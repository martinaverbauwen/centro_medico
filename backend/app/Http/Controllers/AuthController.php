<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/auth/register",
     *     tags={"Authentication"},
     *     summary="Registrar usuario",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="nombre", type="string", example="Juan"),
     *             @OA\Property(property="email", type="string", example="juan@example.com"),
     *             @OA\Property(property="password", type="string", example="123456")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Usuario registrado exitosamente"),
     *     @OA\Response(response=422, description="Error de validación")
     * )
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'nombre' => ['required','string','max:100'],
            'apellido' => ['nullable','string','max:100'],
            'email' => ['required','email','max:150','unique:usuarios,email'],
            'password' => ['required','string','min:6'],
            'dni' => ['nullable','string','max:20','unique:usuarios,dni'],
            'telefono' => ['nullable','string','max:30'],
            'rol' => ['nullable', Rule::in(['administrador','secretario','medico','cliente','Paciente','paciente'])],
            'especialidad_id' => ['nullable','exists:especialidades,id'],
        ]);

    $rol = Role::where('nombre', $data['rol'] ?? 'paciente')->firstOrFail();

        $user = Usuario::create([
            'nombre' => $data['nombre'],
            'apellido' => $data['apellido'] ?? null,
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'dni' => $data['dni'] ?? null,
            'telefono' => $data['telefono'] ?? null,
            'rol_id' => $rol->id,
            'especialidad_id' => $data['especialidad_id'] ?? null,
        ]);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'usuario' => $user->load('rol','especialidad'),
            'token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * @OA\Post(
     *     path="/api/auth/login",
     *     tags={"Authentication"},
     *     summary="Iniciar sesión",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="admin@centromedico.com"),
     *             @OA\Property(property="password", type="string", format="password", example="123456")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login exitoso",
     *         @OA\JsonContent(
     *             @OA\Property(property="usuario", type="object"),
     *             @OA\Property(property="token", type="string"),
     *             @OA\Property(property="token_type", type="string", example="Bearer")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Credenciales inválidas")
     * )
     */
    public function login(Request $request)
    {
        $cred = $request->validate([
            'email' => ['required','email'],
            'password' => ['required','string'],
        ]);

        $user = Usuario::where('email', $cred['email'])->first();
        if (!$user || !Hash::check($cred['password'], $user->password)) {
            return response()->json(['message'=>'Credenciales inválidas'], 401);
        }

        // Opcional: revocar tokens previos
        $user->tokens()->delete();

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'usuario' => $user->load('rol','especialidad'),
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/auth/me",
     *     tags={"Authentication"},
     *     summary="Obtener usuario actual",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Usuario actual",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="nombre", type="string", example="Juan"),
     *             @OA\Property(property="email", type="string", example="juan@example.com"),
     *             @OA\Property(property="rol", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado")
     * )
     */
    public function me(Request $request)
    {
        return response()->json($request->user()->load('rol','especialidad'));
    }

    /**
     * @OA\Post(
     *     path="/api/auth/logout",
     *     tags={"Authentication"},
     *     summary="Cerrar sesión",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Sesión cerrada exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Sesión cerrada")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado")
     * )
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message'=>'Sesión cerrada']);
    }
}
