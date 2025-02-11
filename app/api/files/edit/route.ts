import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function PUT(request: NextRequest) {
    try {
        const { filePath, content } = await request.json();
        
        if (!filePath || content === undefined) {
            return NextResponse.json(
                { error: 'File path and content are required' },
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

        // Write the content to the file
        await fs.writeFile(normalizedPath, JSON.stringify(content, null, 2), 'utf-8');

        return NextResponse.json({ 
            success: true,
            message: 'File updated successfully'
        });
    } catch (error) {
        console.error('Error updating file:', error);
        return NextResponse.json(
            { error: 'Failed to update file' },
            { status: 500 }
        );
    }
}
