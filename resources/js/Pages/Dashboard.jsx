import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Swal from 'sweetalert2';

// Import Logo sesuai request lu
import logoKelarin from '../../images/kelarinlogo.svg'; 

// --- LIBRARY DRAG & DROP (Pastikan sudah npm install) ---
import { DndContext, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// --- 1. KOMPONEN KARTU TUGAS (YANG BISA DIGESER) ---
function TaskCard({ task, openModal, handleDelete, handleRestore, currentFilter }) {
    // Hook biar item bisa digeret
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id.toString(), // ID wajib string
        data: { task }, // Simpen data task biar pas drop tau ini task apa
    });

    // Style saat digeser (Transform posisi & Transparan dikit)
    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none', // Wajib biar di HP ga scroll pas nge-drag
        zIndex: isDragging ? 999 : 'auto', // Biar pas ditarik dia ada di layer paling atas
    };

    // Config Warna Status & Priority (Support Dark Mode)
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
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            {...listeners}
            className={`
                relative group rounded-xl border p-4 mb-3 flex flex-col justify-between shadow-sm 
                cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200
                ${STATUS[task.status].card}
            `}
        >
            {/* Header Kartu */}
            <div className="flex justify-between items-start mb-2">
                <div className="flex flex-wrap items-center gap-2 pr-1">
                    {/* Badge Priority */}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide flex items-center gap-1 ${PRIORITY[task.priority || 'medium'].badge}`}>
                        <span>{PRIORITY[task.priority || 'medium'].icon}</span>
                        {PRIORITY[task.priority || 'medium'].label}
                    </span>
                    
                    {/* Badge Kategori */}
                    {task.category && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border bg-white/60 dark:bg-gray-700/60 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium truncate max-w-[80px]">
                            📂 {task.category.name}
                        </span>
                    )}
                </div>

                {/* Tombol Aksi (Edit/Delete) - Pake onPointerDown biar ga konflik sama Drag */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm p-0.5 rounded-lg">
                    <button 
                        onPointerDown={(e) => { e.stopPropagation(); openModal(task); }} 
                        className="text-gray-400 hover:text-purple-600 p-1"
                    >✏️</button>
                    <button 
                        onPointerDown={(e) => { e.stopPropagation(); handleDelete(task.id); }} 
                        className="text-gray-400 hover:text-red-600 p-1"
                    >🗑️</button>
                </div>
            </div>

            {/* Judul & Deskripsi */}
            <div className="mb-2">
                <h4 className="font-bold text-gray-800 dark:text-white text-sm leading-tight mb-1">
                    {task.title}
                </h4>
                {task.description && (
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2">
                        {task.description}
                    </p>
                )}
            </div>

            {/* Footer (Tanggal) */}
            <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[10px] text-gray-400 font-medium">
                {task.due_date ? (
                    <span className={`flex items-center gap-1 ${new Date(task.due_date) < new Date() && task.status !== 'done' ? 'text-red-500 font-bold' : 'text-purple-600 dark:text-purple-400'}`}>
                        🗓️ {new Date(task.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                ) : (
                    <span>-</span>
                )}
            </div>
        </div>
    );
}

// --- 2. KOMPONEN KOLOM KANBAN (TEMPAT JATUHIN TUGAS) ---
function KanbanColumn({ id, title, count, icon, bgInfo, children }) {
    const { setNodeRef } = useDroppable({ id }); // id = 'pending', 'progress', 'done'

    return (
        <div className="flex flex-col h-full min-w-[280px] w-full md:w-1/3">
            {/* Header Kolom */}
            <div className={`p-3 rounded-t-xl border-t border-x ${bgInfo.header} flex justify-between items-center transition-colors`}>
                <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <h3 className={`font-bold ${bgInfo.text}`}>{title}</h3>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bgInfo.badge}`}>
                    {count}
                </span>
            </div>
            
            {/* Body Kolom (Droppable Area) */}
            <div 
                ref={setNodeRef} 
                className={`
                    flex-1 p-3 border-x border-b rounded-b-xl 
                    bg-gray-50/50 dark:bg-gray-800/50 
                    transition-colors overflow-y-auto min-h-[400px] 
                    ${bgInfo.border}
                `}
            >
                {children}
                
                {/* Placeholder kalau kosong */}
                {count === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <p className="text-sm">Kosong</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- 3. MAIN DASHBOARD ---
export default function Dashboard({ auth, tasks, flash = {}, currentFilter = 'inbox', categories = [], currentCategoryId = null, searchTerm = '' }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState(searchTerm || '');
    
    // STATE LOKAL (PENTING BUAT DRAG & DROP BIAR SMOOTH)
    // Kita copy data dari 'props.tasks' ke state lokal 'localTasks'
    const [localTasks, setLocalTasks] = useState(tasks);

    // Sync state kalau backend ngirim data baru (misal abis refresh/search)
    useEffect(() => { setLocalTasks(tasks); }, [tasks]);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        title: '', description: '', status: 'pending', priority: 'medium', due_date: '', category_id: '',
    });

    // Konfigurasi Sensor DnD (Pointer & Touch biar jalan di HP)
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), 
        useSensor(TouchSensor)
    );

    // --- LOGIC UTAMA: SAAT KARTU DILEPAS (DRAG END) ---
    const handleDragEnd = (event) => {
        const { active, over } = event;
        
        // Kalau dilepas di luar kolom, batal
        if (!over) return;

        const taskId = parseInt(active.id);
        const newStatus = over.id; // 'pending', 'progress', atau 'done'
        
        // Cari task yang digeser
        const oldTask = localTasks.find(t => t.id === taskId);

        // Kalau statusnya sama, gak usah ngapa-ngapain
        if (oldTask.status === newStatus) return;

        // 1. OPTIMISTIC UPDATE (Update UI Dulu biar cepet)
        const updatedTasks = localTasks.map(t => 
            t.id === taskId ? { ...t, status: newStatus } : t
        );
        setLocalTasks(updatedTasks);

        // 2. KIRIM KE BACKEND (Background Process)
        router.put(route('tasks.update', taskId), {
            ...oldTask, 
            status: newStatus // Update statusnya aja
        }, {
            preserveScroll: true,
            preserveState: true,
            onError: () => {
                // Kalau error, balikin ke posisi awal
                setLocalTasks(localTasks);
                Swal.fire('Gagal!', 'Gagal update status.', 'error');
            }
        });
    };

    // Filter Search Lokal
    const filteredTasks = localTasks.filter(task => {
        const query = searchQuery.toLowerCase().trim();
        return !query || task.title.toLowerCase().includes(query) || (task.description && task.description.toLowerCase().includes(query));
    });

    // Pecah Task ke 3 Kolom
    const columns = {
        pending: filteredTasks.filter(t => t.status === 'pending'),
        progress: filteredTasks.filter(t => t.status === 'progress'),
        done: filteredTasks.filter(t => t.status === 'done'),
    };

    // Hitung ulang statistik berdasarkan state lokal
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

    // Flash Message Dark Mode
    useEffect(() => {
        if (flash?.success) {
            const isDark = document.documentElement.classList.contains('dark');
            Swal.fire({ title: 'Berhasil!', text: flash.success, icon: 'success', confirmButtonText: 'Mantap', confirmButtonColor: '#9333ea', timer: 3000, timerProgressBar: true, background: isDark ? '#1f2937' : '#fff', color: isDark ? '#fff' : '#1f2937' });
        }
    }, [flash]);

    // --- Modal Functions ---
    const openModal = (task = null) => {
        clearErrors();
        if (task) {
            setIsEditing(true); setEditingId(task.id);
            setData({ title: task.title, description: task.description || '', status: task.status, priority: task.priority || 'medium', due_date: task.due_date ? task.due_date.split('T')[0] : '', category_id: task.category_id || '' });
        } else {
            setIsEditing(false); setEditingId(null); reset();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const close = () => { setIsModalOpen(false); reset(); };
        isEditing ? put(route('tasks.update', editingId), { onSuccess: close }) : post(route('tasks.store'), { onSuccess: close });
    };

    const handleDelete = (id) => {
        const isArchive = currentFilter === 'archive';
        const isDark = document.documentElement.classList.contains('dark');
        Swal.fire({ title: isArchive ? 'Hapus Permanen?' : 'Buang ke Sampah?', icon: isArchive ? 'error' : 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: isArchive ? 'Musnahkan!' : 'Buang!', background: isDark ? '#1f2937' : '#fff', color: isDark ? '#fff' : '#1f2937' }).then((result) => {
            if (result.isConfirmed) router.delete(route('tasks.destroy', id));
        });
    };

    const handleRestore = (id) => {
        const isDark = document.documentElement.classList.contains('dark');
        Swal.fire({ title: 'Balikin Tugas?', icon: 'question', showCancelButton: true, confirmButtonColor: '#10b981', confirmButtonText: 'Balikin!', background: isDark ? '#1f2937' : '#fff', color: isDark ? '#fff' : '#1f2937' }).then((result) => {
            if (result.isConfirmed) router.patch(route('tasks.restore', id));
        });
    };

    // Styling Kolom (Header & Border)
    const COL_STYLES = {
        pending: { header: 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300', badge: 'bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200', border: 'border-orange-100 dark:border-orange-900/30' },
        progress: { header: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', badge: 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200', border: 'border-blue-100 dark:border-blue-900/30' },
        done: { header: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200', border: 'border-emerald-100 dark:border-emerald-900/30' },
    };

    return (
        <AuthenticatedLayout
            user={auth.user} categories={categories} currentCategoryId={currentCategoryId}
            header={<div className="flex items-center gap-4"><h2 className="text-2xl font-bold text-gray-800 dark:text-white">{currentTitle}</h2></div>}
        >
            <Head title="Kanban Board" />

            <div className="py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* TOOLBAR (Search & Add) */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700 shadow-sm transition-colors">
                        <div className="relative w-full md:w-auto">
                            <TextInput 
                                type="text" 
                                className="pl-9 w-full md:w-72 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" 
                                placeholder="Cari tugas..." 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)} 
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        </div>
                        
                        {/* Tombol Tambah (Disembunyikan kalau di Arsip) */}
                        {currentFilter !== 'archive' && (
                            <PrimaryButton onClick={() => openModal()} className="w-full md:w-auto justify-center">
                                + Tugas Baru
                            </PrimaryButton>
                        )}
                    </div>

                    {/* --- KANBAN BOARD AREA (DND CONTEXT) --- */}
                    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                        <div className="flex flex-col md:flex-row gap-6 items-start h-full">
                            
                            {/* KOLOM 1: PENDING */}
                            <KanbanColumn id="pending" title="Pending" count={stats.pending} icon="⏳" bgInfo={COL_STYLES.pending}>
                                {columns.pending.map(task => (
                                    <TaskCard key={task.id} task={task} openModal={openModal} handleDelete={handleDelete} currentFilter={currentFilter} />
                                ))}
                            </KanbanColumn>

                            {/* KOLOM 2: PROGRESS */}
                            <KanbanColumn id="progress" title="On Progress" count={stats.progress} icon="🔥" bgInfo={COL_STYLES.progress}>
                                {columns.progress.map(task => (
                                    <TaskCard key={task.id} task={task} openModal={openModal} handleDelete={handleDelete} currentFilter={currentFilter} />
                                ))}
                            </KanbanColumn>

                            {/* KOLOM 3: DONE */}
                            <KanbanColumn id="done" title="Selesai" count={stats.done} icon="✅" bgInfo={COL_STYLES.done}>
                                {columns.done.map(task => (
                                    <TaskCard key={task.id} task={task} openModal={openModal} handleDelete={handleDelete} currentFilter={currentFilter} />
                                ))}
                            </KanbanColumn>

                        </div>
                    </DndContext>
                </div>
            </div>

            {/* MODAL INPUT (SAMA PERSIS DENGAN SEBELUMNYA) */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="p-6 dark:bg-gray-800 dark:text-white">
                    <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
                        {isEditing ? 'Edit Tugas' : 'Tambah Tugas Baru'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <InputLabel value="Judul Tugas" className="dark:text-gray-300" />
                            <TextInput className="w-full mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={data.title} onChange={e => setData('title', e.target.value)} placeholder="Contoh: Belajar Laravel" />
                            <InputError message={errors.title} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Status" className="dark:text-gray-300" />
                                <select className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white mt-1 focus:ring-purple-500 focus:border-purple-500" value={data.status} onChange={e => setData('status', e.target.value)}>
                                    <option value="pending">⏳ Pending</option>
                                    <option value="progress">🔥 Progress</option>
                                    <option value="done">✅ Done</option>
                                </select>
                            </div>
                            <div>
                                <InputLabel value="Prioritas" className="dark:text-gray-300" />
                                <select className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white mt-1 focus:ring-purple-500 focus:border-purple-500" value={data.priority} onChange={e => setData('priority', e.target.value)}>
                                    <option value="high">🔥 High</option>
                                    <option value="medium">⚡ Medium</option>
                                    <option value="low">☕ Low</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <InputLabel value="Kategori" className="dark:text-gray-300" />
                            <select className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white mt-1" value={data.category_id} onChange={e => setData('category_id', e.target.value)}>
                                <option value="">📂 Inbox (Tanpa Kategori)</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <InputLabel value="Tenggat Waktu" className="dark:text-gray-300" />
                            <TextInput type="date" className="w-full mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={data.due_date} onChange={e => setData('due_date', e.target.value)} />
                        </div>
                        <div>
                            <InputLabel value="Deskripsi" className="dark:text-gray-300" />
                            <textarea className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white mt-1 focus:ring-purple-500 focus:border-purple-500" rows="3" value={data.description} onChange={e => setData('description', e.target.value)} />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <SecondaryButton onClick={() => setIsModalOpen(false)} className="dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">Batal</SecondaryButton>
                            <PrimaryButton disabled={processing}>
                                {isEditing ? 'Update Tugas' : 'Simpan Tugas'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}