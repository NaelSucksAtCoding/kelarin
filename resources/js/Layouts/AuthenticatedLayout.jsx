import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react'; // usePage buat dapet info user/url
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import logoKelarin from '../../images/kelarinlogo.svg'; // Pastikan path logo aman

export default function Authenticated({ user, header, children }) {
    // State buat Sidebar Mobile (Bawaan)
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    
    // State Baru: Sidebar Desktop (Buka/Tutup)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const { url } = usePage();

    // Komponen Link Sidebar Pintar
    const SidebarLink = ({ href, active, icon, label, badge = null }) => (
        <Link
            href={href}
            title={!isSidebarOpen ? label : ''} // Kasih tooltip pas sidebar nutup
            className={`
                flex items-center py-3 mb-1 font-medium rounded-xl transition-all duration-200
                ${isSidebarOpen ? 'px-4 justify-between' : 'justify-center px-2'} // Beda padding pas buka/tutup
                ${active 
                    ? 'bg-purple-50 text-purple-700 font-bold' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            `}
        >
            <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : ''}`}>
                {/* Ikon digedein dikit pas mode tutup biar jelas */}
                <span className={`${isSidebarOpen ? 'text-lg' : 'text-xl'}`}>{icon}</span>
                
                {/* Teks Label (Hilang kalau sidebar nutup) */}
                <span className={`transition-all duration-300 ${isSidebarOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>
                    {label}
                </span>
            </div>

            {/* Badge Angka (Cuma muncul pas sidebar kebuka) */}
            {badge && isSidebarOpen && (
                <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {badge}
                </span>
            )}
        </Link>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">
            
            {/* ================= SIDEBAR (DESKTOP) ================= */}
            <aside 
                className={`
                    bg-white border-r border-gray-100 hidden md:flex flex-col fixed h-full z-30
                    transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'w-64' : 'w-20'} // Animasi Lebar
                `}
            >
                {/* 1. Header Sidebar (Logo + Toggle Button) */}
                <div className={`h-16 flex items-center border-b border-gray-100 transition-all ${isSidebarOpen ? 'px-6 justify-between' : 'justify-center'}`}>
                    
                    {/* Logo & Teks */}
                    <Link href="/" className="flex items-center gap-2 overflow-hidden">
                        <img src={logoKelarin} alt="Logo" className="w-8 h-8 object-contain shrink-0" />
                        
                        <span className={`text-xl font-bold text-gray-800 tracking-tight whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
                            Kelarin<span className="text-purple-600">.</span>
                        </span>
                    </Link>

                    {/* Tombol Toggle (Panah) */}
                    {isSidebarOpen && (
                        <button 
                            onClick={() => setIsSidebarOpen(false)}
                            className="text-gray-400 hover:text-purple-600 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Tombol Buka Lagi (Kalau lagi nutup) - Muncul di tengah */}
                {!isSidebarOpen && (
                    <div className="flex justify-center py-2 border-b border-gray-100 cursor-pointer hover:bg-gray-50" onClick={() => setIsSidebarOpen(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400">
                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}

                {/* 2. Menu Utama */}
                <div className="p-3 space-y-1 flex-1 overflow-y-auto scrollbar-hide">
                    {/* Label Menu (Hilang pas nutup) */}
                    <div className={`text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2 transition-all ${isSidebarOpen ? 'px-4 opacity-100' : 'text-center opacity-0 hidden'}`}>
                        Menu
                    </div>
                    
                    <SidebarLink href={route('dashboard')} active={url === '/dashboard'} icon="📥" label="Inbox" />
                    <SidebarLink href={route('dashboard') + '?filter=today'} active={url.includes('filter=today')} icon="☀️" label="Hari Ini" />
                    <SidebarLink href={route('dashboard') + '?filter=upcoming'} active={url.includes('filter=upcoming')} icon="🗓️" label="Mendatang" />
                    <SidebarLink href="#" active={false} icon="📦" label="Arsip" />

                    {/* Divider */}
                    <div className="my-4 border-t border-gray-100"></div>

                    {/* Project Section */}
                    <div>
                         {/* Header Project (Flexibel) */}
                        <div className={`flex items-center mb-2 transition-all ${isSidebarOpen ? 'justify-between px-4' : 'justify-center'}`}>
                            <div className={`text-xs font-bold text-gray-400 uppercase tracking-wider ${!isSidebarOpen && 'hidden'}`}>
                                Project
                            </div>
                            <button className="text-gray-400 hover:text-purple-600 text-xs font-bold">
                                {isSidebarOpen ? '+' : <span className="text-lg">+</span>}
                            </button>
                        </div>
                        
                        <SidebarLink href="#" active={false} icon="💼" label="Kantor" />
                        <SidebarLink href="#" active={false} icon="🎓" label="Kuliah" />
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
                                
                                {/* Info User (Hilang pas nutup) */}
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

            {/* ================= KONTEN KANAN (MAIN) ================= */}
            {/* Margin Kiri otomatis menyesuaikan lebar sidebar */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
                
                {/* Header Mobile (Tetap Sama) */}
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
                    {/* Menu Mobile */}
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