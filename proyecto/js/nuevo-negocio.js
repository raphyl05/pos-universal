/*
 * nuevo-negocio.js — Lógica del formulario "Crear nuevo negocio"
 * Preview en vivo, validación, guardado en data.js, redirect a dashboard.
 * Se ejecuta al cargar nuevo-negocio.html.
 */
(function () {
  "use strict";

  function $(sel) { return document.querySelector(sel); }

  var nombre = $("#f-nombre");
  var tipo = $("#f-tipo");
  var direccion = $("#f-direccion");
  var telefono = $("#f-telefono");
  var dueno = $("#f-dueño");
  var fecha = $("#f-fecha");
  var prevNombre = $("#prev-nombre");
  var prevTipo = $("#pre-tipo");
  var btnGuardar = $("#btn-guardar");

  /* Fecha por defecto: hoy */
  if (fecha) {
    fecha.value = new Date().toISOString().split("T")[0];
  }

  /* Preview en vivo: nombre y tipo */
  function updatePreview() {
    if (prevNombre) {
      prevNombre.textContent = nombre.value.trim() || "Mi nuevo negocio";
    }
    if (prevTipo) {
      prevTipo.textContent = tipo.value;
    }
  }

  if (nombre) nombre.addEventListener("input", updatePreview);
  if (tipo) tipo.addEventListener("change", updatePreview);

  /* Guardar negocio */
  if (btnGuardar) {
    btnGuardar.addEventListener("click", function () {
      var nombreVal = nombre.value.trim();
      var tipoVal = tipo.value;

      if (!nombreVal) {
        showError("El nombre del negocio es obligatorio.");
        nombre.focus();
        return;
      }

      if (!tipoVal) {
        showError("El tipo de negocio es obligatorio.");
        tipo.focus();
        return;
      }

      var result = POS_DATA.registrarNegocio(nombreVal, tipoVal);

      if (result.exito) {
        window.location.href = "dashboard.html";
      } else {
        showError(result.error);
      }
    });
  }

  function showError(msg) {
    var existing = $(".error-msg");
    if (existing) existing.remove();

    var error = document.createElement("div");
    error.className = "error-msg";
    error.textContent = msg;

    var formCard = $(".form-card");
    if (formCard) {
      formCard.insertBefore(error, formCard.firstChild);
    }
  }
})();