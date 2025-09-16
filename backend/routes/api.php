<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsuariosController;
use App\Http\Controllers\TurnoController;

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

// // Ejemplo de ruta protegida
// Route::middleware('auth:sanctum')->get('/perfil', function () {
//     return auth()->user()->load('rol','especialidad');
// });

// CRUD de usuarios (solo administrador/secretario)
Route::middleware(['auth:sanctum','role:administrador,secretario'])->group(function () {
    Route::apiResource('usuarios', UsuariosController::class);
});

//Crud de Turnos (acceso a admin, secretario y medico) recstricciones finas en el controller
Route::middleware(['auth:sanctum','role:administrador,secretario,medico'])->group(function () {
    Route::apiResource('turnos', TurnoController::class);
});