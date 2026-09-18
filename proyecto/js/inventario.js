(function () {
  "use strict";

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return document.querySelectorAll(sel); }

  /* ===== Estado ===== */
  var currentPage = 1;
  var itemsPerPage = 10;
  var editingId = null;
  var allFiltered = [];

  /* ===== Utilidades ===== */
  function escapeHtml(text) {
    if (!text) return "";
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  function formatPrice(value) {
    return "RD$ " + Number(value).toFixed(2);
  }

  /* ===== Renderizar tabla ===== */
  function renderTable() {
    var tableBody = $(".table-scroll");
    if (!tableBody) return;

    var filtered = getFilteredProducts();
    allFiltered = filtered;
    var totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;

    var start = (currentPage - 1) * itemsPerPage;
    var pageItems = filtered.slice(start, start + itemsPerPage);

    tableBody.innerHTML = "";

    if (pageItems.length === 0) {
      var empty = document.createElement("div");
      empty.style.padding = "40px";
      empty.style.textAlign = "center";
      empty.style.color = "var(--text-3)";
      empty.style.fontSize = "15px";
      empty.textContent = "No se encontraron productos.";
      tableBody.appendChild(empty);
      renderPagination(totalPages);
      updatePageInfo(filtered.length);
      return;
    }

    pageItems.forEach(function (p) {
      var row = document.createElement("div");
      row.className = "table-row";
      var pillClass = p.estado === "Bajo Stock" ? "pill-warn" : "pill-ok";
      var icon = p.icono || "📦";
      row.innerHTML =
        '<div class="col-producto product-cell">' +
          '<span class="p-thumb" aria-hidden="true">' + escapeHtml(icon) + '</span>' +
          '<span class="p-name">' + escapeHtml(p.nombre) + '</span>' +
        '</div>' +
        '<span class="cell-text">' + escapeHtml(p.sku || "") + '</span>' +
        '<span class="cell-text">' + escapeHtml(p.categoria || "") + '</span>' +
        '<span class="cell-text strong">' + formatPrice(p.precioVenta) + '</span>' +
        '<span class="cell-text">' + formatPrice(p.precioCosto) + '</span>' +
        '<span class="cell-text">' + p.stock + " " + escapeHtml(p.unidad || "und") + '</span>' +
        '<span class="cell-text"><span class="pill ' + pillClass + '">' + escapeHtml(p.estado || "Activo") + '</span></span>' +
        '<div class="col-acciones actions">' +
          '<button class="action-btn" type="button" aria-label="Editar" data-action="edit" data-id="' + p.id + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>' +
          '</button>' +
          '<button class="action-btn" type="button" aria-label="Eliminar" data-action="delete" data-id="' + p.id + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
          '</button>' +
        '</div>';
      tableBody.appendChild(row);
    });

    renderPagination(totalPages);
    updatePageInfo(filtered.length);
  }

  /* ===== Paginación ===== */
  function renderPagination(totalPages) {
    var pagination = $(".pagination");
    if (!pagination) return;
    pagination.innerHTML = "";

    var prevBtn = document.createElement("button");
    prevBtn.className = "page-btn" + (currentPage === 1 ? " disabled" : "");
    prevBtn.type = "button";
    prevBtn.setAttribute("aria-label", "Página anterior");
    prevBtn.disabled = currentPage === 1;
    prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
    prevBtn.addEventListener("click", function () { if (currentPage > 1) { currentPage--; renderTable(); } });
    pagination.appendChild(prevBtn);

    for (var i = 1; i <= totalPages; i++) {
      if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - currentPage) > 1) {
        if (i === 3 || i === totalPages - 2) {
          var ell = document.createElement("span");
          ell.className = "page-ellipsis";
          ell.textContent = "…";
          pagination.appendChild(ell);
        }
        continue;
      }
      var btn = document.createElement("button");
      btn.className = "page-btn page-num" + (i === currentPage ? " active" : "");
      btn.type = "button";
      btn.textContent = i;
      btn.addEventListener("click", (function (page) { return function () { currentPage = page; renderTable(); }; })(i));
      pagination.appendChild(btn);
    }

    if (totalPages > 1) {
      var nextBtn = document.createElement("button");
      nextBtn.className = "page-btn";
      nextBtn.type = "button";
      nextBtn.setAttribute("aria-label", "Página siguiente");
      nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
      nextBtn.addEventListener("click", function () { if (currentPage < totalPages) { currentPage++; renderTable(); } });
      pagination.appendChild(nextBtn);

      var lastBtn = document.createElement("button");
      lastBtn.className = "page-btn";
      lastBtn.type = "button";
      lastBtn.setAttribute("aria-label", "Ir al final");
      lastBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>';
      lastBtn.addEventListener("click", function () { currentPage = totalPages; renderTable(); });
      pagination.appendChild(lastBtn);
    }
  }

  function updatePageInfo(total) {
    var info = $(".page-info");
    if (!info) return;
    var start = (currentPage - 1) * itemsPerPage + 1;
    var end = Math.min(start + itemsPerPage - 1, total);
    info.textContent = "Mostrando " + start + "-" + end + " de " + total.toLocaleString() + " productos";
  }

  /* ===== Filtros ===== */
  function getFilteredProducts() {
    var products = POS_DATA.getProductos() || [];
    var searchTerm = ($(".filter-search input") ? $(".filter-search input").value : "").trim().toLowerCase();
    var catFilter = ($("#f-categoria") ? $("#f-categoria").value : "all");
    var estadoFilter = ($("#f-estado") ? $("#f-estado").value : "all");
    var stockFilter = ($("#f-stock") ? $("#f-stock").value : "all");
    var proveedorFilter = ($("#f-proveedor") ? $("#f-proveedor").value : "all");

    return products.filter(function (p) {
      if (searchTerm) {
        var nombre = (p.nombre || "").toLowerCase();
        var sku = (p.sku || "").toLowerCase();
        var barras = (p.codigoBarras || "").toLowerCase();
        if (nombre.indexOf(searchTerm) === -1 && sku.indexOf(searchTerm) === -1 && barras.indexOf(searchTerm) === -1) return false;
      }
      if (catFilter !== "all" && p.categoria !== catFilter) return false;
      if (estadoFilter !== "all") {
        if (estadoFilter === "activo" && p.estado !== "Activo") return false;
        if (estadoFilter === "bajo" && p.estado !== "Bajo Stock") return false;
      }
      if (stockFilter !== "all") {
        if (stockFilter === "low" && p.stock >= (p.stockMinimo || 0)) return false;
        if (stockFilter === "high" && p.stock < (p.stockMinimo || 0)) return false;
      }
      if (proveedorFilter !== "all") {
        var provMap = { "caribe": "Distribuidora del Caribe", "nacional": "Distribuidora Nacional" };
        var prov = provMap[proveedorFilter] || proveedorFilter;
        if (p.proveedor !== prov) return false;
      }
      return true;
    });
  }

  /* ===== Vista: lista vs formulario ===== */
  function showListView() {
    var formContent = $("#form-content");
    if (formContent) formContent.style.display = "none";
    var listElements = $$("#list-view > *");
    listElements.forEach(function (el) { el.style.display = ""; });
    editingId = null;
    resetForm();
    renderTable();
  }

  function showFormView(editId) {
    var formContent = $("#form-content");
    if (formContent) formContent.style.display = "block";
    var listElements = $$("#list-view > *");
    listElements.forEach(function (el) { el.style.display = "none"; });

    if (editId) {
      var product = (POS_DATA.getProductos() || []).find(function (p) { return p.id === editId; });
      if (product) {
        editingId = editId;
        $("#f-nombre").value = product.nombre || "";
        $("#f-sku").value = product.sku || "";
        $("#f-barras").value = product.codigoBarras || "";
        $("#f-categoria").value = product.categoria || "";
        $("#f-descripcion").value = product.referencia || "";
        $("#f-costo").value = product.precioCosto || "";
        $("#f-venta").value = product.precioVenta || "";
        $("#f-mayorista").value = product.precioMayorista || "";
        $("#f-stock").value = product.stock || "";
        $("#f-stock-min").value = product.stockMinimo || "";
        $("#f-unidad").value = product.unidad || "und";
        var provSelect = $("#f-proveedor");
        if (provSelect) {
          for (var i = 0; i < provSelect.options.length; i++) {
            if (provSelect.options[i].value === product.proveedor) { provSelect.selectedIndex = i; break; }
          }
        }
        $("#f-referencia").value = product.referencia || "";
      }
    } else {
      editingId = null;
      resetForm();
    }
    updatePreview();
  }

  /* ===== Preview en vivo ===== */
  function updatePreview() {
    var nombre = $("#f-nombre").value.trim() || "—";
    var sku = $("#f-sku").value.trim() || "—";
    var venta = $("#f-venta").value.trim();
    var stock = $("#f-stock").value.trim();
    var categoria = $("#f-categoria").value;
    var icon = getIconForCategory(categoria);

    $("#preview-name").textContent = nombre;
    $("#preview-sku").textContent = sku;
    $("#preview-price").textContent = venta ? formatPrice(venta) : "RD$ 0.00";
    $("#preview-icon").textContent = icon;
    $("#preview-stock").textContent = (stock ? stock : "0") + " und";

    var estadoSelect = $("#f-estado");
    var estadoVal = estadoSelect ? estadoSelect.value : "Activo";
    var pill = $("#preview-state");
    if (pill) {
      pill.textContent = estadoVal || "Activo";
      pill.className = "pill " + (estadoVal === "Bajo Stock" ? "pill-warn" : "pill-ok");
    }
  }

  function getIconForCategory(cat) {
    var map = { "Bebidas": "🥤", "Alimentos": "🍞", "Limpieza": "🧴", "Lácteos": "🥛", "Abarrotes": "☕" };
    return map[cat] || "📦";
  }

  function resetForm() {
    ["#f-nombre", "#f-sku", "#f-barras", "#f-descripcion", "#f-costo", "#f-venta", "#f-mayorista", "#f-stock", "#f-stock-min", "#f-referencia"].forEach(function (sel) {
      var el = $(sel);
      if (el) el.value = "";
    });
    var cat = $("#f-categoria"); if (cat) cat.selectedIndex = 0;
    var unidad = $("#f-unidad"); if (unidad) unidad.selectedIndex = 0;
    var proveedor = $("#f-proveedor"); if (proveedor) proveedor.selectedIndex = 0;
    updatePreview();
  }

  /* ===== Guardar producto ===== */
  function saveProduct() {
    var nombre = $("#f-nombre").value.trim();
    var sku = $("#f-sku").value.trim();
    var categoria = $("#f-categoria").value;

    if (!nombre) { alert("El nombre es obligatorio."); return; }
    if (!sku) { alert("El SKU es obligatorio."); return; }
    if (!categoria) { alert("La categoría es obligatoria."); return; }
    if (!POS_DATA.getProductos) { alert("POS_DATA no disponible."); return; }

    var data = {
      nombre: nombre,
      sku: sku,
      codigoBarras: $("#f-barras").value.trim(),
      categoria: categoria,
      precioVenta: parseFloat($("#f-venta").value) || 0,
      precioCosto: parseFloat($("#f-costo").value) || 0,
      precioMayorista: parseFloat($("#f-mayorista").value) || 0,
      stock: parseInt($("#f-stock").value, 10) || 0,
      stockMinimo: parseInt($("#f-stock-min").value, 10) || 0,
      unidad: $("#f-unidad").value,
      proveedor: $("#f-proveedor").value,
      referencia: $("#f-referencia").value.trim(),
      estado: $("#f-estado") ? $("#f-estado").value : "Activo",
      exento: false,
      icono: getIconForCategory(categoria)
    };

    var result;
    if (editingId) {
      result = POS_DATA.editarProducto(editingId, data);
    } else {
      result = POS_DATA.registrarProducto(data);
    }

    if (result.error) { alert(result.error); return; }

    alert((editingId ? "Producto actualizado" : "Producto registrado") + " con éxito.");
    showListView();
  }

  /* ===== Eliminar producto ===== */
  function deleteProduct(id) {
    var product = (POS_DATA.getProductos() || []).find(function (p) { return p.id === id; });
    if (!product) return;
    if (!confirm("¿Eliminar '" + product.nombre + "'?")) return;
    var result = POS_DATA.eliminarProducto(id);
    if (result.error) { alert(result.error); return; }
    alert("Producto eliminado.");
    showListView();
  }

  /* ===== Categorías dinámicas ===== */
  function populateCategorySelect() {
    var select = $("#f-categoria");
    if (!select) return;
    var products = POS_DATA.getProductos() || [];
    var cats = [];
    products.forEach(function (p) { if (p.categoria && cats.indexOf(p.categoria) === -1) cats.push(p.categoria); });
    ["Bebidas", "Alimentos", "Limpieza", "Lácteos", "Abarrotes", "Cuidado personal"].forEach(function (c) { if (cats.indexOf(c) === -1) cats.push(c); });
    select.innerHTML = '<option value="">Seleccionar...</option>' + cats.map(function (c) { return '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + '</option>'; }).join("");
  }

  /* ===== Proveedores dinámicos ===== */
  function populateProveedorSelect() {
    var select = $("#f-proveedor");
    if (!select) return;
    var products = POS_DATA.getProductos() || [];
    var provs = [];
    products.forEach(function (p) { if (p.proveedor && provs.indexOf(p.proveedor) === -1) provs.push(p.proveedor); });
    ["Distribuidora del Caribe", "Distribuidora Nacional"].forEach(function (p) { if (provs.indexOf(p) === -1) provs.push(p); });
    select.innerHTML = provs.map(function (p) { return '<option value="' + escapeHtml(p) + '">' + escapeHtml(p) + '</option>'; }).join("");
  }

  /* ===== Estado filter ===== */
  function populateEstadoFilter() {
    var select = $("#f-estado");
    if (!select) return;
    select.innerHTML = '<option value="all">All</option>' + '<option value="activo">Activo</option>' + '<option value="bajo">Bajo Stock</option>';
  }

  /* ===== Stock filter ===== */
  function populateStockFilter() {
    var select = $("#f-stock");
    if (!select) return;
    select.innerHTML = '<option value="all">Low</option><option value="low">Low</option><option value="high">High</option>';
  }

  /* ===== Event Listeners ===== */
  function init() {
    /* Render inicial */
    renderTable();
    populateCategorySelect();
    populateProveedorSelect();
    populateEstadoFilter();
    populateStockFilter();

    /* Toggle: Nuevo Producto */
    var nuevoBtn = $(".title-actions .btn-primary");
    if (nuevoBtn) {
      nuevoBtn.addEventListener("click", function () { showFormView(null); });
    }

    /* Cancelar */
    var cancelBtn = $("#btn-form-cancel");
    if (cancelBtn) { cancelBtn.addEventListener("click", showListView); }

    /* Guardar */
    var saveBtn = $("#btn-form-save");
    if (saveBtn) { saveBtn.addEventListener("click", saveProduct); }

    /* Preview en vivo */
    ["#f-nombre", "#f-sku", "#f-barras", "#f-categoria", "#f-descripcion", "#f-costo", "#f-venta", "#f-mayorista", "#f-stock", "#f-stock-min", "#f-unidad", "#f-proveedor", "#f-referencia", "#f-estado"].forEach(function (sel) {
      var el = $(sel);
      if (el) el.addEventListener("input", updatePreview);
    });

    /* Acciones de tabla (editar, eliminar) — delegación de eventos */
    var tableScroll = $(".table-scroll");
    if (tableScroll) {
      tableScroll.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-action]");
        if (!btn) return;
        var action = btn.getAttribute("data-action");
        var id = parseInt(btn.getAttribute("data-id"), 10);
        if (action === "edit") { showFormView(id); }
        if (action === "delete") { deleteProduct(id); }
      });
    }

    /* Filtros */
    var searchInput = $(".filter-search input");
    if (searchInput) { searchInput.addEventListener("input", function () { currentPage = 1; renderTable(); }); }
    ["#f-categoria", "#f-estado", "#f-stock", "#f-proveedor"].forEach(function (sel) {
      var el = $(sel);
      if (el) el.addEventListener("change", function () { currentPage = 1; renderTable(); });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();