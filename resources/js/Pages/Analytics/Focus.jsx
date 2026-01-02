import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

export default function FocusAnalytics({ auth, summary, timeline, topTasks, consistency, categories }) {
    
    // 🧠 1. EVOLVING COPY (Menyesuaikan "Jam Terbang" User Hari Ini)
    const getProductivityMessage = (mins, sessions) => {
        if (sessions === 0) return "Perjalanan seribu mil dimulai dari satu Pomodoro. Gas! 🌱";
        if (sessions < 3) return "Pola fokus mulai terbentuk. Lanjutkan ritme ini. 🚀";
        if (mins < 60) return "Pemanasan yang solid! Mau tambah dikit lagi? 🔥";
        if (mins < 180) return "Solid banget! Produktivitas level sehat. 👍";
        return "Mode Dewa! Kamu produktif parah, jangan lupa istirahat. 🧘‍♂️";
    };

    // 🧠 2. MICRO COACH (Saran Konkret berdasarkan Ratio)
    const getRatioHint = (ratio) => {
        if (ratio === 0) return "Data belum cukup.";
        if (ratio < 15) return "🎯 Saran: Coba 1 sesi panjang tanpa pindah-pindah task.";
        if (ratio < 30) return "💪 Challenge: Naikkan durasi fokus 5-10 menit lagi.";
        if (ratio < 50) return "🔥 Ritme bagus! Pertahankan deep work ini.";
        return "🌊 Flow State tercapai. Pertahankan mental zone ini.";
    };

    // Label Visual Ratio
    const getRatioLabel = (ratio) => {
        if (ratio === 0) return { label: "No Data", color: "bg-gray-300" };
        if (ratio < 15) return { label: "Fragmented (Sering Pecah)", color: "bg-red-400" };
        if (ratio < 30) return { label: "Shallow Work (Cukup)", color: "bg-orange-400" };
        if (ratio < 50) return { label: "Deep Work (Fokus Dalam)", color: "bg-blue-500" };
        return { label: "Flow State (Sangat Fokus)", color: "bg-purple-600" };
    };

    const ratioInfo = getRatioLabel(summary.ratio);
    const coachMessage = getRatioHint(summary.ratio);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-900 text-white text-xs p-2 rounded-lg shadow-xl border border-gray-700 z-50"
                >
                    <p className="font-bold mb-1 opacity-70">Pukul {label}</p>
                    <p className="text-purple-300 font-mono text-sm">Fokus: <span className="font-bold text-white">{payload[0].value}</span> mnt</p>
                </motion.div>
            );
        }
        return null;
    };

    const FilterTab = ({ label, value }) => {
        const isActive = summary.current_range === value;
        return (
            <Link 
                href={route('analytics.focus', { range: value })}
                className="relative px-4 py-1.5 text-xs font-bold rounded-full transition-colors z-10"
                preserveScroll
            >
                {isActive && (
                    <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-purple-600 rounded-full -z-10 shadow-md"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}
                <span className={isActive ? 'text-white' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}>
                    {label}
                </span>
            </Link>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            categories={categories} 
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🧠</span>
                        <h2 className="font-bold text-xl text-gray-800 dark:text-white leading-tight">Focus Analytics</h2>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-full border dark:border-gray-700">
                        <FilterTab label="Hari Ini" value="today" />
                        <FilterTab label="7 Hari" value="7d" />
                        <FilterTab label="30 Hari" value="30d" />
                    </div>
                </div>
            }
        >
            <Head title="Focus Analytics" />

            <div className="py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-500">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={summary.current_range}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="space-y-6"
                        >
                            {/* --- ROW 1: SUMMARY & QUALITY --- */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                
                                {/* Card 1: Total Waktu & Insight */}
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300 md:col-span-2">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 text-7xl group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 select-none">⏳</div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Fokus ({summary.range_label})</p>
                                    
                                    <div className="flex items-baseline gap-2">
                                        <motion.h3 
                                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} 
                                            className="text-5xl font-black text-gray-800 dark:text-white tracking-tight"
                                        >
                                            {summary.minutes}
                                        </motion.h3>
                                        <span className="text-gray-500 font-medium text-lg">menit</span>
                                    </div>
                                    
                                    {/* 🎯 SMART INSIGHT BOX */}
                                    <motion.div 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="mt-5 p-3 bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 rounded-xl border border-purple-100 dark:border-purple-800/30 flex items-start gap-3"
                                    >
                                        <span className="text-lg">💡</span>
                                        <div>
                                            <p className="text-xs font-bold text-purple-700 dark:text-purple-300">
                                                {summary.peak_insight ? "Pola Produktivitas Terdeteksi:" : "Status Hari Ini:"}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
                                                {summary.peak_insight 
                                                    ? summary.peak_insight 
                                                    : getProductivityMessage(summary.minutes, summary.sessions)}
                                            </p>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Card 2: Focus Ratio (Coach Mode) */}
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Kualitas Fokus</p>
                                        <div className="flex items-end gap-2">
                                            <h3 className="text-4xl font-black text-gray-800 dark:text-white">{summary.ratio}</h3>
                                            <span className="text-xs text-gray-500 mb-1 font-medium">mnt / sesi</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden mb-2">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, (summary.ratio / 60) * 100)}%` }}
                                                transition={{ duration: 1.2, ease: "circOut" }}
                                                className={`h-full rounded-full ${ratioInfo.color}`}
                                            ></motion.div>
                                        </div>
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{ratioInfo.label}</p>
                                        
                                        {/* 🔥 MICRO COACH COPY */}
                                        {summary.sessions > 0 && (
                                            <p className="text-[10px] text-gray-400 mt-1 leading-tight border-t border-dashed border-gray-200 dark:border-gray-700 pt-2">
                                                {coachMessage}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* --- ROW 2: CHART & HABIT --- */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                
                                {/* CHART */}
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm lg:col-span-2">
                                    <div className="mb-6 flex justify-between items-end">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Distribusi Waktu 📊</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Heatmap aktivitas per jam (00:00 - 23:00)</p>
                                        </div>
                                    </div>
                                    <div className="h-60 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={timeline}>
                                                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} interval={3} dy={10} />
                                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                                                <Bar dataKey="minutes" radius={[4, 4, 0, 0]} animationDuration={1200} animationEasing="ease-out">
                                                    {timeline.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.minutes > 0 ? '#a855f7' : '#f3f4f6'} className="dark:fill-gray-700 hover:opacity-80 transition-opacity" />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* CONSISTENCY (HABIT TRACKER) */}
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
                                    
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1">Streak Mingguan 🔥</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-8">Konsistensi adalah kunci.</p>
                                    
                                    <div className="flex-1 flex items-end justify-between px-1">
                                        {consistency.map((day, idx) => (
                                            <div key={idx} className="flex flex-col items-center gap-3 group w-full">
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: day.active ? `${Math.min(120, Math.max(15, day.minutes))}px` : '6px', opacity: 1 }}
                                                    transition={{ delay: idx * 0.05, duration: 0.6, type: 'spring' }}
                                                    className={`w-2.5 rounded-full transition-colors ${day.active ? 'bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-lg shadow-emerald-500/30' : 'bg-gray-100 dark:bg-gray-700'}`}
                                                ></motion.div>
                                                <span className={`text-[10px] font-bold ${day.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-300 dark:text-gray-600'}`}>
                                                    {day.day.charAt(0)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* --- ROW 3: TOP TASKS --- */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <div className="mb-5">
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">Top Fokus ({summary.range_label}) 🏆</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Tugas yang paling banyak menyita waktu dan energimu.</p>
                                </div>
                                
                                <div className="space-y-3">
                                    {topTasks.length > 0 ? (
                                        topTasks.map((task, idx) => (
                                            <motion.div 
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="flex items-center gap-4 group p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition-all duration-200 cursor-default border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                                            >
                                                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-xs shrink-0 border ${idx === 0 ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700'}`}>
                                                    #{idx + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="font-bold text-sm text-gray-700 dark:text-gray-200 truncate pr-4">{task.title}</h4>
                                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md border dark:border-gray-700">{task.minutes} mnt</span>
                                                    </div>
                                                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden w-full">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(100, (task.minutes / topTasks[0].minutes) * 100)}%` }}
                                                            transition={{ duration: 1, delay: 0.2 }}
                                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" 
                                                        ></motion.div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50"
                                        >
                                            <div className="text-4xl mb-3 grayscale opacity-50">🌱</div>
                                            <p className="font-bold text-gray-600 dark:text-gray-300 text-sm">Belum ada data periode ini.</p>
                                            <p className="text-xs text-gray-400 mb-5">Setiap langkah besar dimulai dari satu sesi fokus.</p>
                                            
                                            <button 
                                                onClick={() => window.dispatchEvent(new CustomEvent('start-pomodoro', { detail: { task: { id: 0, title: 'Quick Focus' }, duration: 25 * 60 * 1000 } }))}
                                                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold px-5 py-2.5 rounded-xl transition hover:shadow-lg hover:scale-105 active:scale-95"
                                            >
                                                Mulai Quick Focus ⚡
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}