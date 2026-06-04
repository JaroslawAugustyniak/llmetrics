<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserApiKey extends Model
{
    protected $table = 'user_api_keys';

    protected $fillable = [
        'user_id',
        'provider',
        'key_value',
    ];

    protected $hidden = [
        'key_value',
    ];

    protected function casts(): array
    {
        return [
            'key_value' => 'encrypted',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}