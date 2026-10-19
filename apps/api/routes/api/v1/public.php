<?php

use App\Http\Controllers\Api\V1\Auth\AuthController;
use Illuminate\Support\Facades\Route;

// Public & authentication routes: /api/v1/...
Route::get('/ping', function () {
    return response()->json([
        'success' => true,
        'message' => 'API v1 public endpoints active',
    ]);
});

// ── Authentication Endpoints ──────────────────────────────────────
Route::prefix('auth')->group(function () {
    // Đăng ký & Đăng nhập trực tiếp qua Backend
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Các route yêu cầu Bearer Token (Firebase ID Token hoặc Sanctum Token)
    Route::middleware('firebase.auth')->group(function () {
        Route::post('/sync', [AuthController::class, 'sync']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});
