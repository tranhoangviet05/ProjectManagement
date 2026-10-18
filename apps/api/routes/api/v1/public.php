<?php

use Illuminate\Support\Facades\Route;

// Public & authentication routes: /api/v1/...
Route::get('/ping', function () {
    return response()->json(['message' => 'API v1 public endpoints active']);
});
