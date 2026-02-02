import { NextResponse } from 'next/server';
import { getCurrentUserId, deleteSessionCookie } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { withMiddleware, withRateLimit, ApiRequest } from '@/lib/middleware';

async function sessionHandler(request: ApiRequest) {
    try {
        const userId = await getCurrentUserId();

        if (!userId) {
            return NextResponse.json({ user: null });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true },
        });

        if (!user) {
            await deleteSessionCookie();
            return NextResponse.json({ user: null });
        }

        return NextResponse.json({ user });

    } catch (error) {
        console.error('Session error:', error);
        return NextResponse.json({ user: null });
    }
}

export const GET = withMiddleware(sessionHandler, withRateLimit({ limit: 100, interval: 60 * 1000 }));
