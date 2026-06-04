<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ApiKeyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApiKeyController extends Controller
{
    public function __construct(private ApiKeyService $service) {}

    public function show(Request $request): JsonResponse
    {
        try {
            $status = $this->service->getKeyStatus($request->user());

            return response()->json([
                'success' => true,
                'data' => $status,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch API key status: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'openai_key' => 'nullable|string|max:500',
                'gemini_key' => 'nullable|string|max:500',
            ]);

            $this->service->updateKeys($request->user(), $validated);

            return response()->json([
                'success' => true,
                'message' => 'API keys updated successfully',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update API keys: ' . $e->getMessage(),
            ], 500);
        }
    }
}