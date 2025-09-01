<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuarios';

    protected $fillable = [
        'nombre','apellido','email','password',
        'dni','telefono','rol_id','especialidad_id'
    ];

    protected $hidden = ['password'];

    public function rol()          { return $this->belongsTo(Rol::class, 'rol_id'); }
    public function especialidad() { return $this->belongsTo(Especialidad::class, 'especialidad_id'); }
    public function turnosPaciente(){ return $this->hasMany(Turno::class, 'paciente_id'); }
    public function turnosMedico() { return $this->hasMany(Turno::class, 'medico_id'); }
}
