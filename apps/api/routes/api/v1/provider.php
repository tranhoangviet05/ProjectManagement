<?php

use App\Http\Controllers\Api\V1\Provider\KycController;
use App\Http\Controllers\Api\V1\Provider\ProviderProfileController;
use App\Http\Controllers\Api\V1\Provider\ServiceController;
use Illuminate\Support\Facades\Route;

// Provider routes: /api/v1/provider/...
Route::get('/ping', function () {
    return response()->json(['message' => 'Provider module endpoints active']);
});

// ── Provider Profile & Wallet Endpoints ─────────────────────────
Route::get('/profile', [ProviderProfileController::class, 'show']);
Route::put('/profile', [ProviderProfileController::class, 'update']);
Route::post('/wallet/activate', [ProviderProfileController::class, 'activateWallet']);

// ── Provider KYC & Onboarding Endpoints ─────────────────────────
Route::prefix('kyc')->group(function () {
    Route::post('/submit', [KycController::class, 'submit']);
    Route::get('/status', [KycController::class, 'status']);
});

// ── Provider Service Management & Media Album Endpoints ─────────
Route::prefix('services')->group(function () {
    Route::get('/', [ServiceController::class, 'index']);
    Route::post('/', [ServiceController::class, 'store']);
    Route::get('/{id}', [ServiceController::class, 'show']);
    Route::put('/{id}', [ServiceController::class, 'update']);
    Route::delete('/{id}', [ServiceController::class, 'destroy']);

    Route::post('/{id}/media', [ServiceController::class, 'uploadMedia']);
    Route::patch('/{id}/media/{mediaId}/cover', [ServiceController::class, 'setCoverMedia']);
    Route::delete('/{id}/media/{mediaId}', [ServiceController::class, 'deleteMedia']);
});
