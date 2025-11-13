<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Models\Role;
use App\Models\Especialidad;

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuarios';

    protected $fillable = [
        'nombre','apellido','email','password',
        'dni','telefono','rol_id','especialidad_id'
    ];

    protected $hidden = ['password'];

    public function rol()
    {
        return $this->belongsTo(Role::class, 'rol_id');
    }

    public function especialidad()
    {
        return $this->belongsTo(Especialidad::class, 'especialidad_id');
    }

    public function turnosPaciente()
    {
        return $this->hasMany(Turno::class, 'paciente_id');
    }

    public function turnosMedico()
    {
        return $this->hasMany(Turno::class, 'medico_id');
    }

    /**
     * Verifica si el usuario tiene alguno de los roles indicados.
     *
     * Acepta:
     *  - 'medico'
     *  - ['medico','administrador']
     *  - 'medico|administrador'
     */
    public function hasRole(string|array $roles): bool
    {
        $nombreRol = $this->rol?->nombre;
        if (!$nombreRol) {
            return false;
        }

        $nombreRol = mb_strtolower($nombreRol);

        // array de roles
        if (is_array($roles)) {
            $roles = array_map(fn ($r) => mb_strtolower($r), $roles);
            return in_array($nombreRol, $roles, true);
        }

        // string con pipes: "medico|administrador"
        if (str_contains($roles, '|')) {
            $rolesArray = array_map(
                fn ($r) => mb_strtolower($r),
                explode('|', $roles)
            );
            return in_array($nombreRol, $rolesArray, true);
        }

        // string simple: "medico"
        return $nombreRol === mb_strtolower($roles);
    }
}
