<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Activity;
use App\Models\Category;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function focus(Request $request)
    {
        $user = $request->user();
        
        // 🧭 IMPROVISASI 2: FILTER WAKTU (Default: today)
        $range = $request->input('range', 'today'); 
        
        switch ($range) {
            case '7d':
                $startDate = Carbon::now()->subDays(6)->startOfDay();
                $label = '7 Hari Terakhir';
                break;
            case '30d':
                $startDate = Carbon::now()->subDays(29)->startOfDay();
                $label = '30 Hari Terakhir';
                break;
            default: // 'today'
                $startDate = Carbon::today();
                $label = 'Hari Ini';
                break;
        }

        // --- 1. DATA PROJECT (SIDEBAR) ---
        $categories = Category::where('user_id', $user->id)
            ->withCount(['tasks' => function ($query) {
                $query->where('status', '!=', 'done');
            }])
            ->get();

        // --- 2. DATA UTAMA (Sesuai Range) ---
        $activities = Activity::where('user_id', $user->id)
            ->where('type', 'success')
            ->where('created_at', '>=', $startDate)
            ->get();

        $totalMinutes = $activities->sum('duration_minutes');
        $totalSessions = $activities->count();

        // 🔥 IMPROVISASI 3: FOCUS RATIO (Menit per Sesi)
        // Kalau rasionya tinggi, berarti deep work. Kalau rendah, berarti sering switching.
        $focusRatio = $totalSessions > 0 ? round($totalMinutes / $totalSessions) : 0;

        // Timeline Stats (Hourly Distribution)
        $hourlyStats = array_fill(0, 24, 0);
        foreach ($activities as $act) {
            $hour = $act->created_at->hour;
            $mins = $act->duration_minutes ?? 25; 
            $hourlyStats[$hour] += $mins;
        }
        
        // 🎯 IMPROVISASI 1: "SO WHAT?" INDICATOR (PEAK HOUR)
        // Cari jam dengan menit tertinggi
        $maxMins = max($hourlyStats);
        $peakHourIndex = array_search($maxMins, $hourlyStats);
        $peakHourInsight = null;

        if ($maxMins > 0) {
            $formattedTime = sprintf('%02d:00', $peakHourIndex);
            if ($peakHourIndex < 12) {
                $peakHourInsight = "Kamu tipe 'Morning Person' ☀️. Jadwalkan tugas berat di jam $formattedTime.";
            } elseif ($peakHourIndex < 18) {
                $peakHourInsight = "Energi kamu memuncak di siang/sore hari 🌤️ ($formattedTime).";
            } else {
                $peakHourInsight = "Kamu 'Night Owl' sejati 🦉. Produktif banget di jam $formattedTime.";
            }
        }

        $timelineData = collect($hourlyStats)->map(function ($mins, $hour) {
            return [
                'hour' => sprintf('%02d:00', $hour),
                'minutes' => $mins
            ];
        })->values();

        // Top Tasks
        $topTasks = Activity::where('user_id', $user->id)
            ->where('type', 'success')
            ->whereNotNull('task_id')
            ->where('created_at', '>=', $startDate) // Ikut filter range
            ->with('task')
            ->select('task_id', DB::raw('sum(duration_minutes) as total_minutes'), DB::raw('count(*) as sessions'))
            ->groupBy('task_id')
            ->orderByDesc('total_minutes')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'title' => $item->task->title ?? 'Tugas Terhapus 👻',
                    'minutes' => (int) $item->total_minutes,
                    'sessions' => $item->sessions
                ];
            });

        // Consistency (Tetap 7 hari terakhir biar visualnya enak, independen dari filter utama)
        $period = CarbonPeriod::create(Carbon::now()->subDays(6), Carbon::now());
        $consistencyData = [];
        
        foreach ($period as $date) {
            $mins = Activity::where('user_id', $user->id)
                ->where('type', 'success')
                ->whereDate('created_at', $date)
                ->sum('duration_minutes');
            
            $consistencyData[] = [
                'day' => $date->format('D'),
                'full_date' => $date->format('d M'),
                'minutes' => (int) $mins,
                'active' => $mins > 0
            ];
        }

        return Inertia::render('Analytics/Focus', [
            'summary' => [
                'minutes' => $totalMinutes, 
                'sessions' => $totalSessions,
                'ratio' => $focusRatio, // Data baru
                'peak_insight' => $peakHourInsight, // Data baru
                'range_label' => $label, // Label filter aktif
                'current_range' => $range // Key filter aktif
            ],
            'timeline' => $timelineData,
            'topTasks' => $topTasks,
            'consistency' => $consistencyData,
            'categories' => $categories
        ]);
    }
}