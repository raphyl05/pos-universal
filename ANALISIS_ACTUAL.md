# POS Universal - Análisis de Ventanas (18/09/2026)

## Resumen

Análisis completo de las 9 pantallas del frontend: conexiones de navegación,
funcionalidades verificadas, botones muertos y huecos críticos identificados.

**Prioridad 1 (conectar sidebar links + fix logout) COMPLETADO** ✅ — commit `f2eb6ea`

## Estado de Pantallas (actualizado 18/09/2026)

| Pantalla | HTML | JS | Navegación | Logout | Funcional |
|---|---|---|---|---|---|
| login.html | ✅ | ✅ | → dashboard.html | N/A | ✅ |
| dashboard.html | ✅ | ✅ | ✅ 4 links | ✅ sidebar-footer | ✅ |
| resumen.html | ✅ | ✅ | ✅ 12 links | ✅ sidebar-footer | ✅ (datos seed) |
| venta.html | ✅ | ✅ | Sin sidebar | ✅ header button | ✅ |
| completar-pago.html | ✅ | ✅ | Modal overlay | N/A | ✅ |
| inventario.html | ✅ | ✅ | ✅ 6 links | ✅ sidebar-footer | ✅ |
| nuevo-negocio.html | ✅ | ✅ | ✅ 4 links | ✅ sidebar-footer | ✅ |
| apertura-caja.html | ✅ | ✅ | ✅ 7 links | ✅ sidebar-footer | ✅ |
| cierre-caja.html | ✅ | ✅ | ✅ 8 links | ✅ sidebar-footer | ✅ |

## Mapa de Navegación Real (18/09/2026)

```
login.html → dashboard.html
  dashboard.html ──[Negocios]──→ dashboard.html (self)
  dashboard.html ──[Eventos]──→ resumen.html
  dashboard.html ──[Formularios]──→ nuevo-negocio.html
  dashboard.html ──[Configuración]──→ dashboard.html (stub future)
  resumen.html ──[Inicio]──→ resumen.html (self)
  resumen.html ──[Ventas]──→ venta.html
  resumen.html ──[Productos]──→ inventario.html
  resumen.html ──[Inventario]──→ inventario.html
  resumen.html ──[Clientes]──→ inventario.html
  resumen.html ──[Proveedores]──→ inventario.html
  resumen.html ──[Compras]──→ dashboard.html
  resumen.html ──[Empleados]──→ dashboard.html
  resumen.html ──[Gastos]──→ dashboard.html
  resumen.html ──[Caja]──→ apertura-caja.html
  resumen.html ──[Reportes]──→ dashboard.html
  resumen.html ──[Configuración]──→ dashboard.html
  venta.html ──[Salir]──→ dashboard.html
  venta.html ──[Logout]──→ login.html
  inventario.html ──[Dashboard]──→ dashboard.html
  inventario.html ──[Ventas]──→ venta.html
  inventario.html ──[Inventario/Productos]──→ inventario.html (self)
  inventario.html ──[Clientes]──→ inventario.html
  inventario.html ──[Reportes]──→ dashboard.html
  inventario.html ──[Configuración]──→ dashboard.html
  nuevo-negocio.html ──[Negocios]──→ dashboard.html
  nuevo-negocio.html ──[Eventos]──→ resumen.html
  nuevo-negocio.html ──[Formularios]──→ nuevo-negocio.html (self)
  nuevo-negocio.html ──[Configuración]──→ dashboard.html
  apertura-caja.html ──[Dashboard]──→ dashboard.html
  apertura-caja.html ──[Ventas]──→ venta.html
  apertura-caja.html ──[Inventario]──→ inventario.html
  apertura-caja.html ──[Clientes]──→ inventario.html
  apertura-caja.html ──[Reportes]──→ dashboard.html
  apertura-caja.html ──[Caja]──→ cierre-caja.html
  apertura-caja.html ──[Configuración]──→ dashboard.html
  cierre-caja.html ──[Dashboard]──→ dashboard.html
  cierre-caja.html ──[Ventas]──→ venta.html
  cierre-caja.html ──[Inventario]──→ inventario.html
  cierre-caja.html ──[Clientes]──→ inventario.html
  cierre-caja.html ──[Reportes]──→ dashboard.html
  cierre-caja.html ──[Caja]──→ dashboard.html
  cierre-caja.html ──[Cierres]──→ apertura-caja.html
  cierre-caja.html ──[Configuración]──→ dashboard.html
```

## Dead Buttons / No-Funcionales restantes

### dashboard.html
- Sidebar: Configuración → dashboard.html (stub future)
- Search box topbar — sin handler
- Notification bell — sin handler
- User box dropdown — sin handler

### resumen.html
- Store selector, search, notification bell — sin handler
- Date filter — texto estático "Hoy · 12 de septiembre de 2026"

### venta.html
- Sin sidebar → no sidebar links needed (Salir + Logout in header ✅)
- Modal Facturas: click en item → solo `alert()`, no carga datos

### inventario.html
- Notification bell — sin handler
- Search/filter inputs in `.filters` row — ⚠️ verify in inventario.js

### nuevo-negocio.html, apertura-caja.html, cierre-caja.html
- Sidebar links point to dashboard.html for non-existent pages (safe default)

### completar-pago.html
- Modal overlay — Salir/Cancelar → venta.html ✅
- Background bg-nav — decorative only ✅

## Pantallas Referenciadas pero INEXISTENTES (future work)

Configuración (full page), Reportes (full page), Clientes, Proveedores, Compras, Gastos, Empleados as standalone pages.

## Huecos Críticos (después de Prioridad 1)

| # | Gap | Impacto | Prioridad |
|---|-----|---------|-----------|
| 1 | Sin páginas Configuración y Reportes | Funcionalidad perdida | 🟠 Alta |
| 2 | Sin gestión de usuarios UI | Admin no puede gestionar | 🟠 Alta |
| 3 | Sin navegación backend (API REST) | Solo localStorage | 🟠 Alta |
| 4 | Sidebar inconsistente (4 vs 12 vs 6 vs 8 vs 4 ítems) | UX fragmentada | 🟡 Media |
| 5 | KPIs resumen son estimados (*0.328, *82) | Datos no reales | 🟡 Media |
| 6 | Facturas modal: solo alert() | No reutilizar facturas | 🟡 Media |
| 7 | Sin timeout de sesión | Seguridad | 🟡 Media |
| 8 | Sin confirmación al eliminar producto (inventario) | Riesgo de error | 🟢 Baja |

## Funcionalidad Verificada ✅

- login.html: Login, registro, toggle forms ✅
- dashboard.html: Render negocios, eliminar con confirm, crear nuevo ✅, **navegación ✅, logout ✅**
- resumen.html: KPIs renderizados, gráfica SVG, últimas ventas ✅, **navegación ✅, logout fix ✅**
- venta.html: **Logout ✅**, Buscar código, sugerencias, carrito, totales, descuento, cobrar, guardar ✅
- completar-pago.html: Métodos pago, cambio en vivo, confirmar/cancelar ✅
- inventario.html: Tabla, paginación, filtros, nuevo producto inline, calculadora ✅, **navegación ✅, logout ✅**
- apertura-caja.html: Fondo, validación, guardar, redirect ✅, **navegación ✅, logout ✅**
- cierre-caja.html: Desglose, totales, diferencia, alerta, guardar ✅, **navegación ✅, logout ✅**

## Plan de Implementación

### ✅ Completado (18/09/2026) — Prioridad 1
1. Conectar sidebar links a pantallas existentes (41 links)
2. Fix logout en resumen.html + agregar en 6 pantallas sin él
3. Agregar .sidebar-footer CSS a apertura-caja, inventario, cierre-caja
4. Agregar logout button + CSS a venta.html header

### ⏭️ Siguiente (pending)
5. Crear páginas Configuración y Reportes (stub)
6. Unificar sidebar en todas las pantallas
7. Dashboard/Reportes dinámicos (KPIs reales, gráfica con datos reales)
8. Reutilizar facturas desde modal (cargar en carrito)
9. Gestión de usuarios UI
10. Conectar todas las pantallas al backend (API REST)