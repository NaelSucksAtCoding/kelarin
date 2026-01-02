<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'description', 'type', 'duration_minutes', 'task_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // 🔥 WAJIB ADA INI
    public function task()
    {
        return $this->belongsTo(Task::class)->withTrashed(); 
    }
}