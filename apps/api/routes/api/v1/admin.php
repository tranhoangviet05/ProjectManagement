<?php

use Illuminate\Support\Facades\Route;

// Admin routes: /api/v1/admin/...
Route::get('/ping', function () {
    return response()->json(['message' => 'Admin module endpoints active']);
});
