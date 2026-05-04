<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UrlCheck;
use App\Services\LlmVisibilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UrlCheckController extends Controller
{
    public function __construct(private LlmVisibilityService $service) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $page = $request->query('page', 1);
            $perPage = 10;

            $checks = $request->user()
                ->urlChecks()
                ->with(['llmResults', 'recommendations'])
                ->latest()
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $checks->items(),
                'pagination' => [
                    'total' => $checks->total(),
                    'per_page' => $checks->perPage(),
                    'current_page' => $checks->currentPage(),
                    'last_page' => $checks->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch checks: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'url' => 'required|url|max:2048',
            ]);

            $check = $this->service->check($validated['url'], $request->user());

            return response()->json([
                'success' => true,
                'message' => 'URL check completed successfully',
                'data' => $check,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check URL: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show(Request $request, string $id): JsonResponse
    {
        try {
            $check = UrlCheck::where('user_id', $request->user()->id)
                ->with([
                    'llmResults',
                    'recommendations' => fn($query) => $query->orderByRaw("FIELD(priority, 'critical', 'high', 'medium', 'low')")
                ])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $check,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Check not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch check: ' . $e->getMessage(),
            ], 500);
        }
    }
}
