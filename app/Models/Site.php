<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Crypt;

class Site extends Model
{
    protected $fillable = [
        'domain',
        'container_name',
        'http_port',
        'wp_admin_user',
        'wp_admin_email',
        'wp_admin_password',
        'status',
        'last_deployed_at',
        'deployment_log',
    ];

    public function server(): HasOne
    {
        return $this->hasOne(Server::class);
    }

    public function database(): HasOne
    {
        return $this->hasOne(DatabaseInfo::class);
    }
    protected function wpAdminPassword(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? Crypt::decryptString($value) : null,
            set: fn ($value) => $value ? Crypt::encryptString($value) : null,
        );
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'running' => 'green',
            'stopped' => 'red',
            'deploying' => 'yellow',
            'failed' => 'red',
            default => 'gray'
        };
    }
}
