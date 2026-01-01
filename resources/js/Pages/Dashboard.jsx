import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Swal from 'sweetalert2';
import logoKelarin from '../../images/kelarinlogo.svg'; 

import { DndContext, useSensor, useSensors, PointerSensor, TouchSensor, DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const createToast = (duration = 3000) => Swal.mixin({
    toast: true, position: 'bottom-end', showConfirmButton: true, confirmButtonText: '⏪ Undo', confirmButtonColor: '#f59e0b', showCancelButton: false, timer: duration, timerProgressBar: true, background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff', color: document.documentElement.classList.contains('dark') ? '#fff' : '#1f2937',
});

// --- HELPER: ASK DURATION & MUSIC 🎵 ---
const handleStartPomodoro = (task) => {
    const isDark = document.documentElement.classList.contains('dark');
    Swal.fire({
        title: 'Setting Mode Fokus 🍅',
        html: `
            <div class="space-y-4 text-left">
                <div>
                    <label class="block text-xs font-bold text-gray-500 mb-1 ml-1">Durasi Fokus</label>
                    <div class="flex justify-center items-center gap-2">
                        <div class="flex flex-col">
                            <input id="swal-hours" type="number" min="0" max="8" class="w-20 text-center text-xl font-bold rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="0">
                            <label class="text-[10px] text-gray-400 mt-1 text-center">Jam</label>
                        </div>
                        <span class="text-2xl font-bold text-gray-400">:</span>
                        <div class="flex flex-col">
                            <input id="swal-minutes" type="number" min="0" max="59" value="25" class="w-20 text-center text-xl font-bold rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="25">
                            <label class="text-[10px] text-gray-400 mt-1 text-center">Menit</label>
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-gray-500 mb-1 ml-1">Tampilan Progress Bar</label>
                    <select id="swal-theme" class="w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 focus:ring-purple-500 focus:border-purple-500">
                        <option value="cat">🐈 Mode Kucing (Lari Terus!)</option>
                        <option value="default">🌈 Default (Gradient Ungu)</option>
                        <option value="blue">🌊 Ocean Blue (Tenang)</option>
                        <option value="orange">🍊 Sunset (Semangat)</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold text-gray-500 mb-1 ml-1">Background Music</label>
                    <select id="swal-music" class="w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 focus:ring-purple-500 focus:border-purple-500">
                        <option value="">🔕 Hening (Tanpa Musik)</option>
                        <option value="lofi">☕ Lofi Beats (Santai)</option>
                    </select>
                    <p class="text-[10px] text-orange-500 mt-1 italic">
                        *BGM lain sedang dalam proses... kalo mau request lain, setel di YouTube langsung aja wkwkwk 🤣
                    </p>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Gas Fokus! 🚀',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#9333ea', 
        background: isDark ? '#1f2937' : '#fff',
        color: isDark ? '#fff' : '#1f2937',
        preConfirm: () => {
            const hours = document.getElementById('swal-hours').value || 0;
            const minutes = document.getElementById('swal-minutes').value || 0;
            const music = document.getElementById('swal-music').value;
            const theme = document.getElementById('swal-theme').value; // Ambil Theme

            const intMinutes = parseInt(minutes);
            const intHours = parseInt(hours);

            if (intMinutes > 59) { Swal.showValidationMessage('Menit maksimal 59 bro!'); return false; }
            if (intMinutes < 0 || intHours < 0) { Swal.showValidationMessage('Waktu gak boleh minus!'); return false; }
            const totalMinutes = (intHours * 60) + intMinutes;
            if (totalMinutes < 1) { Swal.showValidationMessage('Minimal 1 menit lah bro! 😂'); return false; }
            if (totalMinutes > 480) { Swal.showValidationMessage('Maksimal 8 jam aja!'); return false; }
            
            // Return Object Lengkap
            return { 
                durationMs: totalMinutes * 60 * 1000, 
                music, 
                theme 
            }; 
        }
    }).then((result) => {
        if (result.isConfirmed) {
            window.dispatchEvent(new CustomEvent('start-pomodoro', { 
                detail: { 
                    task, 
                    duration: result.value.durationMs, 
                    music: result.value.music,
                    theme: result.value.theme 
                } 
            }));
        }
    });
};

const CustomTooltip = ({ active, payload, label }) => { /* ... sama ... */ if (active && payload && payload.length) { return (<div className="bg-white dark:bg-gray-800 p-3 border dark:border-gray-700 rounded-lg shadow-xl text-left"><p className="font-bold text-gray-700 dark:text-gray-200 mb-1 border-b dark:border-gray-600 pb-1">{label}</p><p className="text-xs text-purple-500 mt-1">📥 Masuk: <span className="font-bold text-sm">{payload[0].value}</span></p><p className="text-xs text-emerald-500">✅ Selesai: <span className="font-bold text-sm">{payload[1].value}</span></p></div>); } return null; };

// --- 1. TASK CARD (Update: Logic Hide Tomat) ---
function TaskCard({ task, openModal, handleDelete, handleRestore, currentFilter, isOverlay = false, activePomodoroId }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id.toString(), data: { task }, disabled: isOverlay });
    const style = { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.3 : 1, touchAction: 'none' };
    const STATUS = { pending: { card: 'bg-orange-50 dark:bg-gray-800 dark:border-gray-700' }, progress: { card: 'bg-blue-50 dark:bg-gray-800 dark:border-gray-700' }, done: { card: 'bg-emerald-50 dark:bg-gray-800 dark:border-gray-700' } };
    const PRIORITY = { high: { label: 'High', badge: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700', icon: '🔥' }, medium: { label: 'Medium', badge: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700', icon: '⚡' }, low: { label: 'Low', badge: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700', icon: '☕' } };

    // 🔥 LOGIC: HILANGKAN TOMAT JIKA TASK INI LAGI DIJALANKAN (activePomodoroId)
    const isRunning = activePomodoroId === task.id;

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`relative group rounded-xl border p-4 mb-3 flex flex-col justify-between ${STATUS[task.status].card} ${'cursor-grab active:cursor-grabbing'} ${isOverlay || isDragging ? '' : 'transition-all duration-200 hover:shadow-md hover:-translate-y-1'} ${isOverlay ? 'shadow-2xl scale-105 rotate-2 z-50 border-purple-500 ring-2 ring-purple-500/20' : 'shadow-sm'}`}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex flex-wrap items-center gap-2 pr-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide flex items-center gap-1 ${PRIORITY[task.priority || 'medium'].badge}`}><span>{PRIORITY[task.priority || 'medium'].icon}</span>{PRIORITY[task.priority || 'medium'].label}</span>
                    {task.category && (<span className="text-[10px] px-2 py-0.5 rounded-full border bg-white/60 dark:bg-gray-700/60 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium truncate max-w-[80px]">📂 {task.category.name}</span>)}
                </div>
                {!isOverlay && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm p-0.5 rounded-lg">
                        {currentFilter !== 'archive' ? (
                            <>
                                {/* 🔥 TOMAT HILANG KALAU DONE ATAU LAGI RUNNING */}
                                {task.status !== 'done' && !isRunning && (<button onPointerDown={(e) => { e.stopPropagation(); handleStartPomodoro(task); }} className="text-gray-400 hover:text-purple-600 p-1" title="Mulai Fokus">🍅</button>)}
                                
                                {/* Kalau lagi running, tampilkan indikator kecil (Opsional) */}
                                {isRunning && <span className="text-xs animate-pulse p-1">🔥</span>}

                                <button onPointerDown={(e) => { e.stopPropagation(); openModal(task); }} className="text-gray-400 hover:text-purple-600 p-1" title="Edit">✏️</button>
                                <button onPointerDown={(e) => { e.stopPropagation(); handleDelete(task.id); }} className="text-gray-400 hover:text-red-600 p-1" title="Hapus">🗑️</button>
                            </>
                        ) : (
                            <><button onPointerDown={(e) => { e.stopPropagation(); handleRestore(task.id); }} className="text-gray-400 hover:text-emerald-600 p-1" title="Restore">♻️</button><button onPointerDown={(e) => { e.stopPropagation(); handleDelete(task.id); }} className="text-gray-400 hover:text-red-600 p-1" title="Hapus Permanen">🔥</button></>
                        )}
                    </div>
                )}
            </div>
            <div className="mb-2">
                <h4 className="font-bold text-gray-800 dark:text-white text-sm leading-tight mb-1">{task.title}</h4>
                {task.description && <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2">{task.description}</p>}
            </div>
            <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[10px] text-gray-400 font-medium">
                {task.due_date ? (<span className={`flex items-center gap-1 ${new Date(task.due_date) < new Date() && task.status !== 'done' ? 'text-red-500 font-bold' : 'text-purple-600 dark:text-purple-400'}`}>🗓️ {new Date(task.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>) : (<span>-</span>)}
            </div>
        </div>
    );
}

function KanbanColumn({ id, title, count, icon, bgInfo, children, filter }) { /* ... SAMA PERSIS ... */ const { setNodeRef } = useDroppable({ id }); const getEmptyMessage = () => { if (filter === 'archive') return { text: "Tong sampah bersih.", sub: "Gak ada yang dibuang." }; if (id === 'pending') return { text: "Gak ada tugas gantung.", sub: "Santai dulu, bro! 😎" }; if (id === 'progress') return { text: "Gak ada yang dikerjain?", sub: "Gas satu tugas dong! 🚀" }; if (id === 'done') return { text: "Belum ada yang kelar.", sub: "Yuk cicil dikit-dikit! 🔥" }; return { text: "Kosong melompong.", sub: "Sepi amat kayak hati." }; }; const msg = getEmptyMessage(); return (<div className="flex flex-col h-full min-w-[280px] w-full md:w-1/3"><div className={`p-3 rounded-t-xl border-t border-x ${bgInfo.header} flex justify-between items-center`}><div className="flex items-center gap-2"><span className="text-lg">{icon}</span><h3 className={`font-bold ${bgInfo.text}`}>{title}</h3></div><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bgInfo.badge}`}>{count}</span></div><div ref={setNodeRef} className={`flex-1 p-3 border-x border-b rounded-b-xl bg-gray-50/50 dark:bg-gray-800/50 overflow-y-auto min-h-[400px] ${bgInfo.border}`}>{children}{count === 0 && (<div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center opacity-70"><svg className="w-16 h-16 mb-3 text-gray-300 dark:text-gray-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg><p className="text-sm font-medium">{msg.text}</p><p className="text-xs mt-1">{msg.sub}</p></div>)}</div></div>); }

// --- 2. FOCUS BOARD (Update: Logic Hide Tomat) ---
function FocusBoard({ tasks, toggleStatus, openModal, activePomodoroId }) {
    const today = new Date().setHours(0,0,0,0);
    const overdueTasks = tasks.filter(t => { const d = new Date(t.due_date); d.setHours(0,0,0,0); return t.due_date && d < today && t.status !== 'done'; });
    const focusTasks = tasks.filter(t => t.status !== 'done' && !overdueTasks.includes(t));
    const completedToday = tasks.filter(t => t.status === 'done');

    const FocusItem = ({ task, isOverdue = false }) => {
        const isRunning = activePomodoroId === task.id; // 🔥 Cek Active
        return (
            <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 group ${isOverdue ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md'}`}>
                <button onClick={() => toggleStatus(task)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${task.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-500 hover:border-purple-500'}`}>{task.status === 'done' && <span className="text-white text-xs">✓</span>}</button>
                
                {/* 🔥 HIDE BUTTON KALAU RUNNING */}
                {task.status !== 'done' && !isRunning && (<button onClick={(e) => { e.stopPropagation(); handleStartPomodoro(task); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors" title="Mulai Fokus">🍅</button>)}
                {isRunning && <span className="text-xl animate-bounce">🏃</span>}

                <div className="flex-1 cursor-pointer" onClick={() => openModal(task)}>
                    <div className="flex items-center gap-2 mb-1"><h4 className={`font-bold text-lg leading-tight ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-white'}`}>{task.title}</h4>{isOverdue && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">Telat!</span>}{task.priority === 'high' && <span className="text-xs">🔥</span>}</div>
                    {task.description && <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{task.description}</p>}
                </div>
                <div className="text-right">{task.category && <span className="block text-[10px] text-gray-400 uppercase tracking-wide">📂 {task.category.name}</span>}</div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
            <div className="text-center space-y-2"><h2 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">Fokus Hari Ini 🎯</h2><p className="text-gray-500 dark:text-gray-400">Selesaikan satu per satu.</p></div>
            {overdueTasks.length > 0 && (<div className="space-y-3 animate-pulse-slow"><h3 className="text-sm font-bold text-red-500 uppercase tracking-wider pl-1">⚠️ Terlewat & Harus Dikelarin</h3>{overdueTasks.map(t => <FocusItem key={t.id} task={t} isOverdue={true} />)}</div>)}
            <div className="space-y-3">{focusTasks.length > 0 ? (focusTasks.map(t => <FocusItem key={t.id} task={t} />)) : (overdueTasks.length === 0 && (<div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl"><p className="text-4xl mb-2 animate-bounce">🎉</p><p className="text-gray-500 dark:text-gray-400 font-medium">Semua tugas hari ini beres!</p><p className="text-sm text-gray-400">Rebahan dulu gih.</p></div>))}</div>
            {completedToday.length > 0 && (<div className="opacity-60 hover:opacity-100 transition-opacity"><div className="flex items-center gap-4 mb-4"><div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div><span className="text-xs font-bold text-gray-400 uppercase">Selesai ({completedToday.length})</span><div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div></div><div className="space-y-2">{completedToday.map(t => <FocusItem key={t.id} task={t} />)}</div></div>)}
        </div>
    );
}

function ArchiveBoard({ tasks, handleRestore, handleDelete }) { /* ... SAMA PERSIS ... */ if (tasks.length === 0) { return (<div className="h-96 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl"><p className="text-4xl mb-2 animate-pulse">✨</p><p>Tong sampah bersih.</p></div>); } return (<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"><div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"><h3 className="font-bold text-gray-700 dark:text-gray-200">Arsip / Sampah 📦</h3><p className="text-xs text-gray-500 dark:text-gray-400">File akan dihapus permanen jika diinginkan.</p></div><div className="overflow-x-auto"><table className="w-full text-left text-sm text-gray-600 dark:text-gray-300"><thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-bold text-gray-500 dark:text-gray-400"><tr><th className="px-6 py-3">Nama Tugas</th><th className="px-6 py-3">Kategori</th><th className="px-6 py-3">Dihapus Pada</th><th className="px-6 py-3 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-700">{tasks.map((task) => (<tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"><td className="px-6 py-4 font-medium text-gray-800 dark:text-white">{task.title}{task.description && <p className="text-xs text-gray-400 font-normal truncate max-w-xs">{task.description}</p>}</td><td className="px-6 py-4">{task.category ? (<span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs border dark:border-gray-600">📂 {task.category.name}</span>) : '-'}</td><td className="px-6 py-4 font-mono text-xs text-gray-400">{task.deleted_at ? new Date(task.deleted_at).toLocaleDateString('id-ID') : '-'}</td><td className="px-6 py-4 text-right space-x-2"><button onClick={() => handleRestore(task.id)} className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline text-xs bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800 transition">♻️ Restore</button><button onClick={() => handleDelete(task.id)} className="text-red-600 hover:text-red-700 font-medium hover:underline text-xs bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-800 transition">🔥 Permanen</button></td></tr>))}</tbody></table></div></div>); }

// --- 3. DASHBOARD UTAMA ---
export default function Dashboard({ auth, tasks, weeklyStats = [], flash = {}, currentFilter = 'inbox', currentCategoryId = null, searchTerm = '' }) {
    const { categories } = usePage().props;
    const preferences = auth.user.preferences || { undo_duration: 3000, default_priority: 'medium' };
    const Toast = createToast(preferences.undo_duration);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState(searchTerm || '');
    const [localTasks, setLocalTasks] = useState(tasks);
    const [activeId, setActiveId] = useState(null);
    
    // 🔥 STATE BARU: ACTIVE POMODORO ID
    const [activePomodoroId, setActivePomodoroId] = useState(null);

    // 🔥 EFFECT BUAT CEK LOCAL STORAGE SAAT LOAD & DENGAR EVENT
    useEffect(() => {
        // Cek Local Storage (Biar pas refresh icon tetep ilang)
        const saved = localStorage.getItem('kelarin_pomodoro');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.status === 'running' || parsed.status === 'paused') {
                setActivePomodoroId(parsed.taskId);
            }
        }

        // Listener buat update state realtime dari PomodoroTimer
        const handleStatusUpdate = (e) => {
            const { taskId, status } = e.detail;
            if (status === 'stopped' || status === 'completed') {
                setActivePomodoroId(null);
            } else {
                setActivePomodoroId(taskId);
            }
        };

        window.addEventListener('pomodoro-status', handleStatusUpdate);
        return () => window.removeEventListener('pomodoro-status', handleStatusUpdate);
    }, []);

    const totalAdded = weeklyStats.reduce((s, d) => s + d.added, 0);
    const totalDone = weeklyStats.reduce((s, d) => s + d.done, 0);
    const bestDay = weeklyStats.reduce((max, d) => d.done > max.done ? d : max, weeklyStats[0] || { day: '-', done: 0 });

    useEffect(() => { setLocalTasks(tasks); }, [tasks]);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({ title: '', description: '', status: 'pending', priority: preferences.default_priority, due_date: '', category_id: currentCategoryId || '', });
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor));
    const handleDragStart = (event) => setActiveId(event.active.id);
    const handleDragEnd = (event) => { const { active, over } = event; setActiveId(null); if (!over) return; const taskId = parseInt(active.id); const newStatus = over.id; updateTaskStatus(taskId, newStatus); };
    const updateTaskStatus = (taskId, newStatus) => { const oldTask = localTasks.find(t => t.id === taskId); if (!oldTask || oldTask.status === newStatus) return; const previousStatus = oldTask.status; const updatedTasks = localTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t); setLocalTasks(updatedTasks); router.put(route('tasks.update', taskId), { ...oldTask, status: newStatus }, { preserveScroll: true, preserveState: true, onSuccess: () => { Swal.close(); Toast.fire({ icon: 'success', title: newStatus === 'done' ? 'Tugas Selesai! 🎉' : `Pindah ke ${newStatus.toUpperCase()}` }).then((result) => { if (result.isConfirmed) { setLocalTasks(localTasks); router.put(route('tasks.update', taskId), { ...oldTask, status: previousStatus }, { preserveScroll: true, preserveState: true }); } }); }, onError: () => { setLocalTasks(localTasks); Swal.fire('Gagal!', 'Gagal update status.', 'error'); } }); };
    const activeTask = activeId ? localTasks.find(t => t.id == activeId) : null;
    const filteredTasks = localTasks.filter(task => { const query = searchQuery.toLowerCase().trim(); return !query || task.title.toLowerCase().includes(query) || (task.description && task.description.toLowerCase().includes(query)); });
    const columns = { pending: filteredTasks.filter(t => t.status === 'pending'), progress: filteredTasks.filter(t => t.status === 'progress'), done: filteredTasks.filter(t => t.status === 'done'), };
    const stats = { total: localTasks.length, pending: columns.pending.length, progress: columns.progress.length, done: columns.done.length };
    const COL_STYLES = { pending: { header: 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300', badge: 'bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200', border: 'border-orange-100 dark:border-orange-900/30' }, progress: { header: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', badge: 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200', border: 'border-blue-100 dark:border-blue-900/30' }, done: { header: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200', border: 'border-emerald-100 dark:border-emerald-900/30' } };
    const dropAnimation = { sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.3' } } }) };
    const pageTitles = { 'today': 'Tugas Hari Ini ☀️', 'upcoming': 'Mendatang 🗓️', 'archive': 'Arsip / Sampah 📦', 'inbox': 'Kanban Board 🚀' };
    let currentTitle = pageTitles[currentFilter] || 'Kanban Board';
    if (currentCategoryId) { const activeCat = categories.find(c => c.id == currentCategoryId); if (activeCat) currentTitle = `Project: ${activeCat.name} 📂`; }
    const openModal = (task = null) => { clearErrors(); if (task) { setIsEditing(true); setEditingId(task.id); setData({ title: task.title, description: task.description || '', status: task.status, priority: task.priority || 'medium', due_date: task.due_date ? task.due_date.split('T')[0] : '', category_id: task.category_id || '' }); } else { setIsEditing(false); setEditingId(null); setData({ title: '', description: '', status: 'pending', priority: preferences.default_priority, due_date: '', category_id: currentCategoryId || '' }); } setIsModalOpen(true); };
    const handleSubmit = (e) => { e.preventDefault(); const isDark = document.documentElement.classList.contains('dark'); const successAlert = () => { setIsModalOpen(false); reset(); Swal.fire({ title: 'Berhasil!', text: isEditing ? 'Tugas berhasil diupdate!' : 'Tugas baru berhasil dibuat!', icon: 'success', confirmButtonText: 'Mantap', confirmButtonColor: '#9333ea', timer: 3000, timerProgressBar: true, background: isDark ? '#1f2937' : '#fff', color: isDark ? '#fff' : '#1f2937' }); }; const options = { onSuccess: successAlert }; isEditing ? put(route('tasks.update', editingId), options) : post(route('tasks.store'), options); };
    const handleDelete = (id) => { const isArchive = currentFilter === 'archive'; const isDark = document.documentElement.classList.contains('dark'); Swal.fire({ title: isArchive ? 'Hapus Permanen?' : 'Buang ke Sampah?', text: isArchive ? "Data bakal hilang SELAMANYA gak bisa balik!" : "Tenang, masih bisa dibalikin dari menu Arsip.", icon: isArchive ? 'error' : 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: isArchive ? 'Ya, Musnahkan!' : 'Ya, Buang!', background: isDark ? '#1f2937' : '#fff', color: isDark ? '#fff' : '#1f2937' }).then((result) => { if (result.isConfirmed) { router.delete(route('tasks.destroy', id), { onSuccess: () => { if (!isArchive) { Swal.close(); Toast.fire({ icon: 'warning', title: 'Tugas dibuang ke sampah.', }).then((res) => { if (res.isConfirmed) router.patch(route('tasks.restore', id)); }); } else { Swal.fire({ title: 'Musnah!', text: 'Data sudah hilang selamanya.', icon: 'success', timer: 2000, showConfirmButton: false, background: isDark ? '#1f2937' : '#fff', color: isDark ? '#fff' : '#1f2937' }); } } }); } }); };
    const handleRestore = (id) => { const isDark = document.documentElement.classList.contains('dark'); Swal.fire({ title: 'Balikin Tugas?', icon: 'question', showCancelButton: true, confirmButtonColor: '#10b981', confirmButtonText: 'Ya, Balikin!', background: isDark ? '#1f2937' : '#fff', color: isDark ? '#fff' : '#1f2937' }).then((result) => { if (result.isConfirmed) { router.patch(route('tasks.restore', id), {}, { onSuccess: () => { Swal.fire({ title: 'Berhasil!', text: 'Tugas aktif kembali!', icon: 'success', confirmButtonText: 'Mantap', confirmButtonColor: '#9333ea', timer: 3000, background: isDark ? '#1f2937' : '#fff', color: isDark ? '#fff' : '#1f2937' }); } }); } }); };

    return (
        <AuthenticatedLayout user={auth.user} categories={categories} currentCategoryId={currentCategoryId} header={<div className="flex items-center gap-4"><h2 className="text-2xl font-bold text-gray-800 dark:text-white">{currentTitle}</h2></div>}>
            <Head title="Kanban Board" />
            <div className="py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* PASS activePomodoroId ke Components */}
                    {currentFilter === 'today' ? (
                        <FocusBoard tasks={localTasks} toggleStatus={(task) => updateTaskStatus(task.id, task.status === 'done' ? 'pending' : 'done')} openModal={openModal} activePomodoroId={activePomodoroId} />
                    ) : currentFilter === 'archive' ? (
                        <ArchiveBoard tasks={localTasks} handleRestore={handleRestore} handleDelete={handleDelete} />
                    ) : (
                        <>
                            <div className="flex flex-wrap gap-4 justify-center"><div className="rounded-xl p-3 border shadow-sm flex flex-col items-center justify-center w-28 bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"><p className="text-[10px] font-bold uppercase text-gray-400">Total</p><p className="text-2xl font-black text-gray-700 dark:text-white">{stats.total}</p></div><div className="rounded-xl p-3 border shadow-sm flex flex-col items-center justify-center w-28 bg-orange-50 border-orange-100 dark:bg-gray-800 dark:border-gray-700"><p className="text-[10px] font-bold uppercase text-orange-600 dark:text-orange-400">Pending</p><p className="text-2xl font-black text-orange-700 dark:text-orange-300">{stats.pending}</p></div><div className="rounded-xl p-3 border shadow-sm flex flex-col items-center justify-center w-28 bg-blue-50 border-blue-100 dark:bg-gray-800 dark:border-gray-700"><p className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">Progress</p><p className="text-2xl font-black text-blue-700 dark:text-blue-300">{stats.progress}</p></div><div className="rounded-xl p-3 border shadow-sm flex flex-col items-center justify-center w-28 bg-emerald-50 border-emerald-100 dark:bg-gray-800 dark:border-gray-700"><p className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Done</p><p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{stats.done}</p></div></div>
                            {!currentFilter.includes('archive') && !currentCategoryId && (<div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6 shadow-sm transition-colors"><div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4"><div><h3 className="font-bold text-gray-700 dark:text-white flex items-center gap-2 text-lg">📊 Produktivitas Minggu Ini</h3><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Minggu ini kamu menyelesaikan <span className="font-bold text-emerald-500">{totalDone}</span> dari <span className="font-bold text-purple-500">{totalAdded}</span> tugas baru.</p></div>{bestDay.done > 0 && (<div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg border border-emerald-100 dark:border-emerald-800"><span className="text-xl">🔥</span><div><p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Paling Produktif</p><p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{bestDay.day} ({bestDay.done} Selesai)</p></div></div>)}</div><div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={weeklyStats} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-10" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} /><Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} /><Bar dataKey="added" name="Ditambah" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={20} /><Bar dataKey="done" name="Selesai" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} /></BarChart></ResponsiveContainer></div></div>)}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700 shadow-sm transition-colors"><div className="relative w-full md:w-auto"><TextInput type="text" className="pl-9 w-full md:w-72 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" placeholder="Cari tugas..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span></div>{currentFilter !== 'archive' && (<PrimaryButton onClick={() => openModal()} className="w-full md:w-auto justify-center">+ Tugas Baru</PrimaryButton>)}</div>
                            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}><div className="flex flex-col md:flex-row gap-6 items-start h-full"><KanbanColumn id="pending" title="Pending" count={stats.pending} icon="⏳" bgInfo={COL_STYLES.pending} filter={currentFilter}>{columns.pending.map(task => <TaskCard key={task.id} task={task} openModal={openModal} handleDelete={handleDelete} handleRestore={handleRestore} currentFilter={currentFilter} activePomodoroId={activePomodoroId} />)}</KanbanColumn><KanbanColumn id="progress" title="On Progress" count={stats.progress} icon="🔥" bgInfo={COL_STYLES.progress} filter={currentFilter}>{columns.progress.map(task => <TaskCard key={task.id} task={task} openModal={openModal} handleDelete={handleDelete} handleRestore={handleRestore} currentFilter={currentFilter} activePomodoroId={activePomodoroId} />)}</KanbanColumn><KanbanColumn id="done" title="Selesai" count={stats.done} icon="✅" bgInfo={COL_STYLES.done} filter={currentFilter}>{columns.done.map(task => <TaskCard key={task.id} task={task} openModal={openModal} handleDelete={handleDelete} handleRestore={handleRestore} currentFilter={currentFilter} activePomodoroId={activePomodoroId} />)}</KanbanColumn></div><DragOverlay dropAnimation={dropAnimation}>{activeTask ? <TaskCard task={activeTask} isOverlay={true} currentFilter={currentFilter} activePomodoroId={activePomodoroId} /> : null}</DragOverlay></DndContext>
                        </>
                    )}
                </div>
            </div>
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}><div className="p-6 dark:bg-gray-800 dark:text-white"><h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">{isEditing ? 'Edit Tugas' : 'Tambah Tugas Baru'}</h2><form onSubmit={handleSubmit} className="space-y-4"><div><InputLabel value="Judul Tugas" className="dark:text-gray-300" /><TextInput className="w-full mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={data.title} onChange={e => setData('title', e.target.value)} placeholder="Contoh: Belajar Laravel" /><InputError message={errors.title} /></div><div className="grid grid-cols-2 gap-4"><div><InputLabel value="Status" className="dark:text-gray-300" /><select className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white mt-1" value={data.status} onChange={e => setData('status', e.target.value)}><option value="pending">⏳ Pending</option><option value="progress">🔥 Progress</option><option value="done">✅ Done</option></select></div><div><InputLabel value="Prioritas" className="dark:text-gray-300" /><select className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white mt-1" value={data.priority} onChange={e => setData('priority', e.target.value)}><option value="high">🔥 High</option><option value="medium">⚡ Medium</option><option value="low">☕ Low</option></select></div></div><div><InputLabel value="Kategori" className="dark:text-gray-300" /><select className={`w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white mt-1 ${!isEditing && currentCategoryId ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''}`} value={data.category_id} onChange={e => setData('category_id', e.target.value)} disabled={!isEditing && !!currentCategoryId} ><option value="">📂 Inbox</option>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select>{!isEditing && currentCategoryId && <p className="text-xs text-purple-500 mt-1">*Kategori dikunci karena kamu sedang di dalam folder proyek.</p>}</div><div><InputLabel value="Tenggat Waktu" className="dark:text-gray-300" /><TextInput type="date" className="w-full mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={data.due_date} onChange={e => setData('due_date', e.target.value)} /></div><div><InputLabel value="Deskripsi" className="dark:text-gray-300" /><textarea className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white mt-1" rows="3" value={data.description} onChange={e => setData('description', e.target.value)} /></div><div className="flex justify-end gap-3 mt-6"><SecondaryButton onClick={() => setIsModalOpen(false)} className="dark:bg-gray-700 dark:text-gray-300">Batal</SecondaryButton><PrimaryButton disabled={processing}>Simpan</PrimaryButton></div></form></div></Modal>
        </AuthenticatedLayout>
    );
}