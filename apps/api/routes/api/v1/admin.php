<?php

use App\Http\Controllers\Api\V1\Admin\AdminCouponController;
use App\Http\Controllers\Api\V1\Admin\AdminKycController;
use Illuminate\Support\Facades\Route;

// Admin routes: /api/v1/admin/...
Route::get('/ping', function () {
    return response()->json(['message' => 'Admin module endpoints active']);
});

// Phân hệ Quản trị & Phê duyệt hồ sơ đối tác (KYC Review)
Route::prefix('kyc')->group(function () {
    Route::get('/providers', [AdminKycController::class, 'index']);
    Route::get('/providers/{id}', [AdminKycController::class, 'show']);
    Route::post('/providers/{id}/approve', [AdminKycController::class, 'approve']);
    Route::post('/providers/{id}/reject', [AdminKycController::class, 'reject']);
});

// Phân hệ Quản lý Mã ưu đãi toàn sàn & Tặng mã cho Tourist (Task #53)
Route::prefix('coupons')->group(function () {
    Route::get('/', [AdminCouponController::class, 'index']);
    Route::post('/', [AdminCouponController::class, 'store']);
    Route::put('/{id}', [AdminCouponController::class, 'update']);
    Route::delete('/{id}', [AdminCouponController::class, 'destroy']);
    Route::get('/{id}/grants', [AdminCouponController::class, 'grants']);
    Route::post('/{id}/grant', [AdminCouponController::class, 'grant']);
});