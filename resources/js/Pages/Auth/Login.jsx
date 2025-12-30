import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

            <form onSubmit={submit} className="space-y-6">
                {/* Email Input */}
                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-gray-700 font-medium ml-1" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-2 block w-full px-5 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-[#667eea] focus:ring-0 transition-all duration-300"
                        placeholder="contoh@email.com"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Password Input */}
                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-gray-700 font-medium ml-1" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-2 block w-full px-5 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-[#667eea] focus:ring-0 transition-all duration-300"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between mt-4">
                    <label className="flex items-center">
                        <Checkbox name="remember" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} className="text-[#667eea] focus:ring-[#667eea]" />
                        <span className="ms-2 text-sm text-gray-500">Ingat Saya</span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-[#667eea] hover:text-[#5a6fd6] font-semibold hover:underline"
                        >
                            Lupa password?
                        </Link>
                    )}
                </div>

                {/* Tombol Login Gradient */}
                <button
                    disabled={processing}
                    className="w-full py-4 px-6 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
                >
                    {processing ? 'Masuk...' : 'MASUK SEKARANG'}
                </button>

                {/* Link ke Register */}
                <div className="text-center mt-6 text-sm text-gray-500">
                    Belum punya akun?{' '}
                    <Link href={route('register')} className="text-[#667eea] font-bold hover:underline">
                        Daftar disini
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}