<?php

namespace App\Repositories;

use App\Models\Site;
use App\Services\RemoteServerService;
use Exception;
use Illuminate\Pagination\LengthAwarePaginator;

class SiteRepository
{
    public function __construct(public RemoteServerService $remoteService)
    {}
    public function index(): LengthAwarePaginator
    {
        return Site::with('server:site_id,server_ip')->whereHas('server')
            ->select('id','domain', 'http_port', 'status', 'last_deployed_at')->latest()->paginate();
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

    /**
     * @throws Exception
     */
    public function store($data)
    {
        $logger = app('deployment_logger');

        try {
            $logger->clear();
            $sanitized_domain = preg_replace('/[^a-zA-Z0-9_.-]/', '_', $data['domain']);
            $data['container_name'] = "{$sanitized_domain}";
            $logger->addInfo("Generated container name: <strong>{$data['container_name']}</strong>");
            $site = Site::create($data);
            $this->updateOthersData($site, $data);

            $logger->addInfo("Starting deployment process...");
            $this->deploySite($site);
            $logger->addSuccess("WordPress site created and deployed successfully!");
            $site->update([
                'deployment_log' => $logger->getLogsAsText(),
                'status' => 'running'
            ]);

            return $site;
        } catch (Exception $e) {
            $logger->addError("Site creation failed: " . $e->getMessage());
            if (isset($site)) {
                $site->update([
                    'deployment_log' => $logger->getLogsAsText(),
                    'status' => 'failed'
                ]);
            }

            throw $e;
        }
    }

    public function find($id)
    {
        return Site::find($id);
    }
    public function update($site, $data): void
    {
        $logger = app('deployment_logger');
        $logger->clear();

        $old_domain    = $site->container_name;
        $old_http_port = $site->http_port;

        try {
            $logger->addInfo("Updating site: <strong>{$site->id}</strong>");
            $logger->addInfo("Old container name: {$old_domain}, old HTTP port: {$old_http_port}");

            $logger->addInfo("Updating database fields...");
            $site->update($data);
            $this->updateOthersData($site, $data);
            $logger->addSuccess("Site database updated");

            $logger->addInfo("Attempting SSH connection for update...");

            if (! $this->remoteService->connect($site)) {
                $logger->addError("SSH connection failed during update");
                throw new Exception("Failed to connect to server");
            }

            $logger->addSuccess("SSH connected successfully");

            // Stop existing containers
            $logger->addInfo("Stopping existing WordPress container...");
            $this->remoteService->stopSite($site);
            $logger->addSuccess("Container stopped");

            // Remove container
            $logger->addInfo("Removing old container instance...");
            $this->remoteService->removeSite($site);
            $logger->addSuccess("Old container removed");

            // Handle renaming if domain changed
            if ($old_domain !== $site->domain) {
                $logger->addInfo("Domain changed — renaming directory: {$old_domain} → {$site->container_name}");
                $this->remoteService->renameSiteDirectory($old_domain, $site);
                $logger->addSuccess("Site directory renamed");
            }

            // Re-deploy updated site
            $logger->addInfo("Starting redeployment for updated site...");
            $this->deploySite($site);
            $logger->addSuccess("Redeployment completed successfully");

            // Save logs
            $site->update([
                'deployment_log' => $logger->getLogsAsText(),
                'status'         => 'running'
            ]);

        } catch (Exception $e) {

            $logger->addError("Update failed: " . $e->getMessage());
            $logger->addInfo("Rolling back database changes...");

            // Rollback to previous values
            $site->update([
                'domain'    => $old_domain,
                'http_port' => $old_http_port,
                'deployment_log' => $logger->getLogsAsText(),
                'status'    => 'failed'
            ]);

            throw $e;
        }
    }
    /**
     * @throws Exception
     */
    public function deploySite(Site $site): void
    {
        $site->update(['status' => 'deploying']);

        $logger = app('deployment_logger');
        $logger->addInfo("Connecting to server: <strong>{$site->server->server_ip}:{$site->server->server_port}</strong>");

        try {
            $this->remoteService->connect($site);
            // Deploy WordPress
            if (! $this->remoteService->deployWordPress($site)) {
                $logger->addError("WordPress deployment failed");
                throw new Exception('WordPress deployment failed');
            }

            $site->update([
                'status' => 'running',
                'last_deployed_at' => now(),
                'deployment_log' => $logger->getLogsAsText()
            ]);

        } catch (Exception $e) {
            $logger->addError("Deployment failed: " . $e->getMessage());

            $site->update([
                'status' => 'failed',
                'deployment_log' => $logger->getLogsAsText()
            ]);

            throw $e;
        }
    }

    public function stopSite(Site $site): void
    {
        $logger = app('deployment_logger');
        $logger->clear();

        try {
            $logger->addInfo("Stopping WordPress site: {$site->container_name}");

            // Connect to server
            $logger->addInfo("Attempting SSH connection...");
            $this->remoteService->connect($site);

            $logger->addSuccess("SSH connected successfully");

            // Stop container
            $logger->addInfo("Executing stop operation on remote server...");
            $success = $this->remoteService->stopSite($site);

            if ($success) {
                $logger->addSuccess("Site stopped successfully");
                $site->update([
                    'status' => 'stopped',
                    'deployment_log' => $logger->getLogsAsText(),
                ]);
            } else {
                $logger->addError("Failed to stop remote container");
                throw new Exception("Failed to stop site remotely");
            }

        } catch (Exception $e) {
            $logger->addError("Stopping site failed: " . $e->getMessage());

            $site->update([
                'deployment_log' => $logger->getLogsAsText(),
                'status' => 'failed',
            ]);

            throw $e;
        }
    }
    public function delete($site): int
    {
        $logger = app('deployment_logger');
        $logger->clear();

        try {
            $logger->addInfo("Deleting WordPress site: {$site->container_name}");

            // Connect to server
            $logger->addInfo("Attempting SSH connection...");

            if ($this->remoteService->connect($site)) {
                $logger->addSuccess("SSH connected successfully");

                // Remove remote container + files + database
                $logger->addInfo("Removing site from remote server...");
                $this->remoteService->removeSite($site);
                $logger->addSuccess("Remote container removed");

                // Also delete the MySQL database
                $logger->addInfo("Deleting MySQL database...");
                $this->deleteDatabase($site);
                $logger->addSuccess("MySQL database deleted");

            } else {
                $logger->addError("SSH connection failed – skipping remote cleanup");
            }

            // Delete from DB
            $logger->addInfo("Deleting site from database...");
            $result = $site->delete();

            $logger->addSuccess("Site deleted successfully");

            return $result;

        } catch (Exception $e) {
            $logger->addError("Site deletion failed: " . $e->getMessage());

            $site->update([
                'deployment_log' => $logger->getLogsAsText(),
                'status' => 'failed',
            ]);

            throw $e;
        }
    }

    private function deleteDatabase(Site $site): void
    {
        try {
            $database_info = $site->database;
            $db_name = $database_info->mysql_database;
            $mysql_password = $database_info->mysql_database;

            $command = "docker exec {$site->container_name}-db mysql -u root -p{$mysql_password} -e \"DROP DATABASE IF EXISTS {$db_name};\"";

            $output = $this->remoteService->executeCommand($command);
            app('deployment_logger')->addInfo("Database deletion command executed - Output: {$output}");

        } catch (Exception $e) {
            app('deployment_logger')->addError("Database deletion failed: " . $e->getMessage());
            // Don't throw exception here as we still want to continue with other cleanup
        }
    }


}
