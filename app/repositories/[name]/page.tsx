'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { Octokit } from '@octokit/rest';

interface RepoDetails {
  name: string;
  description: string | null;
  private: boolean;
  language: string | null;
  updated_at: string;
  default_branch: string;
  stargazers_count: number;
  html_url: string;
}

interface TreeItem {
  path: string;
  type: 'tree' | 'blob';
  sha: string;
}

export default function RepositoryDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const [repo, setRepo] = useState<RepoDetails | null>(null);
  const [tree, setTree] = useState<TreeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepoDetails() {
      if (session?.accessToken && params.name) {
        try {
          const octokit = new Octokit({
            auth: session.accessToken,
          });

          // Get repository details
          const repoData = await octokit.request('GET /repos/{owner}/{repo}', {
            owner: session.user?.login ?? '',
            repo: params.name as string,
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
          });

          setRepo(repoData.data);

          // Get repository tree
          const treeData = await octokit.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}', {
            owner: session.user?.login ?? '',
            repo: params.name as string,
            tree_sha: repoData.data.default_branch,
            recursive: '1',
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
          });

          // Transform the API response to match TreeItem interface
          const transformedTree: TreeItem[] = treeData.data.tree
            .filter((item): item is { path: string; type: string; sha: string } => 
              Boolean(item.path && item.type && item.sha))
            .map(item => ({
              path: item.path,
              type: item.type as 'tree' | 'blob',
              sha: item.sha
            }));

          setTree(transformedTree);
        } catch (err) {
          setError('Failed to fetch repository details');
          console.error('Error fetching repo details:', err);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchRepoDetails();
  }, [session?.accessToken, params.name, session?.user?.email]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !repo) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">{error || 'Repository not found'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{repo.name}</h1>
            <p className="text-gray-600 mt-2">{repo.description || 'No description provided'}</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full ${
            repo.private ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
          }`}>
            {repo.private ? 'Private' : 'Public'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">Language</div>
            <div className="font-medium">{repo.language || 'Not specified'}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">Last Updated</div>
            <div className="font-medium">
              {new Date(repo.updated_at).toLocaleDateString()}
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">Default Branch</div>
            <div className="font-medium">{repo.default_branch}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">Stars</div>
            <div className="font-medium">{repo.stargazers_count}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Files</h2>
        <div className="space-y-2">
          {tree.map((item) => (
            <div
              key={item.sha}
              className="flex items-center p-2 hover:bg-gray-50 rounded-lg"
            >
              <span className="mr-2">
                {item.type === 'tree' ? '📁' : '📄'}
              </span>
              <span className="text-gray-900">{item.path}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
