import { Link } from '@inertiajs/react';
import logoKelarin from '../../images/kelarinlogo.svg';

export default function Guest({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 relative overflow-hidden">
            
            {/* 🎥 VIDEO BACKGROUND */}
            <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover -z-20"
            >
                <source src="/videos/bg.mp4" type="video/mp4" />
            </video>
            
            {/* Overlay Hitam (Biar video agak gelap dikit) */}
            <div className="absolute inset-0 bg-black/40 -z-10"></div> 

            {/* 💎 KONTEN UTAMA */}
            <div className="relative z-10 w-full flex flex-col items-center">
                <div className="mb-6 animate-fade-in-down">
                    <Link href="/">
                        {/* Logo Putih */}
                        <img src={logoKelarin} className="w-20 h-20 fill-current text-white drop-shadow-lg" alt="Logo" />
                    </Link>
                </div>

                <div className="
                    w-full sm:max-w-md mt-6 px-8 py-10 
                    
                    /* 🔥 UBAH DI SINI: JADI HITAM PEKAT (Gray-900) */
                    bg-gray-900 
                    
                    /* Border gelap biar batasnya tegas */
                    border border-gray-800
                    
                    /* Shadow tebal */
                    shadow-2xl rounded-3xl 
                    overflow-hidden
                    transform transition-all hover:scale-[1.01] duration-500
                ">
                    {children}
                </div>
                
                <div className="mt-8 text-white/80 text-xs font-bold tracking-wide drop-shadow-md">
                    &copy; 2025 Kelarin App. Produktivitas Tanpa Batas.
                </div>
            </div>
        </div>
    );
}