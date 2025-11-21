<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class DatabaseInfo extends Model
{
    protected $fillable = [
        'site_id',
        'mysql_database',
        'mysql_username',
        'mysql_password',
    ];

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }
    protected function mysqlPassword(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? Crypt::decryptString($value) : null,
            set: fn ($value) => $value ? Crypt::encryptString($value) : null,
        );
    }
}
