import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                // Gua liat lu pake Poppins, mantap!
                sans: ['Poppins', ...defaultTheme.fontFamily.sans],
            },
            // --- ANIMASI TAMBAHAN ---
            animation: {
                blob: "blob 7s infinite", // (Opsional kalau mau dipake di tempat lain)
                'fade-in-down': 'fadeInDown 0.8s ease-out', // Dipake di Logo
            },
            // --- KEYFRAMES (GERAKAN ANIMASINYA) ---
            keyframes: {
                blob: {
                    "0%": { transform: "translate(0px, 0px) scale(1)" },
                    "33%": { transform: "translate(30px, -50px) scale(1.1)" },
                    "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
                    "100%": { transform: "translate(0px, 0px) scale(1)" },
                },
                fadeInDown: {
                    '0%': { opacity: '0', transform: 'translateY(-20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            },
        },
    },

    plugins: [forms],
};