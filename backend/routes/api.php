<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsuariosController;
use App\Http\Controllers\TurnoController;
use App\Http\Controllers\EspecialidadController;


Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me',     [AuthController::class, 'me']);
        Route::post('/logout',[AuthController::class, 'logout']);
    });


    // Route::middleware(['auth:sanctum','role:administrador,secretario'])
    //  ->post('/turnos', [TurnoController::class,'store']);

});


Route::get('especialidades', [EspecialidadController::class, 'index']);

Route::middleware(['auth:sanctum'])->get('medicos', [UsuariosController::class, 'medicos']);

// CRUD de usuarios (solo administrador/secretario)
Route::middleware(['auth:sanctum','role:administrador,secretario'])->group(function () {
    Route::apiResource('usuarios', UsuariosController::class);
});


Route::middleware(['auth:sanctum', 'role:administrador,secretario,medico,paciente'])->group(function () {
    Route::apiResource('turnos', TurnoController::class);
});



