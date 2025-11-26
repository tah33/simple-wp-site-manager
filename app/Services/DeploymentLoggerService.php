<?php

namespace App\Services;

use Carbon\Carbon;

class DeploymentLoggerService
{
    private array $logEntries = [];

    public function addLog(string $message, string $type = 'info'): void
    {
        $timestamp = Carbon::now()->format('Y-m-d H:i:s');

        $formattedMessage = [
            'timestamp' => $timestamp,
            'type' => $type,
            'message' => $message,
            'icon' => $this->getIconForType($type)
        ];

        $this->logEntries[] = $formattedMessage;
    }

    public function addSuccess(string $message): void
    {
        $this->addLog($message, 'success');
    }

    public function addError(string $message): void
    {
        $this->addLog($message, 'error');
    }

    public function addWarning(string $message): void
    {
        $this->addLog($message, 'warning');
    }

    public function addInfo(string $message): void
    {
        $this->addLog($message, 'info');
    }

    public function getLogs(): array
    {
        return $this->logEntries;
    }
    public function getLogsAsText(): array
    {
        return array_map(function($log) {
            $log['message'] = "{$log['icon']} [{$log['timestamp']}] {$log['message']}\n";
            return $log;
        }, $this->logEntries);
    }

    public function clear(): void
    {
        $this->logEntries = [];
    }

    public function count(): int
    {
        return count($this->logEntries);
    }

    public function processServiceLog(string $serviceLog): void
    {
        $lines = explode("\n", trim($serviceLog));
        foreach ($lines as $line) {
            if (!empty(trim($line))) {
                $type = 'info';

                // Detect log types from service messages
                if (str_contains(strtolower($line), 'error') || str_contains(strtolower($line), 'failed')) {
                    $type = 'error';
                } elseif (str_contains(strtolower($line), 'success') || str_contains(strtolower($line), 'authenticated')) {
                    $type = 'success';
                } elseif (str_contains(strtolower($line), 'warning')) {
                    $type = 'warning';
                }

                $this->addLog($line, $type);
            }
        }
    }

    private function getIconForType(string $type): string
    {
        return match($type) {
            'success' => '✅',
            'error' => '❌',
            'warning' => '⚠️',
            'info' => 'ℹ️',
            default => '📝'
        };
    }
}
