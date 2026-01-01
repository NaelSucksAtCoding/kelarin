<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ActivityController extends Controller
{
    public function index()
    {
        // 1. Ambil Aktivitas (Cukup ini aja)
        $activities = Activity::where('user_id', Auth::id())
            ->latest()
            ->paginate(20);
        // 2. Tampilkan ke halaman Inertia
        return Inertia::render('Activity/Index', [
            'activities' => $activities,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'description' => 'required|string',
            'type' => 'required|string', // success, info, dll
        ]);

        Activity::create([
            'user_id' => Auth::id(),
            'description' => $request->description,
            'type' => $request->type,
        ]);

        return back(); // Gak perlu return apa-apa, 200 OK cukup
    }
}