<?php

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Media\MediaController;
use App\Http\Controllers\Api\V1\Public\CatalogController;
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
        Route::post('/change-password', [AuthController::class, 'changePassword']);
        Route::post('/avatar', [AuthController::class, 'uploadAvatar']);
    });
});

// ── Media Storage Endpoints ───────────────────────────────────────
Route::prefix('media')->middleware('firebase.auth')->group(function () {
    Route::post('/upload', [MediaController::class, 'upload']);
    Route::post('/upload-private', [MediaController::class, 'uploadPrivate']);
    Route::get('/private/{path}', [MediaController::class, 'showPrivate'])->where('path', '.*');
});

// ── Public Catalog Endpoints ──────────────────────────────────────
Route::prefix('public')->group(function () {
    Route::get('/categories', [CatalogController::class, 'categories']);
    Route::get('/locations', [CatalogController::class, 'locations']);
    Route::get('/business-types', [CatalogController::class, 'businessTypes']);
});
