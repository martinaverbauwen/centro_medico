<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();
        if (!$user || !in_array($user->rol->nombre, $roles, true)) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        return $next($request);
    }
}
