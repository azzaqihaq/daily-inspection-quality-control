<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProductDefectDetectionController extends Controller
{
    public function index(){
        return view('product_defect_detection.index');
    }
}
