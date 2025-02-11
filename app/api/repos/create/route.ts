import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Octokit } from '@octokit/rest';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { message: 'Repository name is required' },
        { status: 400 }
      );
    }

    const octokit = new Octokit({
      auth: session.accessToken,
    });

    const response = await octokit.repos.createForAuthenticatedUser({
      name,
      description,
      private: true,
      auto_init: true,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error creating repository:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create repository' },
      { status: 500 }
    );
  }
}
