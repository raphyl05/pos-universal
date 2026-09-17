(function () {
  "use strict";

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return document.querySelectorAll(sel); }

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
    el = $("#cart-tax"); if (el) el.textContent = formatPrice(calc.impuestos);
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

  /* ===== Inventario ===== */
  var invCategory = "Todos";

  function renderInventory() {
    var grid = $(".inv-grid");
    if (!grid) return;

    var productos = POS_DATA.getProductos();
    var filtered = productos.filter(function (p) {
      var cat = invCategory;
      if (cat === "Todos" || cat === "") return true;
      return p.categoria === cat;
    });

    grid.innerHTML = "";
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
        focusSearch();
      });

      grid.appendChild(card);
    });
  }

  function openInventory() {
    var overlay = $("#inv-overlay");
    if (overlay) {
      overlay.classList.add("open");
      invCategory = "Todos";
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

  /* ===== Foco siempre en codigo ===== */
  function focusSearch() {
    var overlay = $("#inv-overlay");
    if (overlay && overlay.classList.contains("open")) {
      var input = $("#inv-search-input");
      if (input) { input.focus(); return; }
    }
    var input2 = $("#code-input");
    if (input2) {
      input2.focus();
      input2.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
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
  function init() {
    renderCartTable();

    /* Codigo de barras / SKU al presionar Enter */
    var codeInput = $("#code-input");
    if (codeInput) {
      codeInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          var code = codeInput.value.trim();
          if (code) {
            var product = findProductByCode(code);
            if (product) {
              POS_DATA.addToCart(product.id);
              renderCartTable();
            }
            codeInput.value = "";
            focusSearch();
          }
        }
      });
    }

    /* Boton inventario */
    var invBtn = $("#btn-inventario");
    if (invBtn) {
      invBtn.addEventListener("click", function () { openInventory(); });
    }

    /* Cerrar inventario */
    var invClose = $("#inv-close");
    if (invClose) {
      invClose.addEventListener("click", function () { closeInventory(); });
    }

    /* Pestaas inventario */
    $$(".inv-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        $$(".inv-tab").forEach(function (t) { t.classList.remove("active"); });
        tab.classList.add("active");
        invCategory = tab.textContent.trim();
        renderInventory();
      });
    });

    /* Buscador inventario */
    var invSearch = $("#inv-search-input");
    if (invSearch) {
      invSearch.addEventListener("input", function () { renderInventory(); });
    }

    /* Descuento */
    var discountInput = $("#discount-input");
    if (discountInput) {
      discountInput.addEventListener("input", updateCartTotals);
    }

    /* Cobrar */
    var cobrarBtn = $(".btn-cobrar");
    if (cobrarBtn) {
      cobrarBtn.addEventListener("click", function () {
        var cart = POS_DATA.getCart();
        if (cart.length === 0) { alert("El carrito est vacio."); return; }
        var clientData = getClientData();
        var paymentMethod = "Efectivo";
        var selected = document.querySelector(".pay-btn.selected");
        if (selected) { paymentMethod = selected.querySelector("span").textContent.trim(); }
        var discount = parseFloat(discountInput.value) || 0;
        var calc = POS_DATA.calculateCart(discount);
        try { sessionStorage.setItem("pos_sale_data", JSON.stringify({ cart: cart, discount: discount, calc: calc, clientData: clientData, paymentMethod: paymentMethod })); }
        catch (e) { alert("Error al guardar datos de venta."); return; }
        window.location.href = "completar-pago.html";
      });
    }

    /* Guardar venta */
    var guardarBtn = $(".btn-guardar");
    if (guardarBtn) {
      guardarBtn.addEventListener("click", function () {
        var cart = POS_DATA.getCart();
        if (cart.length === 0) { alert("El carrito est vacio."); return; }
        var clientData = getClientData();
        var paymentMethod = "Pendiente";
        var selected = document.querySelector(".pay-btn.selected");
        if (selected) { paymentMethod = selected.querySelector("span").textContent.trim(); }
        var discount = parseFloat(discountInput.value) || 0;
        var result = POS_DATA.registrarVenta(paymentMethod, discount, clientData, "Pendiente");
        if (result.error) { alert(result.error); return; }
        alert("Venta " + result.venta.numero + " guardada como pendiente.\nTotal: RD$ " + result.venta.total.toFixed(2));
        renderCartTable();
      });
    }

    /* Métodos de pago */
    $$(".pay-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        $$(".pay-btn").forEach(function (b) { b.classList.remove("selected"); });
        btn.classList.add("selected");
      });
    });

    /* Foco siempre en codigo: recuperar al interactuar (teclado) */
    document.addEventListener("click", function (e) {
      var tag = (e.target.tagName || "").toLowerCase();
      if (tag !== "input" && tag !== "button" && tag !== "textarea" && tag !== "select") {
        focusSearch();
      }
    });

    /* Teclado: Escape cierra inventario, / enfoca codigo */
    document.addEventListener("keydown", function (e) {
      var tag = (e.target.tagName || "").toLowerCase();
      var inInput = tag === "input" || tag === "textarea" || tag === "select";

      if (e.key === "Escape") {
        e.preventDefault();
        closeInventory();
        return;
      }

      if (inInput) return;

      if (e.key === "/") {
        e.preventDefault();
        focusSearch();
      }
    });

    focusSearch();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
