<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Especialidad;
use App\Models\Turno;
use App\Models\Role; // 👈 agregado
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;

class UsuariosController extends Controller
{
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

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre'          => ['required','string','max:100'],
            'apellido'        => ['required','string','max:100'],
            'email'           => ['required','email','max:150','unique:usuarios,email'],
            'password'        => ['required','string','min:6'],
            'dni'             => ['nullable','string','max:20','unique:usuarios,dni'],
            'telefono'        => ['nullable','string','max:30'],
            'rol_id'          => ['nullable','exists:roles,id'], // 👈 ahora nullable
            'rol'             => ['nullable', Rule::in(['administrador','secretario','medico','paciente','cliente'])],
            'especialidad_id' => ['nullable','exists:especialidades,id'],
        ]);

        // si viene rol (nombre) y NO viene rol_id, lo resolvemos por nombre
        if (empty($data['rol_id']) && !empty($data['rol'])) {
            $role = Role::where('nombre', $data['rol'])->first();
            if (!$role) {
                return response()->json([
                    'message' => 'Rol inválido',
                    'errors'  => ['rol' => ['El rol indicado no existe']],
                ], 422);
            }
            $data['rol_id'] = $role->id;
        }

        // si aún no hay rol_id, error
        if (empty($data['rol_id'])) {
            return response()->json([
                'message' => 'El campo rol_id o rol es obligatorio',
                'errors'  => ['rol_id' => ['Debe indicar el rol del usuario']],
            ], 422);
        }

        unset($data['rol']); // no existe columna 'rol' en la tabla

        $data['password'] = Hash::make($data['password']);

        $usuario = Usuario::create($data);

        return response()->json($usuario->load(['rol','especialidad']), 201);
    }

    public function show(Usuario $usuario)
    {
        return $usuario->load(['rol','especialidad']);
    }

    public function update(Request $request, Usuario $usuario)
    {
        $data = $request->validate([
            'nombre'          => ['sometimes','required','string','max:100'],
            'apellido'        => ['sometimes','required','string','max:100'],
            'email'           => [
                'sometimes','required','email','max:150',
                Rule::unique('usuarios','email')->ignore($usuario->id)
            ],
            'password'        => ['nullable','string','min:6'],
            'dni'             => [
                'nullable','string','max:20',
                Rule::unique('usuarios','dni')->ignore($usuario->id)
            ],
            'telefono'        => ['nullable','string','max:30'],
            'rol_id'          => ['sometimes','nullable','exists:roles,id'],
            'rol'             => ['sometimes','nullable', Rule::in(['administrador','secretario','medico','paciente','cliente'])],
            'especialidad_id' => ['nullable','exists:especialidades,id'],
        ]);

        // resolver rol por nombre si viene
        if (!empty($data['rol']) && empty($data['rol_id'])) {
            $role = Role::where('nombre', $data['rol'])->first();
            if (!$role) {
                return response()->json([
                    'message' => 'Rol inválido',
                    'errors'  => ['rol' => ['El rol indicado no existe']],
                ], 422);
            }
            $data['rol_id'] = $role->id;
        }
        unset($data['rol']);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $usuario->update($data);

        return $usuario->load(['rol','especialidad']);
    }

    public function destroy(Usuario $usuario)
    {
        $usuario->delete();
        return response()->json(['message' => 'Usuario eliminado']);
    }

    public function medicos(Request $request)
    {
        $q = Usuario::with(['especialidad:id,nombre','rol:id,nombre'])
            ->whereHas('rol', fn($r) => $r->where('nombre','medico'))
            ->select('id','nombre','apellido','especialidad_id');

        if ($esp = $request->query('especialidad_id')) {
            $q->where('especialidad_id', (int)$esp);
        }

        return $q->orderBy('apellido')->orderBy('nombre')->get();
    }
}
