<?php

use App\Models\Site;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('servers', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Site::class)->constrained()->cascadeOnDelete();
            $table->string('server_ip');
            $table->string('server_port');
            $table->string('server_username');
            $table->string('auth_method');
            $table->text('ssh_password');
            $table->text('ssh_private_key');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('servers');
    }
};
