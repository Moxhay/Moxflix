'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiAuth } from '@/api/api';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { EyeIcon, EyeOffIcon } from '@/components/icons';
import { useAuth } from '@/providers/AuthProvider';

export function LoginForm() {
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { refetch } = useAuth();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            remember: false
        }
    });

    const onSubmit = async (data: LoginFormData) => {
        setError('');

        const { success, error: apiError } = await apiAuth.login(data);

        if (!success) {
            setError(apiError || 'Login failed');
            return;
        }

        await refetch();
        router.push(redirect);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
                <div className="rounded-lg bg-red-500/20 p-3 text-red-400" role="alert">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                    placeholder="you@email.com"
                    disabled={isSubmitting}
                />
                {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>}
            </div>

            <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-300">
                    Password
                </label>
                <div className="relative">
                    <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 pr-12 text-white placeholder-gray-500 transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                        placeholder="••••••••"
                        disabled={isSubmitting}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-white"
                    >
                        {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                    </button>
                </div>
                {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>}
            </div>

            <div className="flex items-center">
                <input
                    id="remember"
                    type="checkbox"
                    {...register('remember')}
                    className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-violet-500 focus:ring-violet-500/20"
                    disabled={isSubmitting}
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-400">
                    Remember me
                </label>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-gradient-to-r from-violet-500 to-purple-700 px-4 py-3 font-medium text-white transition-all hover:from-violet-600 hover:to-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isSubmitting ? 'Logging in...' : 'Log In'}
            </button>
        </form>
    );
}
