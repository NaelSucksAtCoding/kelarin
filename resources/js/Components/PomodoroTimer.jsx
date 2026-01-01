import { useState, useEffect, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function PomodoroTimer() {
    const [session, setSession] = useState(null); 
    const [now, setNow] = useState(Date.now());
    const sessionRef = useRef(session);
    const audioRef = useRef(null);
    
    // Config Alarm
    const { auth } = usePage().props;
    const repetition = auth.user.preferences?.alarm_repetition || 1;

    useEffect(() => { sessionRef.current = session; }, [session]);

    // Emit Status
    useEffect(() => {
        if (session) {
            window.dispatchEvent(new CustomEvent('pomodoro-status', { detail: { taskId: session.taskId, status: session.status } }));
        } else {
            window.dispatchEvent(new CustomEvent('pomodoro-status', { detail: { taskId: null, status: 'stopped' } }));
        }
    }, [session]);

    // Audio Logic
    useEffect(() => {
        if (!session || !session.music || session.music !== 'lofi') {
            if (audioRef.current) { audioRef.current.pause(); }
            return;
        }

        const lofiUrl = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3';

        if (session.status === 'running') {
            if (!audioRef.current) {
                audioRef.current = new Audio(lofiUrl);
                audioRef.current.loop = true;
                audioRef.current.volume = 0.5;
            }
            if (audioRef.current.src !== lofiUrl) audioRef.current.src = lofiUrl;
            
            var playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => console.log("Audio autoplay blocked"));
            }
        } else {
            if (audioRef.current) audioRef.current.pause();
        }

        return () => {
            if (audioRef.current && !session) { 
                audioRef.current.pause(); 
                audioRef.current = null; 
            }
        };
    }, [session?.status, session?.music]);

    // Alarm Logic
    const playAlarm = (count) => {
        if (count <= 0) return;
        const audio = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c153dd.mp3?filename=service-bell-ring-14610.mp3'); 
        audio.volume = 0.7;
        audio.play().catch(e => console.log("Audio blocked", e));
        setTimeout(() => { playAlarm(count - 1); }, 1500);
    };

    // Load State
    useEffect(() => {
        const saved = localStorage.getItem('kelarin_pomodoro');
        if (saved) {
            const parsed = JSON.parse(saved);
            const timeSinceEnd = Date.now() - parsed.endTime;
            if (parsed.status !== 'paused' && timeSinceEnd > 3600000) {
                localStorage.removeItem('kelarin_pomodoro');
            } else {
                setSession(parsed);
            }
        }

        const handleStart = (e) => {
            const { task, duration, music, theme } = e.detail;
            attemptStartSession(task, duration, music, theme);
        };
        window.addEventListener('start-pomodoro', handleStart);
        return () => window.removeEventListener('start-pomodoro', handleStart);
    }, []);

    // Ticker Loop
    useEffect(() => {
        if (!session || session.status !== 'running') return;
        const interval = setInterval(() => {
            setNow(Date.now());
            if (Date.now() >= session.endTime) completeSession();
        }, 1000);
        return () => clearInterval(interval);
    }, [session]);

    // Persistence
    useEffect(() => {
        if (session) localStorage.setItem('kelarin_pomodoro', JSON.stringify(session));
        else localStorage.removeItem('kelarin_pomodoro');
    }, [session]);

    // Actions
    const attemptStartSession = (task, duration, music, theme) => {
        const currentSession = sessionRef.current;
        const finalDuration = duration || 25 * 60 * 1000;
        const finalTheme = theme || 'default';

        if (currentSession) {
            const isDark = document.documentElement.classList.contains('dark');
            Swal.fire({
                title: 'Lagi Fokus Nih 🤨',
                text: `Timer untuk "${currentSession.title}" masih jalan. Mau ganti?`,
                icon: 'question',
                showCancelButton: true, confirmButtonText: 'Ya, Ganti Task', cancelButtonText: 'Batal', confirmButtonColor: '#9333ea',
                background: isDark ? '#1f2937' : '#fff', color: isDark ? '#fff' : '#1f2937'
            }).then((res) => {
                if (res.isConfirmed) executeStart(task, finalDuration, music, finalTheme);
            });
            return;
        }
        executeStart(task, finalDuration, music, finalTheme);
    };

    const executeStart = (task, duration, music, theme) => {
        const newSession = { taskId: task.id, title: task.title, endTime: Date.now() + duration, duration: duration, status: 'running', music: music, theme: theme };
        setSession(newSession);
        const isDark = document.documentElement.classList.contains('dark');
        Swal.fire({
            toast: true, position: 'top-end', icon: 'success', title: 'Mode fokus aktif. 🎧🍅', showConfirmButton: false, timer: 3000,
            background: isDark ? '#1f2937' : '#fff', color: isDark ? '#fff' : '#1f2937'
        });
    };

    const pauseTimer = () => { if (!session) return; const remaining = session.endTime - Date.now(); setSession({ ...session, status: 'paused', remainingWhenPaused: remaining }); };
    const resumeTimer = () => { if (!session) return; setSession({ ...session, status: 'running', endTime: Date.now() + session.remainingWhenPaused }); };
    const stopTimer = () => {
        const isDark = document.documentElement.classList.contains('dark');
        Swal.fire({
            title: 'Sudahan?', text: "Gak dicatat lho.", icon: 'warning', showCancelButton: true, confirmButtonText: 'Stop', confirmButtonColor: '#d33',
            background: isDark ? '#1f2937' : '#fff', color: isDark ? '#fff' : '#1f2937'
        }).then((res) => { if (res.isConfirmed) { if(audioRef.current) audioRef.current.pause(); setSession(null); } });
    };

    const completeSession = () => {
        playAlarm(repetition);
        if(audioRef.current) audioRef.current.pause();
        const minutesCompleted = Math.round(session.duration / 60000);
        router.post(route('activities.store'), { description: `Menyelesaikan sesi fokus ${minutesCompleted} menit: '${session.title}'`, type: 'success' }, { preserveScroll: true });
        const isDark = document.documentElement.classList.contains('dark');
        Swal.fire({ title: 'Fokus Selesai! 🎉', text: 'Mantap! Istirahat bentar.', icon: 'success', confirmButtonText: 'Sip!', confirmButtonColor: '#9333ea', background: isDark ? '#1f2937' : '#fff', color: isDark ? '#fff' : '#1f2937' });
        setSession(null);
    };

    if (!session) return null;

    const timeLeft = session.status === 'running' ? Math.max(0, session.endTime - now) : session.remainingWhenPaused;
    const hours = Math.floor(timeLeft / 3600000);
    const minutes = Math.floor((timeLeft % 3600000) / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((timeLeft % 60000) / 1000).toString().padStart(2, '0');
    const timeString = hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
    
    const progressPercent = Math.min(100, Math.max(0, ((session.duration - timeLeft) / session.duration) * 100));
    
    let barColor = '';
    if (session.status === 'paused') barColor = 'bg-gray-400 dark:bg-gray-600';
    else if (timeLeft < 10000) barColor = 'bg-red-500 animate-pulse';
    else {
        switch(session.theme) {
            case 'cat': barColor = 'bg-gradient-to-r from-pink-300 to-purple-400'; break;
            case 'blue': barColor = 'bg-gradient-to-r from-cyan-400 to-blue-600'; break;
            case 'orange': barColor = 'bg-gradient-to-r from-yellow-400 to-orange-600'; break;
            case 'default':
            default: barColor = 'bg-gradient-to-r from-purple-500 to-pink-500'; break;
        }
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-purple-100 dark:border-gray-700 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-[100] transition-all duration-500 transform translate-y-0">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${session.status === 'running' ? 'bg-purple-100 dark:bg-purple-900/30 animate-pulse-slow' : 'bg-gray-100 dark:bg-gray-800 grayscale'}`}>🍅</div>
                    <div className="min-w-0">
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider flex items-center gap-2">
                            {session.status === 'paused' ? 'Sedang Istirahat ⏸' : 'Mode Fokus 🔥'}
                            {session.music && <span className="text-[10px] bg-purple-100 dark:bg-purple-900 px-1 rounded">🎵 Playing</span>}
                        </p>
                        <p className="text-sm font-bold text-gray-800 dark:text-white truncate max-w-[150px] sm:max-w-xs">{session.title}</p>
                    </div>
                </div>
                <div className={`absolute left-1/2 -translate-x-1/2 font-mono text-3xl font-black tracking-widest transition-colors ${timeLeft < 10000 && session.status === 'running' ? 'text-red-500 scale-110' : 'text-gray-800 dark:text-white'}`}>{timeString}</div>
                <div className="flex items-center gap-2">
                    {session.status === 'running' ? (<button onClick={pauseTimer} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition transform hover:scale-110 active:scale-95" title="Pause">⏸</button>) : (<button onClick={resumeTimer} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-green-500 transition transform hover:scale-110 active:scale-95" title="Resume">▶</button>)}
                    <button onClick={stopTimer} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition transform hover:scale-110 active:scale-95" title="Stop">⏹</button>
                </div>
            </div>
            
            <div className="relative h-2 bg-gray-200 dark:bg-gray-700 w-full"> 
                <div 
                    className={`h-full transition-all duration-1000 ease-linear rounded-r-full ${barColor}`} 
                    style={{ width: `${progressPercent}%` }}
                ></div>
                
                {session.theme === 'cat' && session.status === 'running' && (
                    <div 
                        className="absolute top-[-22px] transition-all duration-1000 ease-linear z-20 filter drop-shadow-sm"
                        // 🔥 FIX FINAL: MUNDURIN 38px BIAR MUKA KUCING PAS DI UJUNG GARIS
                        style={{ left: `calc(${progressPercent}% - 60px)` }} 
                    >
                        <span className="text-2xl inline-block" style={{ transform: 'scaleX(-1)' }}>
                            🐈💨
                        </span> 
                    </div>
                )}
            </div>
        </div>
    );
}