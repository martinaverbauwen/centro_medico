<?php

namespace App\Http\Controllers;

use App\Models\Turno;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TurnoController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/turnos",
     *     tags={"Turnos"},
     *     summary="Listar turnos",
     *     description="Obtiene lista de turnos. Admin/Secretario ven todos, Médicos solo los propios",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="estado",
     *         in="query",
     *         description="Filtrar por estado",
     *         @OA\Schema(type="string", enum={"pendiente", "confirmado", "cancelado", "atendido"})
     *     ),
     *     @OA\Parameter(
     *         name="medico_id",
     *         in="query",
     *         description="Filtrar por médico",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="paciente_id",
     *         in="query",
     *         description="Filtrar por paciente",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="desde",
     *         in="query",
     *         description="Fecha desde",
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="hasta",
     *         in="query",
     *         description="Fecha hasta",
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de turnos",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="current_page", type="integer"),
     *             @OA\Property(property="total", type="integer")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado")
     * )
     * GET /api/turnos
     * Admin/Secretario => todos; Médico => solo los propios
     * Filtros: estado, medico_id, paciente_id, especialidad_id, desde, hasta, search
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Turno::query()
            ->with(['paciente:id,nombre,apellido','medico:id,nombre,apellido','especialidad:id,nombre'])
            ->orderBy('fecha_hora');

        // Visibilidad según rol
    if ($user->rol->nombre === 'medico') {
            $query->where('medico_id', $user->id);
        }

        // Filtros
        if ($estado = $request->input('estado'))            { $query->where('estado', $estado); }
        if ($medicoId = $request->input('medico_id'))       { $query->where('medico_id', $medicoId); }
        if ($pacienteId = $request->input('paciente_id'))   { $query->where('paciente_id', $pacienteId); }
        if ($espId = $request->input('especialidad_id'))    { $query->where('especialidad_id', $espId); }
        if ($desde = $request->input('desde'))              { $query->where('fecha_hora', '>=', $desde); }
        if ($hasta = $request->input('hasta'))              { $query->where('fecha_hora', '<=', $hasta); }

        if ($search = $request->input('search')) {
            $query->whereHas('paciente', function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('apellido', 'like', "%{$search}%")
                  ->orWhere('dni', 'like', "%{$search}%");
            });
        }

        return $query->paginate($request->integer('per_page', 10));
    }

    /**
     * @OA\Post(
     *     path="/api/turnos",
     *     tags={"Turnos"},
     *     summary="Crear turno",
     *     description="Crea un nuevo turno. Admin/Secretario pueden crear para cualquiera, Médicos solo para sí mismos",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"paciente_id","medico_id","especialidad_id","fecha_hora"},
     *             @OA\Property(property="paciente_id", type="integer", example=1),
     *             @OA\Property(property="medico_id", type="integer", example=2),
     *             @OA\Property(property="especialidad_id", type="integer", example=1),
     *             @OA\Property(property="fecha_hora", type="string", format="datetime", example="2024-12-01T10:00:00"),
     *             @OA\Property(property="estado", type="string", enum={"pendiente","confirmado","cancelado","atendido"}, example="pendiente"),
     *             @OA\Property(property="motivo", type="string", example="Consulta general"),
     *             @OA\Property(property="observaciones", type="string", example="Paciente con dolor de cabeza")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Turno creado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="paciente", type="object"),
     *             @OA\Property(property="medico", type="object"),
     *             @OA\Property(property="especialidad", type="object")
     *         )
     *     ),
     *     @OA\Response(response=403, description="No autorizado"),
     *     @OA\Response(response=422, description="Error de validación")
     * )
     * POST /api/turnos
     * Admin/Secretario => crean para cualquiera
     * Médico => solo puede crear turnos donde medico_id sea el suyo
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'paciente_id'     => ['required','exists:usuarios,id'],
            'medico_id'       => ['required','exists:usuarios,id'],
            'especialidad_id' => ['required','exists:especialidades,id'],
            'fecha_hora'      => ['required','date'],
            'estado'          => ['nullable', Rule::in(['pendiente','confirmado','cancelado','atendido'])],
            'motivo'          => ['nullable','string','max:255'],
            'observaciones'   => ['nullable','string'],
        ]);

    if ($user->rol->nombre === 'medico' && (int)$data['medico_id'] !== (int)$user->id) {
            return response()->json(['message' => 'No autorizado: el médico solo puede crearse turnos a sí mismo'], 403);
        }

        // Evitar superposición: mismo médico y mismo horario
        $existe = Turno::where('medico_id', $data['medico_id'])
            ->where('fecha_hora', $data['fecha_hora'])
            ->whereIn('estado', ['pendiente','confirmado','atendido']) // cancelados no bloquean
            ->exists();

        if ($existe) {
            return response()->json(['message' => 'Ya existe un turno con ese médico en ese horario'], 422);
        }

        $turno = Turno::create($data);
        return response()->json($turno->load(['paciente','medico','especialidad']), 201);
    }

    /**
     * GET /api/turnos/{turno}
     */
    public function show(Turno $turno, Request $request)
    {
        $user = $request->user();
    if ($user->rol->nombre === 'medico' && $turno->medico_id !== $user->id) {
            return response()->json(['message'=>'No autorizado'], 403);
        }
        return $turno->load(['paciente','medico','especialidad']);
    }

    /**
     * @OA\Put(
     *     path="/api/turnos/{id}",
     *     tags={"Turnos"},
     *     summary="Actualizar turno",
     *     description="Actualiza un turno médico. Admin/Secretario pueden editar todo, Médico solo sus turnos (estado/observaciones)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del turno a actualizar",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="paciente_id", type="integer", example=1, description="Solo admin/secretario"),
     *             @OA\Property(property="medico_id", type="integer", example=2, description="Solo admin/secretario"),
     *             @OA\Property(property="especialidad_id", type="integer", example=1, description="Solo admin/secretario"),
     *             @OA\Property(property="fecha_hora", type="string", format="datetime", example="2025-10-15T14:30:00", description="Solo admin/secretario"),
     *             @OA\Property(property="estado", type="string", enum={"pendiente","confirmado","cancelado","atendido"}, example="confirmado"),
     *             @OA\Property(property="motivo", type="string", example="Control de rutina actualizado", description="Solo admin/secretario"),
     *             @OA\Property(property="observaciones", type="string", example="Paciente confirmó asistencia")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Turno actualizado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="estado", type="string"),
     *             @OA\Property(property="observaciones", type="string")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="Sin permisos"),
     *     @OA\Response(response=404, description="Turno no encontrado"),
     *     @OA\Response(response=422, description="Error de validación o conflicto de horario")
     * )
     */
    public function update(Request $request, Turno $turno)
    {
        $user = $request->user();

    if ($user->rol->nombre === 'medico') {
            if ($turno->medico_id !== $user->id) {
                return response()->json(['message'=>'No autorizado'], 403);
            }

            $data = $request->validate([
                'estado'        => ['nullable', Rule::in(['pendiente','confirmado','cancelado','atendido'])],
                'observaciones' => ['nullable','string'],
            ]);

            $turno->update($data);
            return $turno->fresh()->load(['paciente','medico','especialidad']);
        }

        // admin/secretario
        $data = $request->validate([
            'paciente_id'     => ['sometimes','exists:usuarios,id'],
            'medico_id'       => ['sometimes','exists:usuarios,id'],
            'especialidad_id' => ['sometimes','exists:especialidades,id'],
            'fecha_hora'      => ['sometimes','date'],
            'estado'          => ['sometimes', Rule::in(['pendiente','confirmado','cancelado','atendido'])],
            'motivo'          => ['nullable','string','max:255'],
            'observaciones'   => ['nullable','string'],
        ]);

        // Validar superposición si cambian médico/fecha
        $nuevoMedico = $data['medico_id'] ?? $turno->medico_id;
        $nuevaFecha  = $data['fecha_hora'] ?? $turno->fecha_hora;

        $existe = Turno::where('medico_id', $nuevoMedico)
            ->where('fecha_hora', $nuevaFecha)
            ->where('id', '!=', $turno->id)
            ->whereIn('estado', ['pendiente','confirmado','atendido'])
            ->exists();

        if ($existe) {
            return response()->json(['message' => 'Ese médico ya tiene un turno en ese horario'], 422);
        }

        $turno->update($data);
        return $turno->fresh()->load(['paciente','medico','especialidad']);
    }

    /**
     * @OA\Delete(
     *     path="/api/turnos/{id}",
     *     tags={"Turnos"},
     *     summary="Eliminar turno",
     *     description="Elimina un turno médico (solo admin/secretario)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del turno a eliminar",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Turno eliminado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Turno eliminado")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="Sin permisos - Solo admin/secretario"),
     *     @OA\Response(response=404, description="Turno no encontrado")
     * )
     */
    public function destroy(Request $request, Turno $turno)
    {
        $user = $request->user();
        if (!in_array($user->rol->nombre, ['administrador','secretario'], true)) {
            return response()->json(['message'=>'No autorizado'], 403);
        }
        $turno->delete();
        return response()->json(['message'=>'Turno eliminado']);
    }
}
