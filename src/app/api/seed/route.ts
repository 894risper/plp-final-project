// app/api/seed/route.ts
import { NextRequest, NextResponse } from "next/server";
import { seedAdmin } from "../../../../lib/seed-admin";

export async function GET(request: NextRequest) {
    try {
        // Security check for production
        if (process.env.NODE_ENV === 'production') {
            const secretKey = request.headers.get('x-secret-key');
            if (secretKey !== process.env.SEED_SECRET_KEY) {
                return NextResponse.json(
                    { error: 'Unauthorized' }, 
                    { status: 401 }
                );
            }
        }

        const result = await seedAdmin();
        
        if (result.success) {
            return NextResponse.json({ 
                message: result.message 
            });
        } else {
            return NextResponse.json(
                { error: result.message }, 
                { status: 500 }
            );
        }
        
    } catch (error) {
        console.error('Seeding error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json(
            { error: 'Seeding failed: ' + errorMessage }, 
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    return GET(request);
}