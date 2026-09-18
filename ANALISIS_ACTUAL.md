# POS Universal - Análisis de Ventanas (18/09/2026)

## Resumen

Análisis completo de las 9 pantallas del frontend: conexiones de navegación,
funcionalidades verificadas, botones muertos y huecos críticos identificados.

## Estado de Pantallas

| Pantalla | HTML | JS | Navegación | Funcional |
|---|---|---|---|---|
| login.html | ✅ | ✅ | → dashboard.html | ✅ |
| dashboard.html | ✅ | ✅ | 3 links reales, 3 muertos | ✅ |
| resumen.html | ✅ | ✅ | 12 links muertos, logout roto | ✅ (datos seed) |
| venta.html | ✅ | ✅ | Sin sidebar, Salir → dashboard | ✅ |
| completar-pago.html | ✅ | ✅ | → venta.html | ✅ |
| inventario.html | ✅ | ✅ | 12 links muertos | ✅ |
| nuevo-negocio.html | ✅ | ✅ | → dashboard.html | ✅ |
| apertura-caja.html | ✅ | ✅ | → dashboard.html | ✅ |
| cierre-caja.html | ✅ | ✅ | → dashboard.html | ✅ |

## Mapa de Navegación Real

```
login.html → dashboard.html
  dashboard.html ──[Entrar]──→ resumen.html
  dashboard.html ──[Crear nuevo]──→ nuevo-negocio.html → dashboard.html
  venta.html ──[COBRAR]──→ completar-pago.html → venta.html
  apertura-caja.html → dashboard.html
  cierre-caja.html → dashboard.html
```

**Todas las demás combinaciones** (sidebar links en resumen, dashboard, inventario): ❌ `href="#"`

## Dead Buttons / No-Funcionales por Pantalla

### dashboard.html
- Sidebar: Eventos, Formularios, Configuración — `href="#"`
- Search box topbar — sin handler
- Notification bell — sin handler
- User box dropdown — sin handler

### resumen.html
- **Logout BROKEN**: sidebar-footer sin `data-action="logout"` → app.js no lo detecta
- Todos los 11 nav items sidebar — `href="#"`
- Store selector, search, notification bell — sin handler
- Date filter — texto estático "Hoy · 12 de septiembre de 2026"

### venta.html (sin sidebar)
- **Logout completamente ausente** en toda la pantalla
- Modal Facturas: click en item → solo `alert()`, no carga datos

### inventario.html
- Todos los nav items sidebar (Dashboard, Ventas, Inventario, Clientes, Reportes, Configuración) — `href="#"`
- Notification bell — sin handler

### nuevo-negocio.html, apertura-caja.html, cierre-caja.html, completar-pago.html
- Logout **ausente** (no hay sidebar-footer en ninguna)

## Pantallas Referenciadas pero INEXISTENTES

Configuración, Reportes, Eventos, Formularios, Clientes, Proveedores, Compras, Gastos, Empleados, Dashboard (como pantalla separada).

## Huecos Críticos

| # | Gap | Impacto | Prioridad |
|---|-----|---------|-----------|
| 1 | Sin navegación entre pantallas (95% sidebar links son #) | Usuario no puede navegar | 🔴 |
| 2 | Logout roto en resumen.html | Usuario atrapado | 🔴 |
| 3 | Logout ausente en 5 pantallas | Sin cierre de sesión | 🔴 |
| 4 | Sin páginas Configuración y Reportes | Funcionalidad perdida | 🟠 |
| 5 | Sin gestión de usuarios UI | Admin no puede gestionar | 🟠 |
| 6 | Sidebar inconsistente (4 vs 12 vs 0 ítems) | UX fragmentada | 🟡 |
| 7 | KPIs resumen son estimados (*0.328, *82) | Datos no reales | 🟡 |
| 8 | Facturas modal: solo alert() | No reutilizar facturas | 🟡 |
| 9 | Sin timeout de sesión | Seguridad | 🟡 |
| 10 | Sin confirmación al eliminar producto | Riesgo de error | 🟢 |

## Funcionalidad Verificada ✅

- login.html: Login, registro, toggle forms ✅
- dashboard.html: Render negocios, eliminar con confirm, crear nuevo ✅
- resumen.html: KPIs renderizados, gráfica SVG, últimas ventas ✅ (datos semilla)
- venta.html: Buscar código, sugerencias, carrito, totales, descuento, cobrar, guardar ✅
- completar-pago.html: Métodos pago, cambio en vivo, confirmar/cancelar ✅
- inventario.html: Tabla, paginación, filtros, nuevo producto inline, calculadora ✅
- apertura-caja.html: Fondo, validación, guardar, redirect ✅
- cierre-caja.html: Desglose, totales, diferencia, alerta, guardar ✅

## Plan de Implementación (Priorizado)

1. Conectar sidebar links a pantallas existentes
2. Fix logout en resumen.html + agregar en todas las pantallas sin él
3. Crear páginas básicas Configuración y Reportes (stub)
4. Unificar sidebar a 12 ítems en todas las pantallas con navegación real
5. Dashboard/Reportes dinámicos (KPIs reales, gráfica con datos reales)
6. Reutilizar facturas desde modal (cargar en carrito)
7. Gestión de usuarios UI
