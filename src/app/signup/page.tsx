import Link from 'next/link';
import { SignupForm } from '@/components/auth/SignupForm';

export const metadata = {
    title: 'Sign Up - Moxflix',
    description: 'Create a Moxflix account',
};

export default function SignupPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black pt-20">
            <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900/80 p-8 shadow-2xl backdrop-blur-sm">
                <h1 className="mb-6 text-center text-2xl font-bold text-white">Create Account</h1>

                <SignupForm />

                <p className="mt-6 text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-violet-400 transition-colors hover:text-violet-300">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
