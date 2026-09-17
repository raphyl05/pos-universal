/*
 * dashboard.js — Render dinámico del Dashboard
 * Genera tarjetas de negocios desde POS_DATA.getNegocios().
 * Se ejecuta al cargar dashboard.html.
 */
(function () {
  "use strict";

  /* Íconos SVG por tipo de negocio */
  var ICONS = {
    Colmado: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><path d="M20 7l-8-4-8 4m16 0v10l-8 4m8-14L4 7m16 0L12 3m8 4l-8 4M4 7v10l8 4m8-14v10"/></svg>',
    Barbería: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>',
    Tienda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>'
  };

  /* Colores de ícono por tipo */
  var ICON_COLORS = {
    Colmado: "#3B7DD8",
    Barbería: "#D83B7A",
    Tienda: "#B8860B"
  };

  function $(sel) { return document.querySelector(sel); }

  /* Renderiza las tarjetas de negocios en .business-grid */
  function renderNegocios() {
    var grid = $(".business-grid");
    if (!grid) return;

    var negocios = POS_DATA.getNegocios();
    grid.innerHTML = "";

    negocios.forEach(function (n) {
      var iconColor = ICON_COLORS[n.tipo] || "#666";
      var iconSvg = ICONS[n.tipo] || ICONS.Colmado;
      /* Cambiar el color del stroke del SVG */
      iconSvg = iconSvg.replace('currentColor', iconColor);

      var card = document.createElement("div");
      card.className = "business-card";
      card.innerHTML =
        '<div class="card-header">' +
          '<div class="business-info">' +
            '<h3>' + escapeHtml(n.nombre) + '</h3>' +
            '<span class="business-type">' + escapeHtml(n.tipo) + '</span>' +
          '</div>' +
          '<div class="business-icon" style="color:' + iconColor + '">' + iconSvg + '</div>' +
        '</div>' +
        '<div class="card-footer">' +
          '<span class="status-badge ' + (n.estado === "Activo" ? "active" : "") + '">' + escapeHtml(n.estado) + '</span>' +
          '<button class="btn-enter" type="button">Entrar</button>' +
        '</div>';

      grid.appendChild(card);
    });

    /* Tarjeta "Crear nuevo negocio" al final */
    var createCard = document.createElement("div");
    createCard.className = "business-card create-new";
    createCard.innerHTML =
      '<div class="create-new-content">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
        '<span>Crear nuevo negocio</span>' +
      '</div>';
    grid.appendChild(createCard);
  }

  /* Escapar HTML para evitar inyección */
  function escapeHtml(text) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  /* Ejecutar al cargar */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    renderNegocios();
  }
})();