<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('turnos', function (Blueprint $table) {
            $table->unique(['medico_id','fecha_hora'], 'turnos_medico_fecha_unique');
        });
    }
    public function down(): void {
        Schema::table('turnos', function (Blueprint $table) {
            $table->dropUnique('turnos_medico_fecha_unique');
        });
    }
};
