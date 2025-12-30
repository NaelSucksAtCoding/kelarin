<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ambil User pertama (si admin@beres.in nanti)
        $user = User::first();

        // Kalau user belum ada (jaga-jaga), kita skip biar gak error
        if (!$user) {
            $this->command->info('⚠️ User tidak ditemukan. Jalankan DatabaseSeeder dulu!');
            return;
        }

        // 2. Daftar tugas dummy yang mau kita masukin
        $tasks = [
            [
                'title' => 'Belajar Metode & Model Pengembangan PL',
                'status' => 'done',
                'description' => 'Memahami Waterfall, Agile, dan model pengembangan perangkat lunak.'
            ],
            [
                'title' => 'Analisis Kebutuhan Sistem',
                'status' => 'done',
                'description' => 'Menyusun dokumen Software Requirements Specification (SRS).'
            ],
            [
                'title' => 'Desain Sistem Perangkat Lunak',
                'status' => 'progress',
                'description' => 'Membuat UML diagram: use case, class, dan sequence.'
            ],
            [
                'title' => 'Tugas Kapita Selekta',
                'status' => 'pending',
                'description' => 'Mengerjakan studi kasus teknologi terbaru di bidang software.'
            ],
            [
                'title' => 'Manajemen Proyek Perangkat Lunak',
                'status' => 'done',
                'description' => 'Menyusun timeline, WBS, dan estimasi biaya proyek.'
            ],
            [
                'title' => 'Belajar Arsitektur Perangkat Lunak',
                'status' => 'progress',
                'description' => 'Memahami layered architecture, MVC, dan microservices.'
            ],
            [
                'title' => 'Praktikum Pemrograman Perangkat Bergerak',
                'status' => 'pending',
                'description' => 'Membuat aplikasi mobile sederhana sesuai modul praktikum.'
            ],
            [
                'title' => 'Proyek Aplikasi Dasar',
                'status' => 'progress',
                'description' => 'Mengembangkan aplikasi dasar sebagai tugas proyek semester.'
            ],
            [
                'title' => 'Praktikum Desain Perangkat Lunak',
                'status' => 'pending',
                'description' => 'Mengerjakan latihan desain sistem dan studi kasus.'
            ],
            [
                'title' => 'Praktikum Pemrograman Web',
                'status' => 'done',
                'description' => 'Membangun aplikasi web menggunakan framework modern.'
            ],
            [
                'title' => 'Verifikasi dan Validasi Perangkat Lunak',
                'status' => 'pending',
                'description' => 'Mempelajari teknik testing dan quality assurance.'
            ],
            [
                'title' => 'Belajar Kecerdasan Artifisial',
                'status' => 'pending',
                'description' => 'Memahami konsep dasar AI dan penerapannya.'
            ],
            [
                'title' => 'Praktikum Pengujian Perangkat Lunak',
                'status' => 'pending',
                'description' => 'Melakukan pengujian unit dan integrasi pada aplikasi.'
            ],
        ];

        // 3. Masukkan data ke database
        foreach ($tasks as $task) {
            Task::create([
                'user_id' => $user->id,
                'title' => $task['title'],
                'status' => $task['status'],
                'description' => $task['description'],
            ]);
        }
    }
}