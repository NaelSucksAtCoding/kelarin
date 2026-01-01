<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class SettingsController extends Controller
{
    public function edit(Request $request)
    {
        return Inertia::render('Settings/Edit', [
            // Kirim preferensi user saat ini (pake operator ?? buat jaga-jaga kalau null)
            'preferences' => $request->user()->preferences ?? [
                'theme' => 'system',
                'undo_duration' => 3000,
                'default_priority' => 'medium',
                'default_view' => 'inbox'
            ],
            'status' => session('status'),
        ]);
    }

    public function update(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'theme' => 'required|string|in:light,dark,system',
            'undo_duration' => 'required|integer|in:3000,5000,10000',
            'default_priority' => 'required|string|in:low,medium,high',
            'default_view' => 'required|string|in:inbox,today,upcoming',
            // 🔥 SETTING BARU: ALARM REPETITION
            'alarm_repetition' => 'required|integer|in:1,2,3,5', 
        ]);

        // Simpan ke kolom JSON 'preferences'
        $user = $request->user();
        $user->preferences = $validated;
        $user->save();

        return Redirect::route('settings.edit')->with('status', 'settings-updated');
    }
}