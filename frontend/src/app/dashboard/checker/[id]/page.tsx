'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSessionContext } from '@/app/components/providers/SessionProvider';
import { getCheck } from '@/lib/actions/checker';
import { ArrowLeft, Loader, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import ScoreGauge from '@/app/components/checker/ScoreGauge';
import ModelScores from '@/app/components/checker/ModelScores';
import Recommendations from '@/app/components/checker/Recommendations';

interface LlmResult {
  id: number;
  url_check_id: number;
  model_name: string;
  score: number | null;
  is_known: boolean;
  summary: string;
  raw_response: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface Recommendation {
  id: number;
  url_check_id: number;
  severity: 'green' | 'yellow' | 'red';
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  affected_area: string;
  message: string;
  solution: string;
  expected_impact: string;
  created_at: string;
  updated_at: string;
}

interface UrlCheck {
  id: number;
  user_id: number;
  url: string;
  overall_score: number | null;
  status: string;
  llm_results: LlmResult[];
  recommendations: Recommendation[];
  created_at: string;
  updated_at: string;
}

export default function CheckerDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations('dashboard');
  const session = useSessionContext();

  const [check, setCheck] = useState<UrlCheck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);

  const id = params.id as string;

  useEffect(() => {
    if (session?.isLoading) {
      return;
    }

    setIsInitializing(false);

    if (!session?.token) {
      router.push('/login');
      return;
    }

    loadCheck();
  }, [session?.token, session?.isLoading, router]);

  useEffect(() => {
    if (!check || check.status !== 'pending' || !session?.token) {
      return;
    }

    const interval = setInterval(() => {
      loadCheck();
    }, 2000);

    return () => clearInterval(interval);
  }, [check?.status, session?.token, id]);

  const loadCheck = async () => {
    if (!session?.token || !id) return;

    if (!check) {
      setIsLoading(true);
    }
    setError('');

    const res = await getCheck(parseInt(id), session.token);
    if (res.success) {
      setCheck(res.data as UrlCheck);
    } else {
      setError(res.error || 'Failed to load check');
    }

    if (!check) {
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

  if (isLoading && !check) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (check?.status === 'pending') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="page-title">Analyzing...</h1>
              <p className="page-subtitle">Processing your URL</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Website Information</h2>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 text-sm mb-1">URL</p>
              <a
                href={check.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 hover:underline break-all flex items-center gap-2 font-medium"
              >
                {check.url}
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-gray-600 text-sm mb-2">Status</p>
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin text-yellow-600" />
                <span className="px-3 py-2 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-700">
                  Processing
                </span>
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-2">Overall Score</p>
              <p className="text-3xl font-bold text-gray-400">—</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-2">Checked</p>
              <p className="text-gray-900 font-medium">
                {format(new Date(check.created_at), 'MMM d')}
              </p>
              <p className="text-gray-600 text-xs">
                {format(new Date(check.created_at), 'HH:mm')}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">Analyzing your website</p>
              <p className="text-gray-500 text-sm">
                Sending requests to LLM models in the background...
              </p>
              <p className="text-gray-400 text-xs mt-2">
                This page will refresh automatically
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !check) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Check not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="page-title">Check Details</h1>
            <p className="page-subtitle">
              {format(new Date(check.created_at), 'MMM d, yyyy HH:mm')}
            </p>
          </div>
        </div>
      </div>

      {/* URL Info Card */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Website Information</h2>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <p className="text-gray-600 text-sm mb-1">URL</p>
            <a
              href={check.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline break-all flex items-center gap-2 font-medium"
            >
              {check.url}
              <ExternalLink className="w-4 h-4 shrink-0" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div>
            <p className="text-gray-600 text-sm mb-2">Status</p>
            <span className={`px-3 py-2 rounded-lg text-sm font-medium inline-block ${
              check.status === 'completed' ? 'bg-green-100 text-green-700' :
              check.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
            </span>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-2">Overall Score</p>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-bold text-gray-900">
                {check.overall_score !== null ? check.overall_score : '—'}
              </p>
              {check.overall_score !== null && <span className="text-gray-600">/100</span>}
            </div>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-2">Checked</p>
            <p className="text-gray-900 font-medium">
              {format(new Date(check.created_at), 'MMM d')}
            </p>
            <p className="text-gray-600 text-xs">
              {format(new Date(check.created_at), 'HH:mm')}
            </p>
          </div>
        </div>
      </div>

      {/* Score Gauge */}
      {check.overall_score !== null && (
        <div className="card">
          <ScoreGauge score={check.overall_score} size="lg" />
        </div>
      )}

      {/* Model Scores */}
      {check.llm_results && check.llm_results.some(r => r.score !== null) && (
        <div className="card">
          <ModelScores results={check.llm_results.filter(r => r.score !== null)} />
        </div>
      )}

      {/* Recommendations */}
      <div className="card">
        <Recommendations items={check.recommendations || []} />
      </div>

      {/* Model Errors */}
      {check.llm_results && check.llm_results.some(r => r.score === null) && (
        <div className="card border-yellow-200 bg-yellow-50">
          <h3 className="text-sm font-semibold text-yellow-800 mb-3">⚠️ Some models encountered errors</h3>
          <div className="space-y-2">
            {check.llm_results
              .filter(r => r.score === null)
              .map(result => (
                <div key={result.id} className="text-sm">
                  <p className="font-medium text-yellow-900">{result.model_name}</p>
                  <p className="text-yellow-700 text-xs mt-1">{result.summary.replace('Error: ', '')}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* LLM Responses */}

      {check.llm_results && check.llm_results.filter(r => r.score !== null).length > 0 && (
        <div className="space-y-4">
          {check.llm_results.filter(r => r.score !== null).map((result) => (
            <div key={result.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {result.model_name === 'openai' && '🤖 OpenAI (GPT-4)'}
                    {result.model_name === 'anthropic' && '🧠 Anthropic (Claude)'}
                    {result.model_name === 'gemini' && '✨ Google Gemini'}
                    {result.model_name === 'perplexity' && '🔍 Perplexity'}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Familiarity Score: <span className="font-bold text-gray-900">{result.score}/100</span>
                    {result.is_known && (
                      <span className="ml-3 inline-block bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-medium">
                        ✓ Known
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-700 leading-relaxed">{result.summary}</p>
              </div>

              {result.raw_response && result.raw_response.usage && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                  <p>Tokens: {result.raw_response.usage.prompt_tokens} prompt + {result.raw_response.usage.completion_tokens} completion</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
