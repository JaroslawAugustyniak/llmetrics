<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserApiKey;

class ApiKeyService
{
    public function getKeyStatus(User $user): array
    {
        $openaiKey = $user->apiKeys()->where('provider', 'openai')->first();
        $geminiKey = $user->apiKeys()->where('provider', 'gemini')->first();

        return [
            'openai' => $openaiKey !== null,
            'gemini' => $geminiKey !== null,
        ];
    }

    public function updateKeys(User $user, array $data): void
    {
        if (isset($data['openai_key']) && $data['openai_key'] !== '') {
            UserApiKey::updateOrCreate(
                ['user_id' => $user->id, 'provider' => 'openai'],
                ['key_value' => $data['openai_key']]
            );
        }

        if (isset($data['gemini_key']) && $data['gemini_key'] !== '') {
            UserApiKey::updateOrCreate(
                ['user_id' => $user->id, 'provider' => 'gemini'],
                ['key_value' => $data['gemini_key']]
            );
        }
    }
}