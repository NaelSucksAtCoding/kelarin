<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\Task;
use App\Observers\TaskObserver;
use Inertia\Inertia;
use App\Models\Category;
use Illuminate\Support\Facades\Auth;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Task::observe(TaskObserver::class);

        // 🔥 LOGIC GLOBAL SIDEBAR (BEST PRACTICE)
        // Data 'categories' bakal otomatis dikirim ke SEMUA halaman Inertia/React
        Inertia::share('categories', function () {
            if (!Auth::check()) {
                return [];
            }
            return Category::where('user_id', Auth::id())
                ->withCount('tasks')
                ->get();
        });
    }
}