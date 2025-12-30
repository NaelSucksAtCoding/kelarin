import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react'; // Import router buat delete
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Dashboard({ auth, tasks }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Mode Edit atau Buat Baru?
    const [editingId, setEditingId] = useState(null);  // ID tugas yang lagi diedit

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        title: '',
        description: '',
        status: 'pending',
    });

    // Fungsi Buka Modal (Bisa buat Baru atau Edit)
    const openModal = (task = null) => {
        clearErrors();
        if (task) {
            // Mode EDIT: Isi form dengan data yang ada
            setIsEditing(true);
            setEditingId(task.id);
            setData({
                title: task.title,
                description: task.description || '',
                status: task.status,
            });
        } else {
            // Mode BARU: Kosongkan form
            setIsEditing(false);
            setEditingId(null);
            reset();
        }
        setIsModalOpen(true);
    };

    // Fungsi Submit (Otomatis milih Create atau Update)
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (isEditing) {
            // Kalau lagi ngedit, kirim ke route Update (PUT)
            put(route('tasks.update', editingId), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            // Kalau baru, kirim ke route Store (POST)
            post(route('tasks.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    // Fungsi Delete
    const handleDelete = (taskId) => {
        if (confirm('Yakin mau hapus tugas ini? Gak bisa dibatalin loh!')) {
            router.delete(route('tasks.destroy', taskId));
        }
    };

    // Helper Statistik & Warna
    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        progress: tasks.filter(t => t.status === 'progress').length,
        done: tasks.filter(t => t.status === 'done').length,
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'done': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatStatus = (status) => status.charAt(0).toUpperCase() + status.slice(1);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-bold text-xl text-gray-800 leading-tight">
                    Dashboard <span className="text-purple-600">Kelarin</span>
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* STATISTIK CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-6">
                            <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Tugas</div>
                            <div className="mt-2 text-3xl font-extrabold text-gray-900">{stats.total}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm rounded-xl border-l-4 border-orange-400 p-6">
                            <div className="text-orange-600 text-sm font-medium uppercase tracking-wider">Pending</div>
                            <div className="mt-2 text-3xl font-extrabold text-gray-900">{stats.pending}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm rounded-xl border-l-4 border-blue-500 p-6">
                            <div className="text-blue-600 text-sm font-medium uppercase tracking-wider">On Progress</div>
                            <div className="mt-2 text-3xl font-extrabold text-gray-900">{stats.progress}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm rounded-xl border-l-4 border-emerald-500 p-6">
                            <div className="text-emerald-600 text-sm font-medium uppercase tracking-wider">Selesai</div>
                            <div className="mt-2 text-3xl font-extrabold text-gray-900">{stats.done}</div>
                        </div>
                    </div>

                    {/* DAFTAR TUGAS */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-white">
                            <h3 className="text-lg font-bold text-gray-800">Daftar Tugas Saya</h3>
                            <PrimaryButton onClick={() => openModal()}>
                                + Tambah Tugas
                            </PrimaryButton>
                        </div>
                        
                        <div className="p-6 bg-gray-50/50">
                            {tasks.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">Belum ada tugas. Yuk bikin satu! 🚀</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {tasks.map((task) => (
                                        <div key={task.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition duration-200 group relative">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                                                    {formatStatus(task.status)}
                                                </span>
                                                
                                                {/* TOMBOL EDIT & DELETE (Muncul pas di-hover) */}
                                                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {/* Tombol Edit */}
                                                    <button 
                                                        onClick={() => openModal(task)}
                                                        className="text-gray-400 hover:text-blue-600 transition"
                                                        title="Edit Tugas"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                    </button>
                                                    
                                                    {/* Tombol Delete */}
                                                    <button 
                                                        onClick={() => handleDelete(task.id)}
                                                        className="text-gray-400 hover:text-red-600 transition"
                                                        title="Hapus Tugas"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <h4 className="font-bold text-gray-800 text-lg mb-2 line-clamp-1">{task.title}</h4>
                                            <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 h-10">
                                                {task.description || 'Tidak ada deskripsi tambahan.'}
                                            </p>
                                            
                                            <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400">
                                                <span>Dibuat: {new Date(task.created_at).toLocaleDateString('id-ID')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODAL (DINAMIS: BISA CREATE ATAU EDIT) --- */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {isEditing ? 'Edit Tugas' : 'Buat Tugas Baru'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Input Judul */}
                        <div>
                            <InputLabel htmlFor="title" value="Judul Tugas" />
                            <TextInput
                                id="title"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Contoh: Belajar Laravel"
                                isFocused
                            />
                            <InputError message={errors.title} className="mt-2" />
                        </div>

                        {/* Input Status */}
                        <div>
                            <InputLabel htmlFor="status" value="Status" />
                            <select
                                id="status"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                            >
                                <option value="pending">Pending (Baru Mulai)</option>
                                <option value="progress">On Progress (Sedang Dikerjakan)</option>
                                <option value="done">Done (Selesai)</option>
                            </select>
                            <InputError message={errors.status} className="mt-2" />
                        </div>

                        {/* Input Deskripsi */}
                        <div>
                            <InputLabel htmlFor="description" value="Deskripsi (Opsional)" />
                            <textarea
                                id="description"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                rows="3"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Detail tugas..."
                            ></textarea>
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        {/* Tombol Aksi */}
                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsModalOpen(false)}>
                                Batal
                            </SecondaryButton>
                            
                            <PrimaryButton disabled={processing}>
                                {processing ? 'Menyimpan...' : (isEditing ? 'Update Tugas' : 'Simpan Tugas')}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}