<?php

namespace App\Services;

use App\Models\Site;
use Exception;
use Illuminate\Support\Facades\Log;
use phpseclib3\Net\SSH2;

class RemoteServerService
{
    private SSH2 $ssh;

    public function connect(Site $site): bool
    {
        $logger = app('deployment_logger');

        try {
            $logger->addInfo("Initializing SSH connection to {$site->server->server_ip}:{$site->server->server_port}");

            $this->ssh = new SSH2($site->server->server_ip, $site->server->server_port ?? 22);
            $logger->addSuccess("SSH client initialized");

            if ($site->server->auth_method == 'password') {
                $logger->addInfo("Attempting password authentication for user: {$site->server->server_username}");

                if (!$this->ssh->login($site->server->server_username, $site->server->ssh_password)) {
                    $logger->addError("SSH password authentication failed");
                    throw new Exception('SSH password authentication failed');
                }

                $logger->addSuccess("Successfully authenticated with password");

            } elseif ($site->server->ssh_private_key) {
                $logger->addInfo("Attempting SSH key authentication for user: {$site->server->server_username}");

                if (!$this->ssh->login($site->server->server_username, $site->server->ssh_private_key)) {
                    $logger->addError("SSH key authentication failed");
                    throw new Exception('SSH key authentication failed');
                }

                $logger->addSuccess("Successfully authenticated with SSH key");

            } else {
                $logger->addError("No authentication method provided");
                throw new Exception('No SSH key or password provided');
            }

            $logger->addSuccess("SSH connection established successfully");

            return true;

        } catch (Exception $e) {
            $logger->addError("SSH connection failed: " . $e->getMessage());

            return false;
        }
    }

    public function executeCommand(string $command): string
    {
        return $this->ssh->exec($command);
    }

    public function deployWordPress(Site $site): bool
    {
        $logger = app('deployment_logger');

        try {
            $logger->addInfo("Starting WordPress deployment for container: {$site->container_name}");

            // Ensure old SSH connection is closed
            $logger->addInfo("Disconnecting any existing SSH connection");
            $this->disconnect();

            // Generate docker-compose file
            $logger->addInfo("Generating docker-compose.yml for {$site->container_name}");
            $dockerComposeContent = $this->generateDockerCompose($site);
            $logger->addSuccess("docker-compose.yml generated successfully");

            $commands = [
                "mkdir -p /opt/wordpress/{$site->container_name}",
                "cat > /opt/wordpress/{$site->container_name}/docker-compose.yml << 'EOF'\n{$dockerComposeContent}\nEOF",
                "cd /opt/wordpress/{$site->container_name} && docker-compose up -d",
                "sleep 30",
            ];

            // SSH Connection
            $logger->addInfo("Establishing SSH connection for deployment...");

            if (! $this->connect($site)) {
                $logger->addError("SSH connection failed during deployment");
                throw new Exception("SSH connection failed during WordPress deployment");
            }

            // Execute commands
            foreach ($commands as $command) {
                $logger->addInfo("Executing command: {$command}");

                $output = $this->executeCommand($command);

                $logger->addInfo("Command output: {$output}");

                if (str_contains($output, 'error') || str_contains($output, 'Error')) {
                    $logger->addError("Command failed: {$command} | Output: {$output}");
                    throw new Exception("Command failed: {$command}");
                }

                $logger->addSuccess("Command executed successfully: {$command}");
            }

            // Disconnect SSH
            $logger->addInfo("Disconnecting SSH after deployment");
            $this->disconnect();

            $logger->addSuccess("WordPress deployment completed successfully");

            return true;

        } catch (Exception $e) {
            $logger->addError("Deployment failed: " . $e->getMessage());

            return false;
        }
    }

    public function disconnect(): void
    {
        if (isset($this->ssh)) {
            $this->ssh->disconnect();
            unset($this->ssh);
        }
    }

    public function stopSite(Site $site): bool
    {
        $logger = app('deployment_logger');

        try {
            $logger->addInfo("Stopping container for site: {$site->container_name}");

            $command = "cd /opt/wordpress/{$site->container_name} && docker-compose down";
            $logger->addInfo("Executing command: {$command}");

            $output = $this->executeCommand($command);
            $logger->addInfo("Command output: {$output}");

            $logger->addSuccess("Container stopped successfully");

            return true;

        } catch (Exception $e) {
            $logger->addError("Failed to stop container: " . $e->getMessage());

            return false;
        }
    }

    public function removeSite(Site $site): bool
    {
        $logger = app('deployment_logger');

        try {
            $logger->addInfo("Removing container and files for site: {$site->container_name}");

            $command = "cd /opt/wordpress/{$site->container_name} && docker-compose down -v && rm -rf /opt/wordpress/{$site->container_name}";
            $logger->addInfo("Executing command: {$command}");

            $output = $this->executeCommand($command);
            $logger->addInfo("Command output: {$output}");

            $logger->addSuccess("Container and directory removed successfully");

            return true;

        } catch (Exception $e) {
            $logger->addError("Failed to remove container and directory: " . $e->getMessage());

            return false;
        }
    }

    public function renameSiteDirectory(string $old_domain, Site $site): bool
    {
        $logger = app('deployment_logger');

        try {
            $new_domain = $site->container_name;

            $logger->addInfo("Renaming site directory: {$old_domain} → {$new_domain}");

            $command = "mv /opt/wordpress/{$old_domain} /opt/wordpress/{$new_domain}";
            $logger->addInfo("Executing command: {$command}");

            $output = $this->executeCommand($command);
            $logger->addInfo("Command output: {$output}");

            $logger->addSuccess("Directory renamed successfully");

            return true;

        } catch (Exception $e) {
            $logger->addError("Failed to rename directory: " . $e->getMessage());

            return false;
        }
    }
    private function generateDockerCompose(Site $site): string
    {
        $httpPort = $site->http_port ?? 8080;

        $sanitized_domain = $site->container_name;

        return <<<YAML
version: '3.8'

services:
  database:
    image: mysql:5.7
    container_name: {$sanitized_domain}
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: {$site->database->mysql_database}
      MYSQL_USER: {$site->database->mysql_username}
      MYSQL_PASSWORD: {$site->database->mysql_password}
      MYSQL_RANDOM_ROOT_PASSWORD: '1'
    volumes:
      - db_data:/var/lib/mysql
    networks:
      - wordpress_network

  wordpress:
    image: wordpress:latest
    container_name: wp_{$sanitized_domain}
    restart: unless-stopped
    ports:
      - "{$httpPort}:80"
    environment:
      WORDPRESS_DB_HOST: database:3306
      WORDPRESS_DB_USER: {$site->database->mysql_username}
      WORDPRESS_DB_PASSWORD: {$site->database->mysql_password}
      WORDPRESS_DB_NAME: {$site->database->mysql_database}
    volumes:
      - wp_data:/var/www/html
    depends_on:
      - database
    networks:
      - wordpress_network

volumes:
  db_data:
  wp_data:

networks:
  wordpress_network:
    driver: bridge
YAML;
    }
}
