<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('turnos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('medico_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('especialidad_id')->constrained('especialidades')->cascadeOnDelete();
            $table->dateTime('fecha_hora');
            $table->enum('estado', ['pendiente','confirmado','cancelado','atendido'])->default('pendiente');
            $table->string('motivo', 255)->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();
        
            $table->index(['medico_id','fecha_hora']);
            $table->index(['paciente_id','fecha_hora']);
        });
    }
    public function down(): void { Schema::dropIfExists('turnos'); }

};
