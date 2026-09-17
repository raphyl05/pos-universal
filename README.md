# POS Universal

Sistema Punto de Venta (POS) multi-negocio.

## Stack CONFIRMADO (decisión del usuario, 16/09/2026)

| Capa | Tecnología |
|---|---|
| **Frontend** | HTML + CSS + **JavaScript (vanilla)** |
| **Backend** | **ASP.NET Core Web API** (.NET LTS) |
| **Base de datos** | **PostgreSQL** (con EF Core / Npgsql) |
| **Auth** | JWT + roles (a definir detalles) |
| **Futuro móvil** | Capacitor/Ionic o PWA (envuelven la web actual) |
| **Futuro escritorio** | Tauri o Electron (envuelven la web actual) |

Regla de oro: **la API es la fuente de verdad**; el frontend solo consume datos vía REST/JSON.
Así la misma app web podrá envolverse en móvil + escritorio sin rehacer la lógica.

## Estado del proyecto

> **Fase actual: FRONTEND DINÁMICO (maqueta estática terminada → funcional con JS).**
> Toda la maqueta HTML + CSS está optimizada y terminada. Ahora se conecta cada
> pantalla a `js/data.js` (modelo de datos) y `js/app.js` (shell/navegación).

## Plan Frontend Dinámico — Orden profesional

| # | Pantalla/Parte | Qué se hace | Depende de |
|---|---|---|---|
| **0** | **FUNDAMENTO** — `js/data.js` + `js/app.js` | Modelo de datos (negocios, productos, ventas), shell (menú activo, logout, navegación) | — |
| **1** | **Login** | Submit + validación simulada → redirige a `dashboard.html` | data.js |
| **2** | **Dashboard** | Render negocios desde data.js; "Entrar" → `resumen.html` | data.js, app.js |
| **3** | **Resumen** | KPIs dinámicos, gráfica SVG con datos, tabla últimas ventas | data.js, app.js |
| **4** | **Venta Pt.1** | Catálogo dinámico (render productos), filtros por categoría, pestañas activas | data.js |
| **5** | **Venta Pt.2** | Carrito funcional: add/remove/stepper, cálculo Subtotal+Descuento+Impuestos en vivo | Venta Pt.1 |
| **6** | **Completar Pago** | Recibido/Cambio calculados, métodos de pago, confirmar → crea venta | Venta Pt.2 |
| **7** | **Inventario** | Búsqueda, filtros (cat/estado/stock/proveedor), paginación, editar/ver/eliminar | data.js |
| **8** | **Nuevo Producto** | Formulario submit → persiste en localStorage/data.js, vista previa en vivo | data.js |
| **9** | **Apertura Caja** | Inputs de denominaciones recalculan subtotales + total automáticamente | data.js |
| **10** | **Cierre Caja** | Inputs de denominaciones recalculan subtotales + diferencia automáticamente | data.js |

### Principios arquitectónicos

- **Single source of truth**: todo dato vive en `js/data.js` (persistido en `localStorage` para simular backend)
- **`js/app.js`** = shell compartido: menú activo, sidebar, header, navegación, logout
- **Cada pantalla** solo tiene su lógica propia en un `<script>` al final del HTML (o archivo JS vinculado)
- **Sin librerías** — vanilla JS, como el stack confirmado
- **El frontend nunca modifica el HTML estático** — todo se renderiza desde data.js via JS

## Optimizaciones realizadas (17/09/2026)

Se resolvieron los 6 problemas identificados en `ANALISIS_ACTUAL.md`:

| Problema | Solución |
|---|---|
| **2. Accesibilidad menú móvil** | Checkbox oculto con `position: absolute; left: -10000px` (teclado accesible) en vez de `visibility: hidden` en 6 archivos CSS |
| **3. Desbordamiento modal pago** | Ya resuelto: `.modal` tiene `max-height` + `overflow-y: auto` |
| **4. Inconsistencias de datos** | Corregidos totales del carrito en `venta.html` (Subtotal RD$2,100, Descuento RD$0, Impuestos RD$350 = RD$2,450 total). Corregidos nombres OCR en `venta.html` y `completar-pago.html` |
| **5. Dependencias externas** | Eliminado FontAwesome CDN de `dashboard.html`. Todos los íconos ahora son SVG inline. Todos los avatares (`ui-avatars.com`) reemplazados por SVG data-URI inline en 6 archivos HTML |
| **6. Tokens CSS inconsistentes** | `resumen-style.css`: `--text-3` corregido de `#1F2937` → `#6B7280` (unificado con las otras 8 pantallas). `tokens.css` expandido con tokens compartidos adicionales |
| **7. Fuente Inter no cargada** | Añadido `@import` de Google Fonts Inter a `tokens.css` (importado por todos los CSS) |

## Estructura

```
POS-UNIVERSAL/
├── GUIA/                      # Solo imágenes de referencia/guía de diseño (sin código)
└── proyecto/
    ├── login.html             # Página de inicio de sesión
    ├── dashboard.html         # Dashboard: listado de negocios
    ├── resumen.html           # Resumen del negocio (KPI, gráfica, últimas ventas)
    ├── nuevo-negocio.html     # Formulario "Crear nuevo negocio"
    ├── cierre-caja.html       # Cierre de caja (resumen + conteo de denominaciones)
    ├── venta.html             # Pantalla de venta POS (catálogo + carrito)
    ├── inventario.html        # Inventario: listado de productos (tabla + filtros)
    ├── nuevo-producto.html    # Formulario "Nuevo producto" (alta de producto)
    ├── apertura-caja.html     # Apertura de caja (fondo inicial + denominaciones)
    ├── completar-pago.html   # Modal "Completar pago" sobre venta oscurecida
    ├── logo.jpg               # Logo real (única imagen usada por el código)
    ├── js/                    # ← Parte 0 + 1 completadas
    │   ├── data.js            # Modelo de datos: negocios, productos, ventas (localStorage)
    │   ├── app.js             # Shell: menú activo, logout, navegación global
    │   ├── login.js           # Login + registro (lógica específica del login)
    │   ├── venta.js         # Pantalla POS: catálogo dinámico, filtros, búsqueda, carrito funcional
    │   ├── dashboard.js       # Render dinámico de tarjetas de negocios desde data.js
    │   ├── resumen.js         # KPIs dinámicos, gráfica SVG, últimas ventas desde data.js
    │   └── nuevo-negocio.js   # Formulario "Crear nuevo negocio" (preview, guardado, redirect)
    └── css/
        ├── login-style.css          # Estilos del login
        ├── dashboard-style.css      # Estilos del dashboard
        ├── resumen-style.css        # Estilos del resumen del negocio
        ├── nuevo-negocio-style.css  # Estilos del formulario de nuevo negocio
        ├── cierre-caja-style.css    # Estilos del cierre de caja
        └── venta-style.css          # Estilos de la pantalla de venta
        └── inventario-style.css     # Estilos del inventario de productos
        └── nuevo-producto-style.css  # Estilos del formulario de nuevo producto
        └── apertura-caja-style.css   # Estilos de la apertura de caja
        └── completar-pago-style.css  # Estilos del modal de pago
```

## Cómo abrir

Abrir `proyecto/login.html` (o cualquier pantalla) con doble clic
(funciona vía `file://` gracias a las rutas relativas).

> **Durante la fase dinámica**, abrir `login.html` → la app renderiza
> datos desde `js/data.js` y navega entre pantallas vía `js/app.js`.
> Si el navegador bloquea localStorage en `file://`, servir con un
> servidor local (`npx serve proyecto` o similar).

Todas las pantallas usan iconos SVG en línea (Lucide/Feather) y avatares SVG inline → **funcionan offline**.

## Avance de la última sesión (16/09/2026)

Trabajado en el **frontend** únicamente (HTML y CSS). Cambios marcados en el código con `[opencode]`.

### Corregido
- **Logo roto** en `dashboard.html`: apuntaba a `logo.png` (inexistente) → ahora `logo.jpg`.
- **Typo** en `login.html`: "Authenticación" → "Iniciar sesión".
- **Ítem duplicado** "Negocios" en el sidebar del dashboard, eliminado.
- **Idioma mixto** en el sidebar: Events/Forms/Settings → Eventos/Formularios/Configuración.
- **Rutas absolutas** (`/css/...`, `/logo.jpg`) → **relativas** para soportar `file://`.
- `login-style.css`: colores hardcodeados → variables CSS en `:root`; eliminado bloque `.tagline` duplicado dentro del media query 768px.
- `dashboard-style.css`: colores de íconos (store/barber/shop) → variables `--icon-*`.
- **Menú móvil ahora funciona sin JS**: checkbox + `<label>` hamburguesa (☰/✕) que abre/cierra el sidebar en ≤768px vía `:checked`.

### Ventanas nuevas (según guía `GUIA/Dashboard.jpg`)
- **`resumen.html` + `css/resumen-style.css`**: panel "Resumen del negocio" (escritorio ≈1456×880).
  Sidebar índigo (12 ítems), header con selector de tienda/búsqueda/usuario, grid de KPIs
  (ventas hoy, ganancia, productos vendidos), "Productos más vendidos" (emojis), gráfica SVG de
  ventas, clientes atendidos y tabla "Últimas ventas". Iconos SVG en línea (Lucide/Feather), sin CDN.
  Cada siguiente ventana de la guía se puede pedir por descripción para continuar la serie.

### Ajustes finales a `resumen.html` (misma sesión, marcados `[opencode]`)
- **Marca = `logo.jpg` siempre**: el sidebar muestra el logo real como imagen (`height: 36px, width: auto`)
  en lugar del texto "POSUniversal"; también se quitó el texto del pie del sidebar (solo ícono de salida).
- **100% responsive** en `css/resumen-style.css`:
  - Escritorio (>1150px): grid de 4 columnas.
  - Tablets (≤1150px): sidebar 220px + grid reorganizado a 2 columnas.
  - ≤860px: sidebar fuera de pantalla y botón flotante hamburguesa ☰/✕ (truco checkbox, sin JS) que lo desliza desde la izquierda.
  - ≤600px: header apilado, buscador a ancho completo, grid de 1 columna, tabla con scroll horizontal, nombre de usuario oculto.
  - Valores con `clamp()`/`min()` y elementos largos truncados con ellipsis para evitar desbordes.

### Ventana nueva: `nuevo-negocio.html` + `css/nuevo-negocio-style.css` (17/09/2026)
- Pantalla "Crear nuevo negocio" (formulario 2 columnas: formulario | vista previa).
- Formulario con campos: nombre, tipo (select), dirección, teléfono, dueño, fecha activa desde.
- Vista previa en vivo del nombre y tipo mientras se escribe.
- Validación de teléfono: solo números y caracteres de formato (+ - ( ) ).
- Guarda en data.js → redirige a dashboard.html.
- Menú hamburguesa ☰/✕ funcional en móvil (CSS checkbox hack).

### Refactor Opción B — Consistencia de layout (17/09/2026)
- **`dashboard.html`**: reescrito con layout base `.app > .sidebar + .main` (antes: `.dashboard-container` con sidebar fijo). Ahora sigue el mismo patrón que resumen/nuevo-negocio.
- **`css/dashboard-style.css`**: reescrito con estructura consistente (`.app`, `.main`, `.topbar`, `.user-box`, `.content`). Añadido `@import url('tokens.css')`. Menú hamburguesa ☰/✕ funcional (checkbox hack).
- **`nuevo-negocio.html`**: añadido label de menú hamburguesa con clases `icon-open`/`icon-close`.
- **`css/nuevo-negocio-style.css`**: añadido CSS completo del menú hamburguesa (checkbox hack, `:checked`, `~` selector). Reemplaza el anterior `.sidebar.open`.
- Resultado: las 9 pantallas comparten el mismo patrón estructural base.

### Fixes aplicados (17/09/2026)
- **Errores visuales top-right en `nuevo-negocio.html`**: se añadió `.topbar-right { display: flex; align-items: center; gap: 16px; }` a `css/nuevo-negocio-style.css` para que search-box, campana y usuario se alineen horizontalmente.
- **Botón "Eliminar negocio" en dashboard**: cada tarjeta ahora incluye botón Eliminar con confirmación. Añadido `eliminarNegocio(id)` en `js/data.js` (con validación de tipo: ID debe ser entero positivo), `js/dashboard.js` (render + evento + confirmación), `css/dashboard-style.css` (estilos `.btn-delete`, `.card-actions`, `.error-msg`).
- **Validación de tipos de datos**: `registrarNegocio()` ahora verifica `typeof nombre === "string"`. `eliminarNegocio()` verifica `Number.isInteger(numId)`.
- **Seguridad**: `nuevo-negocio.html` añadido a `PAGES_REQUIRE_LOGIN` en `js/app.js` (requiere sesión activa).
- **Indentación corregida**: `<script>` tags en `dashboard.html` alineados consistentemente.

### Ventana nueva: `cierre-caja.html` + `css/cierre-caja-style.css` (16/09/2026)
- Pantalla "Cierre de caja" según guía (escritorio ≈1456×880): sidebar ≈270px blanco-humo, header ≈80px
  con buscador + usuario (Lissette Díaz / Administrador) con avatar y campana con punto rojo.
- Sidebar con brand de cuadrado índigo (glifo "P") + texto "POSUniversal", y menú diferenciado:
  "Caja" activo/expandido y sub-ítem "Cierres" activo indentado con conector tipo árbol (codo CSS).
  Sin botón de cerrar sesión (a diferencia de otras pantallas).
- Contenido en 2 columnas: tarjeta "Resumen de caja" (fondo inicial, ventas en efectivo, entradas,
  salidas, total esperado) + tabla de denominaciones (8 filas con inputs numéricos sin flechas
  `appearance:textfield` y subtotales) + tarjeta de "Total contado"/"Diferencia" con badge rojo.
- Barra inferior de acción: alerta (icono alert-circle, "Atención:" en negrita) + botón "Realizar cierre".
- Iconos SVG en línea (Lucide/Feather), sin CDN; avatar externo `ui-avatars.com` (placeholder).
- 100% responsive (mismo truco de checkbox sin JS): ≤1160px las columnas se apilan; ≤860px sidebar
  fuera de pantalla con botón flotante ☰/✕; ≤600px header en columna y barra de acción apilada.
- Nota `[opencode]` en el HTML: los subtotales de la guía venían con valores ilegibles de OCR;
   se usaron los montos correctos (20×2000 + 3×1000 + 1×500 = RD$ 43,500.00 = Total contado),
   que hacen consistente la diferencia de -RD$ 350.00 contra el total esperado de RD$ 43,850.00.

### Ventana nueva: `venta.html` + `css/venta-style.css` (16/09/2026)
- Pantalla "Venta #000184" (POS / punto de venta), escritorio ≈1456×880, según la guía.
  **Sin sidebar ni header global**: solo contenido sobre fondo gris azulado `#ECEFF3`.
- Encabezado de página: título "Venta #000184" (≈30px extrabold) + botón de tres puntos a la derecha.
- Layout 2 columnas: `grid-template-columns: minmax(0,1fr) 465px` con gap 24px.
- **Columna izquierda (catálogo)**: scrollbar vertical decorativa (thumb índigo ≈75% + track gris),
  buscador (lupa + placeholder "Buscar producto, código o escanear..."), pestañas de categoría
  ("Todos" activa con subrayado índigo bajo una línea divisoria, "Bebidas", "Alimentos", "Limpieza",
  "Cuidado personal", "Otros") y grid de productos de 5×3 (15 tarjetas con tile de emoji 68px,
  nombre 2 líneas, precio y "Stock: 120 und").
- **Columna derecha (carrito)**: tarjeta blanca, header "Carrito", 4 ítems (miniatura, nombre,
  botón eliminar rosa, stepper segmentado −/1/+, total de línea), sección de totales
  (Subtotal/Descuento/Impuestos), métodos de pago (Efectivo seleccionado con borde índigo,
  Tarjeta, Transferencia, Mixto), botón "Cobrar" índigo y "Guardar venta" secundario.
- Iconos SVG en línea (Lucide/Feather): search, more-horizontal, x, minus, plus, banknote,
  credit-card, landmark/bank, percent → sin CDN. Emojis nativos para productos/miniaturas.
- 100% responsive: 4 columnas ≥1320px→ menor, catálogo/carrito apilados ≤1080px, 3 columnas ≤860px,
  2 columnas ≤600px; pestañas con scroll horizontal en pantallas angostas.

### Ventana nueva: `inventario.html` + `css/inventario-style.css` (16/09/2026)
- Pantalla "Inventario → Productos" según la guía. Misma base que `cierre-caja.html`
  (sidebar ≈270px + header ≈80px + contenido sobre `#EEF0F3`).
- Sidebar: brand (glifo "P" + POSUniversal), Dashboard, Ventas, **Inventario activo/expandido**
  con sub-ítem "Productos" activo indentado y conector tipo árbol (codo gris), Clientes,
  Reportes, Configuración. Header sin búsqueda: avatar (ui-avatars), Lissette Díaz/Administrador
  y campana con punto rojo.
- Contenido:
  - Fila de título "Productos" + botones primario "＋ Nuevo producto" (navy) y secundario "Importar".
  - Fila de filtros: buscador ≈310px + 4 selects con etiqueta encima (Categoría "All" / Estado
    "Activo" / Stock "Low" / Proveedor "Distribuidora del Caribe", este último más ancho).
  - Tarjeta de tabla (8 columnas vía CSS grid con scroll horizontal en pantallas angostas):
    encabezado `#ECEEF2`, 5 filas con miniatura + nombre, precios, stock, pill de estado
    ("Activo" verde / "Bajo Stock" ámbar) y acciones (lápiz/ojos/basura 32×32).
  - Pie de tarjeta: paginación (chevron-left deshabilitado, página 1 activa navy, 2 y 3,
    ellipsis, chevron-right y chevrons-right) + "Mostrando 1-10 de 1,250 productos".
- Iconos SVG en línea (Lucide/Feather) sin CDN; chevron de los selects vía SVG de fondo en CSS.
- 100% responsive: ≤860px sidebar fuera de pantalla con botón hamburguesa ☰/✕; ≤600px filtros
  apilados y paginación en columna.

### Ventana nueva: `nuevo-producto.html` + `css/nuevo-producto-style.css` (16/09/2026)
- Pantalla "Nuevo producto" (formulario de alta) según la guía.
- Sidebar ≈250px fondo `#ECEEF2` con brand de glifo de llave índigo #3D4DB7 + "POSUniversal",
  menú de 12 ítems (Inicio, Ventas, **Productos activo** con fondo gris lavanda #DDE1EA,
  Inventario, Clientes, Proveedores, Compras, Gastos, Caja, Reportes, Empleados, Configuración)
  y pie con icono de salida + "POSUniversal".
- Header ≈90px blanco sin contenido a la izquierda: búsqueda ≈225px, campana, avatar 32px,
  "Raphy" + chevron-down.
- Contenido: H1 "Nuevo producto" y grid 2 columnas (1fr / 390px) con gap 24px.
- **Columna izquierda (formulario)**: tarjeta con 4 secciones separadas ≈28px:
  Información básica (Nombre/SKU/Código de barras 3 columnas; Categoría/Descripción 1fr:2fr con
  textarea enfocado borde índigo 1.5px y resize vertical), Precios (3 columnas), Inventario
  (3 columnas) y Proveedor (2 columnas). Selects con chevron-down de fondo, controles ≈44px.
- **Columna derecha**: tarjeta de vista previa (thumb 🥤 64px, nombre+SKU, precio bold 24px +
  pill "Activo", fila Estado/Stock), spacer flexible y tarjeta de acciones anclada abajo
  (`margin-top:auto`) con "Cancelar" (gris) y "Guardar producto" (índigo, flex mayor).
- Iconos SVG en línea sin CDN. 100% responsive: ≤1080px columnas apiladas; ≤860px menú
  hamburguesa ☰/✕; ≤600px formulario de 1 columna y búsqueda oculta.

### Ventana nueva: `apertura-caja.html` + `css/apertura-caja-style.css` (16/09/2026)
- Pantalla "Apertura de caja" según la guía. Base de estilo idéntica a `cierre-caja.html`.
- Sidebar ≈270px con brand (glifo "P" + POSUniversal) y menú: **Dashboard activo** con
  fondo lavanda y texto oscuro #1F2937 (variante `.active-soft`), Ventas, **Inventario
  colapsado con chevron-down**, Clientes, Reportes, **Caja activo** (página actual, lavanda
  + texto/ícono índigo #3A3F77, sin chevron ni sub-ítems) y Configuración.
- Header sin búsqueda: avatar (ui-avatars), Lissette Díaz/Administrador y campana con punto rojo.
- Contenido de ancho completo:
  - Fila de título "Apertura de caja" + metadatos (fecha | Cajero: Lissette Díaz).
  - Tarjeta "Fondo inicial": encabezado bold 18px, tabla de 8 denominaciones
    (grid `1fr / 330px / 1fr` con inputs numéricos centrados ≈325×36px sin flechas
    `appearance:textfield` y subtotales right-aligned) con encabezado `#ECEEF2`.
  - Tarjeta inferior: fila "Total de apertura" → "RD$ 10,500.00" bold 24px + botón
    full-width "Abrir caja" navy ≈44px.
  - Nota `[opencode]` en el HTML: la fila de RD$25 venía con subtotal "RD$ 250.00" (OCR);
     con cantidad 0 debe ser RD$ 0.00 (0×25=0), de modo que la columna suma exactamente
     RD$ 10,500.00 (consistente con el total de la tarjeta inferior).
- Iconos SVG en línea sin CDN. 100% responsive: ≤860px sidebar fuera de pantalla con botón
  hamburguesa ☰/✕; ≤600px columna central de inputs más angosta para no desbordar.

### Ventana nueva: `completar-pago.html` + `css/completar-pago-style.css` (16/09/2026)
- Modal "Completar pago" sobre una pantalla de venta simplificada (según la guía).
- **Capa de fondo (oscurecida)**: pantalla de venta simplificada: header con logo índigo
  #3D4DB7 + "POSUniversal", búsqueda con lupa, campana con punto rojo y usuario "Raphy";
  sidebar colapsado solo-iconos ≈80px con botón casa activo en lavanda; contenido con tarjeta
  "Producto" (2 ítems con thumb 48px + dos inputs blancos que se asoman) y tarjeta "Resumen de
  pago" (Efectivo/Tarjeta/Transferencia, divisor, Total, Total a pagar y botón "Confirmar pago").
- **Overlay**: `position:fixed; inset:0` fondo `rgba(15,23,42,0.45)` que oscurece todo.
- **Modal** (≈750px, radio 16px, sombra `0 20px 50px rgba(0,0,0,.30)`, padding 36px, centrado
  por flexbox): título "Completar pago" 27px extrabold; bloque "Total a pagar" → RD$ 2,450.00
  (34px bold); grid de 4 métodos de pago ≈155×115px (Efectivo **seleccionado** con fondo
  lavanda #E7E9F4 + borde índigo 2px, Tarjeta, Transferencia, Pago mixto); fila "Recibido"
  RD$ 3,000.00 / "Cambio" RD$ 550.00; botón primario "Confirmar pago" índigo #45499B con badge
  circular verde #2FAE62 (check blanco) solapado en su esquina superior derecha
  (`top:0; right:0; transform:translate(40%,-50%)`); botón secundario "Cancelar" (borde 1px).
- Iconos SVG en línea sin CDN. Responsive: métodos en 2 columnas / 1 columna en pantallas
  pequeñas; búsqueda y nombre ocultos en móvil.

### Revisión de la maqueta (16/09/2026) — hallazgos históricos

- CSS en "islas" (~350-400 líneas duplicadas por archivo) → futuro: `css/tokens.css` + `css/base.css` compartidos
- Tokens inconsistentes (`--text-3` diferente valor en distintos archivos) → ya corregido
- `Inter` declarada pero nunca cargada → ya corregido (added @import)
- Avatares `ui-avatars.com` y FontAwesome CDN → ya migrados a SVG inline
- Datos OCR hardcodeados pasan a `js/data.js` (productos ilegibles corregidos)
- Números inconsistentes del carrito → ya corregidos (consistentes con completar-pago RD$2,450)
- Sin `<script>`, todos `href="#"` → resuelto en fase JS

## Avance — Fase Frontend Dinámico (en progreso)

### Maqueta estática COMPLETADA (16-17/09/2026)
- 9 pantallas HTML + 10 archivos CSS optimizados
- Menú móvil accesible, dependencias externas eliminadas, tokens CSS unificados
- Datos corregidos y consistentes

### Frontend dinámico EN PROGRESO (desde 17/09/2026)
Trabajo por partes, en orden:
1. ✅ Planificación (este documento)
2. ✅ FUNDAMENTO: `js/data.js` + `js/app.js` → `fd05e85`
3. ✅ Login + Registro con roles (admin/cajero) → `de9a0fc`
4. ✅ Dashboard render dinámico → `09ae92b`
5. ✅ Resumen dinámico (KPIs, gráfica SVG, últimas ventas) → `0f4ec77`
6. ✅ Venta Pt.1 — catálogo dinámico, filtros, búsqueda → `eeec53f`
7. ✅ Venta Pt.2 — carrito funcional, totales en vivo → `07c01dd`
8. ⏳ Pago (métodos, validación) → Completar Pago → Inventario → Nuevo Producto → Apertura/Cierre Caja

## Próxima apertura — dónde continuar

> **Retomar con: Opción A — Pago**
> Validación de método de pago, procesamiento y guardado de venta.

## Control de versión

- **Repositorio:** `https://github.com/raphyl05/pos-universal.git`
- **Rama activa:** `main`
- **Último commit:** `0f4ec77` — `feat: resumen dinamico - KPIs, grafica SVG, ultimas ventas desde data.js`
- **Regla:** Git manual. Solo hacer commits cuando el usuario lo indique. Sugerir mensaje claro al terminar cada funcionalidad importante.

### Estructura JS comentada

| Archivo | Comentarios | Contenido |
|---|---|---|
| `proyecto/js/data.js` | Sección por sección (Persistencia, Getters, Auth, Sesión, CRUD) | Modelo: negocios, productos, ventas, usuarios, denominaciones + funciones auth |
| `proyecto/js/app.js` | Cada función documentada | Shell: verificación de sesión, navegación, menú activo, logout, render usuario |
| `proyecto/js/login.js` | Sección por sección (Referencias, Toggle, Login, Registro, Auto-redirect) | Lógica de login/registro: validación, creación de cuentas, sesión |
| `proyecto/js/dashboard.js` | Sección por sección (Iconos, Render, Escape, Init) | Render dinámico de tarjetas de negocios desde data.js |
| `proyecto/js/resumen.js` | Init (KPIs, Gráfica, Productos, Ventas) | KPIs dinámicos, gráfica SVG, productos más vendidos y últimas ventas desde data.js |
| `proyecto/js/nuevo-negocio.js` | Init (Preview, Guardar, Error) | Formulario "Crear nuevo negocio": preview en vivo, validación, guardado en data.js, redirect a dashboard |

---

## PROMPT MAESTRO — Forma de trabajo

Quiero que actúes como mi desarrollador senior, arquitecto de software y mentor de programación.

Tu objetivo es ayudarme a construir software REAL, FUNCIONAL y MANTENIBLE, pero también quiero aprender durante el proceso.

REGLAS DE TRABAJO:

1. ANTES DE PROGRAMAR
- Analiza primero el proyecto existente.
- Revisa la estructura de carpetas y archivos.
- Identifica las tecnologías utilizadas.
- No crees archivos innecesarios.
- No cambies tecnologías, arquitectura o dependencias sin consultarme.
- Si falta información importante, pregúntame antes de implementar.

2. NO HAGAS CAMBIOS GRANDES DE GOLPE
Trabaja en pequeñas etapas.
Cada etapa debe tener un objetivo claro.

Ejemplo:
FASE 1 → estructura
FASE 2 → interfaz
FASE 3 → lógica
FASE 4 → API
FASE 5 → base de datos
FASE 6 → pruebas

Después de cada etapa:
- Explícame qué hiciste.
- Dime qué archivos modificaste.
- Dime cómo probarlo.
- Espera mi confirmación antes de continuar cuando el cambio sea importante.

3. QUIERO APRENDER
No te limites a escribir código.
Cuando implementes algo importante, explícame brevemente:
- Qué estamos haciendo.
- Por qué lo hacemos.
- Qué problema resuelve.
- Cómo funciona.

No necesito explicaciones excesivamente largas.

4. RESPETA MI STACK
Usa únicamente las tecnologías que yo indique.

Si el proyecto utiliza:
- HTML
- CSS
- JavaScript
- ASP.NET Core
- PostgreSQL

no introduzcas otras tecnologías sin preguntarme primero.

5. CÓDIGO
- Escribe código limpio y sencillo.
- Prioriza legibilidad sobre complejidad.
- Evita sobreingeniería.
- No dupliques código innecesariamente.
- Usa nombres claros.
- Mantén cada archivo con una responsabilidad razonable.
- No agregues librerías si no son realmente necesarias.

6. ARCHIVOS EXISTENTES
Antes de modificar un archivo:
- Léelo completo si es necesario.
- Entiende cómo funciona.
- Conserva lo que ya funciona.
- No reemplaces código funcional simplemente para hacerlo "diferente".

7. ERRORES
Si encuentras un error:
1. Identifica la causa.
2. Explícame brevemente el problema.
3. Propón la solución.
4. Haz el cambio.
5. Comprueba que el problema quedó solucionado.

No ocultes errores ni los ignores.

8. SEGURIDAD
Nunca expongas:
- contraseñas
- API keys
- tokens
- secretos
- credenciales de base de datos

Si encuentras alguno en el código, avísame y propón una forma segura de manejarlo.

9. GIT
Quiero utilizar Git desde el principio.

Cuando terminemos una funcionalidad importante:
- dime qué cambió
- dime qué debería probar
- sugiere un mensaje de commit claro

No hagas commits automáticamente a menos que yo te lo indique.

10. TESTING
Siempre que sea razonable:
- prueba la funcionalidad
- verifica errores de compilación
- verifica errores de consola
- verifica que las rutas y dependencias funcionen

No me digas que algo funciona si no lo comprobaste.

11. CUANDO TE PIDA UNA FUNCIONALIDAD
No empieces inmediatamente a escribir cientos de líneas.

Primero responde:

OBJETIVO
Qué vamos a construir.

PLAN
Los pasos que seguiremos.

ARCHIVOS
Qué archivos probablemente tendremos que crear o modificar.

RIESGOS
Qué podría salir mal.

Después comienza la implementación.

12. SI EXISTE UNA FORMA MÁS SIMPLE
Dímela.

Quiero construir software profesional, pero no quiero complicar el proyecto innecesariamente.

13. SI MI IDEA TIENE UN PROBLEMA
No la implementes ciegamente.
Explícame el problema y propón una alternativa.

14. PRIORIDAD
Mi prioridad es:

FUNCIONALIDAD → SIMPLICIDAD → MANTENIBILIDAD → APRENDIZAJE

No quiero arquitectura excesivamente compleja para problemas pequeños.

15. FORMA DE COMUNICARTE
Háblame en español.

Sé directo y claro.
No asumas que conozco conceptos avanzados.

Cuando uses un concepto técnico nuevo, explícalo brevemente.

REGLA PRINCIPAL:

No quiero que simplemente programes por mí.

Quiero que trabajemos como:
YO = PRODUCT OWNER + APRENDIZ
TÚ = DESARROLLADOR SENIOR + MENTOR

Ayúdame a tomar buenas decisiones y a construir el proyecto paso a paso.