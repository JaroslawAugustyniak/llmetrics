'use client';

import { useState } from 'react';
import { AlertCircle, ChevronDown, AlertTriangle, Info, Lightbulb, TrendingUp } from 'lucide-react';

interface Recommendation {
  id: number;
  severity: 'green' | 'yellow' | 'red';
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  affected_area: string;
  message: string;
  solution: string;
  expected_impact: string;
}

interface RecommendationsProps {
  items: Recommendation[];
}

const priorityConfig = {
  critical: {
    badge: 'bg-red-100 text-red-800 border-red-300',
    icon: AlertCircle,
    label: 'Critical',
    color: 'text-red-600',
  },
  high: {
    badge: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: AlertTriangle,
    label: 'High',
    color: 'text-orange-600',
  },
  medium: {
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: Info,
    label: 'Medium',
    color: 'text-yellow-600',
  },
  low: {
    badge: 'bg-green-100 text-green-800 border-green-300',
    icon: Lightbulb,
    label: 'Low',
    color: 'text-green-600',
  },
};

const areaIcons: Record<string, React.ComponentType<any>> = {
  'SEO': () => <span className="text-lg">🔍</span>,
  'Content': () => <span className="text-lg">📝</span>,
  'Technical': () => <span className="text-lg">⚙️</span>,
  'Brand': () => <span className="text-lg">🎯</span>,
  'User Experience': () => <span className="text-lg">👥</span>,
};

export default function Recommendations({ items }: RecommendationsProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <p className="text-gray-600 font-medium">No recommendations at this time.</p>
        <p className="text-gray-500 text-sm mt-1">Your website is looking good!</p>
      </div>
    );
  }

  const sortedItems = [...items].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Recommendations ({items.length})
        </h3>
        <div className="flex gap-2 text-xs">
          {['critical', 'high', 'medium', 'low'].map((p) => {
            const count = items.filter((r) => r.priority === p).length;
            if (count === 0) return null;
            const config = priorityConfig[p as keyof typeof priorityConfig];
            return (
              <span key={p} className={`px-2 py-1 rounded border ${config.badge}`}>
                {config.label}: {count}
              </span>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        {sortedItems.map((rec) => {
          const config = priorityConfig[rec.priority];
          const Icon = config.icon;
          const AreaIcon = areaIcons[rec.affected_area] || areaIcons['Brand'];
          const isExpanded = expandedId === rec.id;

          return (
            <div
              key={rec.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition"
            >
              {/* Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                className="w-full px-4 py-4 flex items-start gap-3 hover:bg-gray-50 transition text-left"
              >
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.color}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-semibold text-gray-900 break-word">
                      {rec.category}
                    </h4>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${config.badge} shrink-0`}>
                      {config.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AreaIcon />
                    <span>{rec.affected_area}</span>
                  </div>
                </div>

                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 space-y-4">
                  {/* Description */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">Why This Matters</h5>
                    <p className="text-sm text-gray-700 leading-relaxed">{rec.message}</p>
                  </div>

                  {/* Solution */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-blue-600" />
                      <h5 className="text-sm font-semibold text-gray-900">How to Fix</h5>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed bg-white rounded p-3 border border-gray-200">
                      {rec.solution}
                    </p>
                  </div>

                  {/* Expected Impact */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <h5 className="text-sm font-semibold text-gray-900">Expected Impact</h5>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed bg-white rounded p-3 border border-gray-200">
                      {rec.expected_impact}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CheckCircle({ className }: { className: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}
