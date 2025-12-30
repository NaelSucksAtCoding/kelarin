<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $userId = 1; 

    \App\Models\Category::create(['user_id' => $userId, 'name' => 'Kerjaan Kantor 💼']);
    \App\Models\Category::create(['user_id' => $userId, 'name' => 'Kuliah / Belajar 🎓']);
    \App\Models\Category::create(['user_id' => $userId, 'name' => 'Personal 🏠']);
    }
}
