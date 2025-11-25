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
        try {

            $this->ssh = new SSH2($site->server->server_ip, $site->server->server_port ?? 22);

            if ($site->server->auth_method == 'password') {
                if (!$this->ssh->login($site->server->server_username, $site->server->ssh_password)) {
                    throw new Exception('SSH password authentication failed');
                }

            } elseif ($site->server->ssh_private_key) {
                if (!$this->ssh->login($site->server->server_username, $site->server->ssh_private_key)) {
                    throw new Exception('SSH key authentication failed');
                }
            } else {
                throw new Exception('No SSH key or password provided');
            }

            return true;
        } catch (Exception $e) {
            Log::error("SSH Connection failed for {$site->domain}: " . $e->getMessage());
            return false;
        }
    }

    // Optional: Method to test connection with custom credentials
    public function testConnection(string $ip, string $username, $auth, int $port = 22): bool
    {
        try {
            $ssh = new SSH2($ip, $port);

            if (is_string($auth) && str_contains($auth, '-----BEGIN')) {
                // It's a private key
                if (!$ssh->login($username, $auth)) {
                    throw new Exception('SSH key authentication failed');
                }
            } else {
                // It's a password
                if (!$ssh->login($username, $auth)) {
                    throw new Exception('SSH password authentication failed');
                }
            }

            return true;
        } catch (Exception $e) {
            Log::error("SSH Test connection failed for {$ip}: " . $e->getMessage());
            return false;
        }
    }

    public function executeCommand(string $command): string
    {
        return $this->ssh->exec($command);
    }

    public function deployWordPress(Site $site): bool
    {
        try {
            $dockerComposeContent = $this->generateDockerCompose($site);

            $commands = [
                "mkdir -p /opt/wordpress/{$site->container_name}",
                "cat > /opt/wordpress/{$site->container_name}/docker-compose.yml << 'EOF'\n{$dockerComposeContent}\nEOF",
                "cd /opt/wordpress/{$site->container_name} && docker-compose up -d",
                "sleep 30",
            ];

            // Create a new connection and execute all commands
            if (!$this->connect($site)) {
                throw new Exception('SSH connection failed');
            }

            foreach ($commands as $command) {
                $output = $this->executeCommand($command);
                Log::info("Command output: " . $output);

                if (str_contains($output, 'error') || str_contains($output, 'Error')) {
                    throw new Exception("Command failed: $command - Output: $output");
                }
            }

            // Disconnect cause ssh doesn't allow  reopening so when i create another site it gives me error
            $this->disconnect();

            return true;
        } catch (Exception $e) {
            Log::error("Deployment failed for {$site->container_name}: " . $e->getMessage());
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
        try {
            $command = "cd /opt/wordpress/{$site->container_name} && docker-compose down";
            $this->executeCommand($command);
            return true;
        } catch (Exception $e) {
            Log::error("Stop failed for {$site->container_name}: " . $e->getMessage());
            return false;
        }
    }

    public function removeSite(Site $site): bool
    {
        try {
            $command = "cd /opt/wordpress/{$site->container_name} && docker-compose down -v && rm -rf /opt/wordpress/{$site->container_name}";
            $this->executeCommand($command);
            return true;
        } catch (Exception $e) {
            Log::error("Removal failed for {$site->container_name}: " . $e->getMessage());
            return false;
        }
    }

    public function renameSiteDirectory(string $old_domain, string $new_domain): bool
    {
        try {
            $command = "mv /opt/wordpress/{$old_domain} /opt/wordpress/{$new_domain}";
            $this->executeCommand($command);

            Log::info("Renamed site directory from {$old_domain} to {$new_domain}");
            return true;
        } catch (Exception $e) {
            Log::error("Failed to rename site directory: " . $e->getMessage());
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
