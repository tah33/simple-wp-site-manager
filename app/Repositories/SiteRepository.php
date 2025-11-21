<?php

namespace App\Repositories;

use App\Models\Site;
use App\Services\RemoteServerService;
use Illuminate\Pagination\LengthAwarePaginator;

class SiteRepository
{
    public function index(): LengthAwarePaginator
    {
        return Site::with('server:site_id,server_ip')->whereHas('server')->latest()->paginate();
    }

    public function store($data)
    {
        $data['container_name'] = 'wp_' . str_replace(['.', '-'], '_', $data['domain']);
        $site = Site::create($data);
        $site->server()->create($data);

        $data['mysql_database'] = 'wp_' . str_replace(['.', '-'], '_', $data['domain']);
        $data['mysql_username'] = 'wp_user_' . substr(md5($data['domain']), 0, 8);
        $data['mysql_password'] = bin2hex(random_bytes(16));
        $site->database()->create($data);
//        $this->deploySite($site);
        return $site;
    }

    public function find($id)
    {
        return Site::find($id);
    }
    public function update($id, $data): void
    {
        $site = $this->find($id);
        $site->update($data);
    }

    public function delete($site): int
    {
        $service = new RemoteServerService();

        if ($service->connect($site)) {
            $service->removeSite($site);
        }
        return $site->delete();
    }

    private function deploySite(Site $site)
    {
        $site->update(['status' => 'deploying']);

        $service = new RemoteServerService();

        if ($service->connect($site) && $service->deployWordPress($site)) {
            $site->update([
                'status' => 'running',
                'last_deployed_at' => now(),
            ]);
        } else {
            $site->update(['status' => 'failed']);
        }
    }
}
