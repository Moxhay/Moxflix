import { cookies } from 'next/headers';
import { validateSession } from './sessionStore';

export const SESSION_DURATION = {
    DEFAULT: 60 * 60 * 12, // 12 hours
    REMEMBER_ME: 60 * 60 * 24 * 7 // 7 days (1 week)
};

export const COOKIE_NAME = 'session_token';

export interface CookieOptions {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
    maxAge: number;
    path: string;
}

export function getCookieOptions(remember: boolean = false): CookieOptions {
    const duration = remember ? SESSION_DURATION.REMEMBER_ME : SESSION_DURATION.DEFAULT;

    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: duration,
        path: '/'
    };
}

export async function setSessionCookie(sessionToken: string, remember: boolean = false): Promise<void> {
    const cookieStore = await cookies();
    const options = getCookieOptions(remember);
    cookieStore.set(COOKIE_NAME, sessionToken, options);
}

export async function getSessionCookie(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAME)?.value;
}

export async function deleteSessionCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUserId(): Promise<number | null> {
    const sessionToken = await getSessionCookie();

    if (!sessionToken) {
        return null;
    }

    return await validateSession(sessionToken);
}
