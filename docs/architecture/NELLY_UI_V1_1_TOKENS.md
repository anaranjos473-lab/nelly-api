# NELLY UI V1.1 - Tokens de Diseno

**Estado:** Propuesto  
**Ambito:** Plataforma web de Nelly  
**Fecha:** 2026-07-25

## 1. Objetivo

Definir las variables globales que gobiernan color, radio, sombra, espaciado y transicion en toda la UI de Nelly.

## 2. Principio

Los tokens viven una sola vez y se consumen en todos los componentes.
Las pantallas no deben redefinir valores basicos salvo excepcion justificada.

## 3. Tokens base

```css
:root {
  --nelly-color-primary: #f8b91b;
  --nelly-color-secondary: #6ea8fe;
  --nelly-color-success: #35f2c1;
  --nelly-color-warning: #ff9f66;
  --nelly-color-danger: #fb7185;

  --nelly-radius-sm: 14px;
  --nelly-radius-md: 18px;
  --nelly-radius-lg: 20px;

  --nelly-shadow-1: 0 12px 30px rgba(2, 6, 23, 0.22);
  --nelly-shadow-2: 0 24px 60px rgba(2, 6, 23, 0.35);

  --nelly-space-1: 0.25rem;
  --nelly-space-2: 0.5rem;
  --nelly-space-3: 0.75rem;
  --nelly-space-4: 1rem;
  --nelly-space-5: 1.5rem;
  --nelly-space-6: 2rem;

  --nelly-transition-fast: 160ms;
  --nelly-transition-normal: 240ms;
}
```

## 4. Regla de evolucion

Si un color, radio o sombra cambia, se cambia en el token y no en cada pantalla.

## 5. Criterio de calidad

La base de tokens es correcta si reduce duplicacion y mantiene consistencia entre Operaciones, Comercial, CRM, Admin, Cocina y Repartidor.
