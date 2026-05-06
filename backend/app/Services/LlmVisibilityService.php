<?php

namespace App\Services;

use App\Models\UrlCheck;
use App\Models\User;
use OpenAI;
use OpenAI\Client;

class LlmVisibilityService
{
    private Client $openAiClient;
    private string $geminiApiKey;
    private const MODELS = ['openai', 'gemini'];

    public function __construct()
    {
        $openaiKey = config('app.openai_api_key') ?: env('OPENAI_API_KEY');
        if (!$openaiKey) {
            throw new \Exception('OPENAI_API_KEY is not set');
        }
        $this->openAiClient = OpenAI::client($openaiKey);

        $geminiKey = env('GEMINI_API_KEY');
        if (!$geminiKey) {
            throw new \Exception('GEMINI_API_KEY is not set');
        }
        $this->geminiApiKey = $geminiKey;
    }

    public function check(string $url, User $user): UrlCheck
    {
        $urlCheck = UrlCheck::create([
            'user_id' => $user->id,
            'url' => $url,
            'status' => 'pending',
        ]);

        \App\Jobs\ProcessUrlCheck::dispatch($urlCheck);

        return $urlCheck;
    }

    public function processCheck(UrlCheck $urlCheck): void
    {
        try {
            $results = [];
            $errors = [];

            foreach (self::MODELS as $model) {
                try {
                    $results[$model] = $this->queryModel($model, $urlCheck->url);
                } catch (\Exception $e) {
                    $errors[$model] = $e->getMessage();
                    \Log::warning("Model {$model} failed for URL {$urlCheck->url}: " . $e->getMessage());
                }
            }

            if (empty($results)) {
                $urlCheck->update(['status' => 'failed']);
                throw new \Exception("All models failed: " . json_encode($errors));
            }

            $this->storeResults($urlCheck, $results, $errors);
            $this->storeRecommendations($urlCheck, $results);
            $overallScore = $this->calculateScore($results);

            $urlCheck->update(['overall_score' => $overallScore, 'status' => 'completed']);
        } catch (\Exception $e) {
            $urlCheck->update(['status' => 'failed']);
            throw $e;
        }
    }

    private function queryModel(string $model, string $url): array
    {
        return match($model) {
            'openai' => $this->queryOpenAi($url),
            'gemini' => $this->queryGemini($url),
            default => throw new \Exception("Model {$model} not yet implemented"),
        };
    }

    private function queryOpenAi(string $url): array
    {
        try {
            $response = $this->openAiClient->chat()->create([
                'model' => 'gpt-4o-mini',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an expert SEO and web visibility consultant. Analyze websites and provide detailed, actionable recommendations. Respond ONLY with valid JSON, no other text. Return a JSON object with these exact fields:
{
  "familiarity_score": <number 0-10, your familiarity with this website>,
  "is_known": <boolean, true if you recognize this website>,
  "summary": <string, 2-3 sentences about what you know about this website>,
  "recommendations": [
    {
      "title": <string, short improvement suggestion>,
      "description": <string, detailed explanation of why this matters>,
      "affected_area": <string, one of: "SEO", "Content", "Technical", "Brand", "User Experience">,
      "solution": <string, specific steps to implement this improvement>,
      "expected_impact": <string, brief description of expected benefits>,
      "priority": <string, one of: "critical", "high", "medium", "low">
    }
  ]
}',
                    ],
                    [
                        'role' => 'user',
                        'content' => "Analyze this website and provide detailed JSON assessment with structured visibility improvement recommendations: {$url}

Evaluate:
1. SEO visibility (meta tags, structured data, schema markup, keywords)
2. Content clarity and quality (is the purpose/value clear?)
3. Brand presence and authority (recognition, citations, credibility signals)
4. Technical optimization (page speed, mobile-friendliness, accessibility)
5. User experience (navigation, design, conversion paths)

For each recommendation, assess its priority:
- critical: breaks core functionality or severely impacts visibility
- high: significantly impacts SEO or user experience
- medium: moderate improvement opportunity
- low: nice-to-have optimization",
                    ],
                ],
                'temperature' => 0.7,
                'max_tokens' => 1200,
                'response_format' => ['type' => 'json_object'],
            ]);

            $content = $response->choices[0]->message->content;
            $data = json_decode($content, true);

            if (!$data || !isset($data['familiarity_score'], $data['is_known'], $data['summary'])) {
                throw new \Exception("Invalid JSON response from OpenAI");
            }

            $score = (int) round(($data['familiarity_score'] / 10) * 100);

            return [
                'score' => max(0, min(100, $score)),
                'is_known' => (bool) $data['is_known'],
                'summary' => $data['summary'],
                'recommendations' => $data['recommendations'] ?? [],
                'raw_response' => ['model' => 'openai', 'usage' => $response->usage->toArray()],
            ];
        } catch (\Exception $e) {
            throw new \Exception("OpenAI API error: " . $e->getMessage());
        }
    }

    private function queryGemini(string $url): array
    {
        try {
            $systemPrompt = 'You are an expert SEO and web visibility consultant. Analyze websites and provide detailed, actionable recommendations. Respond ONLY with valid JSON, no other text. Return a JSON object with these exact fields:
{
  "familiarity_score": <number 0-10, your familiarity with this website>,
  "is_known": <boolean, true if you recognize this website>,
  "summary": <string, 2-3 sentences about what you know about this website>,
  "recommendations": [
    {
      "title": <string, short improvement suggestion>,
      "description": <string, detailed explanation of why this matters>,
      "affected_area": <string, one of: "SEO", "Content", "Technical", "Brand", "User Experience">,
      "solution": <string, specific steps to implement this improvement>,
      "expected_impact": <string, brief description of expected benefits>,
      "priority": <string, one of: "critical", "high", "medium", "low">
    }
  ]
}';

            $userPrompt = "Analyze this website and provide detailed JSON assessment with structured visibility improvement recommendations: {$url}

Evaluate:
1. SEO visibility (meta tags, structured data, schema markup, keywords)
2. Content clarity and quality (is the purpose/value clear?)
3. Brand presence and authority (recognition, citations, credibility signals)
4. Technical optimization (page speed, mobile-friendliness, accessibility)
5. User experience (navigation, design, conversion paths)

For each recommendation, assess its priority:
- critical: breaks core functionality or severely impacts visibility
- high: significantly impacts SEO or user experience
- medium: moderate improvement opportunity
- low: nice-to-have optimization";

            $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $this->geminiApiKey;

            $payload = [
                'systemInstruction' => ['parts' => [['text' => $systemPrompt]]],
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $userPrompt],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'maxOutputTokens' => 1200,
                ],
            ];

            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => $apiUrl,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 30,
                CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_SSL_VERIFYPEER => true,
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                throw new \Exception("Gemini API curl error: " . $curlError);
            }

            if ($httpCode !== 200) {
                throw new \Exception("Gemini API error (HTTP {$httpCode}): " . substr($response, 0, 200));
            }

            $responseData = json_decode($response, true);

            if (!isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
                throw new \Exception("Invalid response structure from Gemini: " . substr($response, 0, 300));
            }

            $content = $responseData['candidates'][0]['content']['parts'][0]['text'];
            $data = json_decode($content, true);

            if (!$data || !isset($data['familiarity_score'], $data['is_known'], $data['summary'])) {
                throw new \Exception("Invalid JSON response from Gemini: " . substr($content, 0, 300));
            }

            $score = (int) round(($data['familiarity_score'] / 10) * 100);

            return [
                'score' => max(0, min(100, $score)),
                'is_known' => (bool) $data['is_known'],
                'summary' => $data['summary'],
                'recommendations' => $data['recommendations'] ?? [],
                'raw_response' => ['model' => 'gemini', 'usage' => []],
            ];
        } catch (\Exception $e) {
            throw new \Exception("Gemini API error: " . $e->getMessage());
        }
    }

    private function storeResults(UrlCheck $urlCheck, array $results, array $errors = []): void
    {
        foreach ($results as $modelName => $result) {
            $urlCheck->llmResults()->create([
                'model_name' => $modelName,
                'score' => $result['score'],
                'is_known' => $result['is_known'],
                'summary' => $result['summary'],
                'raw_response' => $result['raw_response'],
            ]);
        }

        foreach ($errors as $modelName => $errorMessage) {
            $urlCheck->llmResults()->create([
                'model_name' => $modelName,
                'score' => null,
                'is_known' => false,
                'summary' => "Error: {$errorMessage}",
                'raw_response' => ['error' => $errorMessage],
            ]);
        }
    }

    private function calculateScore(array $results): int
    {
        $scores = array_filter(array_map(fn($r) => $r['score'], $results), fn($s) => $s !== null);
        return $scores ? (int) round(array_sum($scores) / count($scores)) : 0;
    }

    private function storeRecommendations(UrlCheck $urlCheck, array $results): void
    {
        foreach ($results as $modelName => $result) {
            if (!isset($result['recommendations'])) {
                continue;
            }

            $recommendations = $result['recommendations'];

            foreach ($recommendations as $rec) {
                $priority = $rec['priority'] ?? 'medium';
                $severity = match($priority) {
                    'critical' => 'red',
                    'high' => 'red',
                    'medium' => 'yellow',
                    'low' => 'green',
                    default => 'yellow',
                };

                $urlCheck->recommendations()->create([
                    'severity' => $severity,
                    'priority' => $priority,
                    'category' => $rec['title'] ?? 'improvement',
                    'affected_area' => $rec['affected_area'] ?? 'General',
                    'message' => $rec['description'] ?? '',
                    'solution' => $rec['solution'] ?? '',
                    'expected_impact' => $rec['expected_impact'] ?? '',
                ]);
            }
        }
    }

}
