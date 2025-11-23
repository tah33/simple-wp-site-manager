<?php

namespace App\Repositories;

use App\Models\Site;
use App\Services\RemoteServerService;
use Exception;
use Illuminate\Pagination\LengthAwarePaginator;

class SiteRepository
{
    public function __construct(public RemoteServerService $remoteService)
    {
    }
    public function index(): LengthAwarePaginator
    {
        return Site::with('server:site_id,server_ip')->whereHas('server')->latest()->paginate();
    }

    private function updateOthersData($site, $data): void
    {
        $site->server()->updateOrCreate(
            ['site_id' => $site->id],
            $data
        );
        $data['mysql_database'] = 'wp_db_' . $site->domain;
        $data['mysql_username'] = 'wp_user_' . substr(md5($site->domain), 0, 8);
        $data['mysql_password'] = bin2hex(random_bytes(16));
        $site->database()->updateOrCreate(
            ['site_id' => $site->id],
            $data
        );
    }
    public function store($data)
    {
        $sanitized_domain = preg_replace('/[^a-zA-Z0-9_.-]/', '_', $data['domain']);

        $data['container_name'] = "wp_{$sanitized_domain}";
        $site = Site::create($data);
        $this->updateOthersData($site, $data);
        $this->deploySite($site);
        return $site;
    }

    public function find($id)
    {
        return Site::find($id);
    }
    public function update($site, $data): void
    {
        $old_domain     = $site->domain;
        $old_http_port  = $site->http_port;
        $old_https_port = $site->https_port;

        $site->update($data);
        $this->updateOthersData($site, $data);

        try {
            // Connect to server and redeploy with new configuration
            if ($this->remoteService->connect($site)) {

                // Stop and remove old containers
                $this->remoteService->stopSite($site);
                $this->remoteService->removeSite($site);

                // If domain changed, rename the directory
                if ($old_domain !== $site->domain) {
                    $this->remoteService->renameSiteDirectory($old_domain, $site->domain);
                }
                $this->deploySite($site);
            } else {
                throw new Exception('Failed to connect to server');
            }
        } catch (Exception $e) {
            // Rollback the database changes if deployment fails
            $site->update([
                'domain'        => $old_domain,
                'http_port'     => $old_http_port,
                'https_port'    => $old_https_port,
            ]);
        }
    }

    public function delete($site): int
    {
        if ($this->remoteService->connect($site)) {
            $this->remoteService->removeSite($site);
        }
        return $site->delete();
    }

    public function deploySite(Site $site): void
    {
        $site->update(['status' => 'deploying']);

        if ($this->remoteService->connect($site) && $this->remoteService->deployWordPress($site)) {
            $site->update([
                'status' => 'running',
                'last_deployed_at' => now(),
            ]);
        } else {
            $site->update(['status' => 'failed']);
        }
    }

    public function stopSite(Site $site): void
    {
        if ($this->remoteService->connect($site)) {
            $success = $this->remoteService->stopSite($site);
            if ($success) {
                $site->update(['status' => 'stopped']);
            }
        }
    }
}
