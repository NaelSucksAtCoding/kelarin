<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index()
    {
        // 1. Ambil data tugas punya user yang lagi login
        $tasks = Task::where('user_id', auth()->id())
                     ->orderBy('created_at', 'desc') // Urutkan dari yang terbaru
                     ->get();

        // 2. Kirim data ke tampilan 'Dashboard' via Inertia
        // 'tasks' ini nanti bakal jadi PROPS di React
        return Inertia::render('Dashboard', [
            'tasks' => $tasks
        ]);
    }
}