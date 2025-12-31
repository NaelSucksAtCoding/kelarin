<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\CategoryController; 
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\SettingsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [TaskController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::post('/tasks', [TaskController::class, 'store'])
    ->middleware(['auth', 'verified'])
    ->name('tasks.store');

    // Route Update (Edit)
Route::put('/tasks/{task}', [TaskController::class, 'update'])
    ->middleware(['auth', 'verified'])
    ->name('tasks.update');

// Route Delete (Hapus)
Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])
    ->middleware(['auth', 'verified'])
    ->name('tasks.destroy');

Route::patch('/tasks/{id}/restore', [TaskController::class, 'restore'])->name('tasks.restore');

Route::resource('categories', CategoryController::class)->only(['store', 'update', 'destroy']);

Route::middleware('auth', 'verified')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::get('/activities', [ActivityController::class, 'index'])->name('activities.index');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/settings', [SettingsController::class, 'edit'])->name('settings.edit');
    Route::patch('/settings', [SettingsController::class, 'update'])->name('settings.update');
});

require __DIR__.'/auth.php';
