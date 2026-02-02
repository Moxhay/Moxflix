import { createSession, validateSession, deleteSession } from '@/lib/auth/sessionStore';
import { prisma } from '@/lib/prisma';

describe('Session Store', () => {
    let testUserId: number;

    beforeAll(async () => {
        const user = await prisma.user.create({
            data: {
                name: 'Test User',
                email: `test-${Date.now()}@example.com`,
                password: 'hashedpassword',
            },
        });
        testUserId = user.id;
    });

    afterAll(async () => {
        await prisma.session.deleteMany({ where: { userId: testUserId } });
        await prisma.user.delete({ where: { id: testUserId } });
    });

    afterEach(async () => {
        await prisma.session.deleteMany({ where: { userId: testUserId } });
    });

    describe('createSession', () => {
        it('should create a session', async () => {
            const sessionToken = await createSession(testUserId, false);

            expect(sessionToken).toBeDefined();
            expect(typeof sessionToken).toBe('string');
            expect(sessionToken.length).toBeGreaterThan(0);

            const session = await prisma.session.findUnique({
                where: { sessionToken },
            });
            expect(session).toBeDefined();
            expect(session?.userId).toBe(testUserId);
        });

        it('should set correct expiry for remember me', async () => {
            const sessionToken = await createSession(testUserId, true);

            const session = await prisma.session.findUnique({
                where: { sessionToken },
            });

            const now = new Date();
            const expectedExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

            expect(session?.expiresAt.getTime()).toBeGreaterThan(now.getTime());
            expect(session?.expiresAt.getTime()).toBeLessThan(expectedExpiry.getTime() + 60000);
        });
    });

    describe('validateSession', () => {
        it('should validate a valid session', async () => {
            const sessionToken = await createSession(testUserId, false);

            const validatedUserId = await validateSession(sessionToken);
            expect(validatedUserId).toBe(testUserId);
        });

        it('should return null for non-existent session', async () => {
            const validatedUserId = await validateSession('non-existent-token');
            expect(validatedUserId).toBeNull();
        });

        it('should return null and delete expired session', async () => {
            const sessionToken = 'expired-token';
            await prisma.session.create({
                data: {
                    sessionToken,
                    userId: testUserId,
                    expiresAt: new Date(Date.now() - 1000),
                },
            });

            const validatedUserId = await validateSession(sessionToken);
            expect(validatedUserId).toBeNull();

            const session = await prisma.session.findUnique({
                where: { sessionToken },
            });
            expect(session).toBeNull();
        });
    });

    describe('deleteSession', () => {
        it('should delete a session', async () => {
            const sessionToken = await createSession(testUserId, false);

            await deleteSession(sessionToken);

            const session = await prisma.session.findUnique({
                where: { sessionToken },
            });
            expect(session).toBeNull();
        });

        it('should not throw error when deleting non-existent session', async () => {
            await expect(deleteSession('non-existent-token')).resolves.not.toThrow();
        });
    });
});
