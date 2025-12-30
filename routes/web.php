<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\CategoryController; 
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

Route::resource('categories', CategoryController::class)->only(['store', 'destroy']);

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
