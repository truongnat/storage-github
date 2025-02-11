'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Octokit } from '@octokit/rest';

interface Repository {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  private: boolean;
  stargazers_count: number;
  language: string | null;
  updated_at: string | null;
}

export default function GitHubRepos() {
  const { data: session } = useSession();
  const router = useRouter();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRepos() {
      if (session?.accessToken) {
        try {
          const octokit = new Octokit({
            auth: session.accessToken,
          });

          const { data } = await octokit.request('GET /user/repos', {
            sort: 'updated',
            per_page: 100,
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
          });

          // Filter for private repositories with data- prefix
          const filteredRepos = data.filter((repo: Repository) => 
            repo.private && repo.name.startsWith('data-')
          );
          setRepos(filteredRepos);
        } catch (error) {
          console.error('Error fetching repos:', error);
        }
      }
      setLoading(false);
    }

    fetchRepos();
  }, [session?.accessToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto p-6">
      {repos.map((repo) => {
        const updatedDate = new Date(repo?.updated_at ?? '').toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        return (
          <div
            key={repo.id}
            onClick={() => router.push(`/repositories/${repo.name}`)}
            className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 flex flex-col h-full cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {repo.name}
                </h3>
                {repo.language && (
                  <span className="inline-block mt-1 text-sm text-gray-500">
                    {repo.language}
                  </span>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                repo.private ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
              }`}>
                {repo.private ? 'Private' : 'Public'}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm flex-grow">
              {repo.description || 'No description provided'}
            </p>

            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <span>{updatedDate}</span>
              <div className="flex items-center">
                <span className="mr-2">⭐</span>
                {repo.stargazers_count}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
