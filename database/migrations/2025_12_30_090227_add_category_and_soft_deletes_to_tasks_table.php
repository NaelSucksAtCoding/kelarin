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
        Schema::table('tasks', function (Blueprint $table) {
            // 1. Kolom Kategori (Boleh Kosong/Null = Masuk Inbox)
            // nullOnDelete artinya: Kalau kategori dihapus, tugasnya JANGAN ilang, tapi jadi tanpa kategori.
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete()->after('status');

            // 2. Kolom Soft Deletes (deleted_at)
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
            $table->dropSoftDeletes();
        });
    }
};
