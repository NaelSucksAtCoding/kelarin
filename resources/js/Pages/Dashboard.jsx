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

// --- LIBRARY DRAG & DROP ---
import { DndContext, useSensor, useSensors, PointerSensor, TouchSensor, DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// --- LIBRARY CHART (ANALYTICS) ---
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// 🔥 REVISI: TOAST JADI FUNCTION DENGAN PARAMETER DURASI
const createToast = (duration = 3000) => Swal.mixin({
    toast: true,
    position: 'bottom-end',
    showConfirmButton: true,
    confirmButtonText: '⏪ Undo',
    confirmButtonColor: '#f59e0b',
    showCancelButton: false,
    timer: duration, // 🔥 PAKAI DURASI DARI SETTING
    timerProgressBar: true,
    background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
    color: document.documentElement.classList.contains('dark') ? '#fff' : '#1f2937',
});

// --- KOMPONEN CUSTOM TOOLTIP ---
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-3 border dark:border-gray-700 rounded-lg shadow-xl text-left">
                <p className="font-bold text-gray-700 dark:text-gray-200 mb-1 border-b dark:border-gray-600 pb-1">{label}</p>
                <p className="text-xs text-purple-500 mt-1">📥 Masuk: <span className="font-bold text-sm">{payload[0].value}</span></p>
                <p className="text-xs text-emerald-500">✅ Selesai: <span className="font-bold text-sm">{payload[1].value}</span></p>
            </div>
        );
    }
    return null;
};

// --- 1. KOMPONEN KARTU TUGAS ---
function TaskCard({ task, openModal, handleDelete, handleRestore, currentFilter, isOverlay = false }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id.toString(),
        data: { task },
        disabled: isOverlay, 
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.3 : 1, 
        touchAction: 'none',
    };

    const STATUS = {
        pending: { card: 'bg-orange-50 dark:bg-gray-800 dark:border-gray-700' },
        progress: { card: 'bg-blue-50 dark:bg-gray-800 dark:border-gray-700' },
        done: { card: 'bg-emerald-50 dark:bg-gray-800 dark:border-gray-700' },
    };

    const PRIORITY = {
        high: { label: 'High', badge: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700', icon: '🔥' },
        medium: { label: 'Medium', badge: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700', icon: '⚡' },
        low: { label: 'Low', badge: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700', icon: '☕' },
    };

    return (
        <div
            ref={setNodeRef} style={style} {...attributes} {...listeners}
            className={`
                relative group rounded-xl border p-4 mb-3 flex flex-col justify-between 
                ${STATUS[task.status].card}
                ${'cursor-grab active:cursor-grabbing'}
                ${isOverlay || isDragging ? '' : 'transition-all duration-200 hover:shadow-md hover:-translate-y-1'}
                ${isOverlay ? 'shadow-2xl scale-105 rotate-2 z-50 border-purple-500 ring-2 ring-purple-500/20' : 'shadow-sm'}
            `}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex flex-wrap items-center gap-2 pr-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide flex items-center gap-1 ${PRIORITY[task.priority || 'medium'].badge}`}>
                        <span>{PRIORITY[task.priority || 'medium'].icon}</span>
                        {PRIORITY[task.priority || 'medium'].label}
                    </span>
                    {task.category && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border bg-white/60 dark:bg-gray-700/60 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium truncate max-w-[80px]">
                            📂 {task.category.name}
                        </span>
                    )}
                </div>
                {!isOverlay && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm p-0.5 rounded-lg">
                        {currentFilter !== 'archive' ? (
                            <>
                                <button onPointerDown={(e) => { e.stopPropagation(); openModal(task); }} className="text-gray-400 hover:text-purple-600 p-1" title="Edit">✏️</button>
                                <button onPointerDown={(e) => { e.stopPropagation(); handleDelete(task.id); }} className="text-gray-400 hover:text-red-600 p-1" title="Hapus">🗑️</button>
                            </>
                        ) : (
                            <>
                                <button onPointerDown={(e) => { e.stopPropagation(); handleRestore(task.id); }} className="text-gray-400 hover:text-emerald-600 p-1" title="Restore">♻️</button>
                                <button onPointerDown={(e) => { e.stopPropagation(); handleDelete(task.id); }} className="text-gray-400 hover:text-red-600 p-1" title="Hapus Permanen">🔥</button>
                            </>
                        )}
                    </div>
                )}
            </div>
            <div className="mb-2">
                <h4 className="font-bold text-gray-800 dark:text-white text-sm leading-tight mb-1">{task.title}</h4>
                {task.description && <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2">{task.description}</p>}
            </div>
            <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[10px] text-gray-400 font-medium">
                {task.due_date ? (
                    <span className={`flex items-center gap-1 ${new Date(task.due_date) < new Date() && task.status !== 'done' ? 'text-red-500 font-bold' : 'text-purple-600 dark:text-purple-400'}`}>
                        🗓️ {new Date(task.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                ) : (<span>-</span>)}
            </div>
        </div>
    );
}

// --- 2. KOMPONEN KOLOM ---
function KanbanColumn({ id, title, count, icon, bgInfo, children, filter }) {
    const { setNodeRef } = useDroppable({ id });

    const getEmptyMessage = () => {
        if (filter === 'archive') return { text: "Tong sampah bersih.", sub: "Gak ada yang dibuang." };
        if (id === 'pending') return { text: "Gak ada tugas gantung.", sub: "Santai dulu, bro! 😎" };
        if (id === 'progress') return { text: "Gak ada yang dikerjain?", sub: "Gas satu tugas dong! 🚀" };
        if (id === 'done') return { text: "Belum ada yang kelar.", sub: "Yuk cicil dikit-dikit! 🔥" };
        return { text: "Kosong melompong.", sub: "Sepi amat kayak hati." };
    };

    const msg = getEmptyMessage();

    return (
        <div className="flex flex-col h-full min-w-[280px] w-full md:w-1/3">
            <div className={`p-3 rounded-t-xl border-t border-x ${bgInfo.header} flex justify-between items-center`}>
                <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <h3 className={`font-bold ${bgInfo.text}`}>{title}</h3>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bgInfo.badge}`}>{count}</span>
            </div>
            <div ref={setNodeRef} className={`flex-1 p-3 border-x border-b rounded-b-xl bg-gray-50/50 dark:bg-gray-800/50 overflow-y-auto min-h-[400px] ${bgInfo.border}`}>
                {children}
                {count === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center opacity-70">
                        <svg className="w-16 h-16 mb-3 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-sm font-medium">{msg.text}</p>
                        <p className="text-xs mt-1">{msg.sub}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- 3. DASHBOARD UTAMA ---
// Hapus props 'categories' dari sini karena udah global
export default function Dashboard({ auth, tasks, weeklyStats = [], flash = {}, currentFilter = 'inbox', currentCategoryId = null, searchTerm = '' }) {
    
    // 🔥 AMBIL KATEGORI DARI GLOBAL INERTIA
    const { categories } = usePage().props;

    // 🔥 AMBIL PREFERENSI USER (Safe Access)
    const preferences = auth.user.preferences || { undo_duration: 3000, default_priority: 'medium' };
    
    // 🔥 INISIALISASI TOAST DENGAN DURASI USER
    const Toast = createToast(preferences.undo_duration);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState(searchTerm || '');
    const [localTasks, setLocalTasks] = useState(tasks);
    const [activeId, setActiveId] = useState(null);

    const totalAdded = weeklyStats.reduce((s, d) => s + d.added, 0);
    const totalDone = weeklyStats.reduce((s, d) => s + d.done, 0);
    const bestDay = weeklyStats.reduce((max, d) => d.done > max.done ? d : max, weeklyStats[0] || { day: '-', done: 0 });

    useEffect(() => { setLocalTasks(tasks); }, [tasks]);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        title: '', 
        description: '', 
        status: 'pending', 
        priority: preferences.default_priority, // 🔥 SETTING DEFAULT PRIORITY USER
        due_date: '', 
        category_id: currentCategoryId || '',
    });

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor));

    const handleDragStart = (event) => setActiveId(event.active.id);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over) return;
        const taskId = parseInt(active.id);
        const newStatus = over.id; 
        const oldTask = localTasks.find(t => t.id === taskId);
        
        if (!oldTask || oldTask.status === newStatus) return;

        const previousStatus = oldTask.status; 
        const updatedTasks = localTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
        setLocalTasks(updatedTasks);

        router.put(route('tasks.update', taskId), { ...oldTask, status: newStatus }, {
            preserveScroll: true, preserveState: true,
            onSuccess: () => {
                Swal.close(); // Clean previous toast
                Toast.fire({
                    icon: 'success',
                    title: `Pindah ke ${newStatus.toUpperCase()}`,
                }).then((result) => {
                    if (result.isConfirmed) {
                        setLocalTasks(localTasks);
                        router.put(route('tasks.update', taskId), { ...oldTask, status: previousStatus }, {
                            preserveScroll: true, preserveState: true,
                        });
                    }
                });
            },
            onError: () => { setLocalTasks(localTasks); Swal.fire('Gagal!', 'Gagal update status.', 'error'); }
        });
    };

    const activeTask = activeId ? localTasks.find(t => t.id == activeId) : null;
    const filteredTasks = localTasks.filter(task => {
        const query = searchQuery.toLowerCase().trim();
        return !query || task.title.toLowerCase().includes(query) || (task.description && task.description.toLowerCase().includes(query));
    });

    const columns = {
        pending: filteredTasks.filter(t => t.status === 'pending'),
        progress: filteredTasks.filter(t => t.status === 'progress'),
        done: filteredTasks.filter(t => t.status === 'done'),
    };

    const stats = {
        total: localTasks.length,
        pending: columns.pending.length,
        progress: columns.progress.length,
        done: columns.done.length,
    };

    const pageTitles = { 'today': 'Tugas Hari Ini ☀️', 'upcoming': 'Mendatang 🗓️', 'archive': 'Arsip / Sampah 📦', 'inbox': 'Kanban Board 🚀' };
    let currentTitle = pageTitles[currentFilter] || 'Kanban Board';
    if (currentCategoryId) {
        const activeCat = categories.find(c => c.id == currentCategoryId);
        if (activeCat) currentTitle = `Project: ${activeCat.name} 📂`;
    }

    const openModal = (task = null) => {
        clearErrors();
        if (task) {
            setIsEditing(true); setEditingId(task.id);
            setData({ 
                title: task.title, description: task.description || '', status: task.status, priority: task.priority || 'medium', due_date: task.due_date ? task.due_date.split('T')[0] : '', category_id: task.category_id || '' 
            });
        } else {
            setIsEditing(false); setEditingId(null); 
            setData({ title: '', description: '', status: 'pending', priority: preferences.default_priority, due_date: '', category_id: currentCategoryId || '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const isDark = document.documentElement.classList.contains('dark');
        const successAlert = () => {
            setIsModalOpen(false); reset();
            Swal.fire({ title: 'Berhasil!', text: isEditing ? 'Tugas berhasil diupdate!' : 'Tugas baru berhasil dibuat!', icon: 'success', confirmButtonText: 'Mantap', confirmButtonColor: '#9333ea', timer: 3000, timerProgressBar: true, background: isDark ? '#1f2937' : '#fff', color: isDark ? '#fff' : '#1f2937' });
        };
        const options = { onSuccess: successAlert };
        isEditing ? put(route('tasks.update', editingId), options) : post(route('tasks.store'), options);
    };

    const handleDelete = (id) => {
        const isArchive = currentFilter === 'archive';
        const isDark = document.documentElement.classList.contains('dark');
        
        Swal.fire({ 
            title: isArchive ? 'Hapus Permanen?' : 'Buang ke Sampah?', 
            text: isArchive ? "Data bakal hilang SELAMANYA gak bisa balik!" : "Tenang, masih bisa dibalikin dari menu Arsip.",
            icon: isArchive ? 'error' : 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: isArchive ? 'Ya, Musnahkan!' : 'Ya, Buang!', background: isDark ? '#1f2937' : '#fff', color: isDark ? '#fff' : '#1f2937' 
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('tasks.destroy', id), {
                    onSuccess: () => {
                        if (!isArchive) {
                            Swal.close(); // Clean previous toast
                            Toast.fire({
                                icon: 'warning',
                                title: 'Tugas dibuang ke sampah.',
                            }).then((res) => {
                                if (res.isConfirmed) {
                                    router.patch(route('tasks.restore', id));
                                }
                            });
                        } else {
                            Swal.fire({ title: 'Musnah!', text: 'Data sudah hilang selamanya.', icon: 'success', timer: 2000, showConfirmButton: false, background: isDark ? '#1f2937' : '#fff', color: isDark ? '#fff' : '#1f2937' });
                        }
                    }
                });
            }
        });
    };

    const handleRestore = (id) => {
        const isDark = document.documentElement.classList.contains('dark');
        Swal.fire({ title: 'Balikin Tugas?', icon: 'question', showCancelButton: true, confirmButtonColor: '#10b981', confirmButtonText: 'Ya, Balikin!', background: isDark ? '#1f2937' : '#fff', color: isDark ? '#fff' : '#1f2937' }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('tasks.restore', id), {}, {
                    onSuccess: () => { Swal.fire({ title: 'Berhasil!', text: 'Tugas aktif kembali!', icon: 'success', confirmButtonText: 'Mantap', confirmButtonColor: '#9333ea', timer: 3000, background: isDark ? '#1f2937' : '#fff', color: isDark ? '#fff' : '#1f2937' }); }
                });
            }
        });
    };

    const COL_STYLES = {
        pending: { header: 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300', badge: 'bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200', border: 'border-orange-100 dark:border-orange-900/30' },
        progress: { header: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', badge: 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200', border: 'border-blue-100 dark:border-blue-900/30' },
        done: { header: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200', border: 'border-emerald-100 dark:border-emerald-900/30' },
    };

    const dropAnimation = { sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.3' } } }) };

    return (
        <AuthenticatedLayout
            user={auth.user} categories={categories} currentCategoryId={currentCategoryId}
            header={<div className="flex items-center gap-4"><h2 className="text-2xl font-bold text-gray-800 dark:text-white">{currentTitle}</h2></div>}
        >
            <Head title="Kanban Board" />

            <div className="py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* STAT CARDS */}
                    <div className="flex flex-wrap gap-4 justify-center">
                        <div className="rounded-xl p-3 border shadow-sm flex flex-col items-center justify-center w-28 bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"><p className="text-[10px] font-bold uppercase text-gray-400">Total</p><p className="text-2xl font-black text-gray-700 dark:text-white">{stats.total}</p></div>
                        <div className="rounded-xl p-3 border shadow-sm flex flex-col items-center justify-center w-28 bg-orange-50 border-orange-100 dark:bg-gray-800 dark:border-gray-700"><p className="text-[10px] font-bold uppercase text-orange-600 dark:text-orange-400">Pending</p><p className="text-2xl font-black text-orange-700 dark:text-orange-300">{stats.pending}</p></div>
                        <div className="rounded-xl p-3 border shadow-sm flex flex-col items-center justify-center w-28 bg-blue-50 border-blue-100 dark:bg-gray-800 dark:border-gray-700"><p className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">Progress</p><p className="text-2xl font-black text-blue-700 dark:text-blue-300">{stats.progress}</p></div>
                        <div className="rounded-xl p-3 border shadow-sm flex flex-col items-center justify-center w-28 bg-emerald-50 border-emerald-100 dark:bg-gray-800 dark:border-gray-700"><p className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Done</p><p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{stats.done}</p></div>
                    </div>

                    {/* CHART ANALYTICS */}
                    {!currentFilter.includes('archive') && !currentCategoryId && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6 shadow-sm transition-colors">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                                <div><h3 className="font-bold text-gray-700 dark:text-white flex items-center gap-2 text-lg">📊 Produktivitas Minggu Ini</h3><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Minggu ini kamu menyelesaikan <span className="font-bold text-emerald-500">{totalDone}</span> dari <span className="font-bold text-purple-500">{totalAdded}</span> tugas baru.</p></div>
                                {bestDay.done > 0 && (<div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg border border-emerald-100 dark:border-emerald-800"><span className="text-xl">🔥</span><div><p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Paling Produktif</p><p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{bestDay.day} ({bestDay.done} Selesai)</p></div></div>)}
                            </div>
                            <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={weeklyStats} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-10" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} /><Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} /><Bar dataKey="added" name="Ditambah" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={20} /><Bar dataKey="done" name="Selesai" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} /></BarChart></ResponsiveContainer></div>
                        </div>
                    )}

                    {/* TOOLBAR */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700 shadow-sm transition-colors">
                        <div className="relative w-full md:w-auto"><TextInput type="text" className="pl-9 w-full md:w-72 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" placeholder="Cari tugas..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span></div>
                        {currentFilter !== 'archive' && (<PrimaryButton onClick={() => openModal()} className="w-full md:w-auto justify-center">+ Tugas Baru</PrimaryButton>)}
                    </div>

                    {/* KANBAN BOARD */}
                    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                        <div className="flex flex-col md:flex-row gap-6 items-start h-full">
                            <KanbanColumn id="pending" title="Pending" count={stats.pending} icon="⏳" bgInfo={COL_STYLES.pending} filter={currentFilter}>{columns.pending.map(task => <TaskCard key={task.id} task={task} openModal={openModal} handleDelete={handleDelete} handleRestore={handleRestore} currentFilter={currentFilter} />)}</KanbanColumn>
                            <KanbanColumn id="progress" title="On Progress" count={stats.progress} icon="🔥" bgInfo={COL_STYLES.progress} filter={currentFilter}>{columns.progress.map(task => <TaskCard key={task.id} task={task} openModal={openModal} handleDelete={handleDelete} handleRestore={handleRestore} currentFilter={currentFilter} />)}</KanbanColumn>
                            <KanbanColumn id="done" title="Selesai" count={stats.done} icon="✅" bgInfo={COL_STYLES.done} filter={currentFilter}>{columns.done.map(task => <TaskCard key={task.id} task={task} openModal={openModal} handleDelete={handleDelete} handleRestore={handleRestore} currentFilter={currentFilter} />)}</KanbanColumn>
                        </div>
                        <DragOverlay dropAnimation={dropAnimation}>{activeTask ? <TaskCard task={activeTask} isOverlay={true} currentFilter={currentFilter} /> : null}</DragOverlay>
                    </DndContext>
                </div>
            </div>

            {/* MODAL INPUT */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="p-6 dark:bg-gray-800 dark:text-white">
                    <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">{isEditing ? 'Edit Tugas' : 'Tambah Tugas Baru'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div><InputLabel value="Judul Tugas" className="dark:text-gray-300" /><TextInput className="w-full mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={data.title} onChange={e => setData('title', e.target.value)} placeholder="Contoh: Belajar Laravel" /><InputError message={errors.title} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><InputLabel value="Status" className="dark:text-gray-300" /><select className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white mt-1" value={data.status} onChange={e => setData('status', e.target.value)}><option value="pending">⏳ Pending</option><option value="progress">🔥 Progress</option><option value="done">✅ Done</option></select></div>
                            <div><InputLabel value="Prioritas" className="dark:text-gray-300" /><select className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white mt-1" value={data.priority} onChange={e => setData('priority', e.target.value)}><option value="high">🔥 High</option><option value="medium">⚡ Medium</option><option value="low">☕ Low</option></select></div>
                        </div>
                        <div>
                            <InputLabel value="Kategori" className="dark:text-gray-300" />
                            <select className={`w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white mt-1 ${!isEditing && currentCategoryId ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''}`} value={data.category_id} onChange={e => setData('category_id', e.target.value)} disabled={!isEditing && !!currentCategoryId} >
                                <option value="">📂 Inbox</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                            {!isEditing && currentCategoryId && <p className="text-xs text-purple-500 mt-1">*Kategori dikunci karena kamu sedang di dalam folder proyek.</p>}
                        </div>
                        <div><InputLabel value="Tenggat Waktu" className="dark:text-gray-300" /><TextInput type="date" className="w-full mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={data.due_date} onChange={e => setData('due_date', e.target.value)} /></div>
                        <div><InputLabel value="Deskripsi" className="dark:text-gray-300" /><textarea className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white mt-1" rows="3" value={data.description} onChange={e => setData('description', e.target.value)} /></div>
                        <div className="flex justify-end gap-3 mt-6"><SecondaryButton onClick={() => setIsModalOpen(false)} className="dark:bg-gray-700 dark:text-gray-300">Batal</SecondaryButton><PrimaryButton disabled={processing}>Simpan</PrimaryButton></div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}