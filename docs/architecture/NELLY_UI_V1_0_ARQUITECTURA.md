# NELLY UI V1.0 - Arquitectura de Carpetas y Componentes

**Estado:** Propuesta implementable  
**Ambito:** Web publica de Nelly  
**Fecha:** 2026-07-25

## 1. Objetivo

Definir una arquitectura simple y reutilizable para que la UI de Nelly crezca por componentes y no por paginas aisladas.

## 2. Estructura propuesta

```text
public/
  styles/
    nelly-design.css
    tokens.css
    themes.css
    components/
      button.css
      card.css
      table.css
      modal.css
      sidebar.css
      navbar.css
      badge.css
      kpi.css
      chart.css
      timeline.css
      map.css
      forms.css
```

## 3. Responsabilidad de cada capa

### 3.1 `tokens.css`

Mantiene variables base de color, sombra, radio y tipografia.

### 3.2 `themes.css`

Expone alias por dominio para no duplicar decisiones visuales entre paneles.

### 3.3 `nelly-design.css`

Orquesta el sistema visual general:

- base tipografica;
- fondo y atmosfera;
- superficies;
- espaciado;
- utilidades comunes;
- estados de foco y accesibilidad.

### 3.4 `components/*.css`

Cada archivo contiene el lenguaje minimo de un componente reusable.

## 4. Regla de uso

- Las paginas consumen primero la base comun.
- Los componentes no deben redefinir tokens.
- Las diferencias por dominio deben vivir como variantes, no como estilos separados.

## 5. Orden de adopcion

1. base visual y tokens;
2. card, button, badge y kpi;
3. estados unificados;
4. forms y tables;
5. navbar, sidebar y modal;
6. timeline, chart y map;
7. patrones de dominio;
8. migracion progresiva de paneles.

## 6. Criterio de calidad

La arquitectura es correcta si:

- reduce CSS duplicado;
- permite mantener identidad visual comun;
- evita decisiones ad hoc dentro de cada pagina;
- facilita replicar la UI en Android despues.

## 7. Nota de estrategia

La fase actual prioriza consolidar la base reutilizable antes de seguir moviendo pantallas una por una.
La madurez del sistema se mide por la consistencia de los estados, no solo por la apariencia de cada panel.
