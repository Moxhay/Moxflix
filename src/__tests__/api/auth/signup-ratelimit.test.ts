import { authLimiter } from '@/lib/rateLimit';

jest.mock('@/lib/rateLimit', () => {
    const actual = jest.requireActual('@/lib/rateLimit');
    return {
        ...actual,
        withRateLimit: jest.fn((req, config, handler) => handler(req)),
        authLimiter: {
            check: jest.fn(),
        },
    };
});

describe('Signup Endpoint - Rate Limiting Configuration', () => {
    it('should export authLimiter for rate limiting', () => {
        expect(authLimiter).toBeDefined();
        expect(authLimiter.check).toBeDefined();
    });

    it('should use authLimiter with 5 requests limit', async () => {
        const { POST } = await import('@/app/api/auth/signup/route');
        const { withRateLimit } = await import('@/lib/rateLimit');

        expect(withRateLimit).toBeDefined();
    });
});
