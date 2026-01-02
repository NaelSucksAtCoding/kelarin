<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. Tabel Reminders (Sistem Notifikasi)
        Schema::create('reminders', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // Nullable karena bisa jadi reminder umum (bukan task spesifik)
            $table->foreignId('task_id')->nullable()->constrained()->nullOnDelete(); 
            
            $table->string('type'); // 'due_date', 'smart_focus', 'gentle_nudge'
            $table->text('message'); // Isi pesan (sudah di-generate di backend)
            
            $table->timestamp('scheduled_at'); // Kapan harus muncul
            $table->timestamp('sent_at')->nullable(); // Kapan berhasil dikirim ke frontend/email
            $table->boolean('is_read')->default(false); // Status dibaca
            
            $table->json('action_data')->nullable(); // Data dinamis: { label: 'Gas Fokus', url: '...' }
            
            $table->timestamps();
            
            // Index biar polling ngebut ⚡
            $table->index(['user_id', 'scheduled_at', 'sent_at']);
        });

        // 2. Tambah Kolom Cache Peak Hour di Users (Biar gak query berat)
        Schema::table('users', function (Blueprint $table) {
            // Disimpan sebagai string jam (misal: "09:00" atau "14:00")
            // Nullable buat user baru yang belum punya data analytics
            $table->string('focus_peak_hour')->nullable()->after('password'); 
        });
    }

    public function down()
    {
        Schema::dropIfExists('reminders');
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('focus_peak_hour');
        });
    }
};