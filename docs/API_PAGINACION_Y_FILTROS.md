# Documentación rápida de paginación y filtros

## Usuarios (GET /api/users)
- **Paginación:**
  - `page` (opcional, default 1): número de página
  - `limit` (opcional, default 10): cantidad de resultados por página
- **Filtro:**
  - `email`: filtra por email exacto
- **Ejemplo:**
  - `/api/users?page=2&limit=5&email=alguien@mail.com`
- **Respuesta:**
```json
{
  "users": [ ... ],
  "total": 17,
  "page": 2,
  "limit": 5
}
```

## Órdenes (GET /api/orders)
- **Paginación:**
  - `page` (opcional, default 1)
  - `limit` (opcional, default 10)
- **Filtro:**
  - `userId`: filtra por id de usuario
- **Ejemplo:**
  - `/api/orders?page=1&limit=20&userId=abc123`
- **Respuesta:**
```json
{
  "orders": [ ... ],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

## Notas
- Todos los endpoints requieren JWT válido en el header Authorization: Bearer <token>.
- Si no se especifica filtro, devuelve todos los registros paginados.
