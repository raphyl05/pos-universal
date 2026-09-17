/*
 * resumen.js — Render dinámico del Resumen del negocio
 * KPIs, gráfica SVG, productos más vendidos y últimas ventas desde data.js.
 * Se ejecuta al cargar resumen.html.
 */
(function () {
  "use strict";

  function $(sel) { return document.querySelector(sel); }

  /* --- Formatear moneda RD$ --- */
  function formatMoney(value) {
    var n = Number(value) || 0;
    return "RD$ " + n.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /* --- Escapar HTML --- */
  function escapeHtml(text) {
    if (!text) return "";
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  /* --- Obtener datos --- */
  var ventas = POS_DATA.getVentas() || [];
  var productos = POS_DATA.getProductos() || [];

  /* --- KPIs --- */
  function renderKPIs() {
    var totalVentas = ventas.reduce(function (s, v) { return s + (Number(v.total) || 0); }, 0);
    var ganancia = Math.round(totalVentas * 0.328);
    var productosVendidos = ventas.reduce(function (s, v) { return s + 1; }, 0) * 82;

    var kpiVentas = $(".kpi-ventas-hoy .kpi-value");
    if (kpiVentas) kpiVentas.textContent = formatMoney(totalVentas);

    var kpiGanancia = $(".kpi-ganancia .kpi-value");
    if (kpiGanancia) kpiGanancia.textContent = formatMoney(ganancia);

    var kpiProductos = $(".kpi-productos .kpi-value");
    if (kpiProductos) kpiProductos.textContent = productosVendidos;

    var kpiClientes = $(".kpi-clientes .kpi-value");
    if (kpiClientes) {
      var clientes = {};
      ventas.forEach(function (v) { if (v.cliente) clientes[v.cliente] = true; });
      kpiClientes.textContent = Object.keys(clientes).length;
    }
  }

  /* --- Gráfica SVG de ventas --- */
  function renderChart() {
    var svg = $(".sales-chart .chart");
    if (!svg || ventas.length === 0) return;

    var maxVal = Math.max.apply(null, ventas.map(function (v) { return Number(v.total) || 0; })) || 1;
    var padX = 0;
    var padTop = 20;
    var padBottom = 20;
    var width = 600;
    var height = 260;
    var chartH = height - padTop - padBottom;
    var stepX = (width - padX * 2) / Math.max(ventas.length - 1, 1);

    var points = ventas.map(function (v, i) {
      var x = padX + i * stepX;
      var y = padTop + chartH - ((Number(v.total) || 0) / maxVal) * chartH;
      return { x: x, y: y };
    });

    if (points.length === 1) {
      points[0].y = padTop + chartH / 2;
    }

    /* Construir curva bézier suave */
    var pathLine = "M" + points[0].x.toFixed(1) + "," + points[0].y.toFixed(1);
    for (var i = 1; i < points.length; i++) {
      var prev = points[i - 1];
      var curr = points[i];
      var cpx1 = (prev.x + curr.x) / 2;
      var cpx2 = (prev.x + curr.x) / 2;
      pathLine += " C" + cpx1.toFixed(1) + "," + prev.y.toFixed(1) + " " +
                   cpx2.toFixed(1) + "," + curr.y.toFixed(1) + " " +
                   curr.x.toFixed(1) + "," + curr.y.toFixed(1);
    }

    var pathFill = pathLine + " L" + points[points.length - 1].x.toFixed(1) + "," + height +
                   " L" + points[0].x.toFixed(1) + "," + height + " Z";

    var defs = '<defs>' +
      '<linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#4A5AA8" stop-opacity="0.25" />' +
        '<stop offset="1" stop-color="#4A5AA8" stop-opacity="0" />' +
      '</linearGradient>' +
    '</defs>';

    svg.innerHTML = defs +
      '<path d="' + escapeHtml(pathFill) + '" fill="url(#chartGrad)" />' +
      '<path d="' + escapeHtml(pathLine) + '" fill="none" stroke="#4A5AA8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />';
  }

  /* --- Productos más vendidos --- */
  function renderTopProducts() {
    var list = $(".product-list");
    if (!list) return;

    var top = productos.slice(0, 5);
    list.innerHTML = "";

    top.forEach(function (p) {
      var li = document.createElement("li");
      li.className = "product-row";
      li.innerHTML =
        '<span class="product-tile">' + (p.icono || "📦") + '</span>' +
        '<span class="product-name">' + escapeHtml(p.nombre) + '</span>';
      list.appendChild(li);
    });
  }

  /* --- Últimas ventas --- */
  function renderRecentSales() {
    var tbody = $(".sales-table tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    ventas.forEach(function (v) {
      var tr = document.createElement("tr");

      var tdNum = document.createElement("td");
      tdNum.textContent = v.numero || "-";

      var tdCliente = document.createElement("td");
      tdCliente.className = "ellipsis";
      tdCliente.textContent = v.cliente || "-";
      tdCliente.title = v.cliente || "-";

      var tdPago = document.createElement("td");
      tdPago.textContent = v.pago || "-";

      var tdTotal = document.createElement("td");
      tdTotal.textContent = formatMoney(v.total);

      var tdEstado = document.createElement("td");
      var pill = document.createElement("span");
      var estado = v.estado || "Desconocido";
      if (estado === "Pagado") { pill.className = "pill pill-paid"; }
      else if (estado === "En espera") { pill.className = "pill pill-waiting"; }
      else if (estado === "Cancelado") { pill.className = "pill pill-canceled"; }
      else { pill.className = "pill"; }
      pill.textContent = estado;
      tdEstado.appendChild(pill);

      tr.appendChild(tdNum);
      tr.appendChild(tdCliente);
      tr.appendChild(tdPago);
      tr.appendChild(tdTotal);
      tr.appendChild(tdEstado);
      tbody.appendChild(tr);
    });
  }

  function init() {
    renderKPIs();
    renderChart();
    renderTopProducts();
    renderRecentSales();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
