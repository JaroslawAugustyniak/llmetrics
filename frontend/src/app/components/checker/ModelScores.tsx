'use client';

interface ModelScore {
  model_name: string;
  score: number;
  is_known: boolean;
}

interface ModelScoresProps {
  results: ModelScore[];
}

const modelLabels: Record<string, string> = {
  openai: 'OpenAI (GPT-4)',
  anthropic: 'Anthropic (Claude)',
  gemini: 'Google Gemini',
  perplexity: 'Perplexity',
};

const modelColors: Record<string, string> = {
  openai: 'bg-green-500',
  anthropic: 'bg-blue-500',
  gemini: 'bg-yellow-500',
  perplexity: 'bg-purple-500',
};

export default function ModelScores({ results }: ModelScoresProps) {
  if (!results || results.length === 0) {
    return <div className="text-center py-8 text-gray-500">No model scores available.</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Per-Model Scores</h3>
      {results.map((result) => (
        <div key={result.model_name} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">
                {modelLabels[result.model_name] || result.model_name}
              </span>
              {result.is_known && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Known
                </span>
              )}
            </div>
            <span className="font-bold text-gray-900">{result.score}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${modelColors[result.model_name] || 'bg-gray-500'}`}
              style={{ width: `${result.score}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
