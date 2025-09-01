<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Turno extends Model
{
    use HasFactory;

    protected $table = 'turnos';

    protected $fillable = [
        'paciente_id','medico_id','especialidad_id',
        'fecha_hora','estado','motivo','observaciones'
    ];

    public function paciente()     { return $this->belongsTo(Usuario::class, 'paciente_id'); }
    public function medico()       { return $this->belongsTo(Usuario::class, 'medico_id'); }
    public function especialidad() { return $this->belongsTo(Especialidad::class, 'especialidad_id'); }
}

