import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface FileInfo {
    name: string;
    path: string;
    type: 'file' | 'directory';
    size?: number;
}

async function getFilesRecursively(dir: string, baseDir: string): Promise<FileInfo[]> {
    const items = await fs.readdir(dir, { withFileTypes: true });
    const files: FileInfo[] = [];

    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        const relativePath = path.relative(baseDir, fullPath);

        if (item.isDirectory()) {
            files.push({
                name: item.name,
                path: relativePath,
                type: 'directory'
            });
            files.push(...await getFilesRecursively(fullPath, baseDir));
        } else {
            const stats = await fs.stat(fullPath);
            files.push({
                name: item.name,
                path: relativePath,
                type: 'file',
                size: stats.size
            });
        }
    }

    return files;
}

export async function GET(request: NextRequest) {
    try {
        const dirPath = request.nextUrl.searchParams.get('path') || '.';
        
        // Ensure the directory path is within the allowed directory
        const normalizedPath = path.normalize(dirPath);
        if (normalizedPath.includes('..')) {
            return NextResponse.json(
                { error: 'Invalid directory path' },
                { status: 400 }
            );
        }

        const files = await getFilesRecursively(normalizedPath, normalizedPath);

        return NextResponse.json({ 
            success: true,
            files
        });
    } catch (error) {
        console.error('Error listing files:', error);
        return NextResponse.json(
            { error: 'Failed to list files' },
            { status: 500 }
        );
    }
}
