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

    public function store(Request $request)
    {
        // 1. Validasi input (Biar gak asal-asalan)
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:pending,progress,done',
        ]);

        // 2. Simpan ke Database (Pake relasi user biar otomatis ada user_id nya)
        $request->user()->tasks()->create($validated);

        // 3. Redirect balik (Inertia bakal otomatis refresh halaman tanpa reload)
        return to_route('dashboard')->with('success', 'Tugas baru berhasil dibuat! 🚀');
    }
    // Method buat UPDATE data
    public function update(Request $request, Task $task)
    {
        // 1. Cek keamanan: Pastikan yang ngedit adalah pemilik tugas
        if ($task->user_id !== auth()->id()) {
            abort(403);
        }

        // 2. Validasi input baru
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:pending,progress,done',
        ]);

        // 3. Update database
        $task->update($validated);

        return to_route('dashboard')->with('success', 'Tugas berhasil diupdate! ✨');
    }

    // Method buat DELETE data
    public function destroy(Task $task)
    {
        // 1. Cek keamanan
        if ($task->user_id !== auth()->id()) {
            abort(403);
        }

        // 2. Hapus dari database
        $task->delete();

        return to_route('dashboard')->with('success', 'Tugas berhasil dihapus! 🗑️');
    }
}
