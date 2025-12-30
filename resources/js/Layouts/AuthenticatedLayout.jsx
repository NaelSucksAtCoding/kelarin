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

    // STATE & FORM BUAT KATEGORI
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        name: '',
    });

    // Handle Buka Modal
    const openCategoryModal = () => {
        clearErrors();
        reset();
        setIsCatModalOpen(true);
    };

    // Handle Simpan Kategori
    const submitCategory = (e) => {
        e.preventDefault();
        post(route('categories.store'), {
            onSuccess: () => setIsCatModalOpen(false),
        });
    };

    // Handle Hapus Kategori
// Handle Hapus Kategori (Versi Router Inertia - Lebih Stabil)
    const deleteCategory = (e, id, name) => {
        e.preventDefault();
        
        Swal.fire({
            title: `Hapus Project "${name}"?`,
            text: "Tugas di dalamnya TIDAK akan terhapus (pindah ke Inbox).",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus Project!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                // Pake router.delete bawaan Inertia. Lebih clean & aman!
                router.delete(route('categories.destroy', id), {
                    onSuccess: () => {
                        // Gak perlu alert lagi disini, karena udah di-handle flash message Dashboard
                    },
                    onError: () => {
                        Swal.fire('Gagal!', 'Gagal menghapus project.', 'error');
                    }
                });
            }
        });
    };

    // Komponen Link Sidebar
    const SidebarLink = ({ href, active, icon, label, badge = null, onDelete = null }) => (
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
                <span className={`transition-all duration-300 truncate max-w-[120px] ${isSidebarOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>
                    {label}
                </span>
            </div>
            
            {/* Tombol Delete (Muncul pas Hover & Sidebar Buka) */}
            {onDelete && isSidebarOpen && (
                <button 
                    onClick={onDelete}
                    className="absolute right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Hapus Project"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                </button>
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

                    {/* 3. Project / Kategori (REAL DARI DATABASE) */}
                    <div>
                        <div className={`flex items-center mb-2 transition-all ${isSidebarOpen ? 'justify-between px-4' : 'justify-center'}`}>
                            <div className={`text-xs font-bold text-gray-400 uppercase tracking-wider ${!isSidebarOpen && 'hidden'}`}>
                                Project
                            </div>
                            {/* Tombol Tambah Project */}
                            <button 
                                onClick={openCategoryModal}
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
                                    // Pass fungsi delete
                                    onDelete={(e) => deleteCategory(e, cat.id, cat.name)}
                                />
                            ))
                        ) : (
                            isSidebarOpen && <p className="text-xs text-gray-400 px-4 text-center">Belum ada project.</p>
                        )}
                    </div>
                </div>

                {/* 4. User Profile */}
                <div className="p-3 border-t border-gray-100">
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className={`flex items-center w-full p-2 hover:bg-gray-50 rounded-lg transition ${isSidebarOpen ? 'justify-start gap-3' : 'justify-center'}`}>
                                <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                                    {user.name.charAt(0)}
                                </div>
                                <div className={`flex-1 min-w-0 text-left transition-all duration-300 ${isSidebarOpen ? 'block opacity-100' : 'hidden opacity-0'}`}>
                                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                                {isSidebarOpen && <span className="text-gray-400">▼</span>}
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content align={isSidebarOpen ? 'right' : 'left'} width="48">
                            <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </aside>

            {/* ================= MODAL TAMBAH KATEGORI (BARU) ================= */}
            <Modal show={isCatModalOpen} onClose={() => setIsCatModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold mb-4 text-gray-800">
                        Buat Project Baru 📁
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
                            {/* Menampilkan error manual jika ada (dari props layout kalau mau detail, tapi default alert sukses cukup) */}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <SecondaryButton onClick={() => setIsCatModalOpen(false)}>Batal</SecondaryButton>
                            <PrimaryButton disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Buat Project'}
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