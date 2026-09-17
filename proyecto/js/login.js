/*
 * login.js — Lógica de login y registro
 * Alterna entre formulario de login y registro.
 * Valida campos, crea cuentas (rol Cajero) y inicia sesión.
 * Se ejecuta al cargar login.html.
 */
(function () {
  "use strict";

  /* Referencias DOM */
  var loginForm = document.getElementById("login-form");
  var registerForm = document.getElementById("register-form");
  var loginToggle = document.getElementById("toggle-login");
  var registerToggle = document.getElementById("toggle-register");
  var formTitle = document.getElementById("form-title");
  var errorMsg = document.getElementById("error-msg");

  /* Muestra u oculta el mensaje de error */
  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = "block";
  }

  function hideError() { errorMsg.style.display = "none"; }

  /* Alterna al formulario de login */
  function showLogin() {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    formTitle.textContent = "Iniciar sesión";
    hideError();
  }

  /* Alterna al formulario de registro */
  function showRegister() {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    formTitle.textContent = "Crear cuenta";
    hideError();
  }

  /* Toggle: enlace "Iniciar sesión" */
  loginToggle.addEventListener("click", function (e) {
    e.preventDefault();
    showLogin();
  });

  /* Toggle: enlace "Crear cuenta" */
  registerToggle.addEventListener("click", function (e) {
    e.preventDefault();
    showRegister();
  });

  /* Login: valida y autentica */
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    hideError();

    var username = document.getElementById("username").value.trim();
    var password = document.getElementById("password").value;

    if (!username || !password) {
      showError("Completa todos los campos.");
      return;
    }

    var result = POS_DATA.loginUsuario(username, password);

    if (result.exito) {
      window.location.href = "dashboard.html";
    } else {
      showError(result.error);
    }
  });

  /* Registro: valida y crea cuenta (siempre rol Cajero) */
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    hideError();

    var nombre = document.getElementById("reg-nombre").value.trim();
    var username = document.getElementById("reg-username").value.trim();
    var password = document.getElementById("reg-password").value;
    var confirm = document.getElementById("reg-confirm").value;

    if (!nombre || !username || !password || !confirm) {
      showError("Completa todos los campos.");
      return;
    }

    if (password !== confirm) {
      showError("Las contraseñas no coinciden.");
      return;
    }

    var result = POS_DATA.registrarUsuario(username, password, nombre);

    if (result.exito) {
      showError("Cuenta creada. Ahora inicia sesión.");
      showLogin();
      document.getElementById("username").value = username;
      document.getElementById("password").focus();
    } else {
      showError(result.error);
    }
  });

  /* Si ya hay sesión activa, redirige directamente al dashboard */
  if (POS_DATA.isLoggedIn()) {
    window.location.href = "dashboard.html";
  }
})();