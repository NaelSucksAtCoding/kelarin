<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\Category;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::where('user_id', auth()->id());

        // --- LOGIKA FILTER UPDATE ---
        if ($request->has('category_id')) {
            // Filter berdasarkan Kategori Spesifik
            $query->where('category_id', $request->input('category_id'));
        } 
        else {
            // Filter Sidebar Bawaan (Hanya jalan kalau BUKAN lagi milih kategori)
            switch ($request->input('filter')) {
                case 'today':
                    $query->whereDate('due_date', Carbon::today());
                    break;
                case 'upcoming':
                    $query->whereDate('due_date', '>', Carbon::today());
                    break;
                case 'archive':
                    $query->onlyTrashed();
                    break;
                default:
                    // Inbox (Semua yang belum dihapus) - Default behavior
                    break;
            }
        }

        // Ambil Tugas
        $tasks = $query->with('category')->orderBy('created_at', 'desc')->get(); // with('category') biar nama kategorinya kebawa

        // Ambil Daftar Kategori milik User (Buat Sidebar & Dropdown)
        $categories = Category::where('user_id', auth()->id())->withCount('tasks')->get();

        return Inertia::render('Dashboard', [
            'tasks' => $tasks,
            'categories' => $categories, // <--- KIRIM INI KE FRONTEND
            'currentFilter' => $request->input('filter', 'inbox'),
            'currentCategoryId' => $request->input('category_id'), // Kirim ID kategori aktif (biar sidebar nyala)
        ]);
    }

    public function store(Request $request)
    {
        // --- PERBAIKAN DI SINI ---
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:pending,progress,done',
            'due_date' => 'nullable|date',
            // Kita izinkan category_id masuk, pastikan ID-nya ada di tabel categories
            'category_id' => 'nullable|exists:categories,id', 
        ]);

        $request->user()->tasks()->create($validated);

        return to_route('dashboard')->with('success', 'Tugas baru berhasil dibuat! 🚀');
    }
    // Method buat UPDATE data
    public function update(Request $request, Task $task)
    {
        if ($task->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:pending,progress,done',
            'due_date' => 'nullable|date',
            'category_id' => 'nullable|exists:categories,id', // Tambahin ini
        ]);

        $task->update($validated);

        return to_route('dashboard')->with('success', 'Tugas berhasil diupdate! ✨');
    }

    // Method buat DELETE data
    public function destroy($id)
    {
        // Cari tugas (termasuk yang udah dihapus/soft deleted)
        $task = Task::withTrashed()->where('id', $id)->where('user_id', auth()->id())->firstOrFail();

        if ($task->trashed()) {
            // Kalau udah di tong sampah, hapus permanen (Force Delete)
            $task->forceDelete();
            $message = 'Tugas dihapus selamanya (Permanen) 🔥';
        } else {
            // Kalau masih aktif, masukin tong sampah (Soft Delete)
            $task->delete();
            $message = 'Tugas dipindahkan ke Arsip 🗑️';
        }

        return back()->with('success', $message);
    }

    public function restore($id)
    {
        // Cari tugas di tong sampah
        $task = Task::onlyTrashed()->where('id', $id)->where('user_id', auth()->id())->firstOrFail();
        
        // Balikin nyawanya
        $task->restore();

        return back()->with('success', 'Tugas berhasil dikembalikan! ♻️');
    }
}
