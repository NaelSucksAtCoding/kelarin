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
        Schema::table('activities', function (Blueprint $table) {
            $table->integer('duration_minutes')->nullable()->after('description'); // Simpan menit
            $table->foreignId('task_id')->nullable()->constrained('tasks')->onDelete('set null')->after('user_id'); // Relasi ke task
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table) {
                $table->dropForeign(['task_id']);
                $table->dropColumn(['task_id', 'duration_minutes']);
        });
    }
};
