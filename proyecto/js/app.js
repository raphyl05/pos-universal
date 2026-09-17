(function () {
  "use strict";

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return document.querySelectorAll(sel); }

  var PAGES_REQUIRE_LOGIN = [
    "dashboard.html", "resumen.html", "venta.html", "completar-pago.html",
    "inventario.html", "nuevo-producto.html", "apertura-caja.html", "cierre-caja.html"
  ];

  function getCurrentPage() {
    var path = window.location.pathname;
    return path.substring(path.lastIndexOf("/") + 1);
  }

  function requireLogin() {
    var page = getCurrentPage();
    if (page === "login.html") return;
    if (PAGES_REQUIRE_LOGIN.indexOf(page) === -1) return;
    if (!POS_DATA.isLoggedIn()) {
      window.location.replace("login.html");
    }
  }

  function highlightActiveNav() {
    var page = getCurrentPage();
    var pageMap = {
      "dashboard.html": "Dashboard",
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
      if (text === target) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }

  function renderUserInHeader() {
    var session = POS_DATA.getSession();
    if (!session) return;

    $$(".user-name").forEach(function (el) {
      if (el.textContent.trim() === "Raphy" || el.textContent.trim() === "Lissette Díaz") {
        el.textContent = session.nombre;
      }
    });
  }

  function handleLogout() {
    $$(".logout, [data-action='logout']").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        POS_DATA.logout();
        window.location.href = "login.html";
      });
    });
  }

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