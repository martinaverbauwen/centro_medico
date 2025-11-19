<?php

namespace App\Http\Controllers;

use App\Models\Especialidad;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EspecialidadController extends Controller
{
    /**
     * Listar especialidades (para selects, etc.)
     * GET /api/especialidades
     */
    public function index()
    {
        return Especialidad::orderBy('nombre')->get();
    }

    /**
     * Crear especialidad
     * POST /api/especialidades
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:150', 'unique:especialidades,nombre'],
            'descripcion' => ['nullable', 'string', 'max:255'],
        ]);

        $especialidad = Especialidad::create($data);

        return response()->json($especialidad, 201);
    }

    /**
     * Actualizar especialidad
     * PUT /api/especialidades/{especialidad}
     */
    public function update(Request $request, Especialidad $especialidad)
    {
        $data = $request->validate([
            'nombre' => [
                'sometimes',
                'required',
                'string',
                'max:150',
                Rule::unique('especialidades', 'nombre')->ignore($especialidad->id),
            ],
            'descripcion' => ['nullable', 'string', 'max:255'],
        ]);

        $especialidad->update($data);

        return response()->json($especialidad);
    }

    /**
     * Eliminar especialidad
     * DELETE /api/especialidades/{especialidad}
     */
    public function destroy(Especialidad $especialidad)
    {
        $especialidad->delete();

        return response()->json([
            'message' => 'Especialidad eliminada correctamente',
        ]);
    }
}
