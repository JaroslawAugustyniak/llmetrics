<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LlmResult extends Model
{
    use HasFactory;

    protected $fillable = ['url_check_id', 'model_name', 'score', 'is_known', 'summary', 'raw_response'];

    protected $casts = [
        'score' => 'integer',
        'is_known' => 'boolean',
        'raw_response' => 'array',
    ];

    public function urlCheck(): BelongsTo
    {
        return $this->belongsTo(UrlCheck::class);
    }
}
