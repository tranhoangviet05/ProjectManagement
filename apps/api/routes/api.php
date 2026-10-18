<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'Social Travel Booking API',
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// API Version 1
Route::prefix('v1')->group(function () {
    // Public & Auth routes
    Route::group([], base_path('routes/api/v1/public.php'));

    // Tourist routes: /api/v1/tourist
    Route::prefix('tourist')->group(base_path('routes/api/v1/tourist.php'));

    // Provider routes: /api/v1/provider
    Route::prefix('provider')->group(base_path('routes/api/v1/provider.php'));

    // Admin routes: /api/v1/admin
    Route::prefix('admin')->group(base_path('routes/api/v1/admin.php'));
});
