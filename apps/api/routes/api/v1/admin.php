<?php

use App\Http\Controllers\Api\V1\Admin\AdminBusinessTypeController;
use App\Http\Controllers\Api\V1\Admin\AdminCategoryController;
use App\Http\Controllers\Api\V1\Admin\AdminCouponController;
use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\AdminHolidayCampaignController;
use App\Http\Controllers\Api\V1\Admin\AdminKycController;
use App\Http\Controllers\Api\V1\Admin\AdminLocationController;
use App\Http\Controllers\Api\V1\Admin\AdminReportController;
use App\Http\Controllers\Api\V1\Admin\AdminServiceController;
use App\Http\Controllers\Api\V1\Admin\AdminServicePolicyController;
use App\Http\Controllers\Api\V1\Admin\AdminUserController;
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

// Phân hệ Kiểm duyệt & Phê duyệt/Từ chối Dịch vụ (Task #46)
Route::prefix('services')->group(function () {
    Route::get('/', [AdminServiceController::class, 'index']);
    Route::get('/{id}', [AdminServiceController::class, 'show']);
    Route::post('/{id}/approve', [AdminServiceController::class, 'approve']);
    Route::post('/{id}/reject', [AdminServiceController::class, 'reject']);
});

// Phân hệ Quản lý Tài khoản Người dùng (Task #52)
Route::prefix('users')->group(function () {
    Route::get('/', [AdminUserController::class, 'index']);
    Route::get('/stats', [AdminUserController::class, 'stats']);
    Route::get('/{id}', [AdminUserController::class, 'show']);
    Route::patch('/{id}/status', [AdminUserController::class, 'updateStatus']);
});

// Phân hệ Quản lý Mã giảm giá (Coupon Management - Task #53)
Route::prefix('coupons')->group(function () {
    Route::get('/', [AdminCouponController::class, 'index']);
    Route::post('/', [AdminCouponController::class, 'store']);
    Route::get('/{id}', [AdminCouponController::class, 'show']);
    Route::put('/{id}', [AdminCouponController::class, 'update']);
    Route::delete('/{id}', [AdminCouponController::class, 'destroy']);
    Route::post('/grant', [AdminCouponController::class, 'grant']);
});

// Phân hệ Quản lý Báo cáo Vi phạm Nội dung (Task #55)
Route::prefix('reports')->group(function () {
    Route::get('/', [AdminReportController::class, 'index']);
    Route::get('/stats', [AdminReportController::class, 'stats']);
    Route::get('/{id}', [AdminReportController::class, 'show']);
    Route::patch('/{id}/handle', [AdminReportController::class, 'handle']);
});

// Phân hệ Dashboard & Thống kê Quản trị (Task #56)
Route::prefix('dashboard')->group(function () {
    Route::get('/kpis', [AdminDashboardController::class, 'kpis']);
    Route::get('/revenue-chart', [AdminDashboardController::class, 'revenueChart']);
    Route::get('/category-revenue', [AdminDashboardController::class, 'categoryRevenue']);
    Route::get('/bookings', [AdminDashboardController::class, 'bookings']);
    Route::get('/top-providers', [AdminDashboardController::class, 'topProviders']);
});

// Phân hệ Quản lý Chính sách Dịch vụ Chung (Task #67)
Route::prefix('policies')->group(function () {
    Route::get('/', [AdminServicePolicyController::class, 'index']);
    Route::post('/', [AdminServicePolicyController::class, 'store']);
    Route::get('/{id}', [AdminServicePolicyController::class, 'show']);
    Route::put('/{id}', [AdminServicePolicyController::class, 'update']);
    Route::delete('/{id}', [AdminServicePolicyController::class, 'destroy']);
});

// Phân hệ Quản lý Chương trình Khuyến mãi Ngày lễ (Task #67)
Route::prefix('campaigns')->group(function () {
    Route::get('/', [AdminHolidayCampaignController::class, 'index']);
    Route::post('/', [AdminHolidayCampaignController::class, 'store']);
    Route::get('/{id}', [AdminHolidayCampaignController::class, 'show']);
    Route::put('/{id}', [AdminHolidayCampaignController::class, 'update']);
    Route::post('/{id}/reopen', [AdminHolidayCampaignController::class, 'reopen']);
    Route::delete('/{id}', [AdminHolidayCampaignController::class, 'destroy']);
});

