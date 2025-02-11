'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Octokit } from '@octokit/rest';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function CreateRepoPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    // Validate data- prefix
    if (!name.startsWith('data-')) {
      setError('Repository name must start with "data-"');
      setLoading(false);
      return;
    }

    if (!session?.accessToken) {
      setError('You must be logged in to create a repository');
      setLoading(false);
      return;
    }

    try {
      const octokit = new Octokit({
        auth: session.accessToken,
      });

      await octokit.request('POST /user/repos', {
        name,
        description,
        private: true,
        auto_init: true,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      router.push('/repositories');
    } catch (err: any) {
      setError(err.message || 'Failed to create repository');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Repository</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Repository Name</Label>
          <div className="space-y-1">
            <Input
              id="name"
              name="name"
              required
              placeholder="data-example"
              pattern="data-.*"
              title="Repository name must start with data-"
            />
            <p className="text-sm text-gray-500">
              Repository name must start with "data-" (e.g., data-json, data-demo-01)
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Description of your repository..."
            className="w-full h-32"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Private Repository'}
        </Button>
      </form>
    </div>
  );
}
