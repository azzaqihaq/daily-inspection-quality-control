<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PartScannerIndicatorController extends Controller
{
    public function index(){
        return view('part_scanner_indicator.index');
    }
}
