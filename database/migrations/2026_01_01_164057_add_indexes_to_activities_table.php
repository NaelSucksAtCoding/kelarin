<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('activities', function (Blueprint $table) {
            // Index komposit: biar query filter user + tipe + tanggal jadi instan
            $table->index(['user_id', 'type', 'created_at']); 
        });
    }

    public function down()
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'type', 'created_at']);
        });
    }
};
