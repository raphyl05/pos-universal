/*
 * app.js — Shell POSUniversal
 * Verificación de sesión, navegación, menú activo, logout, render de usuario.
 * Se ejecuta al cargar en las 9 pantallas protegidas.
 */
(function () {
  "use strict";

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return document.querySelectorAll(sel); }

  /* Páginas que requieren sesión activa */
  var PAGES_REQUIRE_LOGIN = [
    "dashboard.html", "resumen.html", "venta.html", "completar-pago.html",
    "inventario.html", "nuevo-producto.html", "apertura-caja.html", "cierre-caja.html"
  ];

  /* Obtiene el nombre del archivo actual */
  function getCurrentPage() {
    var path = window.location.pathname;
    return path.substring(path.lastIndexOf("/") + 1);
  }

  /* Redirige a login si no hay sesión en página protegida */
  function requireLogin() {
    var page = getCurrentPage();
    if (page === "login.html") return;
    if (PAGES_REQUIRE_LOGIN.indexOf(page) === -1) return;
    if (!POS_DATA.isLoggedIn()) {
      window.location.replace("login.html");
    }
  }

  /* Marca como activo el ítem del sidebar que coincide con la página actual */
  function highlightActiveNav() {
    var page = getCurrentPage();
    var pageMap = {
      "dashboard.html": "Negocios",
      "resumen.html": "Inicio",
      "venta.html": "Ventas",
      "completar-pago.html": "Ventas",
      "inventario.html": "Inventario",
      "nuevo-producto.html": "Productos",
      "apertura-caja.html": "Caja",
      "cierre-caja.html": "Caja"
    };

    var target = pageMap[page];
    if (!target) return;

    $$(".nav-item").forEach(function (item) {
      var span = item.querySelector("span");
      var text = span ? span.textContent.trim() : "";
      if (text === target) item.classList.add("active");
      else item.classList.remove("active");
    });
  }

  /* Actualiza el nombre del usuario en el header (reemplaza "Raphy"/"Lissette Díaz") */
  function renderUserInHeader() {
    var session = POS_DATA.getSession();
    if (!session) return;

    $$(".user-name").forEach(function (el) {
      if (el.textContent.trim() === "Raphy" || el.textContent.trim() === "Lissette Díaz") {
        el.textContent = session.nombre;
      }
    });
  }

  /* Agrega evento de logout a botones con clase "logout" o data-action="logout" */
  function handleLogout() {
    $$(".logout, [data-action='logout']").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        POS_DATA.logout();
        window.location.href = "login.html";
      });
    });
  }

  /* Intercepta enlaces de navegación interna (evita #) */
  function handleNavLinks() {
    $$("a.nav-item").forEach(function (link) {
      var href = link.getAttribute("href");
      if (href && href !== "#" && !href.startsWith("http")) {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          window.location.href = href;
        });
      }
    });
  }

  /* Botones "Entrar" del dashboard → redirigen a resumen.html */
  function handleDashboardEnter() {
    $$(".btn-enter").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.location.href = "resumen.html";
      });
    });
  }

  function init() {
    requireLogin();
    highlightActiveNav();
    handleLogout();
    handleNavLinks();
    handleDashboardEnter();
    renderUserInHeader();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();