<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Especialidade;

class EspecialidadSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['nombre'=>'Clínica Médica'],
            ['nombre'=>'Pediatría'],
            ['nombre'=>'Cardiología'],
            ['nombre'=>'Dermatología'],
        ] as $e) {
            Especialidade::firstOrCreate(['nombre'=>$e['nombre']], $e);
        }
    }
}
