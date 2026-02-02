import Link from 'next/link';
import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
    title: 'Login - Moxflix',
    description: 'Log in to your Moxflix account',
};

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black pt-20">
            <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900/80 p-8 shadow-2xl backdrop-blur-sm">
                <h1 className="mb-6 text-center text-2xl font-bold text-white">Log In</h1>

                <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
                    <LoginForm />
                </Suspense>

                <p className="mt-6 text-center text-sm text-gray-400">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="text-violet-400 transition-colors hover:text-violet-300">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
