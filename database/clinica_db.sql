-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS clinica_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE clinica_db;

-- Tabla de Roles
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

-- Tabla de Usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- Tabla de Especialidades
CREATE TABLE especialidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- Tabla de Turnos
CREATE TABLE turnos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL,
    medico_id INT NOT NULL,
    especialidad_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    FOREIGN KEY (paciente_id) REFERENCES usuarios(id),
    FOREIGN KEY (medico_id) REFERENCES usuarios(id),
    FOREIGN KEY (especialidad_id) REFERENCES especialidades(id)
);

-- ==============================
-- INSERTAR DATOS DE PRUEBA
-- ==============================

-- Roles iniciales
INSERT INTO roles (nombre) VALUES ('Admin'), ('Secretario'), ('Medico'), ('Paciente');


-- Especialidades iniciales
INSERT INTO especialidades (nombre) VALUES ('Cardiología'), ('Pediatría'), ('Dermatología');

-- Usuario Admin de prueba
INSERT INTO usuarios (nombre, email, password, rol_id) 
VALUES ('Administrador', 'admin@clinica.com', '$2y$10$Vy85czsv5DjIR3fFolf2m.izDB780gVGWM2jHuQVKrtUfSF7d66je', 1);