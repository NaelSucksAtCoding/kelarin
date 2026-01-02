import { useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function ReminderManager() {
    
    // 🔥 LOGIC POLLING UTAMA
    useEffect(() => {
        // Fungsi pengecek ke backend
        const checkReminders = async () => {
            try {
                const response = await axios.get(route('reminders.check'));
                const reminders = response.data;

                if (reminders.length > 0) {
                    // Ambil reminder pertama aja (biar gak numpuk/spam)
                    const reminder = reminders[0]; 
                    showReminderToast(reminder);
                }
            } catch (error) {
                console.error("Gagal cek reminder:", error);
            }
        };

        // 1. Cek langsung pas pertama kali load
        checkReminders();

        // 2. Pasang interval tiap 60 detik (60000 ms)
        const intervalId = setInterval(checkReminders, 60000);

        // Cleanup: Hapus interval kalau user pindah halaman/logout
        return () => clearInterval(intervalId);
    }, []);

    // 🎨 TAMPILAN TOAST (UI)
    const showReminderToast = (reminder) => {
        const isDark = document.documentElement.classList.contains('dark');
        
        // Cek apakah ada action button (misal: "Mulai Fokus")
        const hasAction = reminder.action_data && reminder.action_data.action === 'start_focus';
        
        Swal.fire({
            title: 'Ingat!',
            text: reminder.message,
            icon: 'info', // Bisa diganti emoji di text kalau mau lebih santai
            toast: true,
            position: 'bottom-end',
            showConfirmButton: hasAction, // Muncul cuma kalau ada action
            confirmButtonText: hasAction ? reminder.action_data.label : 'Oke',
            confirmButtonColor: '#9333ea', // Warna Ungu Kelarin
            showCloseButton: true,
            timer: 10000, // Hilang sendiri dalam 10 detik kalau dicuekin
            timerProgressBar: true,
            background: isDark ? '#1f2937' : '#fff',
            color: isDark ? '#fff' : '#1f2937',
            
            // Logic pas tombol ditekan
            didOpen: (toast) => {
                // Efek suara notifikasi ringan (Opsional)
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.volume = 0.5;
                audio.play().catch(() => {}); // Catch error kalau browser block autoplay
            }
        }).then((result) => {
            // Tandai sudah dibaca di database (apapun hasilnya, mau klik atau close)
            axios.post(route('reminders.read', reminder.id));

            // Kalau user klik tombol Action (Mulai Fokus)
            if (result.isConfirmed && hasAction) {
                handleAction(reminder.action_data);
            }
        });
    };

    // ⚡ EKSEKUSI ACTION (Start Pomodoro)
    const handleAction = (actionData) => {
        if (actionData.action === 'start_focus') {
            // Kita tembak event global biar PomodoroTimer nangkep
            // Tapi kita butuh data Task lengkap (ID & Title).
            // Karena di reminder cuma ada ID, kita fetch task dulu atau kirim title dari backend.
            // SEMENTARA: Kita kirim ID dan Title generik "Tugas Deadline" biar cepet.
            // (Idealnya backend kirim title juga di action_data)
            
            window.dispatchEvent(new CustomEvent('start-pomodoro', { 
                detail: { 
                    task: { 
                        id: actionData.task_id, 
                        title: 'Tugas Deadline (Reminder)' // Nanti bisa diperbaiki di Backend Generator
                    }, 
                    duration: 25 * 60 * 1000 // Default 25 menit
                } 
            }));
        }
    };

    return null; // Komponen ini "Invisible", cuma logic doang
}