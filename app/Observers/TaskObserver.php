<?php

namespace App\Observers;

use App\Models\Task;
use App\Models\Activity;
use Illuminate\Support\Facades\Auth;

class TaskObserver
{
    // Helper buat nyatet (biar rapi)
    private function log($description, $type = 'info')
    {
        if (Auth::check()) {
            Activity::create([
                'user_id' => Auth::id(),
                'description' => $description,
                'type' => $type,
            ]);
        }
    }

    // 1. Saat Tugas Dibuat
    public function created(Task $task)
    {
        $this->log("Membuat tugas baru: '{$task->title}'", 'success');
    }

    // 2. Saat Tugas Diupdate (LOGIC DIPERBAIKI)
    public function updated(Task $task)
    {
        // Cek Status (Blok 1)
        if ($task->isDirty('status')) {
            $oldStatus = $task->getOriginal('status');
            $newStatus = $task->status;
            // Pake ucfirst biar rapi
            $this->log("Memindahkan tugas '{$task->title}' dari " . ucfirst($oldStatus) . " ke " . ucfirst($newStatus), 'info');
        } 
        
        // 🔥 REVISI: Ganti 'elseif' jadi 'if' baru (Blok 2)
        // Biar kalau judul diedit barengan sama status, tetep kecatet log-nya
        if ($task->isDirty('title')) {
            $this->log("Mengubah judul tugas menjadi: '{$task->title}'", 'warning');
        }
    }

    // 3. Saat Tugas Dihapus (Soft Delete / Masuk Sampah)
    public function deleted(Task $task)
    {
        if ($task->isForceDeleting()) {
            $this->log("Menghapus permanen tugas: '{$task->title}'", 'danger');
        } else {
            $this->log("Membuang tugas ke sampah: '{$task->title}'", 'danger');
        }
    }

    // 4. Saat Tugas Direstore (Undo / Balikin dari Arsip)
    public function restored(Task $task)
    {
        $this->log("Mengembalikan tugas: '{$task->title}'", 'success');
    }
}