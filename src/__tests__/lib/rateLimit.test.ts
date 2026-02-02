jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((data: any, init?: any) => ({
            status: init?.status || 200,
            json: async () => data,
        })),
    },
}));

import { withRateLimit } from '@/lib/rateLimit';
import { NextResponse } from 'next/server';

const mockLimiterCheck = jest.fn();
const mockLimiter = {
    check: mockLimiterCheck,
};

const mockRequest = {
    ip: '192.168.1.1',
    headers: {
        get: jest.fn(),
    },
} as any;

const mockHandler = jest.fn(async () =>
    NextResponse.json({ success: true })
);

describe('Rate Limiter', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('withRateLimit', () => {
        it('should allow requests when rate limiter check passes', async () => {
            mockLimiterCheck.mockResolvedValue(undefined);

            const response = await withRateLimit(
                mockRequest,
                { limiter: mockLimiter as any, limit: 5 },
                mockHandler
            );

            expect(mockLimiterCheck).toHaveBeenCalledWith(5, '192.168.1.1');
            expect(mockHandler).toHaveBeenCalledWith(mockRequest);
            expect(response.status).toBe(200);
        });

        it('should return 429 when rate limit is exceeded', async () => {
            mockLimiterCheck.mockRejectedValue(new Error('Rate limit exceeded'));

            const response = await withRateLimit(
                mockRequest,
                { limiter: mockLimiter as any, limit: 5 },
                mockHandler
            );

            expect(mockLimiterCheck).toHaveBeenCalledWith(5, '192.168.1.1');
            expect(mockHandler).not.toHaveBeenCalled();
            expect(response.status).toBe(429);

            const data = await response.json();
            expect(data).toEqual({ error: 'Too many requests. Please try again later.' });
        });

        it('should use x-forwarded-for header when IP is not available', async () => {
            mockLimiterCheck.mockResolvedValue(undefined);

            const requestWithoutIP = {
                ip: undefined,
                headers: {
                    get: jest.fn((header: string) => {
                        if (header === 'x-forwarded-for') return '10.0.0.1';
                        return null;
                    }),
                },
            } as any;

            await withRateLimit(
                requestWithoutIP,
                { limiter: mockLimiter as any, limit: 5 },
                mockHandler
            );

            expect(mockLimiterCheck).toHaveBeenCalledWith(5, '10.0.0.1');
        });

        it('should use "anonymous" when no identifier is available', async () => {
            mockLimiterCheck.mockResolvedValue(undefined);

            const requestWithoutIdentifier = {
                ip: undefined,
                headers: {
                    get: jest.fn(() => null),
                },
            } as any;

            await withRateLimit(
                requestWithoutIdentifier,
                { limiter: mockLimiter as any, limit: 5 },
                mockHandler
            );

            expect(mockLimiterCheck).toHaveBeenCalledWith(5, 'anonymous');
        });
    });
});
