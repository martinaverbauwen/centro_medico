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
     * @OA\Get(
     *     path="/api/usuarios",
     *     tags={"Usuarios"},
     *     summary="Listar usuarios",
     *     description="Obtiene lista de usuarios con filtros opcionales",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="q",
     *         in="query",
     *         description="Buscar por nombre, apellido, email o DNI",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="rol",
     *         in="query",
     *         description="Filtrar por rol",
     *         @OA\Schema(type="string", enum={"administrador","secretario","medico","paciente"})
     *     ),
     *     @OA\Parameter(
     *         name="especialidad",
     *         in="query",
     *         description="Filtrar por especialidad (ID)",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Registros por página",
     *         @OA\Schema(type="integer", default=10)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de usuarios",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="current_page", type="integer"),
     *             @OA\Property(property="total", type="integer")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="Sin permisos")
     * )
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
     * @OA\Post(
     *     path="/api/usuarios",
     *     tags={"Usuarios"},
     *     summary="Crear usuario",
     *     description="Crea un nuevo usuario en el sistema",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nombre","email","password","rol_id"},
     *             @OA\Property(property="nombre", type="string", example="Juan"),
     *             @OA\Property(property="apellido", type="string", example="Pérez"),
     *             @OA\Property(property="email", type="string", format="email", example="juan@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="123456"),
     *             @OA\Property(property="dni", type="string", example="12345678"),
     *             @OA\Property(property="telefono", type="string", example="1234567890"),
     *             @OA\Property(property="rol_id", type="integer", example=4),
     *             @OA\Property(property="especialidad_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Usuario creado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="nombre", type="string"),
     *             @OA\Property(property="email", type="string"),
     *             @OA\Property(property="rol", type="object"),
     *             @OA\Property(property="especialidad", type="object")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=403, description="Sin permisos")
     * )
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
     * @OA\Put(
     *     path="/api/usuarios/{id}",
     *     tags={"Usuarios"},
     *     summary="Actualizar usuario",
     *     description="Actualiza los datos de un usuario existente",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del usuario a actualizar",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="nombre", type="string", example="Juan Actualizado"),
     *             @OA\Property(property="apellido", type="string", example="Pérez Modificado"),
     *             @OA\Property(property="email", type="string", example="juan.nuevo@email.com"),
     *             @OA\Property(property="password", type="string", example="nueva123"),
     *             @OA\Property(property="dni", type="string", example="98765432"),
     *             @OA\Property(property="telefono", type="string", example="011-1111-2222"),
     *             @OA\Property(property="rol_id", type="integer", example=3),
     *             @OA\Property(property="especialidad_id", type="integer", example=2)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Usuario actualizado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="nombre", type="string"),
     *             @OA\Property(property="email", type="string")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="Sin permisos"),
     *     @OA\Response(response=404, description="Usuario no encontrado"),
     *     @OA\Response(response=422, description="Error de validación")
     * )
     */
    public function update(Request $request, \App\Models\Usuario $usuario)
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
     * @OA\Delete(
     *     path="/api/usuarios/{id}",
     *     tags={"Usuarios"},
     *     summary="Eliminar usuario",
     *     description="Elimina un usuario del sistema",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del usuario a eliminar",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Usuario eliminado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Usuario eliminado")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="Sin permisos"),
     *     @OA\Response(response=404, description="Usuario no encontrado")
     * )
     */
    public function destroy(\App\Models\Usuario $usuario)
    {
        $usuario->delete();
        return response()->json(['message' => 'Usuario eliminado']);
    }

    /**
     * @OA\Get(
     *     path="/api/medicos",
     *     tags={"Usuarios"},
     *     summary="Listar médicos (para agenda del paciente)",
     *     description="Devuelve médicos y sus especialidades. Filtros opcionales por especialidad o búsqueda.",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="especialidad_id",
     *         in="query",
     *         description="Filtrar por ID de especialidad",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="q",
     *         in="query",
     *         description="Buscar por nombre, apellido o DNI",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(response=200, description="Listado de médicos")
     * )
     */
  public function medicos(\Illuminate\Http\Request $request)
{
    $q = \App\Models\Usuario::with(['especialidad:id,nombre','rol:id,nombre'])
      ->whereHas('rol', fn($r) => $r->where('nombre','medico'))
      ->select('id','nombre','apellido','especialidad_id');

    if ($esp = $request->query('especialidad_id')) {
        $q->where('especialidad_id', (int)$esp);
    }

    return $q->orderBy('apellido')->orderBy('nombre')->get();
}

}
