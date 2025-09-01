<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'nombre' => ['required','string','max:100'],
            'apellido' => ['nullable','string','max:100'],
            'email' => ['required','email','max:150','unique:usuarios,email'],
            'password' => ['required','string','min:6'],
            'dni' => ['nullable','string','max:20','unique:usuarios,dni'],
            'telefono' => ['nullable','string','max:30'],
            'rol' => ['nullable', Rule::in(['administrador','secretario','medico','cliente'])],
            'especialidad_id' => ['nullable','exists:especialidades,id'],
        ]);

        $rol = Role::where('nombre', $data['rol'] ?? 'cliente')->firstOrFail();

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

    public function me(Request $request)
    {
        return response()->json($request->user()->load('rol','especialidad'));
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message'=>'Sesión cerrada']);
    }
}

