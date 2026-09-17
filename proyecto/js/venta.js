/*
 * venta.js — Pantalla POS: catálogo dinámico de productos
 * Render productos desde POS_DATA.getProductos(), filtros por categoría,
 * búsqueda en vivo y pestañas activas.
 * Se ejecuta al cargar venta.html.
 */
(function () {
  "use strict";

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return document.querySelectorAll(sel); }

  var activeCategory = "Todos";
  var searchTerm = "";

  /* Categorías disponibles en las pestañas */
  var TAB_CATEGORIES = ["Todos", "Bebidas", "Alimentos", "Limpieza", "Cuidado personal"];

  /* Renderizar grid de productos según categoría y búsqueda */
  function renderProducts() {
    var grid = $(".product-grid");
    if (!grid) return;

    var productos = POS_DATA.getProductos();

    var filtered = productos.filter(function (p) {
      var matchCategory;
      if (activeCategory === "Todos") {
        matchCategory = true;
      } else if (TAB_CATEGORIES.indexOf(activeCategory) !== -1) {
        matchCategory = p.categoria === activeCategory;
      } else {
        matchCategory = p.categoria !== "Bebidas" && p.categoria !== "Alimentos" &&
                        p.categoria !== "Limpieza" && p.categoria !== "Cuidado personal";
      }

      var matchSearch = true;
      if (searchTerm) {
        var term = searchTerm.toLowerCase();
        matchSearch = p.nombre.toLowerCase().indexOf(term) !== -1 ||
                      (p.sku && p.sku.toLowerCase().indexOf(term) !== -1) ||
                      (p.categoria && p.categoria.toLowerCase().indexOf(term) !== -1);
      }

      return matchCategory && matchSearch;
    });

    grid.innerHTML = "";

    if (filtered.length === 0) {
      var empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "No se encontraron productos.";
      grid.appendChild(empty);
      return;
    }

    filtered.forEach(function (p) {
      var card = document.createElement("article");
      card.className = "product-card";
      card.innerHTML =
        '<div class="thumb"><span>' + escapeHtml(p.icono || "📦") + '</span></div>' +
        '<h3 class="p-name">' + escapeHtml(p.nombre) + '</h3>' +
        '<p class="p-price">RD$ ' + Number(p.precioVenta).toFixed(2) + '</p>' +
        '<p class="p-stock">Stock: ' + Number(p.stock) + ' ' + escapeHtml(p.unidad || "und") + '</p>';
      grid.appendChild(card);
    });
  }

  /* Escapar HTML para evitar inyección */
  function escapeHtml(text) {
    if (!text) return "";
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  /* Pestañas: cambiar categoría activa y re-renderizar */
  function initTabs() {
    var tabs = $$(".tab");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.classList.remove("active"); });
        tab.classList.add("active");
        activeCategory = tab.textContent.trim();
        renderProducts();
      });
    });
  }

  /* Buscador: filtrar en vivo */
  function initSearch() {
    var input = $(".search-box input");
    if (!input) return;
    input.addEventListener("input", function () {
      searchTerm = input.value.trim();
      renderProducts();
    });
  }

  function init() {
    renderProducts();
    initTabs();
    initSearch();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
