<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Recommendation extends Model
{
    use HasFactory;

    protected $fillable = ['url_check_id', 'severity', 'priority', 'category', 'affected_area', 'message', 'solution', 'expected_impact'];

    public function urlCheck(): BelongsTo
    {
        return $this->belongsTo(UrlCheck::class);
    }
}
