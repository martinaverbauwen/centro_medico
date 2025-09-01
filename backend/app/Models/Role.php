<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Role extends Model
{
    use HasFactory;

    protected $table = 'roles';
    protected $fillable = ['nombre','descripcion'];

    public function usuarios() { return $this->hasMany(Usuario::class, 'rol_id'); }
}
