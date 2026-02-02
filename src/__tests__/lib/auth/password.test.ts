import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('Password utilities', () => {
    describe('hashPassword', () => {
        it('should hash a password', async () => {
            const password = 'mySecurePassword123';
            const hashed = await hashPassword(password);

            expect(hashed).toBeDefined();
            expect(hashed).not.toBe(password);
            expect(hashed.length).toBeGreaterThan(0);
        });

        it('should generate different hashes for the same password', async () => {
            const password = 'mySecurePassword123';
            const hash1 = await hashPassword(password);
            const hash2 = await hashPassword(password);

            expect(hash1).not.toBe(hash2);
        });
    });

    describe('verifyPassword', () => {
        it('should verify a correct password', async () => {
            const password = 'mySecurePassword123';
            const hashed = await hashPassword(password);

            const isValid = await verifyPassword(password, hashed);
            expect(isValid).toBe(true);
        });

        it('should reject an incorrect password', async () => {
            const password = 'mySecurePassword123';
            const wrongPassword = 'wrongPassword456';
            const hashed = await hashPassword(password);

            const isValid = await verifyPassword(wrongPassword, hashed);
            expect(isValid).toBe(false);
        });
    });
});
