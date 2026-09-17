/*
 * data.js — Modelo de datos POSUniversal
 * Fuente única de verdad: negocios, productos, ventas, usuarios, denominaciones.
 * Persiste en localStorage. Funciones CRUD para productos y usuarios.
 * Expone window.POS_DATA si no es CommonJS.
 */
(function () {
  "use strict";

  /* --- Claves de almacenamiento --- */
  var STORAGE_KEY = "pos_universal_data";
  var SESSION_KEY = "pos_session";

  /* --- Datos iniciales (seed) --- */
  var seedData = {
    negocios: [
      { id: 1, nombre: "Colmado La Bendición", tipo: "Colmado", estado: "Activo", exento: false },
      { id: 2, nombre: "Raphy Barber Studio", tipo: "Barbería", estado: "Activo", exento: true },
      { id: 3, nombre: "Mi Tienda", tipo: "Tienda", estado: "Activo", exento: false }
    ],

    /* 12 productos: 5 del inventario + 7 del catálogo de venta */
    productos: [
      { id: 1, nombre: "Agua Cristal 1L", sku: "SKU12345", codigoBarras: "123445666789", categoria: "Bebidas", precioVenta: 75, precioCosto: 65, precioMayorista: 85, stock: 120, stockMinimo: 50, unidad: "und", proveedor: "Distribuidora del Caribe", referencia: "AGU-CR-1L", estado: "Activo", exento: false, icono: "💧" },
      { id: 2, nombre: "Arroz Selecto Campos 5lbs", sku: "SKU67890", codigoBarras: "678901234567", categoria: "Alimentos", precioVenta: 75, precioCosto: 50, precioMayorista: 65, stock: 120, stockMinimo: 30, unidad: "und", proveedor: "Distribuidora del Caribe", referencia: "ARR-SC-5L", estado: "Activo", exento: true, icono: "🍚" },
      { id: 3, nombre: "Sopa de Alimentos", sku: "SKU11111", codigoBarras: "111111111111", categoria: "Alimentos", precioVenta: 75, precioCosto: 45, precioMayorista: 60, stock: 120, stockMinimo: 20, unidad: "und", proveedor: "Distribuidora del Caribe", referencia: "SOP-AL-1U", estado: "Activo", exento: false, icono: "🍜" },
      { id: 4, nombre: "Limpiador Multiusos", sku: "SKU22222", codigoBarras: "222222222222", categoria: "Limpieza", precioVenta: 75, precioCosto: 40, precioMayorista: 55, stock: 120, stockMinimo: 20, unidad: "und", proveedor: "Distribuidora del Caribe", referencia: "LIM-MU-1U", estado: "Activo", exento: false, icono: "🧴" },
      { id: 5, nombre: "Coca-Cola 2L", sku: "SKU12345", codigoBarras: "123445666789", categoria: "Bebidas", precioVenta: 95, precioCosto: 65, precioMayorista: 85, stock: 250, stockMinimo: 50, unidad: "und", proveedor: "Distribuidora del Caribe", referencia: "COKE-DR-2L", estado: "Activo", exento: false, icono: "🥤" },
      { id: 6, nombre: "Pan de agua", sku: "SKU67890", codigoBarras: "678901234567", categoria: "Alimentos", precioVenta: 15, precioCosto: 8, precioMayorista: 12, stock: 150, stockMinimo: 40, unidad: "und", proveedor: "Distribuidora del Caribe", referencia: "PAN-AG-1U", estado: "Activo", exento: true, icono: "🍞" },
      { id: 7, nombre: "Leche Rica 1L", sku: "SKU54321", codigoBarras: "543210987654", categoria: "Lácteos", precioVenta: 70, precioCosto: 48, precioMayorista: 60, stock: 110, stockMinimo: 30, unidad: "und", proveedor: "Distribuidora del Caribe", referencia: "LEC-RC-1L", estado: "Activo", exento: false, icono: "🥛" },
      { id: 8, nombre: "Café Santo Domingo 1lb", sku: "SKU09876", codigoBarras: "098765432109", categoria: "Abarrotes", precioVenta: 350, precioCosto: 240, precioMayorista: 300, stock: 85, stockMinimo: 20, unidad: "und", proveedor: "Distribuidora Nacional", referencia: "CAF-SD-1L", estado: "Activo", exento: false, icono: "☕" },
      { id: 9, nombre: "Detergente Ariel 500g", sku: "SKU24680", codigoBarras: "246801357924", categoria: "Limpieza", precioVenta: 120, precioCosto: 85, precioMayorista: 100, stock: 40, stockMinimo: 15, unidad: "und", proveedor: "Distribuidora Nacional", referencia: "DET-AE-500", estado: "Bajo Stock", exento: false, icono: "🧴" },
      { id: 10, nombre: "Gel Personal 200ml", sku: "SKU33333", codigoBarras: "333333333333", categoria: "Cuidado personal", precioVenta: 75, precioCosto: 50, precioMayorista: 65, stock: 120, stockMinimo: 25, unidad: "und", proveedor: "Distribuidora del Caribe", referencia: "GEL-PD-200", estado: "Activo", exento: false, icono: "🧴" },
      { id: 11, nombre: "Arroz Selecto 200ml", sku: "SKU44444", codigoBarras: "444444444444", categoria: "Alimentos", precioVenta: 75, precioCosto: 50, precioMayorista: 65, stock: 120, stockMinimo: 25, unidad: "und", proveedor: "Distribuidora del Caribe", referencia: "ARR-SE-200", estado: "Activo", exento: true, icono: "🧀" },
      { id: 12, nombre: "Cuidado Personal Set", sku: "SKU55555", codigoBarras: "555555555555", categoria: "Cuidado personal", precioVenta: 75, precioCosto: 50, precioMayorista: 65, stock: 120, stockMinimo: 25, unidad: "und", proveedor: "Distribuidora del Caribe", referencia: "CPS-1S", estado: "Activo", exento: false, icono: "🧴" }
    ],

    ventas: [
      { id: 1, numero: "1220500", cliente: "Jona de Frnte", pago: "Domicilio", total: 250, estado: "Pagado" },
      { id: 2, numero: "1220302", cliente: "Calonda Innhez", pago: "Efectivo", total: 250, estado: "En espera" },
      { id: 3, numero: "1220302", cliente: "Colmado La Bendición", pago: "Efectivo", total: 250, estado: "Cancelado" },
      { id: 4, numero: "1220303", cliente: "Café Santo Domingo", pago: "Efectivo", total: 250, estado: "Cancelado" }
    ],

    /* 2 usuarios seed: admin (Administrador) y cajero1 (Cajero) */
    usuarios: [
      { id: 1, username: "admin", password: "admin123", nombre: "Raphy", rol: "Administrador", activo: true },
      { id: 2, username: "cajero1", password: "cajero123", nombre: "Lissette Díaz", rol: "Cajero", activo: true }
    ],

    denominaciones: [
      { denom: "RD$2,000", valor: 2000 },
      { denom: "RD$1,000", valor: 1000 },
      { denom: "RD$500", valor: 500 },
      { denom: "RD$200", valor: 200 },
      { denom: "RD$100", valor: 100 },
      { denom: "RD$25", valor: 25 },
      { denom: "RD$10", valor: 10 },
      { denom: "RD$1", valor: 1 }
    ]
  };

  /* --- Persistencia --- */

  /* Lee datos desde localStorage; retorna null si no existe o hay error */
  function loadFromStorage() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("[data.js] localStorage no disponible, usando datos iniciales.");
    }
    return null;
  }

  /* Escribe datos en localStorage */
  function saveToStorage(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("[data.js] No se pudo guardar en localStorage.", e);
    }
  }

  var _cache = null;

  /* Obtiene datos (cache en memoria, carga de localStorage si es primera vez) */
  function getData() {
    if (_cache) return _cache;
    var data = loadFromStorage();
    if (!data) {
      data = JSON.parse(JSON.stringify(seedData));
      saveToStorage(data);
    }
    _cache = data;
    return data;
  }

  /* Sobrescribe datos y persiste */
  function setData(data) {
    _cache = data;
    saveToStorage(data);
  }

  /* --- Getters de datos --- */
  function getNegocios() { return getData().negocios; }
  function getProductos() { return getData().productos; }
  function getVentas() { return getData().ventas; }
  function getDenominaciones() { return getData().denominaciones; }
  function getUsuarios() { return getData().usuarios; }

  function getUsuarioByUsername(username) {
    return getUsuarios().find(function (u) { return u.username === username; });
  }

  /* --- Auth: Registro ---
     Siempre asigna rol "Cajero". Retorna { error } o { exito, usuario }. */
  function registrarUsuario(username, password, nombre) {
    if (!username || !password || !nombre) return { error: "Todos los campos son obligatorios." };
    if (username.length < 3) return { error: "El nombre de usuario debe tener al menos 3 caracteres." };
    if (password.length < 4) return { error: "La contraseña debe tener al menos 4 caracteres." };
    if (getUsuarioByUsername(username)) return { error: "Ese nombre de usuario ya existe." };

    var data = getData();
    var nuevo = { id: Date.now(), username: username, password: password, nombre: nombre, rol: "Cajero", activo: true };
    data.usuarios.push(nuevo);
    setData(data);
    return { exito: true, usuario: nuevo };
  }

  /* --- Auth: Login ---
     Valida credenciales, crea sesión. Retorna { error } o { exito, usuario }. */
  function loginUsuario(username, password) {
    var user = getUsuarioByUsername(username);
    if (!user) return { error: "Usuario no encontrado." };
    if (user.password !== password) return { error: "Contraseña incorrecta." };
    if (!user.activo) return { error: "Usuario inactivo." };

    var sessionUser = { id: user.id, username: user.username, nombre: user.nombre, rol: user.rol };
    setSession(sessionUser);
    return { exito: true, usuario: sessionUser };
  }

  /* --- Sesión --- */
  function setSession(user) {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); }
    catch (e) { console.warn("[data.js] No se pudo guardar la sesión.", e); }
  }

  function getSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function clearSession() {
    try { localStorage.removeItem(SESSION_KEY); }
    catch (e) { console.warn("[data.js] No se pudo limpiar la sesión.", e); }
  }

  function isLoggedIn() { return getSession() !== null; }
  function isAdmin() { var s = getSession(); return s && s.rol === "Administrador"; }
  function logout() { clearSession(); }

  /* --- CRUD Usuarios --- */

  /* Elimina usuario. Bloquea si es el último admin o es el usuario activo. */
  function eliminarUsuario(id) {
    var data = getData();
    var usuario = data.usuarios.find(function (u) { return u.id === id; });
    if (!usuario) return { error: "Usuario no encontrado." };

    var admins = data.usuarios.filter(function (u) { return u.rol === "Administrador"; });
    if (usuario.rol === "Administrador" && admins.length <= 1) {
      return { error: "No se puede eliminar el último administrador." };
    }

    var session = getSession();
    if (session && session.id === id) {
      return { error: "No puedes eliminar tu propia cuenta mientras estás activo." };
    }

    data.usuarios = data.usuarios.filter(function (u) { return u.id !== id; });
    setData(data);
    return { exito: true };
  }

  /* --- CRUD Negocios --- */

  /* Registra un nuevo negocio. Retorna { error } o { exito, negocio }. */
  function registrarNegocio(nombre, tipo) {
    if (typeof nombre !== "string" || typeof tipo !== "string") {
      return { error: "Nombre y tipo deben ser texto." };
    }
    if (!nombre.trim() || !tipo.trim()) return { error: "Nombre y tipo son obligatorios." };
    if (getNegocios().some(function (n) { return n.nombre === nombre; })) {
      return { error: "Ese nombre de negocio ya existe." };
    }
    var data = getData();
    var nuevo = { id: Date.now(), nombre: nombre, tipo: tipo, estado: "Activo" };
    data.negocios.push(nuevo);
    setData(data);
    return { exito: true, negocio: nuevo };
  }

  /* Elimina negocio. Retorna { error } o { exito }. */
  function eliminarNegocio(id) {
    var numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) return { error: "ID de negocio inválido." };
    var data = getData();
    var negocio = data.negocios.find(function (n) { return n.id === numId; });
    if (!negocio) return { error: "Negocio no encontrado." };

    data.negocios = data.negocios.filter(function (n) { return n.id !== numId; });
    setData(data);
    return { exito: true };
  }

  function getNegocioById(id) {
    return getNegocios().find(function (n) { return n.id === Number(id); });
  }

  /* Reinicia todo a datos iniciales */
  function resetData() {
    _cache = null;
    localStorage.removeItem(STORAGE_KEY);
    clearSession();
    return getData();
  }

  /* --- Carrito de compras --- */
  var STORAGE_CART_KEY = "pos_cart";

  function getCart() {
    try {
      var raw = localStorage.getItem(STORAGE_CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function setCart(items) {
    try { localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(items)); }
    catch (e) { console.warn("[data.js] No se pudo guardar el carrito.", e); }
  }

  function addToCart(productId, quantity) {
    var numId = Number(productId);
    if (!Number.isInteger(numId) || numId <= 0) return { error: "ID de producto inválido." };
    var qty = (typeof quantity === "number" && Number.isInteger(quantity)) ? quantity : 1;
    var cart = getCart();
    var existing = cart.find(function (item) { return item.id === numId; });
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({ id: numId, quantity: qty });
    }
    setCart(cart);
    return { exito: true, cart: cart };
  }

  function updateCartPrice(productId, price) {
    var numId = Number(productId);
    if (!Number.isInteger(numId) || numId <= 0) return { error: "ID de producto inválido." };
    var p = Number(price);
    if (!Number.isFinite(p) || p < 0) return { error: "Precio inválido." };
    var cart = getCart();
    var existing = cart.find(function (item) { return item.id === numId; });
    if (existing) {
      existing.priceOverride = p;
    }
    setCart(cart);
    return { exito: true, cart: cart };
  }

  function removeFromCart(productId) {
    var numId = Number(productId);
    if (!Number.isInteger(numId) || numId <= 0) return { error: "ID de producto inválido." };
    var cart = getCart().filter(function (item) { return item.id !== numId; });
    setCart(cart);
    return { exito: true };
  }

  function updateCartQuantity(productId, quantity) {
    var numId = Number(productId);
    var qty = Number(quantity);
    if (!Number.isInteger(numId) || numId <= 0) return { error: "ID de producto inválido." };
    if (!Number.isInteger(qty) || qty < 0) return { error: "Cantidad inválida." };
    var cart = getCart();
    if (qty === 0) {
      cart = cart.filter(function (item) { return item.id !== numId; });
    } else {
      var existing = cart.find(function (item) { return item.id === numId; });
      if (existing) {
        existing.quantity = qty;
      } else {
        cart.push({ id: numId, quantity: qty });
      }
    }
    setCart(cart);
    return { exito: true, cart: cart };
  }

  function clearCart() {
    setCart([]);
    return { exito: true };
  }

  function calculateCart(discountPercent) {
    var cart = getCart();
    var products = getProductos();
    var subtotal = 0;
    var exempt = 0;
    var taxed = 0;
    cart.forEach(function (item) {
      var product = products.find(function (p) { return p.id === item.id; });
      if (product) {
        var price = item.priceOverride != null ? Number(item.priceOverride) : Number(product.precioVenta);
        var lineTotal = price * Number(item.quantity);
        subtotal += lineTotal;
        if (product.exento) {
          exempt += lineTotal;
        } else {
          taxed += lineTotal;
        }
      }
    });
    var discount = Number(discountPercent) || 0;
    var itbis = taxed * 0.18;
    var descuento = subtotal * discount / 100;
    var total = subtotal + itbis - descuento;
    return { subtotal: subtotal, descuento: descuento, exempt: exempt, taxed: taxed, itbis: itbis, total: total, items: cart.length };
  }

  /* Genera número de venta secuencial */
  function getNumeroVenta() {
    var sales = getVentas();
    var max = 0;
    sales.forEach(function (s) {
      var num = parseInt(String(s.numero));
      if (!isNaN(num) && num > max) max = num;
    });
    return (max + 1).toString();
  }

  /* Registra una venta. Retorna { error } o { exito, venta }.
     clientData: string (nombre) u objeto { nombre, telefono, cedula, direccion } */
  function registrarVenta(paymentMethod, discountPercent, clientData, estado) {
    var cart = getCart();
    var products = getProductos();
    if (cart.length === 0) return { error: "El carrito está vacío." };
    if (!paymentMethod) return { error: "Selecciona un método de pago." };

    var calc = calculateCart(discountPercent);
    var clientName = "Contado";
    if (clientData) {
      if (typeof clientData === "string") {
        clientName = clientData;
      } else if (typeof clientData === "object" && clientData.nombre) {
        clientName = clientData.nombre;
      }
    }

    var sale = {
      id: Date.now(),
      numero: getNumeroVenta(),
      cliente: clientName,
      clienteData: (typeof clientData === "object") ? clientData : null,
      pago: paymentMethod,
      subtotal: calc.subtotal,
      descuento: calc.descuento,
      itbis: calc.itbis,
      exempt: calc.exempt,
      taxed: calc.taxed,
      total: calc.total,
      fecha: new Date().toISOString(),
      estado: estado || "Pagado",
      productos: cart.map(function (item) {
        var product = products.find(function (p) { return p.id === item.id; });
        var price = item.priceOverride != null ? item.priceOverride : (product ? product.precioVenta : 0);
        return { id: item.id, quantity: item.quantity, price: price };
      })
    };

    var data = getData();
    data.ventas.push(sale);
    setData(data);
    clearCart();
    return { exito: true, venta: sale };
  }

  /* --- Exportación --- */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      getData: getData, setData: setData,
      getNegocios: getNegocios, getProductos: getProductos, getVentas: getVentas, getDenominaciones: getDenominaciones,
      getUsuarios: getUsuarios, getUsuarioByUsername: getUsuarioByUsername,
      registrarNegocio: registrarNegocio, getNegocioById: getNegocioById,
      eliminarNegocio: eliminarNegocio,
      registrarUsuario: registrarUsuario, loginUsuario: loginUsuario,
      setSession: setSession, getSession: getSession, clearSession: clearSession,
      isLoggedIn: isLoggedIn, isAdmin: isAdmin, logout: logout,
      eliminarUsuario: eliminarUsuario, resetData: resetData,
      getCart: getCart, addToCart: addToCart, removeFromCart: removeFromCart,
      updateCartQuantity: updateCartQuantity, updateCartPrice: updateCartPrice, clearCart: clearCart, calculateCart: calculateCart,
      registrarVenta: registrarVenta
    };
  } else {
    window.POS_DATA = {
      getData: getData, setData: setData,
      getNegocios: getNegocios, getProductos: getProductos, getVentas: getVentas, getDenominaciones: getDenominaciones,
      getUsuarios: getUsuarios, getUsuarioByUsername: getUsuarioByUsername,
      registrarNegocio: registrarNegocio, getNegocioById: getNegocioById,
      eliminarNegocio: eliminarNegocio,
      registrarUsuario: registrarUsuario, loginUsuario: loginUsuario,
      setSession: setSession, getSession: getSession, clearSession: clearSession,
      isLoggedIn: isLoggedIn, isAdmin: isAdmin, logout: logout,
      eliminarUsuario: eliminarUsuario, resetData: resetData,
      getCart: getCart, addToCart: addToCart, removeFromCart: removeFromCart,
      updateCartQuantity: updateCartQuantity, updateCartPrice: updateCartPrice, clearCart: clearCart, calculateCart: calculateCart,
      registrarVenta: registrarVenta
    };
  }
})();