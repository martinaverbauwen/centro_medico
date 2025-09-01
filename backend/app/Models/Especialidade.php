<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Especialidade extends Model
{
    use HasFactory;

    protected $table = 'especialidades';
    protected $fillable = ['nombre','descripcion'];

    public function medicos() { return $this->hasMany(Usuario::class, 'especialidad_id'); }
    public function turnos()  { return $this->hasMany(Turno::class, 'especialidad_id'); }
}
