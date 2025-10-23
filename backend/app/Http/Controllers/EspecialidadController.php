<?php

namespace App\Http\Controllers;

use App\Models\Especialidad;
use Illuminate\Http\Request;

class EspecialidadController extends Controller
{
    public function index()
    {
        return Especialidad::select('id','nombre')->orderBy('nombre')->get();
    }
}
