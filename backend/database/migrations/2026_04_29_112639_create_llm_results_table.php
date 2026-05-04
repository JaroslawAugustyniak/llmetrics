<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('llm_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('url_check_id')->constrained('url_checks')->onDelete('cascade');
            $table->enum('model_name', ['openai', 'anthropic', 'gemini', 'perplexity']);
            $table->tinyInteger('score')->default(0);
            $table->boolean('is_known')->default(false);
            $table->text('summary')->nullable();
            $table->json('raw_response')->nullable();
            $table->timestamps();
            $table->index(['url_check_id', 'model_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('llm_results');
    }
};
