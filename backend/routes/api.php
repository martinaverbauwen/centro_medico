<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsuariosController;
use App\Http\Controllers\TurnoController;
use App\Http\Controllers\EspecialidadController;

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me',      [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

/*
|--------------------------------------------------------------------------
| PÚBLICO / LECTURAS GENERALES
|--------------------------------------------------------------------------
*/

Route::get('especialidades', [EspecialidadController::class, 'index']);

// CRUD solo para administrador
Route::middleware(['auth:sanctum', 'role:administrador'])->group(function () {
    Route::post('especialidades', [EspecialidadController::class, 'store']);           // crear
    Route::put('especialidades/{especialidad}', [EspecialidadController::class, 'update']); // editar
    Route::delete('especialidades/{especialidad}', [EspecialidadController::class, 'destroy']); // eliminar
});

/*
|--------------------------------------------------------------------------
| RUTAS SOLO AUTENTICADOS (cualquier rol)
|--------------------------------------------------------------------------
|
*/
Route::middleware(['auth:sanctum'])->group(function () {
    // listado de médicos
    Route::get('medicos', [UsuariosController::class, 'medicos']);

    // lectura de turnos (filtrada internamente según rol)
    Route::get('turnos',      [TurnoController::class, 'index']);
    Route::get('turnos/{id}', [TurnoController::class, 'show']);
});

/*
|--------------------------------------------------------------------------
| ADMINISTRADOR (y opcionalmente SECRETARIO) – USUARIOS
|--------------------------------------------------------------------------
|
| Si querés que el secretario también gestione usuarios, dejalo así.
| Si querés que SOLO admin lo haga, sacá "secretario" de la lista.
|
*/
Route::middleware(['auth:sanctum','role:administrador,secretario'])->group(function () {
    Route::apiResource('usuarios', UsuariosController::class);
});

/*
|--------------------------------------------------------------------------
| TURNOS – OPERACIONES ESPECÍFICAS POR ROL
|--------------------------------------------------------------------------
|
| Regla de negocio:
|  - Paciente: ver sus turnos, agendar, cancelar.
|  - Médico: ver sus turnos, cancelar, reprogramar.
|  - Secretario: ver todos, agendar, cancelar, reprogramar.
|  - Administrador: todo.
|
| NOTA IMPORTANTE:
|   La validación de "solo sus turnos" (paciente/médico) debe hacerse
|   dentro de TurnoController (por ej. comprobando paciente_id/medico_id).
|
*/

/*
 * Crear turno (agendar)
 * - Paciente puede agendar sus propios turnos
 * - Secretario puede agendar turnos para pacientes
 * - Administrador puede agendar cualquier turno
 */
Route::middleware([
    'auth:sanctum',
    'role:administrador,secretario,paciente,cliente'
])->group(function () {
    Route::post('turnos', [TurnoController::class, 'store']);
});

/*
 * Cancelar turno (DELETE)
 * - Paciente / cliente → solo sus propios turnos
 * - Médico → sus turnos
 * - Secretario → cualquiera
 * - Administrador → cualquiera
 */
Route::middleware([
    'auth:sanctum',
    'role:administrador,secretario,medico,paciente,cliente'
])->group(function () {
    Route::delete('turnos/{id}', [TurnoController::class, 'destroy']);
});

/*
 * Reprogramar turno
 * - Médico: sus turnos
 * - Secretario: cualquiera
 * - Administrador: cualquiera
 */
Route::middleware([
    'auth:sanctum',
    'role:administrador,secretario,medico'
])->group(function () {
    Route::put('turnos/{id}/reprogramar', [TurnoController::class, 'reprogramar']);
});

/*
 * Editar turno genéricamente (update)
 * No lo mencionaste en la consigna, así que lo dejo SOLO
 * para administrador y secretario. Si querés sumamos médico.
 */
Route::middleware([
    'auth:sanctum',
    'role:administrador,secretario'
])->group(function () {
    Route::put('turnos/{id}', [TurnoController::class, 'update']);
});
