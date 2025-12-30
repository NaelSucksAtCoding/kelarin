import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit} className="space-y-5">
                {/* Nama Lengkap */}
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" className="text-gray-700 font-medium ml-1" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-2 block w-full px-5 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-[#667eea] focus:ring-0 transition-all duration-300"
                        placeholder="Udin Petot"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                {/* Email */}
                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-gray-700 font-medium ml-1" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-2 block w-full px-5 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-[#667eea] focus:ring-0 transition-all duration-300"
                        placeholder="udin@contoh.com"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Password */}
                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-gray-700 font-medium ml-1" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-2 block w-full px-5 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-[#667eea] focus:ring-0 transition-all duration-300"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Konfirmasi Password */}
                <div>
                    <InputLabel htmlFor="password_confirmation" value="Ulangi Password" className="text-gray-700 font-medium ml-1" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-2 block w-full px-5 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-[#667eea] focus:ring-0 transition-all duration-300"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                {/* Tombol Register Gradient */}
                <button
                    disabled={processing}
                    className="w-full mt-4 py-4 px-6 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
                >
                    {processing ? 'Mendaftar...' : 'BUAT AKUN BARU'}
                </button>

                {/* Link ke Login */}
                <div className="text-center mt-6 text-sm text-gray-500">
                    Sudah punya akun?{' '}
                    <Link href={route('login')} className="text-[#667eea] font-bold hover:underline">
                        Masuk disini
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}