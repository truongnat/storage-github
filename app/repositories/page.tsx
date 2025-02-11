import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import GitHubRepos from '@/components/GitHubRepos';

export default async function RepositoriesPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-6">
      <GitHubRepos />
    </div>
  );
}
