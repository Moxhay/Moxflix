import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from './session';

export interface AuthenticatedRequest extends NextRequest {
    userId: number;
}

type AuthenticatedHandler = (request: AuthenticatedRequest) => Promise<NextResponse>;

export async function withAuth(
    request: NextRequest,
    handler: AuthenticatedHandler
): Promise<NextResponse> {
    const userId = await getCurrentUserId();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.userId = userId;

    return handler(authenticatedRequest);
}
