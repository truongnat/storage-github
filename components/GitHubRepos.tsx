'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Repository {
  id: number;
  name: string;
  description: string;
  html_url: string;
  private: boolean;
  stargazers_count: number;
  language: string;
  updated_at: string;
}

export default function GitHubRepos() {
  const { data: session } = useSession();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRepos() {
      if (session?.accessToken) {
        try {
          const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          });
          const data = await response.json();
          setRepos(data);
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
        const updatedDate = new Date(repo.updated_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        return (
          <a
            key={repo.id}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 flex flex-col h-full"
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
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .25a.75.75 0 0 1 .673.418l3.058 6.197 6.839.994a.75.75 0 0 1 .415 1.279l-4.948 4.823 1.168 6.811a.75.75 0 0 1-1.088.791L12 18.347l-6.117 3.216a.75.75 0 0 1-1.088-.79l1.168-6.812-4.948-4.823a.75.75 0 0 1 .416-1.28l6.838-.993L11.328.668A.75.75 0 0 1 12 .25z"/>
                </svg>
                {repo.stargazers_count}
              </div>
              <span>{updatedDate}</span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
