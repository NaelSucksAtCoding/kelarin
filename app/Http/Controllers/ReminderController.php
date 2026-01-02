<?php

namespace App\Http\Controllers;

use App\Models\Reminder;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReminderController extends Controller
{
    // 🔥 FETCHER: Dipanggil React tiap 60 detik
    public function check(Request $request)
    {
        $user = $request->user();
        $now = Carbon::now();

        // Cari reminder yang:
        // 1. Punya user ini
        // 2. Jadwalnya sudah lewat atau sekarang (scheduled_at <= now)
        // 3. BELUM pernah dikirim (sent_at IS NULL)
        // 4. BELUM dibaca (is_read = false)
        
        $reminders = Reminder::where('user_id', $user->id)
            ->where('scheduled_at', '<=', $now)
            ->whereNull('sent_at') 
            ->where('is_read', false)
            ->orderBy('scheduled_at', 'asc')
            ->get();

        // 🔥 PENTING: Tandai 'sent_at' SEKARANG JUGA.
        // Supaya di polling menit berikutnya, reminder ini gak keambil lagi.
        // (Mencegah spam notif yang sama berkali-kali)
        if ($reminders->count() > 0) {
            Reminder::whereIn('id', $reminders->pluck('id'))->update([
                'sent_at' => $now
            ]);
        }

        return response()->json($reminders);
    }

    // ACTION: Tandai reminder sbg 'read' saat user berinteraksi/close
    public function markAsRead(Request $request, Reminder $reminder)
    {
        // Security Check: Pastikan reminder punya user yg login
        if ($reminder->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $reminder->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }
}