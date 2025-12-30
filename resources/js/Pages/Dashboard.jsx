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
import logoKelarin from '../../images/kelarinlogo.svg'; 

export default function Dashboard({ auth, tasks, flash = {}, currentFilter = 'inbox', categories = [], currentCategoryId = null, searchTerm = '' }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState(searchTerm || '');
    const [filterStatus, setFilterStatus] = useState('all');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        title: '', description: '', status: 'pending', priority: 'medium', due_date: '', category_id: '',
    });

    const pageTitles = {
        'today': 'Tugas Hari Ini ☀️', 'upcoming': 'Mendatang 🗓️', 'archive': 'Arsip / Sampah 📦', 'inbox': 'Inbox (Semua Tugas) 📥'
    };
    
    let currentTitle = pageTitles[currentFilter] || 'Daftar Tugas';
    if (currentCategoryId) {
        const activeCat = categories.find(c => c.id == currentCategoryId);
        if (activeCat) currentTitle = `Project: ${activeCat.name} 📂`;
    }

    // --- FLASH MESSAGE DARK MODE ---
    useEffect(() => {
        if (flash?.success) {
            const isDark = document.documentElement.classList.contains('dark');
            Swal.fire({ 
                title: 'Berhasil!', 
                text: flash.success, 
                icon: 'success', 
                confirmButtonText: 'Mantap', 
                confirmButtonColor: '#9333ea', 
                timer: 3000, 
                timerProgressBar: true,
                background: isDark ? '#1f2937' : '#fff',
                color: isDark ? '#fff' : '#1f2937',
            });
        }
    }, [flash]);

    // FILTER LOGIC
    const finalFilteredTasks = tasks.filter(task => {
        const statusMatch = filterStatus === 'all' || task.status === filterStatus;
        const query = searchQuery.toLowerCase().trim();
        const searchMatch = !query || task.title.toLowerCase().includes(query) || (task.description && task.description.toLowerCase().includes(query));
        return statusMatch && searchMatch;
    });

    const stats = {
        total: finalFilteredTasks.length,
        pending: finalFilteredTasks.filter(t => t.status === 'pending').length,
        progress: finalFilteredTasks.filter(t => t.status === 'progress').length,
        done: finalFilteredTasks.filter(t => t.status === 'done').length,
    };

    const openModal = (task = null) => {
        clearErrors();
        if (task) {
            setIsEditing(true); setEditingId(task.id);
            setData({
                title: task.title, description: task.description || '', status: task.status, priority: task.priority || 'medium',
                due_date: task.due_date ? task.due_date.split('T')[0] : '', category_id: task.category_id || '',
            });
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

    // --- DELETE DARK MODE ---
    const handleDelete = (id) => {
        const isArchive = currentFilter === 'archive';
        const isDark = document.documentElement.classList.contains('dark');
        
        Swal.fire({
            title: isArchive ? 'Hapus Permanen?' : 'Buang ke Sampah?',
            text: isArchive ? "Data bakal hilang SELAMANYA gak bisa balik!" : "Tenang, masih bisa dibalikin dari menu Arsip.",
            icon: isArchive ? 'error' : 'warning',
            showCancelButton: true, 
            confirmButtonColor: '#d33', 
            confirmButtonText: isArchive ? 'Ya, Musnahkan!' : 'Ya, Buang!',
            background: isDark ? '#1f2937' : '#fff',
            color: isDark ? '#fff' : '#1f2937',
        }).then((result) => {
            if (result.isConfirmed) router.delete(route('tasks.destroy', id));
        });
    };

    // --- RESTORE DARK MODE ---
    const handleRestore = (id) => {
        const isDark = document.documentElement.classList.contains('dark');
        
        Swal.fire({ 
            title: 'Balikin Tugas?', 
            text: "Tugas ini bakal aktif lagi dan masuk ke foldernya.", 
            icon: 'question', 
            showCancelButton: true, 
            confirmButtonColor: '#10b981', 
            confirmButtonText: 'Ya, Balikin!',
            background: isDark ? '#1f2937' : '#fff',
            color: isDark ? '#fff' : '#1f2937',
        }).then((result) => {
            if (result.isConfirmed) router.patch(route('tasks.restore', id));
        });
    };

    const STATUS = {
        pending: { label: 'Pending', badge: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700', card: 'bg-orange-50 dark:bg-gray-800 dark:border-gray-700' },
        progress: { label: 'Progress', badge: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700', card: 'bg-blue-50 dark:bg-gray-800 dark:border-gray-700' },
        done: { label: 'Done', badge: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700', card: 'bg-emerald-50 dark:bg-gray-800 dark:border-gray-700' },
    };

    const PRIORITY = {
        high: { label: 'High', badge: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700', icon: '🔥' },
        medium: { label: 'Medium', badge: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700', icon: '⚡' },
        low: { label: 'Low', badge: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700', icon: '☕' },
    };

    return (
        <AuthenticatedLayout
            user={auth.user} categories={categories} currentCategoryId={currentCategoryId}
            header={<div className="flex items-center gap-4"><h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors">{currentTitle}</h2></div>}
        >
            <Head title="Dashboard" />

            <div className="py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
                <div className="max-w-7xl mx-auto px-6 space-y-8">
                    {/* STAT CARDS */}
                    <div className="flex flex-wrap gap-4 justify-center">
                        <button onClick={() => setFilterStatus('all')} className={`rounded-xl p-3 border shadow-sm flex flex-col items-center justify-center w-28 transition-all hover:scale-105 ${filterStatus === 'all' ? 'bg-white ring-2 ring-purple-500 border-purple-500 dark:bg-gray-800' : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}>
                            <p className="text-[10px] font-bold uppercase text-gray-400">Total</p>
                            <p className="text-2xl font-black text-gray-700 dark:text-white">{stats.total}</p>
                        </button>
                        <button onClick={() => setFilterStatus('pending')} className={`rounded-xl p-3 border shadow-sm flex flex-col items-center justify-center w-28 transition-all hover:scale-105 ${filterStatus === 'pending' ? 'bg-orange-100 ring-2 ring-orange-500 border-orange-500 dark:bg-gray-800' : 'bg-orange-50 border-orange-100 dark:bg-gray-800 dark:border-gray-700'}`}>
                            <p className="text-[10px] font-bold uppercase text-orange-600 dark:text-orange-400">Pending</p>
                            <p className="text-2xl font-black text-orange-700 dark:text-orange-300">{stats.pending}</p>
                        </button>
                        <button onClick={() => setFilterStatus('progress')} className={`rounded-xl p-3 border shadow-sm flex flex-col items-center justify-center w-28 transition-all hover:scale-105 ${filterStatus === 'progress' ? 'bg-blue-100 ring-2 ring-blue-500 border-blue-500 dark:bg-gray-800' : 'bg-blue-50 border-blue-100 dark:bg-gray-800 dark:border-gray-700'}`}>
                            <p className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">Progress</p>
                            <p className="text-2xl font-black text-blue-700 dark:text-blue-300">{stats.progress}</p>
                        </button>
                        <button onClick={() => setFilterStatus('done')} className={`rounded-xl p-3 border shadow-sm flex flex-col items-center justify-center w-28 transition-all hover:scale-105 ${filterStatus === 'done' ? 'bg-emerald-100 ring-2 ring-emerald-500 border-emerald-500 dark:bg-gray-800' : 'bg-emerald-50 border-emerald-100 dark:bg-gray-800 dark:border-gray-700'}`}>
                            <p className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Done</p>
                            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{stats.done}</p>
                        </button>
                    </div>

                    {/* TASK SECTION */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 min-h-[500px] transition-colors">
                        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b dark:border-gray-700">
                            <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                                {currentFilter === 'archive' ? '🗑️ Sampah' : '📝 Daftar Tugas'}
                            </h3>

                            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                                <div className="relative">
                                    <TextInput 
                                        type="text"
                                        className="pl-9 w-full md:w-64 transition-all focus:w-full md:focus:w-72 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                        placeholder="Ketik untuk mencari..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                                </div>

                                <select 
                                    className="rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm focus:ring-purple-500 focus:border-purple-500 cursor-pointer"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="pending">⏳ Pending</option>
                                    <option value="progress">🔥 Progress</option>
                                    <option value="done">✅ Done</option>
                                </select>

                                {currentFilter !== 'archive' && (
                                    <PrimaryButton onClick={() => openModal()} className="whitespace-nowrap flex justify-center">
                                        + Tambah Baru
                                    </PrimaryButton>
                                )}
                            </div>
                        </div>

                        <div className="p-6">
                            {finalFilteredTasks.length === 0 ? (
                                <div className="text-center py-20">
                                    <p className="text-4xl mb-4">✨</p>
                                    <p className="text-gray-400 font-medium">
                                        {currentFilter === 'today' ? 'Tidak ada tugas untuk hari ini. Santai dulu!' :
                                         currentFilter === 'archive' ? 'Tong sampah bersih.' :
                                         'Belum ada tugas di sini.'}
                                    </p>
                                </div>
                            ) : (
                                <div 
                                    key={searchQuery} 
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up"
                                >
                                    {finalFilteredTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className={`relative group rounded-xl border p-5 flex flex-col justify-between ${STATUS[task.status].card} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex flex-wrap items-center gap-2 pr-2">
                                                {/* 1. Status Badge */}
                                                <span className={`text-[10px] px-2 py-1 rounded-full border font-bold uppercase tracking-wide ${STATUS[task.status].badge}`}>
                                                    {STATUS[task.status].label}
                                                </span>

                                                {/* 2. PRIORITY BADGE (NEW) */}
                                                <span className={`text-[10px] px-2 py-1 rounded-full border font-bold uppercase tracking-wide flex items-center gap-1 ${PRIORITY[task.priority || 'medium'].badge}`}>
                                                    <span>{PRIORITY[task.priority || 'medium'].icon}</span>
                                                    {PRIORITY[task.priority || 'medium'].label}
                                                </span>

                                                {/* 3. Category Label */}
                                                {task.category && (
                                                    <span className="text-[10px] px-2 py-1 rounded-full border bg-white/60 dark:bg-gray-700/60 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium flex items-center gap-1 truncate max-w-[120px]">
                                                        📂 {task.category.name}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm p-1 rounded-lg shadow-sm">
                                                {currentFilter !== 'archive' ? (
                                                    <>
                                                        <button onClick={() => openModal(task)} className="text-gray-400 hover:text-purple-600 transition-colors" aria-label="Edit">✏️</button>
                                                        <button onClick={() => handleDelete(task.id)} className="text-gray-400 hover:text-red-600 transition-colors" aria-label="Archive">🗑️</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleRestore(task.id)} className="text-gray-400 hover:text-emerald-600 transition-colors" aria-label="Restore">♻️</button>
                                                        <button onClick={() => handleDelete(task.id)} className="text-gray-400 hover:text-red-600 transition-colors" aria-label="Force Delete">🔥</button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <h4 className="font-bold text-gray-800 dark:text-white text-lg leading-tight mb-2">
                                                {task.title}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
                                                {task.description || 'Tidak ada deskripsi detail.'}
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs text-gray-400 font-medium">
                                            <span>Dibuat: {new Date(task.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}</span>
                                            {task.due_date && (
                                                <span className={`flex items-center gap-1 ${new Date(task.due_date) < new Date() && task.status !== 'done' ? 'text-red-500 font-bold' : 'text-purple-600 dark:text-purple-400'}`}>
                                                    🗓️ {new Date(task.due_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL INPUT */}
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

                        {/* GRID STATUS & PRIORITY */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Kolom Kiri: Status */}
                            <div>
                                <InputLabel value="Status" className="dark:text-gray-300" />
                                <select className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white mt-1 focus:ring-purple-500 focus:border-purple-500" value={data.status} onChange={e => setData('status', e.target.value)}>
                                    <option value="pending">⏳ Pending</option>
                                    <option value="progress">🔥 Progress</option>
                                    <option value="done">✅ Done</option>
                                </select>
                            </div>

                            {/* Kolom Kanan: PRIORITY (NEW) */}
                            <div>
                                <InputLabel value="Prioritas" className="dark:text-gray-300" />
                                <select 
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white mt-1 focus:ring-purple-500 focus:border-purple-500" 
                                    value={data.priority} 
                                    onChange={e => setData('priority', e.target.value)}
                                >
                                    <option value="high">🔥 High (Penting!)</option>
                                    <option value="medium">⚡ Medium (Standar)</option>
                                    <option value="low">☕ Low (Santai)</option>
                                </select>
                            </div>
                        </div>

                        {/* CATEGORY (Full Width di bawah Status/Priority) */}
                        <div>
                            <InputLabel value="Kategori (Project)" className="dark:text-gray-300" />
                            <select className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white mt-1" value={data.category_id} onChange={e => setData('category_id', e.target.value)}>
                                <option value="">📂 Masuk Inbox (Tanpa Kategori)</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <InputLabel value="Tenggat Waktu (Opsional)" className="dark:text-gray-300" />
                            <TextInput type="date" className="w-full mt-1 cursor-pointer dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={data.due_date} onChange={e => setData('due_date', e.target.value)} />
                            <InputError message={errors.due_date} />
                        </div>
                        <div>
                            <InputLabel value="Deskripsi Detail" className="dark:text-gray-300" />
                            <textarea className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white mt-1 focus:ring-purple-500 focus:border-purple-500" rows="3" value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Tulis detail tugas di sini..." />
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