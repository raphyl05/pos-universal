(function () {
  "use strict";

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return document.querySelectorAll(sel); }

  var invCategory = "Todos";
  var invSearchTerm = "";
  var invSelectedIndex = -1;
  var sugIndex = -1;

  /* ===== Utilidades ===== */
  function formatPrice(value) {
    return "RD$ " + Number(value).toFixed(2);
  }

  function escapeHtml(text) {
    if (!text) return "";
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  function findProductByCode(code) {
    var products = POS_DATA.getProductos();
    var term = code.trim();
    if (!term) return null;
    var termLower = term.toLowerCase();
    return products.find(function (p) {
      return (p.sku && p.sku.toLowerCase() === termLower) ||
             (p.codigoBarras && p.codigoBarras === term);
    });
  }

  /* ===== Renderizar tabla del carrito ===== */
  function renderCartTable() {
    var list = $("#cart-list");
    if (!list) return;

    var cart = POS_DATA.getCart();
    var products = POS_DATA.getProductos();

    list.innerHTML = "";

    if (cart.length === 0) {
      var empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "Agrega productos a la factura";
      list.appendChild(empty);
      updateCartTotals();
      updateCartCount();
      return;
    }

    cart.forEach(function (item) {
      var product = products.find(function (p) { return p.id === item.id; });
      if (!product) return;

      var price = item.priceOverride != null ? item.priceOverride : product.precioVenta;
      var total = Number(price) * Number(item.quantity);

      var row = document.createElement("div");
      row.className = "cart-row-item";
      row.setAttribute("data-id", product.id);
      row.innerHTML =
        '<span class="col-cod">' +
          '<span class="cod-sku">' + escapeHtml(product.sku || "") + '</span>' +
          '<span class="cod-bar">' + escapeHtml(product.codigoBarras || "") + '</span>' +
        '</span>' +
        '<span class="col-product">' +
          '<span class="prod-icon">' + escapeHtml(product.icono || "") + '</span>' +
          '<span class="prod-name">' + escapeHtml(product.nombre) + '</span>' +
        '</span>' +
        '<span class="col-qty">' +
          '<input type="number" class="cart-qty" value="' + item.quantity + '" min="1" max="999" aria-label="Cantidad">' +
        '</span>' +
        '<span class="col-price">' +
          '<input type="number" class="cart-price" value="' + Number(price).toFixed(2) + '" step="0.01" min="0" aria-label="Precio">' +
        '</span>' +
        '<span class="col-total">' +
          '<span class="row-total">RD$ ' + Number(total).toFixed(2) + '</span>' +
          '<button class="cart-remove" type="button" aria-label="Eliminar">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="10" height="10"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</span>';

      var qtyInput = row.querySelector(".cart-qty");
      qtyInput.addEventListener("change", function () {
        var qty = parseInt(qtyInput.value, 10);
        if (!Number.isInteger(qty) || qty < 1) qty = 1;
        POS_DATA.updateCartQuantity(product.id, qty);
        renderCartTable();
        focusSearch();
      });

      var priceInput = row.querySelector(".cart-price");
      priceInput.addEventListener("change", function () {
        var p = parseFloat(priceInput.value);
        if (!Number.isFinite(p) || p < 0) p = 0;
        POS_DATA.updateCartPrice(product.id, p);
        renderCartTable();
        focusSearch();
      });

      var removeBtn = row.querySelector(".cart-remove");
      removeBtn.addEventListener("click", function () {
        POS_DATA.removeFromCart(product.id);
        renderCartTable();
        focusSearch();
      });

      list.appendChild(row);
    });

    updateCartTotals();
    updateCartCount();
  }

  /* ===== Totales ===== */
  function updateCartTotals() {
    var discountInput = $("#discount-input");
    var discount = discountInput ? parseFloat(discountInput.value) || 0 : 0;
    var calc = POS_DATA.calculateCart(discount);

    var el;
    el = $("#cart-subtotal"); if (el) el.textContent = formatPrice(calc.subtotal);
    el = $("#cart-discount"); if (el) el.textContent = formatPrice(calc.descuento);
    el = $("#cart-itbis"); if (el) el.textContent = formatPrice(calc.itbis);
    el = $("#cart-total"); if (el) el.textContent = formatPrice(calc.total);
  }

  function updateCartCount() {
    var el = $("#cart-count");
    if (el) {
      var cart = POS_DATA.getCart();
      var count = cart.reduce(function (sum, item) { return sum + item.quantity; }, 0);
      el.textContent = count + " items";
    }
  }

  /* ===== Stock ===== */
  function renderInventory() {
    var grid = $(".inv-grid");
    if (!grid) return;

    var productos = POS_DATA.getProductos();
    var term = invSearchTerm.trim().toLowerCase();

    var filtered = productos.filter(function (p) {
      if (invCategory !== "Todos" && invCategory !== "") {
        if (p.categoria !== invCategory) return false;
      }
      if (term) {
        var matchName = p.nombre && p.nombre.toLowerCase().indexOf(term) !== -1;
        var matchSku = p.sku && p.sku.toLowerCase().indexOf(term) !== -1;
        var matchCat = p.categoria && p.categoria.toLowerCase().indexOf(term) !== -1;
        var matchBar = p.codigoBarras && p.codigoBarras.toLowerCase().indexOf(term) !== -1;
        if (!matchName && !matchSku && !matchCat && !matchBar) return false;
      }
      return true;
    });

    grid.innerHTML = "";
    invSelectedIndex = -1;

    if (filtered.length === 0) {
      var empty = document.createElement("div");
      empty.className = "inv-empty";
      empty.textContent = "No se encontraron productos.";
      grid.appendChild(empty);
      return;
    }

    filtered.forEach(function (p) {
      var card = document.createElement("article");
      card.className = "inv-card";
      card.setAttribute("data-id", p.id);
      card.innerHTML =
        '<div class="inv-card-top">' +
          '<span class="prod-icon">' + escapeHtml(p.icono || "") + '</span>' +
          '<div class="inv-info">' +
            '<p class="p-name">' + escapeHtml(p.nombre) + '</p>' +
            '<p class="p-price">RD$ ' + Number(p.precioVenta).toFixed(2) + '</p>' +
            '<p class="p-stock">Stock: ' + Number(p.stock) + ' ' + escapeHtml(p.unidad || "und") + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="inv-card-bottom">' +
          '<input type="number" class="inv-qty" value="1" min="1" max="999" aria-label="Cantidad">' +
          '<button class="inv-add" type="button">Agregar</button>' +
        '</div>';

      var addBtn = card.querySelector(".inv-add");
      addBtn.addEventListener("click", function () {
        var qty = parseInt(card.querySelector(".inv-qty").value, 10);
        if (!Number.isInteger(qty) || qty < 1) qty = 1;
        POS_DATA.addToCart(p.id, qty);
        renderCartTable();
      });

      grid.appendChild(card);
    });
  }

  function highlightInvCard() {
    var cards = $$(".inv-card");
    cards.forEach(function (c) { c.classList.remove("selected"); });
    if (invSelectedIndex >= 0 && invSelectedIndex < cards.length) {
      cards[invSelectedIndex].classList.add("selected");
      cards[invSelectedIndex].scrollIntoView({ block: "nearest" });
    }
  }

  function navigateInvCards(direction) {
    var grid = $(".inv-grid");
    if (!grid) return;
    var cards = grid.querySelectorAll(".inv-card");
    if (cards.length === 0) return;
    if (direction === "next") {
      invSelectedIndex = invSelectedIndex < cards.length - 1 ? invSelectedIndex + 1 : 0;
    } else {
      invSelectedIndex = invSelectedIndex > 0 ? invSelectedIndex - 1 : cards.length - 1;
    }
    highlightInvCard();
  }

  function addInvSelected() {
    var cards = $$(".inv-card");
    if (invSelectedIndex >= 0 && invSelectedIndex < cards.length) {
      var id = cards[invSelectedIndex].getAttribute("data-id");
      var qtyInput = cards[invSelectedIndex].querySelector(".inv-qty");
      var qty = parseInt(qtyInput.value, 10);
      if (!Number.isInteger(qty) || qty < 1) qty = 1;
      POS_DATA.addToCart(id, qty);
      renderCartTable();
    }
  }

  function openInventory() {
    var overlay = $("#inv-overlay");
    if (overlay) {
      overlay.classList.add("open");
      invCategory = "Todos";
      invSelectedIndex = -1;
      $$(".inv-tab").forEach(function (t) { t.classList.toggle("active", t.textContent.trim() === "Todos"); });
      renderInventory();
      var searchInput = $("#inv-search-input");
      if (searchInput) { searchInput.value = ""; searchInput.focus(); }
    }
  }

  function closeInventory() {
    var overlay = $("#inv-overlay");
    if (overlay) {
      overlay.classList.remove("open");
      focusSearch();
    }
  }

  /* ===== Facturas ===== */
  function openFactModal() {
    var overlay = $("#fact-overlay");
    if (overlay) {
      overlay.classList.add("open");
      var fromEl = $("#fact-date-from");
      var toEl = $("#fact-date-to");
      if (fromEl && toEl && !fromEl.value && !toEl.value) {
        var today = new Date();
        var yyyy = today.getFullYear();
        var mm = String(today.getMonth() + 1).padStart(2, "0");
        var dd = String(today.getDate()).padStart(2, "0");
        fromEl.value = yyyy + "-" + mm + dd;
        toEl.value = yyyy + "-" + mm + dd;
      }
      searchFacts();
    }
  }

  function closeFactModal() {
    var overlay = $("#fact-overlay");
    if (overlay) {
      overlay.classList.remove("open");
      focusSearch();
    }
  }

  function searchFacts() {
    var listEl = $("#fact-list");
    if (!listEl) return;
    var fromEl = $("#fact-date-from");
    var toEl = $("#fact-date-to");
    var fromDate = fromEl ? fromEl.value : "";
    var toDate = toEl ? toEl.value : "";
    var ventas = POS_DATA.getVentas() || [];
    var filtered = ventas.filter(function (v) {
      var fecha = v.fecha ? v.fecha.slice(0, 10) : "";
      if (fromDate && fecha < fromDate) return false;
      if (toDate && fecha > toDate) return false;
      return true;
    });
    renderFactList(filtered);
  }

  function renderFactList(data) {
    var listEl = $("#fact-list");
    if (!listEl) return;
    if (!data || data.length === 0) {
      listEl.innerHTML = '<div class="fact-empty">No se encontraron facturas en el rango seleccionado.</div>';
      return;
    }
    listEl.innerHTML = "";
    data.forEach(function (v) {
      var fecha = v.fecha ? v.fecha.slice(0, 10) : "—";
      var statusClass = v.estado === "Pagado" ? "pagado" : v.estado === "Cancelado" ? "" : "pendiente";
      var icon = v.estado === "Pagado" ? "✅" : v.estado === "Cancelado" ? "❌" : "⏳";
      var item = document.createElement("div");
      item.className = "fact-item";
      item.setAttribute("data-id", v.id);
      item.innerHTML =
        '<span class="fact-item-icon">' + icon + '</span>' +
        '<div class="fact-item-info">' +
          '<div class="fact-item-top">' +
            '<span class="fact-item-num">Factura #' + escapeHtml(v.numero || "") + '</span>' +
            '<span class="fact-item-total">RD$ ' + Number(v.total).toFixed(2) + '</span>' +
          '</div>' +
          '<div class="fact-item-meta">' +
            '<span>' + escapeHtml(v.cliente || "") + '</span>' +
            '<span>' + escapeHtml(v.pago || "") + '</span>' +
            '<span>' + fecha + '</span>' +
          '</div>' +
        '</div>' +
        '<span class="fact-item-status ' + statusClass + '">' + escapeHtml(v.estado || "") + '</span>';
      item.addEventListener("click", function () {
        loadFactAsCurrent(v);
      });
      listEl.appendChild(item);
    });
  }

  function loadFactAsCurrent(factura) {
    if (!factura) return;
    var msg = "Factura #" + (factura.numero || "") + "\n" +
      "Cliente: " + (factura.cliente || "") + "\n" +
      "Total: RD$ " + Number(factura.total).toFixed(2) + "\n" +
      "Pago: " + (factura.pago || "") + "\n" +
      "Estado: " + (factura.estado || "") + "\n" +
      "Fecha: " + (factura.fecha || "");
    alert(msg);
    closeFactModal();
  }

  /* ===== Sugerencias ===== */
  function renderSuggestions(term) {
    var dropdown = $("#code-suggestions");
    if (!dropdown) return;
    if (!term || term.trim() === "") {
      dropdown.classList.remove("open");
      dropdown.innerHTML = "";
      sugIndex = -1;
      return;
    }
    var products = POS_DATA.getProductos();
    var termLower = term.trim().toLowerCase();
    var matches = products.filter(function (p) {
      var matchName = p.nombre && p.nombre.toLowerCase().indexOf(termLower) !== -1;
      var matchSku = p.sku && p.sku.toLowerCase().indexOf(termLower) !== -1;
      var matchCat = p.categoria && p.categoria.toLowerCase().indexOf(termLower) !== -1;
      var matchBar = p.codigoBarras && p.codigoBarras.toLowerCase().indexOf(termLower) !== -1;
      return matchName || matchSku || matchCat || matchBar;
    }).slice(0, 6);
    if (matches.length === 0) {
      dropdown.classList.remove("open");
      dropdown.innerHTML = "";
      sugIndex = -1;
      return;
    }
    dropdown.innerHTML = "";
    matches.forEach(function (p) {
      var item = document.createElement("div");
      item.className = "code-suggestion";
      item.setAttribute("data-id", p.id);
      item.innerHTML =
        '<span class="sug-icon">' + escapeHtml(p.icono || "") + '</span>' +
        '<span class="sug-name">' + escapeHtml(p.nombre) + '</span>' +
        '<span class="sug-sku">' + escapeHtml(p.sku || "") + '</span>' +
        '<span class="sug-price">RD$ ' + Number(p.precioVenta).toFixed(2) + '</span>';
      item.addEventListener("click", function () {
        POS_DATA.addToCart(p.id);
        renderCartTable();
        codeInput.value = "";
        dropdown.classList.remove("open");
        focusSearch();
      });
      dropdown.appendChild(item);
    });
    sugIndex = -1;
    dropdown.classList.add("open");
  }

  function highlightSuggestion() {
    var items = $$("#code-suggestions .code-suggestion");
    items.forEach(function (item) { item.style.background = ""; });
    if (sugIndex >= 0 && sugIndex < items.length) {
      items[sugIndex].style.background = "var(--selected-bg)";
      items[sugIndex].scrollIntoView({ block: "nearest" });
    }
  }

  function navigateSuggestions(direction) {
    var items = $$("#code-suggestions .code-suggestion");
    if (items.length === 0) return;
    if (direction === "next") {
      sugIndex = sugIndex < items.length - 1 ? sugIndex + 1 : 0;
    } else {
      sugIndex = sugIndex > 0 ? sugIndex - 1 : items.length - 1;
    }
    highlightSuggestion();
  }

  function addSuggestedProduct() {
    var items = $$("#code-suggestions .code-suggestion");
    if (sugIndex >= 0 && sugIndex < items.length) {
      var id = items[sugIndex].getAttribute("data-id");
      if (id) {
        POS_DATA.addToCart(id);
        renderCartTable();
        codeInput.value = "";
        $("#code-suggestions").classList.remove("open");
        focusSearch();
      }
    }
  }

  /* ===== Foco ===== */
  function focusSearch() {
    var overlay = $("#inv-overlay");
    if (overlay && overlay.classList.contains("open")) {
      var input = $("#inv-search-input");
      if (input) { input.focus(); return; }
    }
    var input2 = $("#code-input");
    if (input2) { input2.focus(); }
  }

  /* ===== Datos del cliente ===== */
  function getClientData() {
    var nombreEl = $("#client-nombre");
    var telefonoEl = $("#client-telefono");
    var cedulaEl = $("#client-cedula");
    var direccionEl = $("#client-direccion");
    return {
      nombre: nombreEl ? nombreEl.value.trim() : "",
      telefono: telefonoEl ? telefonoEl.value.trim() : "",
      cedula: cedulaEl ? cedulaEl.value.trim() : "",
      direccion: direccionEl ? direccionEl.value.trim() : ""
    };
  }

  /* ===== Inicializar ===== */
  var codeInput;

  function init() {
    renderCartTable();

    codeInput = $("#code-input");
    if (codeInput) {
      codeInput.addEventListener("input", function () {
        renderSuggestions(codeInput.value);
      });
      codeInput.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          var dropdown = $("#code-suggestions");
          if (dropdown) dropdown.classList.remove("open");
          return;
        }
        if ($("#code-suggestions").classList.contains("open")) {
          if (e.key === "ArrowDown") { e.preventDefault(); navigateSuggestions("next"); return; }
          if (e.key === "ArrowUp") { e.preventDefault(); navigateSuggestions("prev"); return; }
          if (e.key === "Enter") { e.preventDefault(); addSuggestedProduct(); return; }
          return;
        }
        if (e.key === "Enter") {
          var code = codeInput.value.trim();
          if (code) {
            var product = findProductByCode(code);
            if (product) {
              POS_DATA.addToCart(product.id);
              renderCartTable();
              codeInput.value = "";
              focusSearch();
            }
          }
        }
      });
      codeInput.addEventListener("blur", function () {
        setTimeout(function () {
          var dropdown = $("#code-suggestions");
          if (dropdown) dropdown.classList.remove("open");
        }, 200);
      });
    }

    /* Stock */
    var invBtn = $("#btn-inventario");
    if (invBtn) { invBtn.addEventListener("click", function () { openInventory(); }); }

    var invClose = $("#inv-close");
    if (invClose) { invClose.addEventListener("click", function () { closeInventory(); }); }

    $$(".inv-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        $$(".inv-tab").forEach(function (t) { t.classList.remove("active"); });
        tab.classList.add("active");
        invCategory = tab.textContent.trim();
        renderInventory();
      });
    });

    var invSearch = $("#inv-search-input");
    if (invSearch) {
      invSearch.addEventListener("input", function () {
        invSearchTerm = invSearch.value;
        renderInventory();
      });
    }

    /* Facturas modal */
    var factBtn = $("#btn-facturas");
    if (factBtn) { factBtn.addEventListener("click", function () { openFactModal(); }); }

    var factClose = $("#fact-close");
    if (factClose) { factClose.addEventListener("click", function () { closeFactModal(); }); }

    var factOverlay = $("#fact-overlay");
    if (factOverlay) {
      factOverlay.addEventListener("click", function (e) {
        if (e.target === factOverlay) closeFactModal();
      });
    }

    var factSearchBtn = $("#fact-search-btn");
    if (factSearchBtn) { factSearchBtn.addEventListener("click", function () { searchFacts(); }); }

    var factDateFrom = $("#fact-date-from");
    if (factDateFrom) { factDateFrom.addEventListener("change", function () { searchFacts(); }); }

    var factDateTo = $("#fact-date-to");
    if (factDateTo) { factDateTo.addEventListener("change", function () { searchFacts(); }); }

    /* Fecha actual en header */
    var invoiceDate = $("#invoice-date");
    if (invoiceDate) {
      var today = new Date();
      var day = today.getDate();
      var months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
      invoiceDate.textContent = day + " " + months[today.getMonth()] + " " + today.getFullYear();
    }

    /* Descuento */
    var discountInput = $("#discount-input");
    if (discountInput) { discountInput.addEventListener("input", updateCartTotals); discountInput.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); var cb = $(".btn-cobrar"); if (cb) cb.click(); } }); }

    /* Método de pago */
    var paymentSelect = $("#payment-method");

    /* Cobrar */
    var cobrarBtn = $(".btn-cobrar");
    if (cobrarBtn) {
      cobrarBtn.addEventListener("click", function () {
        var cart = POS_DATA.getCart();
        if (cart.length === 0) { alert("El carrito está vacío."); return; }
        var clientData = getClientData();
        var method = paymentSelect ? paymentSelect.value : "Efectivo";
        var discount = discountInput ? parseFloat(discountInput.value) || 0 : 0;
        var calc = POS_DATA.calculateCart(discount);
        try { sessionStorage.setItem("pos_sale_data", JSON.stringify({ cart: cart, discount: discount, calc: calc, clientData: clientData, paymentMethod: method })); }
        catch (e) { alert("Error al guardar datos de venta."); return; }
        window.location.href = "completar-pago.html";
      });
    }

    /* Guardar venta */
    var guardarBtn = $(".btn-guardar");
    if (guardarBtn) {
      guardarBtn.addEventListener("click", function () {
        var cart = POS_DATA.getCart();
        if (cart.length === 0) { alert("El carrito está vacío."); return; }
        var clientData = getClientData();
        var method = paymentSelect ? paymentSelect.value : "Pendiente";
        var discount = discountInput ? parseFloat(discountInput.value) || 0 : 0;
        var result = POS_DATA.registrarVenta(method, discount, clientData, "Pendiente");
        if (result.error) { alert(result.error); return; }
        alert("Venta " + result.venta.numero + " guardada como pendiente.\nTotal: RD$ " + result.venta.total.toFixed(2));
        renderCartTable();
      });
    }

    /* Nueva Factura — limpiar carrito */
    var nuevaFacturaBtn = $("#btn-nueva-factura");
    if (nuevaFacturaBtn) {
      nuevaFacturaBtn.addEventListener("click", function () {
        var cart = POS_DATA.getCart();
        if (cart.length === 0) { alert("La factura ya está vacía."); return; }
        var confirmado = confirm("¿Deseas limpiar la factura actual?\nSe eliminarán todos los productos del carrito.");
        if (confirmado) {
          POS_DATA.clearCart();
          renderCartTable();
          var clientNombre = $("#client-nombre");
          var clientTelefono = $("#client-telefono");
          var clientCedula = $("#client-cedula");
          var clientDireccion = $("#client-direccion");
          if (clientNombre) clientNombre.value = "";
          if (clientTelefono) clientTelefono.value = "";
          if (clientCedula) clientCedula.value = "";
          if (clientDireccion) clientDireccion.value = "";
        }
      });
    }

    /* Salir — volver al dashboard */
    var salirBtn = $("#btn-salir");
    if (salirBtn) {
      salirBtn.addEventListener("click", function () {
        window.location.href = "dashboard.html";
      });
    }

    /* Foco siempre en codigo */
    document.addEventListener("click", function (e) {
      var tag = (e.target.tagName || "").toLowerCase();
      if (tag !== "input" && tag !== "button" && tag !== "textarea" && tag !== "select") {
        focusSearch();
      }
      var dropdown = $("#code-suggestions");
      if (dropdown && !e.target.closest(".code-suggestion") && !e.target.closest(".search-box")) {
        dropdown.classList.remove("open");
      }
    });

    /* Teclado global */
    document.addEventListener("keydown", function (e) {
      var tag = (e.target.tagName || "").toLowerCase();

      if (e.key === "Escape") {
        var dropdown = $("#code-suggestions");
        if (dropdown) dropdown.classList.remove("open");
        closeFactModal();
        closeInventory();
        return;
      }

      /* Stock modal con teclado */
      var overlay = $("#inv-overlay");
      if (overlay && overlay.classList.contains("open")) {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); navigateInvCards("next"); return; }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); navigateInvCards("prev"); return; }
        if (e.key === "Enter") { e.preventDefault(); addInvSelected(); return; }
        return;
      }

      /* En campo de código */
      if (tag === "input" && codeInput && e.target === codeInput) {
        /* Already handled by codeInput keydown */
      }
    });

    /* Numero de factura */
    var invNum = $("#invoice-number");
    if (invNum) { invNum.textContent = POS_DATA.getNumeroVenta(); }

    /* Fecha actual */
    var saleDate = $("#sale-date");
    if (saleDate) {
      var today = new Date();
      var yyyy = today.getFullYear();
      var mm = String(today.getMonth() + 1).padStart(2, "0");
      var dd = String(today.getDate()).padStart(2, "0");
      saleDate.value = yyyy + "-" + mm + dd;
    }

    /* Menu tres puntos — Salir */
    var moreBtn = $("#more-btn");
    if (moreBtn) {
      var moreMenu = null;
      document.addEventListener("click", function () {
        if (moreMenu) { moreMenu.remove(); moreMenu = null; }
      });
      moreBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (moreMenu) { moreMenu.remove(); moreMenu = null; return; }
        moreMenu = document.createElement("div");
        moreMenu.className = "more-menu";
        moreMenu.innerHTML = '<button id="btn-salir-menu" type="button">Salir</button>';
        var headerRight = $(".header-right");
        if (headerRight) {
          headerRight.appendChild(moreMenu);
        } else {
          var pageHead = $(".page-head");
          if (pageHead) { pageHead.appendChild(moreMenu); }
          else { document.body.appendChild(moreMenu); }
        }
        var salirMenuBtn = $("#btn-salir-menu");
        if (salirMenuBtn) {
          salirMenuBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            window.location.href = "dashboard.html";
          });
        }
      });
    }

    focusSearch();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
