<?php

use App\Http\Controllers\Api\V1\Provider\KycController;
use App\Http\Controllers\Api\V1\Provider\ProviderProfileController;
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
