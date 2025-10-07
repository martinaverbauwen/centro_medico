<?php

namespace App\Http\Controllers;

/**
 * @OA\Info(
 *     title="Centro Médico API",
 *     version="1.0.0",
 *     description="API para la gestión del centro médico",
 *     @OA\Contact(
 *         email="admin@centromedico.com"
 *     )
 * )
 * @OA\Server(
 *     url="http://127.0.0.1:8000",
 *     description="Servidor local"
 * )
 * @OA\SecurityScheme(
 *     securityScheme="sanctum",
 *     type="http",
 *     scheme="bearer"
 * )
 */
abstract class Controller
{
    //
}
