<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use App\Models\Category;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        // 🔥 LOGIC REDIRECT: CEK DEFAULT VIEW USER
        // Kalau gak ada request 'filter', 'category_id', atau 'search'
        if (!$request->has('filter') && !$request->has('category_id') && !$request->has('search')) {
            $defaultView = $request->user()->preferences['default_view'] ?? 'inbox';
            
            // Redirect jika user sukanya view lain (misal: Hari Ini)
            if ($defaultView !== 'inbox') {
                return redirect()->route('dashboard', ['filter' => $defaultView]);
            }
        }

        $query = Task::where('user_id', auth()->id());

        // --- 1. FITUR SEARCH ---
        if ($request->input('search')) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->input('search') . '%')
                  ->orWhere('description', 'like', '%' . $request->input('search') . '%');
            });
        }

        // 2. FILTER CATEGORY
        if ($request->has('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        } 
        // 3. FILTER SIDEBAR
        else if (!$request->input('search')) { 
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
            }
        }

        // --- 4. SMART SORTING ---
        $query->orderByRaw("
            CASE priority 
                WHEN 'high' THEN 1 
                WHEN 'medium' THEN 2 
                WHEN 'low' THEN 3 
                ELSE 4 
            END
        ");
        $query->orderByRaw("CASE WHEN due_date IS NULL THEN 1 ELSE 0 END, due_date ASC");
        $query->orderBy('created_at', 'desc');

        $tasks = $query->with('category')->get();
        
        // ❌ HAPUS $categories DARI SINI (Udah global di AppServiceProvider)
        
        // Statistik Mingguan
        $start = Carbon::now()->subDays(6);
        $end = Carbon::now();
        $period = CarbonPeriod::create($start, $end);

        $weeklyStats = collect($period)->map(function ($date) {
            return [
                'day' => $date->format('D'),
                'added' => Task::where('user_id', auth()->id())
                            ->whereDate('created_at', $date)
                            ->count(),
                'done' => Task::where('user_id', auth()->id())
                            ->where('status', 'done')
                            ->whereDate('updated_at', $date)
                            ->count(),
            ];
        })->values();

        return Inertia::render('Dashboard', [
            'tasks' => $tasks,
            // 'categories' => $categories, // ❌ JANGAN KIRIM INI LAGI
            'currentFilter' => $request->input('filter', 'inbox'),
            'currentCategoryId' => $request->input('category_id'),
            'searchTerm' => $request->input('search'),
            'flash' => session('flash') ?? [],
            'weeklyStats' => $weeklyStats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:pending,progress,done',
            'due_date' => 'nullable|date',
            'priority' => 'required|in:high,medium,low',
            'category_id' => 'nullable|exists:categories,id', 
        ]);

        $request->user()->tasks()->create($validated);

        return to_route('dashboard')->with('success', 'Tugas baru berhasil dibuat! 🚀');
    }

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
            'priority' => 'required|in:high,medium,low',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $task->update($validated);

        return to_route('dashboard')->with('success', 'Tugas berhasil diupdate! ✨');
    }

    public function destroy($id)
    {
        $task = Task::withTrashed()->where('id', $id)->where('user_id', auth()->id())->firstOrFail();

        if ($task->trashed()) {
            $task->forceDelete();
            $message = 'Tugas dihapus selamanya (Permanen) 🔥';
        } else {
            $task->delete();
            $message = 'Tugas dipindahkan ke Arsip 🗑️';
        }

        return back()->with('success', $message);
    }

    public function restore($id)
    {
        $task = Task::onlyTrashed()->where('id', $id)->where('user_id', auth()->id())->firstOrFail();
        $task->restore();

        return back()->with('success', 'Tugas berhasil dikembalikan! ♻️');
    }
}