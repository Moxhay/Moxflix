import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import RateLimiter from 'next-rate-limit';

export interface ApiRequest<T = Record<string, unknown>> extends NextRequest {
    query: T;
    routeParams: Record<string, string>;
}

type RouteContext = { params: Promise<Record<string, string>> };
type Handler = (req: ApiRequest) => Promise<NextResponse>;
type Middleware = (req: ApiRequest) => Promise<void | NextResponse>;

export const withMiddleware = (handler: Handler, ...middlewares: Middleware[]) => {
    return async (req: NextRequest, context?: RouteContext): Promise<NextResponse> => {
        const apiReq = req as ApiRequest;
        apiReq.query = {};
        apiReq.routeParams = context?.params ? await context.params : {};

        for (const mw of middlewares) {
            const result = await mw(apiReq);
            if (result) return result;
        }

        return handler(apiReq);
    };
};

interface RateLimitOptions {
    limit: number;
    interval?: number;
}

export const withRateLimit = (options: RateLimitOptions): Middleware => {
    const limiter = RateLimiter({ interval: options.interval });

    return async (req: ApiRequest) => {
        try {
            limiter.checkNext(req, options.limit);
        } catch {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }
    };
};

export const withValidation = <T extends ZodSchema>(schema: T): Middleware => {
    return async (req: ApiRequest) => {
        const { searchParams } = new URL(req.url);
        const params = Object.fromEntries(searchParams.entries());

        const result = schema.safeParse(params);

        if (!result.success) {
            return NextResponse.json({ error: 'Validation error', details: result.error.issues }, { status: 400 });
        }

        (req as ApiRequest).query = result.data as Record<string, unknown>;
    };
};

export const withParamsValidation = <T extends ZodSchema>(schema: T): Middleware => {
    return async (req: ApiRequest) => {
        const result = schema.safeParse(req.routeParams);

        if (!result.success) {
            return NextResponse.json({ error: 'Invalid parameters', details: result.error.issues }, { status: 400 });
        }
    };
};
