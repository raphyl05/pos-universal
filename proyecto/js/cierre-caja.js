(function () {
    "use strict";

    function $(sel) { return document.querySelector(sel); }
    function $$(sel) { return document.querySelectorAll(sel); }

    function formatMoney(value) {
        return "RD$ " + Number(value).toFixed(2);
    }

    function parseDenom(text) {
        var n = parseFloat(String(text).replace(/RD\$|[^0-9.]/g, ""));
        return Number.isFinite(n) ? n : 0;
    }

    function recalculate() {
        var rows = $$(".table-card .table-row");
        var totalContado = 0;

        rows.forEach(function (row) {
            var input = row.querySelector("input[type='number']");
            var subtotal = row.querySelector(".subtotal");
            var denom = row.querySelector(".denom");
            if (!input || !subtotal || !denom) return;

            var cantidad = parseInt(input.value, 10) || 0;
            var denomValue = parseDenom(denom.textContent);
            var sub = cantidad * denomValue;
            subtotal.textContent = formatMoney(sub);
            totalContado += sub;
        });

        var totalContadoEl = $("#total-contado");
        if (totalContadoEl) totalContadoEl.textContent = formatMoney(totalContado);

        var totalEsperadoEl = $("#total-esperado");
        if (totalEsperadoEl) {
            var totalEsperado = parseDenom(totalEsperadoEl.textContent);
            var diferencia = totalContado - totalEsperado;
            var diffEl = $("#differencia");
            if (diffEl) {
                var sign = diferencia < 0 ? "-" : "";
                diffEl.textContent = sign + formatMoney(Math.abs(diferencia));
                diffEl.className = "diff-badge" + (Math.abs(diferencia) < 0.01 ? " diff-ok" : " diff-alert");
            }

            var alertBox = $(".alert-box");
            if (alertBox) {
                if (Math.abs(diferencia) < 0.01) {
                    alertBox.style.display = "none";
                } else {
                    alertBox.style.display = "flex";
                    var diffText = diferencia >= 0 ? "" : "-";
                    alertBox.querySelector("p").innerHTML =
                        "<strong>Atención:</strong> Diferencia de " + diffText + formatMoney(Math.abs(diferencia)) + " en efectivo.";
                }
            }
        }
    }

    function init() {
        var inputs = $$(".table-card .table-row input[type='number']");
        inputs.forEach(function (input) {
            input.addEventListener("input", recalculate);
        });

        recalculate();

        var closeBtn = $(".btn-close-cash");
        if (closeBtn) {
            closeBtn.addEventListener("click", function () {
                var totalContadoEl = $("#total-contado");
                var totalEsperadoEl = $("#total-esperado");
                var diffEl = $("#differencia");

                var totalContado = parseDenom(totalContadoEl ? totalContadoEl.textContent : "0");
                var totalEsperado = parseDenom(totalEsperadoEl ? totalEsperadoEl.textContent : "0");
                var diferencia = totalContado - totalEsperado;

                if (!confirm("¿Confirmar cierre de caja?\nTotal contado: " + formatMoney(totalContado) +
                    "\nDiferencia: " + (diferencia >= 0 ? "" : "-") + formatMoney(Math.abs(diferencia)))) {
                    return;
                }

                var session = POS_DATA.getSession();
                var cajero = session ? session.nombre : "Lissette Díaz";

                var rows = $$(".table-card .table-row");
                var denominaciones = [];
                rows.forEach(function (row) {
                    var input = row.querySelector("input[type='number']");
                    var denom = row.querySelector(".denom");
                    if (!input || !denom) return;
                    denominaciones.push({
                        denom: denom.textContent.trim(),
                        cantidad: parseInt(input.value, 10) || 0
                    });
                });

                var result = POS_DATA.setCierre({
                    fecha: new Date().toISOString(),
                    cajero: cajero,
                    fondoInicial: POS_DATA.getApertura() ? POS_DATA.getApertura().fondo : 0,
                    totalContado: totalContado,
                    totalEsperado: totalEsperado,
                    diferencia: diferencia,
                    denominaciones: denominaciones
                });

                if (result.error) {
                    alert(result.error);
                    return;
                }

                alert("Cierre de caja realizado con éxito.\nDiferencia: " + (diferencia >= 0 ? "" : "-") + formatMoney(Math.abs(diferencia)));
                window.location.href = "dashboard.html";
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
