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

    // HAPUS KATEGORI
    public function destroy(Category $category)
    {
        // Pastikan yang ngehapus adalah pemiliknya
        if ($category->user_id !== auth()->id()) {
            abort(403);
        }

        $category->delete();

        // Redirect ke dashboard (bukan back) takutnya user lagi buka halaman kategori itu
        return to_route('dashboard')->with('success', 'Project berhasil dihapus. Tugas masuk ke Inbox.');
    }
}