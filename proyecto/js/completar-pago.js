/*
 * completar-pago.js — Modal "Completar pago" sobre pantalla de venta
 * Lee datos de venta desde sessionStorage, muestra modal,
 * calcula cambio, confirma pago.
 * Se ejecuta al cargar completar-pago.html.
 */
(function () {
  "use strict";

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return document.querySelectorAll(sel); }

  /* Leer datos de venta desde sessionStorage */
  var saleData = null;
  try {
    saleData = JSON.parse(sessionStorage.getItem("pos_sale_data"));
  } catch (e) { saleData = null; }

  if (!saleData || !saleData.calc) {
    alert("No hay datos de venta. Regresando...");
    window.location.href = "venta.html";
    return;
  }

  var calc = saleData.calc;
  var discount = saleData.discount || 0;

  /* Poblar totales */
  function populate() {
    var el;
    el = $("#total-a-pagar");
    if (el) el.textContent = "RD$ " + Number(calc.total).toFixed(2);

    el = $("#bg-total");
    if (el) el.textContent = "RD$ " + Number(calc.total).toFixed(2);

    var rows = $$(".bg-sum-row");
    rows.forEach(function (row) {
      var label = row.querySelector("span");
      if (!label) return;
      var text = label.textContent.trim();
      var val = row.querySelector("strong");
      if (!val) return;
      if (text === "Subtotal") val.textContent = "RD$ " + Number(calc.subtotal).toFixed(2);
      else if (text === "Descuento") val.textContent = "-RD$ " + Number(calc.descuento).toFixed(2);
      else if (text === "Impuestos") val.textContent = "RD$ " + Number(calc.impuestos).toFixed(2);
      else if (text === "Total") val.textContent = "RD$ " + Number(calc.subtotal + calc.impuestos - calc.descuento).toFixed(2);
      else if (text === "Total a pagar") val.textContent = "RD$ " + Number(calc.total).toFixed(2);
    });
  }

  /* Métodos de pago del modal */
  function initPaymentMethods() {
    var btns = $$(".pay-method");
    if (btns.length === 0) return;
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        btns.forEach(function (b) { b.classList.remove("selected"); });
        btn.classList.add("selected");
      });
    });
  }

  /* Recibido → calcular Cambio en vivo */
  function initRecibido() {
    var input = $("#recibido-input");
    if (!input) return;
    input.addEventListener("input", function () {
      var received = parseFloat(input.value) || 0;
      var change = received - calc.total;
      var cambioEl = $("#cambio-value");
      if (cambioEl) {
        cambioEl.textContent = "RD$ " + Number(change).toFixed(2);
        cambioEl.style.color = change >= 0 ? "#2FAE62" : "#B02A37";
      }
    });
  }

  /* Confirmar pago */
  function initConfirm() {
    var btn = $(".btn-confirm");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var selected = $(".pay-method.selected");
      var method = selected ? selected.querySelector("span").textContent.trim() : "Efectivo";
      var clientData = saleData.clientData || null;

      var result = POS_DATA.registrarVenta(method, discount, clientData);
      if (result.error) {
        alert(result.error);
        return;
      }

      var receivedInput = $("#recibido-input");
      var received = parseFloat(receivedInput ? receivedInput.value : 0) || 0;
      var change = received - calc.total;
      if (change < 0) {
        alert("Monto insuficiente. Faltan RD$ " + Number(-change).toFixed(2));
        return;
      }

      alert("Pago completado.\nVenta: " + result.venta.numero + "\nMétodo: " + method + "\nCambio: RD$ " + Number(change >= 0 ? change : 0).toFixed(2));

      sessionStorage.removeItem("pos_sale_data");
      window.location.href = "venta.html";
    });
  }

  /* Cancelar */
  function initCancel() {
    var btn = $(".btn-cancel");
    if (!btn) return;
    btn.addEventListener("click", function () {
      sessionStorage.removeItem("pos_sale_data");
      window.location.href = "venta.html";
    });
  }

  function init() {
    populate();
    initPaymentMethods();
    initRecibido();
    initConfirm();
    initCancel();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
