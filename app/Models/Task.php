<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use HasFactory, SoftDeletes;

    // Kolom mana aja yang boleh diisi manual
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'status',
        'category_id',
    ];

    public function user()
        {
            return $this->belongsTo(User::class);
        }

        // Tugas milik satu Kategori (Opsional)
        public function category()
        {
            return $this->belongsTo(Category::class);
        }
}