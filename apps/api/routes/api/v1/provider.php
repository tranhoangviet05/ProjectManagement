<?php

use Illuminate\Support\Facades\Route;

// Provider routes: /api/v1/provider/...
Route::get('/ping', function () {
    return response()->json(['message' => 'Provider module endpoints active']);
});
