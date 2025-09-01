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
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('apellido')->nullable();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('dni', 20)->nullable()->unique();
            $table->string('telefono', 30)->nullable();
        
            $table->foreignId('rol_id')->constrained('roles')->cascadeOnDelete();
            $table->foreignId('especialidad_id')->nullable()->constrained('especialidades')->nullOnDelete();
        
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('usuarios'); }

};
