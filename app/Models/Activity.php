<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    protected $guarded = [];

    // Relasi ke User (biar tau siapa yg aksi)
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}