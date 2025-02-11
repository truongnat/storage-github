import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
    try {
        const filePath = request.nextUrl.searchParams.get('path');
        
        if (!filePath) {
            return NextResponse.json(
                { error: 'File path is required' },
                { status: 400 }
            );
        }

        // Ensure the file path is within the allowed directory
        const normalizedPath = path.normalize(filePath);
        if (normalizedPath.includes('..')) {
            return NextResponse.json(
                { error: 'Invalid file path' },
                { status: 400 }
            );
        }

        // Read the file content
        const content = await fs.readFile(normalizedPath, 'utf-8');

        return NextResponse.json({ 
            success: true,
            content
        });
    } catch (error) {
        console.error('Error reading file:', error);
        return NextResponse.json(
            { error: 'Failed to read file' },
            { status: 500 }
        );
    }
}
