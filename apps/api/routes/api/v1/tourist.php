<?php

use App\Http\Controllers\Api\V1\Tourist\TouristBookingController;
use App\Http\Controllers\Api\V1\Tourist\TouristProfileController;
use Illuminate\Support\Facades\Route;

// Tourist routes: /api/v1/tourist/...
Route::get('/ping', function () {
    return response()->json(['message' => 'Tourist module endpoints active']);
});

// ── Tourist Profile Endpoints ───────────────────────────────────
Route::get('/profile', [TouristProfileController::class, 'show']);
Route::put('/profile', [TouristProfileController::class, 'update']);

// ── Tourist Booking Engine Endpoints ────────────────────────────
Route::prefix('bookings')->group(function () {
    Route::get('/', [TouristBookingController::class, 'index']);
    Route::post('/preview', [TouristBookingController::class, 'preview']);
    Route::post('/', [TouristBookingController::class, 'store']);
    Route::get('/{id}', [TouristBookingController::class, 'show'])->whereNumber('id');
    Route::post('/{id}/cancel', [TouristBookingController::class, 'cancel'])->whereNumber('id');
});
