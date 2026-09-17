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
  var selectedCardIndex = -1;

  /* Categorías disponibles en las pestañas */
  var TAB_CATEGORIES = ["Todos", "Bebidas", "Alimentos", "Limpieza", "Cuidado personal"];

  /* Renderizar grid de productos según categoría y búsqueda */
  function renderProducts() {
    selectedCardIndex = -1;
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
      card.setAttribute("data-id", p.id);
      card.innerHTML =
        '<div class="thumb"><span>' + escapeHtml(p.icono || "📦") + '</span></div>' +
        '<h3 class="p-name">' + escapeHtml(p.nombre) + '</h3>' +
        '<p class="p-price">RD$ ' + Number(p.precioVenta).toFixed(2) + '</p>' +
        '<p class="p-stock">Stock: ' + Number(p.stock) + ' ' + escapeHtml(p.unidad || "und") + '</p>';
      card.addEventListener("click", function () {
        POS_DATA.addToCart(p.id);
        renderCart();
        focusSearch();
      });
      grid.appendChild(card);
    });
    highlightSelectedCard();
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

  /* Renderizar carrito desde POS_DATA.getCart() */
  function renderCart() {
    var list = $(".cart-list");
    if (!list) return;

    var cart = POS_DATA.getCart();
    var products = POS_DATA.getProductos();

    list.innerHTML = "";

    if (cart.length === 0) {
      var empty = document.createElement("div");
      empty.className = "cart-empty";
      empty.textContent = "Agrega productos al carrito";
      list.appendChild(empty);
      updateTotals();
      return;
    }

    var reversedCart = cart.slice().reverse();

    reversedCart.forEach(function (item) {
      var product = products.find(function (p) { return p.id === item.id; });
      if (!product) return;

      var total = Number(product.precioVenta) * Number(item.quantity);

      var el = document.createElement("div");
      el.className = "cart-item";
      el.innerHTML =
        '<div class="item-thumb"><span>' + escapeHtml(product.icono || "📦") + '</span></div>' +
        '<p class="item-name">' + escapeHtml(product.nombre) + '</p>' +
        '<button class="remove-btn" aria-label="Eliminar ítem">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
        '<div class="stepper">' +
          '<button class="step-btn" type="button" aria-label="Disminuir cantidad">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
          '</button>' +
          '<span class="step-value">' + item.quantity + '</span>' +
          '<button class="step-btn" type="button" aria-label="Aumentar cantidad">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
          '</button>' +
        '</div>' +
        '<p class="item-total">RD$ ' + Number(total).toFixed(2) + '</p>';

      el.querySelector(".remove-btn").addEventListener("click", function (e) {
        e.stopPropagation();
        POS_DATA.removeFromCart(product.id);
        renderCart();
      });

      var btns = el.querySelectorAll(".step-btn");
      btns[0].addEventListener("click", function (e) {
        e.stopPropagation();
        POS_DATA.updateCartQuantity(product.id, item.quantity - 1);
        renderCart();
      });
      btns[1].addEventListener("click", function (e) {
        e.stopPropagation();
        POS_DATA.updateCartQuantity(product.id, item.quantity + 1);
        renderCart();
      });

      list.appendChild(el);
    });

    updateTotals();
  }

  function updateTotals() {
    var discountInput = $("#discount-input");
    var discount = discountInput ? parseFloat(discountInput.value) || 0 : 0;
    var calc = POS_DATA.calculateCart(discount);

    var el;
    el = $("#cart-subtotal"); if (el) el.textContent = "RD$ " + Number(calc.subtotal).toFixed(2);
    el = $("#cart-discount"); if (el) el.textContent = "RD$ " + Number(calc.descuento).toFixed(2);
    el = $("#cart-tax"); if (el) el.textContent = "RD$ " + Number(calc.impuestos).toFixed(2);
    el = $("#cart-total"); if (el) el.textContent = "RD$ " + Number(calc.total).toFixed(2);
  }

  function initPaymentMethods() {
    var btns = $$(".pay-btn");
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        btns.forEach(function (b) { b.classList.remove("selected"); });
        btn.classList.add("selected");
      });
    });
  }

  function initCart() {
    var discountInput = $("#discount-input");
    if (discountInput) {
      discountInput.addEventListener("input", updateTotals);
    }

    var cobrarBtn = $(".btn-cobrar");
    if (cobrarBtn) {
      cobrarBtn.addEventListener("click", function () {
        var cart = POS_DATA.getCart();
        if (cart.length === 0) { alert("El carrito está vacío."); return; }
        var selectedBtn = document.querySelector(".pay-btn.selected");
        if (!selectedBtn) { alert("Selecciona un método de pago."); return; }
        var paymentMethod = selectedBtn.querySelector("span").textContent.trim();
        var discount = parseFloat($("#discount-input").value) || 0;
        var calc = POS_DATA.calculateCart(discount);

        var saleData = {
          cart: cart,
          discount: discount,
          paymentMethod: paymentMethod,
          calc: calc
        };
        try { sessionStorage.setItem("pos_sale_data", JSON.stringify(saleData)); }
        catch (e) { alert("Error al guardar datos de venta."); return; }
        window.location.href = "completar-pago.html";
      });
    }

    var guardarBtn = $(".btn-guardar");
    if (guardarBtn) {
      guardarBtn.addEventListener("click", function () {
        var cart = POS_DATA.getCart();
        if (cart.length === 0) { alert("El carrito está vacío."); return; }
        var selectedBtn = document.querySelector(".pay-btn.selected");
        var paymentMethod = selectedBtn ? selectedBtn.querySelector("span").textContent.trim() : "Pendiente";
        var discount = parseFloat($("#discount-input").value) || 0;
        var result = POS_DATA.registrarVenta(paymentMethod, discount, null, "Pendiente");
        if (result.error) { alert(result.error); return; }
        alert("Venta " + result.venta.numero + " guardada como pendiente.\nTotal: RD$ " + result.venta.total.toFixed(2));
        renderCart();
      });
    }
  }

  function focusSearch() {
    var input = $(".search-box input");
    if (input) {
      input.focus();
      input.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  function highlightSelectedCard() {
    var cards = $$(".product-card");
    cards.forEach(function (c) { c.classList.remove("selected"); });
    if (selectedCardIndex >= 0 && selectedCardIndex < cards.length) {
      cards[selectedCardIndex].classList.add("selected");
      cards[selectedCardIndex].scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  function navigateCards(direction) {
    var grid = $(".product-grid");
    if (!grid) return;
    var cards = grid.querySelectorAll(".product-card");
    if (cards.length === 0) return;
    if (direction === "next") {
      selectedCardIndex = selectedCardIndex < cards.length - 1 ? selectedCardIndex + 1 : 0;
    } else {
      selectedCardIndex = selectedCardIndex > 0 ? selectedCardIndex - 1 : cards.length - 1;
    }
    highlightSelectedCard();
  }

  function init() {
    renderProducts();
    initTabs();
    initSearch();
    renderCart();
    initCart();
    initPaymentMethods();

    /* Foco siempre en buscador: recuperar al interactuar (teclado) */
    document.addEventListener("click", function (e) {
      var tag = (e.target.tagName || "").toLowerCase();
      if (tag !== "input" && tag !== "button" && tag !== "textarea" && tag !== "select") {
        focusSearch();
      }
    });

    /* Teclado: flechas navegan productos, Enter agrega al carrito */
    document.addEventListener("keydown", function (e) {
      var tag = (e.target.tagName || "").toLowerCase();
      var inInput = tag === "input" || tag === "textarea" || tag === "select";

      if (inInput) return;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        navigateCards("next");
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        navigateCards("prev");
      } else if (e.key === "Enter") {
        e.preventDefault();
        var grid = $(".product-grid");
        if (!grid) return;
        var cards = grid.querySelectorAll(".product-card");
        if (selectedCardIndex >= 0 && selectedCardIndex < cards.length) {
          var id = cards[selectedCardIndex].getAttribute("data-id");
          if (id) {
            POS_DATA.addToCart(id);
            renderCart();
            focusSearch();
          }
        }
      } else if (e.key === "/") {
        e.preventDefault();
        focusSearch();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
