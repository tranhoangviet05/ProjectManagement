<?php

use Illuminate\Support\Facades\Route;

// Tourist routes: /api/v1/tourist/...
Route::get('/ping', function () {
    return response()->json(['message' => 'Tourist module endpoints active']);
});
