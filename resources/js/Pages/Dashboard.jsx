import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ auth, tasks }) {
    // 1. Logic Hitung Statistik (Client Side)
    // Karena datanya udah ada di props 'tasks', kita hitung aja langsung di sini.
    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        progress: tasks.filter(t => t.status === 'progress').length,
        done: tasks.filter(t => t.status === 'done').length,
    };

    // 2. Helper buat Warna Badge Status
    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'done': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // 3. Helper buat Label Status (Biar huruf depan kapital)
    const formatStatus = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

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
                    
                    {/* --- BAGIAN 1: STATISTIK CARDS --- */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Total Tasks */}
                        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-6">
                            <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Tugas</div>
                            <div className="mt-2 text-3xl font-extrabold text-gray-900">{stats.total}</div>
                        </div>

                        {/* Pending */}
                        <div className="bg-white overflow-hidden shadow-sm rounded-xl border-l-4 border-orange-400 p-6">
                            <div className="text-orange-600 text-sm font-medium uppercase tracking-wider">Pending</div>
                            <div className="mt-2 text-3xl font-extrabold text-gray-900">{stats.pending}</div>
                        </div>

                        {/* On Progress */}
                        <div className="bg-white overflow-hidden shadow-sm rounded-xl border-l-4 border-blue-500 p-6">
                            <div className="text-blue-600 text-sm font-medium uppercase tracking-wider">On Progress</div>
                            <div className="mt-2 text-3xl font-extrabold text-gray-900">{stats.progress}</div>
                        </div>

                        {/* Done */}
                        <div className="bg-white overflow-hidden shadow-sm rounded-xl border-l-4 border-emerald-500 p-6">
                            <div className="text-emerald-600 text-sm font-medium uppercase tracking-wider">Selesai</div>
                            <div className="mt-2 text-3xl font-extrabold text-gray-900">{stats.done}</div>
                        </div>
                    </div>

                    {/* --- BAGIAN 2: DAFTAR TUGAS --- */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-white">
                            <h3 className="text-lg font-bold text-gray-800">Daftar Tugas Saya</h3>
                            <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                                + Tambah Tugas
                            </button>
                        </div>
                        
                        <div className="p-6 bg-gray-50/50">
                            {tasks.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    Belum ada tugas. Yuk bikin satu! 🚀
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {tasks.map((task) => (
                                        <div key={task.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition duration-200 group">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                                                    {formatStatus(task.status)}
                                                </span>
                                                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {/* Placeholder Button Actions */}
                                                    <button className="text-gray-400 hover:text-blue-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                                                    <button className="text-gray-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                                </div>
                                            </div>
                                            
                                            <h4 className="font-bold text-gray-800 text-lg mb-2 line-clamp-1">{task.title}</h4>
                                            <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 h-10">
                                                {task.description || 'Tidak ada deskripsi tambahan.'}
                                            </p>
                                            
                                            <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400 flex justify-between">
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
        </AuthenticatedLayout>
    );
}