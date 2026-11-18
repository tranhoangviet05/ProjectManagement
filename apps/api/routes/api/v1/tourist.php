<?php

use App\Http\Controllers\Api\V1\Tourist\TouristProfileController;
use Illuminate\Support\Facades\Route;

// Tourist routes: /api/v1/tourist/...
Route::get('/ping', function () {
    return response()->json(['message' => 'Tourist module endpoints active']);
});

// ── Tourist Profile Endpoints ───────────────────────────────────
Route::get('/profile', [TouristProfileController::class, 'show']);
Route::put('/profile', [TouristProfileController::class, 'update']);
