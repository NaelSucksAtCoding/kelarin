import { Link } from '@inertiajs/react';
import logoKelarin from '../../images/kelarinlogo.svg'; // Pastikan path logo bener

export default function Guest({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-[#f3f4f6] relative overflow-hidden">
            
            {/* Hiasan Background (Blob Ungu Pudar) - Opsional biar estetik */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

            {/* CONTAINER UTAMA (Card Putih) */}
            <div className="w-full sm:max-w-md mt-6 px-10 py-12 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.1)] rounded-[20px] relative z-10 transition-all duration-300 hover:shadow-[0_25px_70px_rgba(0,0,0,0.15)]">
                
                {/* HEADER LOGO */}
                <div className="flex flex-col items-center mb-8">
                    <Link href="/">
                        <img src={logoKelarin} alt="Logo" className="w-16 h-16 object-contain mb-4 hover:scale-110 transition-transform duration-300" />
                    </Link>
                    <h2 className="text-[#667eea] font-bold text-3xl mb-2">Kelarin.</h2>
                    <p className="text-gray-500 text-sm text-center">
                        Masuk untuk mulai produktif hari ini.
                    </p>
                </div>

                {/* FORM (Login/Register masuk sini) */}
                {children}
            </div>
        </div>
    );
}