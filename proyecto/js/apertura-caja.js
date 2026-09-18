(function () {
    "use strict";

    function $(sel) { return document.querySelector(sel); }
    function $$(sel) { return document.querySelectorAll(sel); }

    function parseMoney(raw) {
        var n = parseFloat(String(raw).replace(/[RD$\s,.]/g, "").replace(/^([\d.]+)$/, "$1"));
        if (isNaN(n)) n = parseFloat(String(raw).replace(/[^0-9.]/g, ""));
        return n;
    }

    function formatMoney(value) {
        return "RD$ " + (Number.isFinite(value) ? value.toFixed(2) : "0.00");
    }

    function init() {
        var fondoInput = $("#fondo-inicial");
        var totalApertura = $("#total-apertura");
        var openBtn = $(".btn-open");

        if (!fondoInput || !openBtn) return;

        fondoInput.addEventListener("input", function () {
            var val = parseMoney(fondoInput.value);
            if (totalApertura) totalApertura.textContent = formatMoney(val);
        });

        openBtn.addEventListener("click", function () {
            var raw = fondoInput.value.trim();
            var fondo = parseMoney(raw);

            if (!Number.isFinite(fondo) || fondo <= 0) {
                alert("El fondo inicial debe ser mayor a RD$ 0.00.");
                return;
            }

            var session = POS_DATA.getSession();
            var cajero = session ? session.nombre : "Lissette Díaz";
            var result = POS_DATA.setApertura(fondo, cajero);
            if (result.error) {
                alert(result.error);
                return;
            }

            alert("Caja abierta con éxito.\nFondo: " + formatMoney(fondo) + "\nCajero: " + cajero);
            window.location.href = "dashboard.html";
        });

        var apertura = POS_DATA.getApertura();
        if (apertura && apertura.fondo) {
            fondoInput.value = apertura.fondo.toFixed(2);
            if (totalApertura) totalApertura.textContent = formatMoney(apertura.fondo);
        }

        setTimeout(function () { fondoInput.focus(); }, 100);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
