<?php

namespace App\Http\Controllers;

use App\Models\Turno;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TurnoController extends Controller
{
    /**
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
     * PUT/PATCH /api/turnos/{turno}
     * Admin/Secretario => pueden editar todo
     * Médico => solo puede editar sus turnos y solo estado/observaciones
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
     * DELETE /api/turnos/{turno}
     * Solo admin/secretario
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
