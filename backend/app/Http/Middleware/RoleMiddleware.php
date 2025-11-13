<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    /**
     * Middleware de control de roles.
     *
     * Soporta:
     *  - role:medico
     *  - role:medico,administrador
     *  - role:medico|administrador
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        // Si vino solo un parámetro tipo "medico|admin"
        if (count($roles) === 1 && str_contains($roles[0], '|')) {
            $roles = explode('|', $roles[0]);
        }

        // Normalizar roles a minúsculas
        $roles = array_map(fn ($r) => mb_strtolower($r), $roles);

        // Usamos el helper del modelo Usuario
        if (!$user->hasRole($roles)) {
            return response()->json([
                'message' => 'No autorizado (se requiere: '.implode(',', $roles).')'
            ], 403);
        }

        return $next($request);
    }
}
