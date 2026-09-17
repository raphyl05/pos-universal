(function () {
  "use strict";

  function $(sel) { return document.querySelector(sel); }

  var loginForm = document.getElementById("login-form");
  var registerForm = document.getElementById("register-form");
  var loginToggle = document.getElementById("toggle-login");
  var registerToggle = document.getElementById("toggle-register");
  var formTitle = document.getElementById("form-title");
  var errorMsg = document.getElementById("error-msg");

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = "block";
  }

  function hideError() {
    errorMsg.style.display = "none";
  }

  function showLogin() {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    formTitle.textContent = "Iniciar sesión";
    hideError();
  }

  function showRegister() {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    formTitle.textContent = "Crear cuenta";
    hideError();
  }

  loginToggle.addEventListener("click", function (e) {
    e.preventDefault();
    showLogin();
  });

  registerToggle.addEventListener("click", function (e) {
    e.preventDefault();
    showRegister();
  });

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

  if (POS_DATA.isLoggedIn()) {
    window.location.href = "dashboard.html";
  }
})();