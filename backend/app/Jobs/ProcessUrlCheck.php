<?php

namespace App\Jobs;

use App\Models\UrlCheck;
use App\Services\LlmVisibilityService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessUrlCheck implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(private UrlCheck $urlCheck) {}

    public function handle(LlmVisibilityService $service): void
    {
        try {
            $service->processCheck($this->urlCheck);
        } catch (\Exception $e) {
            $this->urlCheck->update(['status' => 'failed']);
            \Log::error("ProcessUrlCheck failed for URL {$this->urlCheck->url}: " . $e->getMessage());
            throw $e;
        }
    }
}
