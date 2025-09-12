<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Especialidad;
use App\Models\Turno;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;


class UsuariosController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = (int)($request->input('per_page', 10));

        $query = Usuario::with(['rol', 'especialidad']);

        if ($q = $request->input('q')) {
            $query->where(function($qq) use ($q) {
                $qq->where('nombre','like',"%{$q}%")
                   ->orWhere('apellido','like',"%{$q}%")
                   ->orWhere('email','like',"%{$q}%")
                   ->orWhere('dni','like',"%{$q}%");
            });
        }

        if ($rolNombre = $request->input('rol')) {
            $query->whereHas('rol', fn($r) => $r->where('nombre', $rolNombre));
        }

        if ($espId = $request->input('especialidad')) {
            $query->where('especialidad_id', $espId);
        }

        return $query->orderBy('id','desc')->paginate($perPage);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => ['required','string','max:100'],
            'apellido' => ['required','string','max:100'],
            'email' => ['required','email','max:150','unique:usuarios,email'],
            'password' => ['required','string','min:6'],
            'dni' => ['nullable','string','max:20','unique:usuarios,dni'],
            'telefono' => ['nullable','string','max:30'],
            'rol_id' => ['required','exists:roles,id'],
            'especialidad_id' => ['nullable','exists:especialidades,id'],
        ]);

        $data['password'] = Hash::make($data['password']);

        $usuario = Usuario::create($data);

        return response()->json($usuario->load(['rol','especialidad']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(\App\Models\Usuario $usuario)
    {
        return $usuario->load(['rol','especialidad']);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(\Illuminate\Http\Request $request, \App\Models\Usuario $usuario)
    {
        $data = $request->validate([
            'nombre' => ['sometimes','required','string','max:100'],
            'apellido' => ['sometimes','required','string','max:100'],
            'email' => [
                'sometimes','required','email','max:150',
                Rule::unique('usuarios','email')->ignore($usuario->id)
            ],
            'password' => ['nullable','string','min:6'],
            'dni' => [
                'nullable','string','max:20',
                Rule::unique('usuarios','dni')->ignore($usuario->id)
            ],
            'telefono' => ['nullable','string','max:30'],
            'rol_id' => ['sometimes','required','exists:roles,id'],
            'especialidad_id' => ['nullable','exists:especialidades,id'],
        ]);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $usuario->update($data);

        return $usuario->load(['rol','especialidad']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(\App\Models\Usuario $usuario)
    {
        $usuario->delete();
        return response()->json(['message' => 'Usuario eliminado']);
    }
}
