<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class Server extends Model
{
    protected $fillable = [
        'site_id',
        'server_ip',
        'server_port',
        'server_username',
        'auth_method',
        'ssh_password',
        'ssh_private_key',
    ];

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }
    protected function sshPassword(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => Crypt::decryptString($value),
            set: fn ($value) => Crypt::encryptString($value),
        );
    }
    protected function sshPrivateKey(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => Crypt::decryptString($value),
            set: fn ($value) => Crypt::encryptString($value),
        );
    }
}
