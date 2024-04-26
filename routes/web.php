<?php

use App\Http\Controllers\PartScannerIndicatorController;
use App\Http\Controllers\ProductDefectDetectionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/test/react', function () {
    return view('test_react.index');
});

Route::get('/detect/product-defect', [ProductDefectDetectionController::class, 'index']);
          
Route::get('/detect/part-scanner-indicator', [PartScannerIndicatorController::class, 'index']);
