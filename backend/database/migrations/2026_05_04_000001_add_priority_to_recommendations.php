<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recommendations', function (Blueprint $table) {
            $table->enum('priority', ['critical', 'high', 'medium', 'low'])->default('medium')->after('severity');
            $table->string('affected_area')->nullable()->after('category');
            $table->text('solution')->nullable()->after('message');
            $table->string('expected_impact')->nullable()->after('solution');
        });
    }

    public function down(): void
    {
        Schema::table('recommendations', function (Blueprint $table) {
            $table->dropColumn(['priority', 'affected_area', 'solution', 'expected_impact']);
        });
    }
};
