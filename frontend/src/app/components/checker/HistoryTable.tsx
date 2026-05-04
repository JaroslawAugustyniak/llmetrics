'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ExternalLink } from 'lucide-react';

interface HistoryItem {
  id: number;
  url: string;
  overall_score: number | null;
  status: string;
  created_at: string;
}

interface HistoryTableProps {
  items: HistoryItem[];
  loading?: boolean;
}

const getScoreColor = (score: number | null) => {
  if (score === null) return 'text-gray-500';
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export default function HistoryTable({ items, loading }: HistoryTableProps) {
  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading history...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No checks performed yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">URL</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Score</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block max-w-md">
                  {item.url}
                </a>
              </td>
              <td className={`px-4 py-3 text-sm font-bold ${getScoreColor(item.overall_score)}`}>
                {item.overall_score !== null ? `${item.overall_score}/100` : '—'}
              </td>
              <td className="px-4 py-3 text-sm">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  item.status === 'completed' ? 'bg-green-100 text-green-700' :
                  item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {format(new Date(item.created_at), 'MMM d, yyyy HH:mm')}
              </td>
              <td className="px-4 py-3 text-center">
                <Link href={`/dashboard/checker/${item.id}`} className="text-blue-600 hover:text-blue-700">
                  <ExternalLink className="w-4 h-4 inline" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
