(function () {
  "use strict";

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return document.querySelectorAll(sel); }

  var currentPage = 1;
  var itemsPerPage = 10;
  var editingId = null;
  var allFiltered = [];

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
        '<span class="cell-text">' + escapeHtml(p.codigoBarras || "") + '</span>' +
        '<span class="cell-text">' + escapeHtml(p.categoria || "") + '</span>' +
        '<span class="cell-text strong">' + formatPrice(p.precioVenta) + '</span>' +
        '<span class="cell-text">' + formatPrice(p.precioCosto) + '</span>' +
        '<span class="cell-text">' + p.stock + " " + escapeHtml(p.unidad || "und") + '</span>' +
        '<span class="cell-text"><span class="pill ' + pillClass + '">' + escapeHtml(p.estado || "Activo") + '</span></span>' +
        '<div class="col-acciones actions">' +
          '<button class="action-btn" type="button" aria-label="Editar" data-action="edit" data-id="' + p.id + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>' +
          '</button>' +
          '<button class="action-btn danger" type="button" aria-label="Eliminar" data-action="delete" data-id="' + p.id + '">' +
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

    return products.filter(function (p) {
      if (searchTerm) {
        var nombre = (p.nombre || "").toLowerCase();
        var barras = (p.codigoBarras || "").toLowerCase();
        if (nombre.indexOf(searchTerm) === -1 && barras.indexOf(searchTerm) === -1) return false;
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
        $("#p-barras").value = product.codigoBarras || "";
        $("#p-nombre").value = product.nombre || "";
        var catSel = $("#p-categoria");
        if (catSel) {
          for (var i = 0; i < catSel.options.length; i++) {
            if (catSel.options[i].value === product.categoria) { catSel.selectedIndex = i; break; }
          }
        }
        $("#p-venta").value = product.precioVenta || "";
        $("#p-costo").value = product.precioCosto || "";
        $("#p-stock").value = product.stock || "";
        $("#p-stock-min").value = product.stockMinimo || "";
        var uniSel = $("#p-unidad");
        if (uniSel) {
          for (var j = 0; j < uniSel.options.length; j++) {
            if (uniSel.options[j].value === (product.unidad || "und")) { uniSel.selectedIndex = j; break; }
          }
        }
        var estSel = $("#p-estado");
        if (estSel) {
          for (var k = 0; k < estSel.options.length; k++) {
            if (estSel.options[k].value === (product.estado || "Activo")) { estSel.selectedIndex = k; break; }
          }
        }
      }
    } else {
      editingId = null;
      resetForm();
    }
    updatePreview();

    /* Auto-focus en código de barras */
    setTimeout(function () { var barras = $("#p-barras"); if (barras) barras.focus(); }, 100);
  }

  /* ===== Preview en vivo ===== */
  function updatePreview() {
    var barras = $("#p-barras").value.trim() || "—";
    var nombre = $("#p-nombre").value.trim() || "—";
    var venta = $("#p-venta").value.trim();
    var stock = $("#p-stock").value.trim();
    var categoria = $("#p-categoria").value;
    var estadoVal = $("#p-estado") ? $("#p-estado").value : "Activo";
    var icon = getIconForCategory(categoria);

    $("#preview-name").textContent = nombre;
    $("#preview-barcode").textContent = barras;
    $("#preview-price").textContent = venta ? formatPrice(venta) : "RD$ 0.00";
    $("#preview-icon").textContent = icon;
    $("#preview-stock").textContent = (stock ? stock : "0") + " und";

    var pill = $("#preview-state");
    if (pill) {
      pill.textContent = estadoVal;
      pill.className = "pill " + (estadoVal === "Bajo Stock" ? "pill-warn" : "pill-ok");
    }
  }

  function getIconForCategory(cat) {
    var map = { "Bebidas": "🥤", "Alimentos": "🍞", "Limpieza": "🧴", "Lácteos": "🥛", "Abarrotes": "☕" };
    return map[cat] || "📦";
  }

  function resetForm() {
    ["#p-barras", "#p-nombre", "#p-venta", "#p-costo", "#p-stock", "#p-stock-min"].forEach(function (sel) {
      var el = $(sel);
      if (el) el.value = "";
    });
    var cat = $("#p-categoria"); if (cat) cat.selectedIndex = 0;
    var uni = $("#p-unidad"); if (uni) uni.selectedIndex = 0;
    var est = $("#p-estado"); if (est) est.selectedIndex = 0;
    updatePreview();
  }

  /* ===== Guardar producto ===== */
  function saveProduct() {
    var barras = $("#p-barras").value.trim();
    var nombre = $("#p-nombre").value.trim();
    var categoria = $("#p-categoria").value;
    var venta = parseFloat($("#p-venta").value) || 0;
    var costo = parseFloat($("#p-costo").value) || 0;
    var stock = parseInt($("#p-stock").value, 10);
    var stockMin = parseInt($("#p-stock-min").value, 10);
    var unidad = $("#p-unidad").value;
    var estado = $("#p-estado") ? $("#p-estado").value : "Activo";

    if (!barras) { alert("El código de barras es obligatorio."); return; }
    if (!nombre) { alert("El nombre es obligatorio."); return; }
    if (!categoria) { alert("La categoría es obligatoria."); return; }
    if (!Number.isFinite(venta) || venta < 0) { alert("El precio de venta es inválido."); return; }
    if (!Number.isFinite(costo) || costo < 0) { alert("El costo es inválido."); return; }
    if (!Number.isInteger(stock) || stock < 0) { alert("El stock es inválido."); return; }
    if (!Number.isInteger(stockMin) || stockMin < 0) { alert("El stock mínimo es inválido."); return; }
    if (!unidad) { alert("La unidad de medida es obligatoria."); return; }
    if (!POS_DATA.getProductos) { alert("POS_DATA no disponible."); return; }

    var data = {
      codigoBarras: barras,
      sku: barras,
      nombre: nombre,
      categoria: categoria,
      precioVenta: venta,
      precioCosto: costo,
      precioMayorista: 0,
      stock: stock,
      stockMinimo: stockMin,
      unidad: unidad,
      estado: estado,
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
    var select = $("#p-categoria");
    if (!select) return;
    var products = POS_DATA.getProductos() || [];
    var cats = [];
    products.forEach(function (p) { if (p.categoria && cats.indexOf(p.categoria) === -1) cats.push(p.categoria); });
    ["Bebidas", "Alimentos", "Limpieza", "Lácteos", "Abarrotes", "Cuidado personal"].forEach(function (c) { if (cats.indexOf(c) === -1) cats.push(c); });
    select.innerHTML = '<option value="">Seleccionar...</option>' + cats.map(function (c) { return '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + '</option>'; }).join("");
  }

  /* ===== Event Listeners ===== */
  function init() {
    renderTable();
    populateCategorySelect();

    var nuevoBtn = $(".title-actions .btn-primary");
    if (nuevoBtn) {
      nuevoBtn.addEventListener("click", function () { showFormView(null); });
    }

    var cancelBtn = $("#btn-form-cancel");
    if (cancelBtn) { cancelBtn.addEventListener("click", showListView); }

    var saveBtn = $("#btn-form-save");
    if (saveBtn) { saveBtn.addEventListener("click", saveProduct); }

    var previewFields = ["#p-barras", "#p-nombre", "#p-categoria", "#p-venta", "#p-costo", "#p-stock", "#p-stock-min", "#p-unidad", "#p-estado"];
    previewFields.forEach(function (sel) {
      var el = $(sel);
      if (el) el.addEventListener("input", updatePreview);
    });

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

    var searchInput = $(".filter-search input");
    if (searchInput) { searchInput.addEventListener("input", function () { currentPage = 1; renderTable(); }); }
    ["#f-categoria", "#f-estado", "#f-stock"].forEach(function (sel) {
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