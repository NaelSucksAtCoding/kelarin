<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // SIMPAN KATEGORI BARU
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50', // Maksimal 50 huruf biar ga kepanjangan
        ]);

        Category::create([
            'user_id' => auth()->id(),
            'name' => $request->name,
        ]);

        return back()->with('success', 'Project baru berhasil dibuat! 📂');
    }

    public function update(Request $request, Category $category)
    {
        // Pastikan punya dia
        if ($category->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:50',
        ]);

        $category->update(['name' => $request->name]);

        return back()->with('success', 'Nama project berhasil diubah! ✏️');
    }

    // HAPUS KATEGORI
    public function destroy(Request $request, Category $category)
    {
        if ($category->user_id !== auth()->id()) {
            abort(403);
        }

        // Cek apakah user minta hapus tugasnya juga?
        if ($request->has('delete_tasks') && $request->delete_tasks == 'true') {
            // Hapus semua tugas di dalam kategori ini (Soft Delete)
            $category->tasks()->delete();
        }

        // Hapus kategorinya
        $category->delete();

        return to_route('dashboard')->with('success', 'Project berhasil dihapus.');
    }
}