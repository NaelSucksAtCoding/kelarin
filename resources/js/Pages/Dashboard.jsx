import { useState, useEffect } from 'react'; // Tambah useEffect
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Swal from 'sweetalert2'; // Import SweetAlert2
import logoKelarin from '../../images/kelarinlogo.svg';

// Tambah props 'flash' di sini buat nangkep pesan dari controller
export default function Dashboard({ auth, tasks, flash = {} }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        title: '',
        description: '',
        status: 'pending',
    });

    // --- 1. POP UP PESAN SUKSES (useEffect) ---
    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                title: 'Berhasil!',
                text: flash.success,
                icon: 'success',
                confirmButtonText: 'Mantap',
                confirmButtonColor: '#9333ea', // Warna Purple-600
                timer: 3000, // Otomatis nutup dalam 3 detik
                timerProgressBar: true,
            });
        }
    }, [flash]); // Jalanin setiap ada pesan sukses baru

    // Logika Filter
    const filteredTasks = tasks.filter(task => {
        if (filterStatus === 'all') return true;
        return task.status === filterStatus;
    });

    const openModal = (task = null) => {
        clearErrors();
        if (task) {
            setIsEditing(true);
            setEditingId(task.id);
            setData({
                title: task.title,
                description: task.description || '',
                status: task.status,
            });
        } else {
            setIsEditing(false);
            setEditingId(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        isEditing
            ? put(route('tasks.update', editingId), { onSuccess: close })
            : post(route('tasks.store'), { onSuccess: close });

        function close() {
            setIsModalOpen(false);
            reset();
        }
    };

    // --- 2. POP UP KONFIRMASI DELETE (Ganti confirm biasa) ---
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Yakin mau hapus?',
            text: "Data yang dihapus gak bisa balik lagi loh!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('tasks.destroy', id));
            }
        });
    };

    const STATUS = {
        pending: { label: 'Pending', badge: 'bg-orange-100 text-orange-700 border-orange-300', card: 'bg-orange-50' },
        progress: { label: 'Progress', badge: 'bg-blue-100 text-blue-700 border-blue-300', card: 'bg-blue-50' },
        done: { label: 'Done', badge: 'bg-emerald-100 text-emerald-700 border-emerald-300', card: 'bg-emerald-50' },
    };

    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        progress: tasks.filter(t => t.status === 'progress').length,
        done: tasks.filter(t => t.status === 'done').length,
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
                header={
                    <div className="flex items-center gap-4"> 
                        <img 
                            src={logoKelarin} 
                            alt="Logo Kelarin" 
                            className="w-20 h-20 object-contain" 
                        />

                        <h2 className="text-3xl font-bold"> 
                            Kelarin<span className="text-purple-600">.</span>
                        </h2>
                    </div>
                }
        >
            <Head title="Dashboard" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-6 space-y-10">

                    {/* STAT CARDS */}
                    <div className="flex flex-wrap gap-8 justify-center">
                        <button onClick={() => setFilterStatus('all')} className={`rounded-xl p-3 border shadow-sm flex flex-col items-center justify-center aspect-[3/4] w-32 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md ${filterStatus === 'all' ? 'bg-white ring-2 ring-purple-500 ring-offset-2 border-purple-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total</p>
                            <p className="text-3xl font-black text-gray-700">{stats.total}</p>
                        </button>
                        <button onClick={() => setFilterStatus('pending')} className={`rounded-xl p-3 border shadow-sm flex flex-col items-center justify-center aspect-[3/4] w-32 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md ${filterStatus === 'pending' ? 'bg-orange-100 ring-2 ring-orange-500 ring-offset-2 border-orange-500' : 'bg-orange-50 border-orange-100 hover:bg-orange-100'}`}>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">Pending</p>
                            <p className="text-3xl font-black text-orange-700">{stats.pending}</p>
                        </button>
                        <button onClick={() => setFilterStatus('progress')} className={`rounded-xl p-3 border shadow-sm flex flex-col items-center justify-center aspect-[3/4] w-32 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md ${filterStatus === 'progress' ? 'bg-blue-100 ring-2 ring-blue-500 ring-offset-2 border-blue-500' : 'bg-blue-50 border-blue-100 hover:bg-blue-100'}`}>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Progress</p>
                            <p className="text-3xl font-black text-blue-700">{stats.progress}</p>
                        </button>
                        <button onClick={() => setFilterStatus('done')} className={`rounded-xl p-3 border shadow-sm flex flex-col items-center justify-center aspect-[3/4] w-32 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md ${filterStatus === 'done' ? 'bg-emerald-100 ring-2 ring-emerald-500 ring-offset-2 border-emerald-500' : 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100'}`}>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Done</p>
                            <p className="text-3xl font-black text-emerald-700">{stats.done}</p>
                        </button>
                    </div>

                    {/* TASK SECTION */}
                    <div className="bg-white rounded-2xl border">
                        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b">
                            <h3 className="text-xl font-bold">Daftar Tugas</h3>
                            <div className="flex gap-3 w-full md:w-auto">
                                <select className="rounded-lg border-gray-300 text-sm focus:ring-purple-500 focus:border-purple-500 cursor-pointer" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                    <option value="all">Semua Status</option>
                                    <option value="pending">⏳ Pending</option>
                                    <option value="progress">🔥 Progress</option>
                                    <option value="done">✅ Done</option>
                                </select>
                                <PrimaryButton onClick={() => openModal()} className="whitespace-nowrap">+ Tambah</PrimaryButton>
                            </div>
                        </div>

                        <div className="p-6">
                            {filteredTasks.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    {filterStatus === 'all' ? 'Belum ada tugas sama sekali. Yuk tambah baru! 🚀' : `Belum ada tugas dengan status ${STATUS[filterStatus]?.label}.`}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {filteredTasks.map(task => (
                                        <div key={task.id} className={`aspect-[3/4] rounded-2xl border p-4 flex flex-col justify-between ${STATUS[task.status].card} shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 transition`}>
                                            <div className="flex justify-between">
                                                <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${STATUS[task.status].badge}`}>{STATUS[task.status].label}</span>
                                                <div className="flex gap-1">
                                                    <button onClick={() => openModal(task)} className="hover:scale-110 transition" aria-label="Edit tugas">✏️</button>
                                                    <button onClick={() => handleDelete(task.id)} className="hover:scale-110 transition" aria-label="Hapus tugas">🗑️</button>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <h4 className="font-bold text-lg mt-4 mb-2 leading-tight">{task.title}</h4>
                                                <p className="text-xs text-gray-600 line-clamp-4 leading-relaxed">{task.description || 'Tidak ada deskripsi'}</p>
                                            </div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center border-t border-black/5 pt-3 mt-2">
                                                {new Date(task.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold mb-4">{isEditing ? 'Edit Tugas' : 'Tambah Tugas'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div><InputLabel value="Judul" /><TextInput className="w-full mt-1" value={data.title} onChange={e => setData('title', e.target.value)} /><InputError message={errors.title} /></div>
                        <div><InputLabel value="Status" /><select className="w-full rounded border-gray-300 mt-1" value={data.status} onChange={e => setData('status', e.target.value)}><option value="pending">Pending</option><option value="progress">Progress</option><option value="done">Done</option></select></div>
                        <div><InputLabel value="Deskripsi" /><textarea className="w-full rounded border-gray-300 mt-1" rows="4" value={data.description} onChange={e => setData('description', e.target.value)} /></div>
                        <div className="flex justify-end gap-3 mt-6"><SecondaryButton onClick={() => setIsModalOpen(false)}>Batal</SecondaryButton><PrimaryButton disabled={processing}>Simpan</PrimaryButton></div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}