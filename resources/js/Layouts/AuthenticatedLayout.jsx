import { useState } from 'react';
import { Link, usePage, useForm, router } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import Modal from '@/Components/Modal'; // Import Modal
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import Swal from 'sweetalert2'; 
import logoKelarin from '../../images/kelarinlogo.svg'; 

export default function Authenticated({ user, header, children, categories = [], currentCategoryId = null }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { url } = usePage();
    const [showUserMenu, setShowUserMenu] = useState(false);
    
    // STATE KHUSUS EDIT
    const [editingCategory, setEditingCategory] = useState(null); // Kategori yang lagi diedit

    // STATE & FORM BUAT KATEGORI
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const { data, setData, post, patch, processing, reset, errors, clearErrors } = useForm({
        name: '',
    });

    // Handle Buka Modal (CREATE)
    const openCreateModal = () => {
        clearErrors();
        reset(); // Kosongin form
        setEditingCategory(null); // Mode Create: set null
        setIsCatModalOpen(true);
    };

    // Handle Buka Modal (EDIT) -> PENTING
    const openEditModal = (cat) => {
        clearErrors();
        setData('name', cat.name); // Isi form dengan nama lama
        setEditingCategory(cat); // Mode Edit: isi data kategori
        setIsCatModalOpen(true);
    };

    // Handle Simpan Kategori (Bisa Create atau Update)
    const submitCategory = (e) => {
        e.preventDefault();
        
        if (editingCategory) {
            // Pakai method 'patch' bawaan useForm. Anti ribet.
            patch(route('categories.update', editingCategory.id), {
                onSuccess: () => setIsCatModalOpen(false),
            });
        } else {
            // LOGIC CREATE (POST)
            post(route('categories.store'), {
                onSuccess: () => setIsCatModalOpen(false),
            });
        }
    };

    // Handle Hapus Kategori (Versi Router Inertia - Lebih Stabil)
    const deleteCategory = (e, id, name, taskCount) => {
        e.preventDefault();
        
        Swal.fire({
            title: `Hapus Project "${name}"?`,
            // Kasih info ada berapa tugas di dalamnya
            text: taskCount > 0 
                ? `Ada ${taskCount} tugas di dalam project ini. Mau diapain?` 
                : "Project ini kosong, aman buat dihapus.",
            icon: 'warning',
            showCancelButton: true,
            showDenyButton: taskCount > 0, // Tombol opsi ke-2 cuma muncul kalau ada tugasnya
            
            // Konfigurasi 3 Tombol
            confirmButtonColor: '#d33',     // Merah (Hapus Semua)
            denyButtonColor: '#3085d6',     // Biru (Pindah Inbox)
            cancelButtonColor: '#6b7280',   // Abu (Batal)
            
            confirmButtonText: taskCount > 0 ? '🔥 Musnahkan Semua' : 'Ya, Hapus',
            denyButtonText: '📂 Pindahin Tugas ke Inbox',
            cancelButtonText: 'Batal',
            reverseButtons: true // Biar tombol bahaya di kanan/kiri sesuai selera (opsional)
        }).then((result) => {
            if (result.isConfirmed) {
                // PILIHAN 1: HAPUS PROJECT + TUGAS
                router.delete(route('categories.destroy', id), {
                    data: { delete_tasks: true }, // Kirim sinyal ke controller
                    onError: () => Swal.fire('Gagal!', 'Terjadi kesalahan.', 'error')
                });
            } else if (result.isDenied) {
                // PILIHAN 2: HAPUS PROJECT AJA (Tugas ke Inbox)
                router.delete(route('categories.destroy', id), {
                    data: { delete_tasks: false }, // Default behavior
                    onError: () => Swal.fire('Gagal!', 'Terjadi kesalahan.', 'error')
                });
            }
        });
    };

    // Komponen Link Sidebar
    const SidebarLink = ({ href, active, icon, label, badge = null, onDelete = null, onEdit = null }) => (
        <Link
            href={href}
            title={!isSidebarOpen ? label : ''}
            className={`
                group flex items-center py-3 mb-1 font-medium rounded-xl transition-all duration-200 relative
                ${isSidebarOpen ? 'px-4 justify-between' : 'justify-center px-2'}
                ${active 
                    ? 'bg-purple-50 text-purple-700 font-bold' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            `}
        >
            <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : ''}`}>
                <span className={`${isSidebarOpen ? 'text-lg' : 'text-xl'}`}>{icon}</span>
                <span className={`transition-all duration-300 truncate max-w-[100px] ${isSidebarOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>
                    {label}
                </span>
            </div>
            
            {/* Bagian Kanan: Badge Angka & Action Buttons */}
            {isSidebarOpen && (
                <div className="flex items-center gap-1">
                    {/* Badge Angka (Kalau ada tugasnya) */}
                    {badge > 0 && (
                        <span className={`text-[10px] py-0.5 px-2 rounded-full font-bold transition-opacity ${active ? 'bg-purple-200 text-purple-700' : 'bg-gray-100 text-gray-500'} group-hover:hidden`}>
                            {badge}
                        </span>
                    )}

                    {/* Tombol Edit & Delete (Muncul pas Hover) */}
                    {(onEdit || onDelete) && (
                        <div className="hidden group-hover:flex items-center bg-white/50 backdrop-blur-sm rounded-md">
                            {onEdit && (
                                <button 
                                    onClick={(e) => { e.preventDefault(); onEdit(); }}
                                    className="p-1 text-gray-400 hover:text-blue-500 transition"
                                    title="Ganti Nama"
                                >
                                    ✏️
                                </button>
                            )}
                            {onDelete && (
                                <button 
                                    onClick={(e) => { 
                                        e.preventDefault(); // Cegah link kebuka
                                        e.stopPropagation(); // Cegah event nembus ke elemen lain
                                        onDelete(e); // <--- PENTING: Lempar 'e' ke fungsi parent
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-500 transition"
                                    title="Hapus Project"
                                >
                                    ❌
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </Link>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">
            
            {/* ================= SIDEBAR ================= */}
            <aside 
                className={`
                    bg-white border-r border-gray-100 hidden md:flex flex-col fixed h-full z-30
                    transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'w-64' : 'w-20'}
                `}
            >
                {/* 1. Header Sidebar */}
                <div className={`h-16 flex items-center border-b border-gray-100 transition-all ${isSidebarOpen ? 'px-6 justify-between' : 'justify-center'}`}>
                    <Link href="/" className="flex items-center gap-2 overflow-hidden">
                        <img src={logoKelarin} alt="Logo" className="w-8 h-8 object-contain shrink-0" />
                        <span className={`text-xl font-bold text-gray-800 tracking-tight whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
                            Kelarin<span className="text-purple-600">.</span>
                        </span>
                    </Link>
                    {isSidebarOpen && (
                        <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-purple-600 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>

                {!isSidebarOpen && (
                    <div className="flex justify-center py-2 border-b border-gray-100 cursor-pointer hover:bg-gray-50" onClick={() => setIsSidebarOpen(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400">
                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}

                {/* 2. Menu Utama */}
                <div className="p-3 space-y-1 flex-1 overflow-y-auto scrollbar-hide">
                    <div className={`text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2 transition-all ${isSidebarOpen ? 'px-4 opacity-100' : 'text-center opacity-0 hidden'}`}>
                        Menu
                    </div>
                    
                    <SidebarLink href={route('dashboard')} active={url === '/dashboard' && !url.includes('?')} icon="📥" label="Inbox" />
                    <SidebarLink href={route('dashboard') + '?filter=today'} active={url.includes('filter=today')} icon="☀️" label="Hari Ini" />
                    <SidebarLink href={route('dashboard') + '?filter=upcoming'} active={url.includes('filter=upcoming')} icon="🗓️" label="Mendatang" />
                    <SidebarLink href={route('dashboard') + '?filter=archive'} active={url.includes('filter=archive')} icon="📦" label="Arsip" />

                    <div className="my-4 border-t border-gray-100"></div>

                    {/* 3. Project / Kategori */}
                    <div>
                        <div className={`flex items-center mb-2 transition-all ${isSidebarOpen ? 'justify-between px-4' : 'justify-center'}`}>
                            <div className={`text-xs font-bold text-gray-400 uppercase tracking-wider ${!isSidebarOpen && 'hidden'}`}>
                                Project
                            </div>
                            {/* Tombol Tambah Project */}
                            <button 
                                onClick={openCreateModal} // <--- Panggil fungsi Create Modal
                                className="text-gray-400 hover:text-purple-600 text-xs font-bold p-1 rounded hover:bg-purple-50 transition"
                            >
                                {isSidebarOpen ? '+ Baru' : <span className="text-lg">+</span>}
                            </button>
                        </div>
                        
                        {/* Looping Data Categories */}
                        {categories.length > 0 ? (
                            categories.map(cat => (
                                <SidebarLink 
                                    key={cat.id}
                                    href={route('dashboard') + '?category_id=' + cat.id} 
                                    active={currentCategoryId == cat.id} 
                                    icon="📁" 
                                    label={cat.name}
                                    badge={cat.tasks_count} // Kirim Jumlah Tugas
                                    onEdit={() => openEditModal(cat)} // Kirim Fungsi Edit
                                    onDelete={(e) => deleteCategory(e, cat.id, cat.name, cat.tasks_count)}
                                />
                            ))
                        ) : (
                            isSidebarOpen && <p className="text-xs text-gray-400 px-4 text-center">Belum ada project.</p>
                        )}
                    </div>
                </div>

                {/* 4. User Profile */}
                <div className="p-3 border-t border-gray-100 relative">
                    
                    {/* MENU POP-UP (MUNCUL KE ATAS) */}
                    {showUserMenu && (
                        <>
                            <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setShowUserMenu(false)}
                            ></div>

                            <div 
                                className={`
                                    absolute bottom-full mb-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50
                                    transition-all duration-200 ease-out origin-bottom
                                    ${isSidebarOpen ? 'left-3 right-3' : 'left-full ml-2 w-48 bottom-0'} 
                                `}
                            >
                                <div className="py-1">
                                    <Link 
                                        href={route('profile.edit')} 
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        Profile
                                    </Link>
                                    <Link 
                                        href={route('logout')} 
                                        method="post" 
                                        as="button"
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        Log Out
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}

                    {/* TOMBOL TRIGGER */}
                    <button 
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className={`flex items-center w-full p-2 hover:bg-gray-50 rounded-lg transition ${isSidebarOpen ? 'justify-start gap-3' : 'justify-center'}`}
                    >
                        <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                            {user.name.charAt(0)}
                        </div>
                        
                        <div className={`flex-1 min-w-0 text-left transition-all duration-300 ${isSidebarOpen ? 'block opacity-100' : 'hidden opacity-0'}`}>
                            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        
                        {isSidebarOpen && (
                            <span className={`text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}>
                                ▲
                            </span>
                        )}
                    </button>
                </div>
            </aside>

            {/* ================= MODAL TAMBAH/EDIT KATEGORI ================= */}
            <Modal show={isCatModalOpen} onClose={() => setIsCatModalOpen(false)}>
                <div className="p-6">
                    {/* --- JUDUL DINAMIS --- */}
                    <h2 className="text-lg font-bold mb-4 text-gray-800">
                        {editingCategory ? 'Ganti Nama Project ✏️' : 'Buat Project Baru 📁'}
                    </h2>

                    <form onSubmit={submitCategory} className="space-y-4">
                        <div>
                            <InputLabel value="Nama Project" />
                            <TextInput 
                                className="w-full mt-1" 
                                value={data.name} 
                                onChange={e => setData('name', e.target.value)} 
                                placeholder="Contoh: Skripsi, Liburan, Bisnis..."
                                autoFocus
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <SecondaryButton onClick={() => setIsCatModalOpen(false)}>Batal</SecondaryButton>
                            
                            {/* --- TOMBOL DINAMIS --- */}
                            <PrimaryButton disabled={processing}>
                                {processing ? 'Menyimpan...' : (editingCategory ? 'Simpan Perubahan' : 'Buat Project')}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* ================= KONTEN KANAN (MAIN) ================= */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
                {/* Mobile Header */}
                <nav className="bg-white border-b border-gray-100 md:hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex">
                                <div className="shrink-0 flex items-center">
                                    <Link href="/">
                                        <img src={logoKelarin} className="block h-9 w-auto" alt="Logo" />
                                    </Link>
                                </div>
                            </div>
                            <div className="-me-2 flex items-center">
                                <button
                                    onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none transition duration-150 ease-in-out"
                                >
                                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                        <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                        <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* ... Mobile Menu Bawahnya tetep sama ... */}
                    <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' md:hidden bg-white border-b'}>
                        <div className="pt-2 pb-3 space-y-1">
                            <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>Inbox</ResponsiveNavLink>
                        </div>
                        <div className="pt-4 pb-1 border-t border-gray-200">
                            <div className="px-4">
                                <div className="font-medium text-base text-gray-800">{user.name}</div>
                                <div className="font-medium text-sm text-gray-500">{user.email}</div>
                            </div>
                            <div className="mt-3 space-y-1">
                                <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                                <ResponsiveNavLink method="post" href={route('logout')} as="button">Log Out</ResponsiveNavLink>
                            </div>
                        </div>
                    </div>
                </nav>

                {header && (
                    <header className="bg-white shadow-sm sticky top-0 z-10">
                        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}