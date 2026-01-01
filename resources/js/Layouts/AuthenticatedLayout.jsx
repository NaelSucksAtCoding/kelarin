import { useState, useEffect } from 'react';
import { Link, usePage, useForm, router } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import PomodoroTimer from '@/Components/PomodoroTimer';
import Swal from 'sweetalert2'; 
import logoKelarin from '../../images/kelarinlogo.svg'; 

export default function Authenticated({ user, header, children, categories = [], currentCategoryId = null }) {    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { url } = usePage();
    const [showUserMenu, setShowUserMenu] = useState(false);
    
    // --- 🔥 LOGIC TEMA (AUTO SINKRON DATABASE) ---
    // Kita gak butuh state 'darkMode' lokal lagi, langsung baca dari props user
    useEffect(() => {
        const userTheme = user.preferences?.theme || 'system';
        
        const applyTheme = (theme) => {
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else if (theme === 'light') {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            } else {
                // System Mode
                localStorage.removeItem('theme');
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        };

        applyTheme(userTheme);
    }, [user.preferences?.theme]); // Re-run otomatis kalau user ubah setting di halaman Settings

    // STATE KHUSUS EDIT
    const [editingCategory, setEditingCategory] = useState(null);
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const { data, setData, post, patch, processing, reset, errors, clearErrors } = useForm({ name: '' });

    const openCreateModal = () => { clearErrors(); reset(); setEditingCategory(null); setIsCatModalOpen(true); };
    const openEditModal = (cat) => { clearErrors(); setData('name', cat.name); setEditingCategory(cat); setIsCatModalOpen(true); };
    const submitCategory = (e) => { e.preventDefault(); if (editingCategory) { patch(route('categories.update', editingCategory.id), { onSuccess: () => setIsCatModalOpen(false) }); } else { post(route('categories.store'), { onSuccess: () => setIsCatModalOpen(false) }); } };

    const deleteCategory = (e, id, name, taskCount) => {
        e.preventDefault();
        const isDark = document.documentElement.classList.contains('dark');
        Swal.fire({
            title: `Hapus Project "${name}"?`,
            text: taskCount > 0 ? `Ada ${taskCount} tugas di dalam project ini. Mau diapain?` : "Project ini kosong, aman buat dihapus.",
            icon: 'warning',
            background: isDark ? '#1f2937' : '#fff', color: isDark ? '#fff' : '#1f2937',
            showCancelButton: true, showDenyButton: taskCount > 0, confirmButtonColor: '#d33', denyButtonColor: '#3085d6', cancelButtonColor: '#6b7280',
            confirmButtonText: taskCount > 0 ? '🔥 Musnahkan Semua' : 'Ya, Hapus', denyButtonText: '📂 Pindahin Tugas ke Inbox', cancelButtonText: 'Batal', reverseButtons: true
        }).then((result) => {
            const swalError = { title: 'Gagal!', text: 'Terjadi kesalahan.', icon: 'error', background: isDark ? '#1f2937' : '#fff', color: isDark ? '#fff' : '#1f2937' };
            if (result.isConfirmed) { router.delete(route('categories.destroy', id), { data: { delete_tasks: true }, onError: () => Swal.fire(swalError) }); } 
            else if (result.isDenied) { router.delete(route('categories.destroy', id), { data: { delete_tasks: false }, onError: () => Swal.fire(swalError) }); }
        });
    };

    const SidebarLink = ({ href, active, icon, label, badge = null, onDelete = null, onEdit = null }) => (
        <Link href={href} title={!isSidebarOpen ? label : ''} className={`group flex items-center py-3 mb-1 font-medium rounded-xl transition-all duration-200 relative ${isSidebarOpen ? 'px-4 justify-between' : 'justify-center px-2'} ${active ? 'bg-purple-50 text-purple-700 font-bold dark:bg-purple-900/20 dark:text-purple-300' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'}`}>
            <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : ''}`}>
                <span className={`${isSidebarOpen ? 'text-lg' : 'text-xl'}`}>{icon}</span>
                <span className={`transition-all duration-300 truncate max-w-[100px] ${isSidebarOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>{label}</span>
            </div>
            {isSidebarOpen && (<div className="flex items-center gap-1">{badge > 0 && (<span className={`text-[10px] py-0.5 px-2 rounded-full font-bold transition-opacity ${active ? 'bg-purple-200 text-purple-700 dark:bg-purple-800 dark:text-purple-200' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'} group-hover:hidden`}>{badge}</span>)}{(onEdit || onDelete) && (<div className="hidden group-hover:flex items-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-md">{onEdit && (<button onClick={(e) => { e.preventDefault(); onEdit(); }} className="p-1 text-gray-400 hover:text-blue-500 transition" title="Ganti Nama">✏️</button>)}{onDelete && (<button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(e); }} className="p-1 text-gray-400 hover:text-red-500 transition" title="Hapus Project">❌</button>)}</div>)}</div>)}
        </Link>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-300 ease-in-out">
            <aside className={`bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 hidden md:flex flex-col fixed h-full z-30 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                {/* Header Sidebar */}
                <div className={`h-16 flex items-center border-b border-gray-100 dark:border-gray-700 transition-all ${isSidebarOpen ? 'px-6 justify-between' : 'justify-center'}`}>
                    <Link href="/" className="flex items-center gap-2 overflow-hidden"><img src={logoKelarin} alt="Logo" className="w-8 h-8 object-contain shrink-0" /><span className={`text-xl font-bold text-gray-800 dark:text-white tracking-tight whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>Kelarin<span className="text-purple-600">.</span></span></Link>
                    {isSidebarOpen && (<button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-purple-600 transition"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg></button>)}
                </div>
                {!isSidebarOpen && (<div className="flex justify-center py-2 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => setIsSidebarOpen(true)}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg></div>)}

                <div className="p-3 space-y-1 flex-1 overflow-y-auto scrollbar-hide">
                    <div className={`text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2 transition-all ${isSidebarOpen ? 'px-4 opacity-100' : 'text-center opacity-0 hidden'}`}>Menu</div>
                    
                    {/* 🔥 FIX INBOX LINK: Paksa parameter filter=inbox biar gak kena redirect loop di Controller */}
                    <SidebarLink href={route('dashboard') + '?filter=inbox'} active={url.includes('filter=inbox') || (url === '/dashboard' && !url.includes('?'))} icon="📥" label="Inbox" />
                    
                    <SidebarLink href={route('dashboard') + '?filter=today'} active={url.includes('filter=today')} icon="☀️" label="Hari Ini" />
                    <SidebarLink href={route('dashboard') + '?filter=upcoming'} active={url.includes('filter=upcoming')} icon="🗓️" label="Mendatang" />
                    <SidebarLink href={route('dashboard') + '?filter=archive'} active={url.includes('filter=archive')} icon="📦" label="Arsip" />
                    <SidebarLink href={route('activities.index')} active={url.includes('/activities')} icon="📜" label="Aktivitas" />
                    <div className="my-4 border-t border-gray-100 dark:border-gray-700"></div>
                    <div>
                        <div className={`flex items-center mb-2 transition-all ${isSidebarOpen ? 'justify-between px-4' : 'justify-center'}`}>
                            <div className={`text-xs font-bold text-gray-400 uppercase tracking-wider ${!isSidebarOpen && 'hidden'}`}>Project</div>
                            <button onClick={openCreateModal} className="text-gray-400 hover:text-purple-600 text-xs font-bold p-1 rounded hover:bg-purple-50 dark:hover:bg-purple-900 transition">{isSidebarOpen ? '+ Baru' : <span className="text-lg">+</span>}</button>
                        </div>
                        {categories.length > 0 ? (categories.map(cat => (<SidebarLink key={cat.id} href={route('dashboard') + '?category_id=' + cat.id} active={currentCategoryId == cat.id} icon="📁" label={cat.name} badge={cat.tasks_count} onEdit={() => openEditModal(cat)} onDelete={(e) => deleteCategory(e, cat.id, cat.name, cat.tasks_count)} />))) : (isSidebarOpen && <p className="text-xs text-gray-400 px-4 text-center">Belum ada project.</p>)}
                    </div>
                </div>

                <div className="p-3 border-t border-gray-100 dark:border-gray-700 relative">
                    
                    {/* 🔥 TOMBOL TOGGLE THEME DIHAPUS TOTAL BIAR GAK BENTROK SAMA SETTINGS */}

                    {showUserMenu && (<><div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div><div className={`absolute bottom-full mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 transition-all duration-200 ease-out origin-bottom ${isSidebarOpen ? 'left-3 right-3' : 'left-full ml-2 w-48 bottom-0'}`}><div className="py-1"><Link href={route('profile.edit')} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700" onClick={() => setShowUserMenu(false)}>Profile</Link><Link href={route('settings.edit')} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700" onClick={() => setShowUserMenu(false)}>Pengaturan ⚙️</Link><Link href={route('logout')} method="post" as="button" className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setShowUserMenu(false)}>Log Out</Link></div></div></>)}
                    
                    <button onClick={() => setShowUserMenu(!showUserMenu)} className={`flex items-center w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition ${isSidebarOpen ? 'justify-start gap-3' : 'justify-center'}`}>
                        <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">{user.name.charAt(0)}</div>
                        <div className={`flex-1 min-w-0 text-left transition-all duration-300 ${isSidebarOpen ? 'block opacity-100' : 'hidden opacity-0'}`}>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                        {isSidebarOpen && <span className="text-gray-400 dark:text-gray-500 transition-transform duration-200">▲</span>}
                    </button>
                </div>
            </aside>

            <Modal show={isCatModalOpen} onClose={() => setIsCatModalOpen(false)}>
                <div className="p-6 dark:bg-gray-800 dark:text-white">
                    <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">{editingCategory ? 'Ganti Nama Project ✏️' : 'Buat Project Baru 📁'}</h2>
                    <form onSubmit={submitCategory} className="space-y-4">
                        <div><InputLabel value="Nama Project" className="dark:text-gray-300" /><TextInput className="w-full mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-purple-500" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Contoh: Skripsi, Liburan, Bisnis..." autoFocus /></div>
                        <div className="flex justify-end gap-3 mt-6"><SecondaryButton onClick={() => setIsCatModalOpen(false)} className="dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">Batal</SecondaryButton><PrimaryButton disabled={processing}>{processing ? 'Menyimpan...' : (editingCategory ? 'Simpan Perubahan' : 'Buat Project')}</PrimaryButton></div>
                    </form>
                </div>
            </Modal>
            
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
                {header && (<header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 transition-colors duration-300"><div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">{header}</div></header>)}
                <main className="flex-1 pb-20"> {/* 🔥 Kasih padding bottom biar konten gak ketutup Timer */}
                    {children}
                </main>
            </div>
            {/* 🔥 PASANG TIMER DI SINI (GLOBAL) */}
            <PomodoroTimer /> 
        </div>
    );
}