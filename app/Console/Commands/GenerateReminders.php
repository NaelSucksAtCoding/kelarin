<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Task;
use App\Models\Reminder;
use App\Models\User;
use Carbon\Carbon;

class GenerateReminders extends Command
{
    protected $signature = 'reminders:generate';
    protected $description = 'Scan tasks & analytics to generate smart reminders';

    public function handle()
    {
        $this->info('🚀 Starting Reminder Generator...');

        // --- 1. TASK DUE REMINDER (H-1 Deadline) ---
        // Cari tugas yang deadline-nya BESOK (antara 24 jam dari sekarang)
        // Dan STATUSNYA BELUM SELESAI
        
        $tomorrow = Carbon::tomorrow(); // Besok jam 00:00
        $endOfTomorrow = Carbon::tomorrow()->endOfDay(); // Besok jam 23:59

        $tasksDueTomorrow = Task::whereBetween('due_date', [$tomorrow, $endOfTomorrow])
            ->where('status', '!=', 'done')
            ->get();

        foreach ($tasksDueTomorrow as $task) {
            // Cek: Apakah reminder buat task ini UDAH ADA? (Biar gak duplikat)
            $exists = Reminder::where('task_id', $task->id)
                ->where('type', 'due_date')
                ->exists();

            if (!$exists) {
                // Set jadwal reminder: Besok jam 09:00 Pagi
                $scheduleTime = Carbon::parse($task->due_date)->setTime(9, 0, 0);
                
                // Kalau jam 9 pagi besok udah lewat (kasus aneh), set 1 jam dari sekarang
                if ($scheduleTime->isPast()) {
                    $scheduleTime = Carbon::now()->addHour();
                }

                Reminder::create([
                    'user_id' => $task->user_id,
                    'task_id' => $task->id,
                    'type' => 'due_date',
                    'message' => "⏰ Tugas '{$task->title}' jatuh tempo besok! Cicil 25 menit sekarang yuk?",
                    'scheduled_at' => $scheduleTime,
                    'action_data' => [
                        'label' => '🍅 Mulai Fokus',
                        'action' => 'start_focus', // Signal buat Frontend
                        'task_id' => $task->id
                    ]
                ]);
                
                $this->info("Created reminder for task: {$task->title}");
            }
        }

        // --- 2. SMART FOCUS REMINDER (Peak Hour) ---
        // (Logic ini bisa kita aktifkan nanti kalau fitur Peak Hour user udah matang)
        // Konsep: Cek user yang 'focus_peak_hour' == jam sekarang
        
        $this->info('✅ Reminder generation complete.');
    }
}