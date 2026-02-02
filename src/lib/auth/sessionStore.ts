import { prisma } from '@/lib/prisma';
import { SESSION_DURATION } from './session';

function generateSessionToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function createSession(userId: number, remember: boolean = false): Promise<string> {
    const sessionToken = generateSessionToken();
    const duration = remember ? SESSION_DURATION.REMEMBER_ME : SESSION_DURATION.DEFAULT;
    const expiresAt = new Date(Date.now() + duration * 1000);

    await prisma.session.create({
        data: {
            sessionToken,
            userId,
            expiresAt,
        },
    });

    return sessionToken;
}

export async function validateSession(sessionToken: string): Promise<number | null> {
    const session = await prisma.session.findUnique({
        where: { sessionToken },
        select: { userId: true, expiresAt: true },
    });

    if (!session) {
        return null;
    }

    if (session.expiresAt < new Date()) {
        await prisma.session.delete({
            where: { sessionToken }
        }).catch(() => {});
        return null;
    }

    return session.userId;
}

export async function deleteSession(sessionToken: string): Promise<void> {
    await prisma.session.delete({
        where: { sessionToken },
    }).catch(() => {});
}

export async function deleteAllUserSessions(userId: number): Promise<void> {
    await prisma.session.deleteMany({
        where: { userId },
    });
}

export async function cleanupExpiredSessions(): Promise<void> {
    await prisma.session.deleteMany({
        where: {
            expiresAt: {
                lt: new Date(),
            },
        },
    });
}
