import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import Swal from 'sweetalert2';

export default function SettingsEdit({ auth, preferences, status }) {
    // Ambil data categories global buat layout
    const { categories } = usePage().props;

    const { data, setData, patch, processing, errors } = useForm({
        theme: preferences.theme || 'system',
        undo_duration: preferences.undo_duration || 3000,
        default_priority: preferences.default_priority || 'medium',
        default_view: preferences.default_view || 'inbox',
        alarm_repetition: preferences.alarm_repetition || 1,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('settings.update'), {
            onSuccess: () => {
                // Update LocalStorage theme langsung biar berasa efeknya
                if (data.theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                } else if (data.theme === 'light') {
                    document.documentElement.classList.remove('dark');
                    localStorage.setItem('theme', 'light');
                } else {
                    localStorage.removeItem('theme'); // System
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark');
                    else document.documentElement.classList.remove('dark');
                }
                
                Swal.fire({
                    icon: 'success',
                    title: 'Disimpan!',
                    text: 'Pengaturan berhasil diperbarui.',
                    timer: 2000,
                    showConfirmButton: false,
                    background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
                    color: document.documentElement.classList.contains('dark') ? '#fff' : '#1f2937'
                });
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            categories={categories}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-white leading-tight">Pengaturan ⚙️</h2>}
        >
            <Head title="Pengaturan" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        <form onSubmit={submit} className="space-y-6">
                            
                            {/* 1. TEMA APLIKASI */}
                            <div>
                                <InputLabel value="Tampilan Aplikasi" className="dark:text-gray-300 mb-2" />
                                <div className="grid grid-cols-3 gap-3">
                                    {['light', 'dark', 'system'].map((theme) => (
                                        <div key={theme} 
                                            onClick={() => setData('theme', theme)}
                                            className={`cursor-pointer border-2 rounded-xl p-4 text-center transition-all ${data.theme === theme ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'}`}
                                        >
                                            <div className="text-2xl mb-1">
                                                {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '💻'}
                                            </div>
                                            <div className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                                                {theme}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-gray-100 dark:border-gray-700" />

                            {/* 2. UNDO DURATION */}
                            <div>
                                <InputLabel value="Durasi Undo (Batalkan Aksi)" className="dark:text-gray-300 mb-2" />
                                <select 
                                    value={data.undo_duration} 
                                    onChange={(e) => setData('undo_duration', parseInt(e.target.value))}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="3000">⚡ Cepat (3 Detik)</option>
                                    <option value="5000">🐢 Santai (5 Detik)</option>
                                    <option value="10000">🛡️ Aman Banget (10 Detik)</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Berapa lama tombol "Undo" muncul setelah menghapus tugas.</p>
                            </div>

                            {/* 3. DEFAULT PRIORITY */}
                            <div>
                                <InputLabel value="Prioritas Default Tugas Baru" className="dark:text-gray-300 mb-2" />
                                <div className="flex gap-4">
                                    {['low', 'medium', 'high'].map((prio) => (
                                        <label key={prio} className="flex items-center cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="priority" 
                                                value={prio} 
                                                checked={data.default_priority === prio} 
                                                onChange={(e) => setData('default_priority', e.target.value)}
                                                className="text-purple-600 focus:ring-purple-500 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                            />
                                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">{prio}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* 4. DEFAULT VIEW */}
                            <div>
                                <InputLabel value="Halaman Awal Dashboard" className="dark:text-gray-300 mb-2" />
                                <select 
                                    value={data.default_view} 
                                    onChange={(e) => setData('default_view', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="inbox">📥 Inbox (Semua Tugas)</option>
                                    <option value="today">☀️ Hari Ini</option>
                                    <option value="upcoming">🗓️ Mendatang</option>
                                </select>
                            </div>

                            {/* 5. ALARM REPETITION (BARU) */}
                            <div>
                                <InputLabel value="Bunyi Alarm Pomodoro" className="dark:text-gray-300 mb-2" />
                                <select 
                                    value={data.alarm_repetition} 
                                    onChange={(e) => setData('alarm_repetition', parseInt(e.target.value))}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="1">🔔 Sekali (Ting!)</option>
                                    <option value="2">🔔🔔 Dua Kali (Ting! Ting!)</option>
                                    <option value="3">🔔🔔🔔 Tiga Kali (Agak Berisik)</option>
                                    <option value="5">📢 Lima Kali (Wajib Bangun!)</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Berapa kali bunyi alarm diputar saat waktu habis.</p>
                            </div>

                            <div className="flex justify-end pt-4">
                                <PrimaryButton disabled={processing}>Simpan Pengaturan</PrimaryButton>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}