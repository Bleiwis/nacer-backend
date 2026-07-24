# Normas y Alcance del Backend (`nacer-backend`)

Este documento establece las instrucciones de desarrollo para la prueba técnica **Nacer Digital**, enfocándose en **entregar una solución limpia, elegante y libre de sobreingeniería**.

---

## 1. Alcance y Requerimiento Objetivo

- **Objetivo Práctico**: Endpoint `GET /user/:username` que consume la API pública de GitHub (`https://api.github.com/users/:username`) y mapea una respuesta estructurada para el frontend.
- **Evitar Sobreingeniería**: 
  - **NO** implementar base de datos (PostgreSQL/MongoDB/Prisma/TypeORM), autenticación JWT compleja, ni arquitecturas de microservicios o colas.
  - Mantener un **único módulo funcional** (`UserModule` o `GithubModule`).

---

## 2. Estructura del Proyecto en NestJS

La estructura debe ser directa y mantenible:

```text
src/
├── user/
│   ├── dto/
│   │   └── user-response.dto.ts
│   ├── user.controller.ts
│   ├── user.service.ts
│   └── user.module.ts
├── common/ (opcional para filtros de excepción/interceptores limpios)
├── app.module.ts
└── main.ts
```

- **`UserController`**: Define la ruta `GET /user/:username`.
- **`UserService`**: Consume la API de GitHub usando `HttpModule` (Axios) o `fetch`, formatea el payload y maneja casos donde el usuario no exista (`404 Not Found`).

---

## 3. Manejo de Errores y Seguridad Esencial

- **Captura de Errores de GitHub**:
  - Si GitHub responde `404`, lanzar `NotFoundException('Usuario de GitHub no encontrado')`.
  - Si ocurre un error de rate limit o red, lanzar `BadGatewayException` o `InternalServerErrorException` con mensaje claro.
- **Respuesta Limpia (Sin Stack Trace)**:
  - No exponer el objeto de error crudo de Axios ni el stack trace en las respuestas HTTP al cliente.
  - Usar `Logger.error()` para imprimir errores internamente en consola.
- **CORS**: Habilitar CORS en `main.ts` (`app.enableCors()`) para permitir que el frontend en Next.js consulte la API sin bloqueos.

---

## 4. Calidad de Código y Tipado

- **DTO de Respuesta**: Definir interfaces o clases DTO claras para los datos mapeados (ej. `name`, `login`, `avatar_url`, `bio`, `public_repos`, `followers`, `following`, `html_url`, `location`, `company`).
- **Tipado Estricto**: No usar `any`. Tipar la respuesta de la API de GitHub y la respuesta formateada de NestJS.
