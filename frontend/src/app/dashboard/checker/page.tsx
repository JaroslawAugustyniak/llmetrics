'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader } from 'lucide-react';
import { useSessionContext } from '@/app/components/providers/SessionProvider';
import { checkUrl, getChecks } from '@/lib/actions/checker';
import HistoryTable from '@/app/components/checker/HistoryTable';

interface UrlCheck {
  id: number;
  url: string;
}

export default function CheckerPage() {
  const router = useRouter();
  const session = useSessionContext();

  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<UrlCheck[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (session?.isLoading) {
      return;
    }

    setIsInitializing(false);

    if (!session?.token) {
      router.push('/login');
      return;
    }

    loadHistory();
  }, [session?.token, session?.isLoading, router]);

  const loadHistory = async () => {
    if (!session?.token) return;

    setHistoryLoading(true);
    const res = await getChecks(session.token, 1);
    if (res.success) {
      setHistory(res.data || []);
    }
    setHistoryLoading(false);
  };

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!urlInput.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!session?.token) {
      setError('You are not authenticated');
      return;
    }

    setIsLoading(true);

    const res = await checkUrl(urlInput, session.token);
    if (res.success) {
      router.push(`/dashboard/checker/${res.data.id}`);
    } else {
      setError(res.error || 'Failed to check URL');
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <div className="card">
        <form onSubmit={handleCheck} className="space-y-4">
          <div>
            <label className="label">Website URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com"
                className="input flex-1"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary px-6 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Check
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </form>
      </div>


      {/* History */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Check History</h2>
        <HistoryTable items={history} loading={historyLoading} />
      </div>
    </div>
  );
}
