<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    // Kolom mana aja yang boleh diisi manual
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'status',
    ];

    // Relasi balik: Sebuah Task milik satu User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}