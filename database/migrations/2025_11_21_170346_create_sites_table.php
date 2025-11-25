<?php

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
        Schema::create('sites', function (Blueprint $table) {
            $table->id();
            $table->string('domain');
            $table->string('container_name')->nullable();
            $table->integer('http_port')->nullable();
            $table->text('wp_admin_user')->nullable();
            $table->text('wp_admin_email')->nullable();
            $table->text('wp_admin_password')->nullable(); // Encrypted
            $table->string('status')->default('stopped');
            $table->timestamp('last_deployed_at')->nullable();
            $table->text('deployment_log')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sites');
    }
};
