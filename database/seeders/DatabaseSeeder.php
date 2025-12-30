<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Bikin User Admin Default
        // Biar lu gampang login, password default-nya biasanya 'password'
        User::factory()->create([
            'name' => 'Admin Beres',
            'email' => 'admin@beres.in',
            'password' => bcrypt('password'), // Password-nya: password
        ]);

        // 2. Panggil TaskSeeder buat ngisi tugas ke user di atas
        $this->call([
            TaskSeeder::class,
        ]);
    }
}