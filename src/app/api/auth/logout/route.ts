import { NextResponse } from 'next/server';
import { getSessionCookie, deleteSessionCookie } from '@/lib/auth/session';
import { deleteSession } from '@/lib/auth/sessionStore';
import { withMiddleware, withRateLimit, ApiRequest } from '@/lib/middleware';

async function logoutHandler(request: ApiRequest) {
    try {
        const sessionToken = await getSessionCookie();

        if (sessionToken) {
            await deleteSession(sessionToken);
        }

        await deleteSessionCookie();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const POST = withMiddleware(logoutHandler, withRateLimit({ limit: 20, interval: 60 * 1000 }));
