(function () {
  "use strict";

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return document.querySelectorAll(sel); }

  function getCurrentPage() {
    var path = window.location.pathname;
    var file = path.substring(path.lastIndexOf("/") + 1);
    if (!file) return "dashboard.html";
    return file;
  }

  function highlightActiveNav() {
    var page = getCurrentPage();
    var pageMap = {
      "login.html": null,
      "dashboard.html": "dashboard",
      "resumen.html": "inicio",
      "venta.html": "ventas",
      "completar-pago.html": "ventas",
      "inventario.html": "inventario",
      "nuevo-producto.html": "productos",
      "apertura-caja.html": "caja",
      "cierre-caja.html": "caja"
    };

    var target = pageMap[page];
    if (!target) return;

    $$(".nav-item").forEach(function (item) {
      var span = item.querySelector("span");
      var text = span ? span.textContent.trim().toLowerCase() : "";
      if (text === target) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }

  function handleLogout() {
    $$(".logout, [data-action='logout']").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
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

  function formatMoney(value) {
    return "RD$ " + value.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function parseMoney(str) {
    if (!str) return 0;
    var cleaned = String(str).replace(/[RD$,\s]/g, "").replace(/\./g, "");
    var num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  function renderAvatar(initials, color, size) {
    size = size || 32;
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='" + size + "' height='" + size + "' viewBox='0 0 " + size + " " + size + "'%3E%3Ccircle cx='" + (size / 2) + "' cy='" + (size / 2) + "' r='" + (size / 2) + "' fill='" + encodeURIComponent(color) + "'/%3E%3Ctext x='" + (size / 2) + "' y='" + (size * 0.72) + "' text-anchor='middle' fill='%23fff' font-size='" + (size * 0.42) + "' font-weight='600' font-family='system-ui'%3E" + encodeURIComponent(initials) + "%3C/text%3E%3C/svg%3E";
  }

  function init() {
    highlightActiveNav();
    handleLogout();
    handleNavLinks();
    handleDashboardEnter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { init: init, formatMoney: formatMoney, parseMoney: parseMoney, renderAvatar: renderAvatar, getCurrentPage: getCurrentPage };
  } else {
    window.POS_APP = {
      init: init,
      formatMoney: formatMoney,
      parseMoney: parseMoney,
      renderAvatar: renderAvatar,
      getCurrentPage: getCurrentPage
    };
  }
})();