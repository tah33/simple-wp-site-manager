<?php
// app/Services/RemoteServerService.php

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
            $this->ssh = new SSH2($site->server_ip, $site->server_port);

            if (!$this->ssh->login($site->server_username, $site->ssh_private_key)) {
                throw new Exception('SSH login failed');
            }

            return true;
        } catch (Exception $e) {
            Log::error("SSH Connection failed for {$site->domain}: " . $e->getMessage());
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
                // Create directory
                "mkdir -p /opt/wordpress/{$site->domain}",

                // Create docker-compose.yml
                "cat > /opt/wordpress/{$site->domain}/docker-compose.yml << 'EOF'\n{$dockerComposeContent}\nEOF",

                // Start containers
                "cd /opt/wordpress/{$site->domain} && docker-compose up -d",

                // Wait for services to start
                "sleep 30",
            ];

            foreach ($commands as $command) {
                $output = $this->executeCommand($command);
                if (str_contains($output, 'error') || str_contains($output, 'Error')) {
                    throw new Exception("Command failed: $command - Output: $output");
                }
            }

            return true;
        } catch (Exception $e) {
            Log::error("Deployment failed for {$site->domain}: " . $e->getMessage());
            return false;
        }
    }

    public function stopSite(Site $site): bool
    {
        try {
            $command = "cd /opt/wordpress/{$site->domain} && docker-compose down";
            $this->executeCommand($command);
            return true;
        } catch (Exception $e) {
            Log::error("Stop failed for {$site->domain}: " . $e->getMessage());
            return false;
        }
    }

    public function removeSite(Site $site): bool
    {
        try {
            $command = "cd /opt/wordpress/{$site->domain} && docker-compose down -v && rm -rf /opt/wordpress/{$site->domain}";
            $this->executeCommand($command);
            return true;
        } catch (Exception $e) {
            Log::error("Removal failed for {$site->domain}: " . $e->getMessage());
            return false;
        }
    }

    private function generateDockerCompose(Site $site): string
    {
        $httpPort = $site->http_port ?? 8080;
        $httpsPort = $site->https_port ?? 8443;

        return <<<YAML
version: '3.8'

services:
  database:
    image: mysql:5.7
    container_name: wp_db_{$site->domain}
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: {$site->mysql_database}
      MYSQL_USER: {$site->mysql_user}
      MYSQL_PASSWORD: {$site->mysql_password}
      MYSQL_RANDOM_ROOT_PASSWORD: '1'
    volumes:
      - db_data:/var/lib/mysql
    networks:
      - wordpress_network

  wordpress:
    image: wordpress:latest
    container_name: wp_{$site->domain}
    restart: unless-stopped
    ports:
      - "{$httpPort}:80"
      - "{$httpsPort}:443"
    environment:
      WORDPRESS_DB_HOST: database:3306
      WORDPRESS_DB_USER: {$site->mysql_user}
      WORDPRESS_DB_PASSWORD: {$site->mysql_password}
      WORDPRESS_DB_NAME: {$site->mysql_database}
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
