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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            // Relasi ke User (Kalau user dihapus, tugasnya ikut kehapus/cascade)
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            $table->string('title'); // Judul tugas
            $table->text('description')->nullable(); // Deskripsi boleh kosong
            
            // Status pakai enum biar datanya konsisten, defaultnya 'pending'
            $table->enum('status', ['pending', 'progress', 'done'])->default('pending');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
