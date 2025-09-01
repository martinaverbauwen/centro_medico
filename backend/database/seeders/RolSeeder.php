<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RolSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['nombre'=>'administrador','descripcion'=>'Acceso total'],
            ['nombre'=>'secretario','descripcion'=>'Gestión de turnos'],
            ['nombre'=>'medico','descripcion'=>'Atención de pacientes'],
            ['nombre'=>'cliente','descripcion'=>'Paciente/cliente'],
        ] as $r) {
            Role::firstOrCreate(['nombre'=>$r['nombre']], $r);
        }
    }
}
