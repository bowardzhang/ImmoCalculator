/* ================================
   ImmoCalculator - Calculation Engine
   ================================ */
(function () {
  'use strict';
  var chartInstance = null;
  var COLORS = { cashflow: '#22c55e', equity: '#3b82f6', debt: '#ef4444', propertyValue: '#eab308', zeroLine: '#475569', breakEven: '#a855f7' };
  var form = document.getElementById('calcForm');
  var chartCanvas = document.getElementById('chart');

  function initTheme() {
    var saved = localStorage.getItem('immo-theme');
    document.body.setAttribute('data-theme', saved || 'dark');
  }
  function toggleTheme() {
    var current = document.body.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', next);
    localStorage.setItem('immo-theme', next);
    if (chartInstance) run();
  }
  function formatEuroDisplay(v) {
    if (v === '' || v == null) return '';
    var cleaned = String(v).replace(/[^\d]/g, '');
    if (cleaned === '') return '';
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  function parseEuroInput(str) {
    if (!str) return 0;
    return parseFloat(String(str).replace(/\s/g, '')) || 0;
  }
  function bindNumberFormatting() {
    document.querySelectorAll('input[data-format="euro"]').forEach(function (input) {
      input.value = formatEuroDisplay(input.value);
      input.addEventListener('blur', function () { var raw = parseEuroInput(input.value); if (!isNaN(raw) && raw !== 0) input.value = formatEuroDisplay(raw); });
      input.addEventListener('focus', function () { var raw = parseEuroInput(input.value); if (raw > 0) input.value = raw; setTimeout(function () { input.select(); }, 50); });
      input.addEventListener('input', function () { input.value = input.value.replace(/[^\d\s]/g, ''); });
    });
  }
  function getInputs() {
    var g = function (id) { return parseFloat(document.getElementById(id).value.replace(/\s/g, '')) || 0; };
    return {
      purchasePrice: g('purchasePrice'), appreciationRate: g('appreciationRate') / 100, monthlyRent: g('monthlyRent'),
      rentIncrease: g('rentIncrease') / 100, grunderwerbsteuer: g('grunderwerbsteuer') / 100, notar: g('notar') / 100,
      makler: g('makler') / 100, downPayment: g('downPayment'), interestRate: g('interestRate') / 100,
      tilgung: g('tilgung') / 100, hausgeld: g('hausgeld'), grundsteuer: g('grundsteuer'), insurance: g('insurance'),
      maintenanceRate: g('maintenanceRate') / 100, taxRate: g('taxRate') / 100, afaRate: g('afaRate') / 100,
      buildingRatio: g('buildingRatio') / 100, holdingPeriod: g('holdingPeriod'),
    };
  }
  function calculate(inp) {
    var totalAcqCost = inp.purchasePrice * (1 + inp.grunderwerbsteuer + inp.notar + inp.makler);
    var loanAmount = Math.max(0, totalAcqCost - inp.downPayment);
    var annualPayment = loanAmount * (inp.interestRate + inp.tilgung);
    var monthlyPayment = annualPayment / 12;
    var years = inp.holdingPeriod;
    var data = [];
    var pv = inp.purchasePrice, rl = loanAmount, cc = -inp.downPayment, tci = inp.downPayment, rent = inp.monthlyRent * 12;
    data.push({ year: 0, propertyValue: pv, remainingLoan: rl, equity: pv - rl, cumulativeCashflow: cc, netWorth: pv - rl + cc, rent: 0, loanInterest: 0, loanRepayment: 0, maintenance: 0, hausgeld: 0, grundsteuer: 0, insurance: 0, taxEffect: 0, netCashflow: -inp.downPayment, totalCapitalInjected: tci });
    for (var y = 1; y <= years; y++) {
      pv *= 1 + inp.appreciationRate;
      if (y > 1) rent *= 1 + inp.rentIncrease;
      var maint = pv * inp.maintenanceRate;
      var hg = y === 1 ? inp.hausgeld * 12 : data[y-1].hausgeld * 1.01;
      var gs = y === 1 ? inp.grundsteuer : data[y-1].grundsteuer * 1.01;
      var ins = y === 1 ? inp.insurance : data[y-1].insurance * 1.01;
      var li = 0, lr = 0;
      if (rl > 0) { li = rl * inp.interestRate; lr = Math.min(annualPayment - li, rl); if (lr < 0) lr = 0; rl -= lr; }
      var afa = inp.purchasePrice * inp.buildingRatio * inp.afaRate;
      var ti = rent - maint - hg - gs - ins - li - afa;
      var te = ti * inp.taxRate;
      var ncf = rent - (li + lr) - maint - hg - gs - ins - te;
      cc += ncf;
      if (ncf < 0) tci += Math.abs(ncf);
      var eq = pv - Math.max(0, rl);
      var nw = eq + cc;
      data.push({ year: y, propertyValue: Math.round(pv), remainingLoan: Math.round(Math.max(0, rl)), equity: Math.round(eq), cumulativeCashflow: Math.round(cc), netWorth: Math.round(nw), rent: Math.round(rent), loanInterest: Math.round(li), loanRepayment: Math.round(lr), maintenance: Math.round(maint), hausgeld: Math.round(hg), grundsteuer: Math.round(gs), insurance: Math.round(ins), afa: Math.round(afa), taxableIncome: Math.round(ti), taxEffect: Math.round(te), netCashflow: Math.round(ncf), totalCapitalInjected: Math.round(tci) });
    }
    return { data: data, monthlyPayment: monthlyPayment, totalAcqCost: totalAcqCost, loanAmount: loanAmount };
  }

  function fmtEur(v) {
    var abs = Math.abs(v).toLocaleString('de-DE', { maximumFractionDigits: 0 });
    return (v < 0 ? '−€' : '€') + abs;
  }
  function fmtPercent(v) { return v.toFixed(1) + '%'; }
  function fmtEurPerMonth(v) { return fmtEur(v) + '/月'; }
  function findBreakEvenYear(data) {
    for (var i = 0; i < data.length; i++) { if (data[i].netWorth >= 0) return data[i].year; }
    return null;
  }
  function renderKPI(data, monthlyPayment, totalAcqCost) {
    var last = data[data.length - 1], first = data[0];
    var profit = last.netWorth - first.netWorth;
    var tc = last.totalCapitalInjected, years = data.length - 1;
    var sr = tc > 0 ? (profit / tc) * 100 : 0;
    var ar = 0;
    if (years > 0 && tc > 0) { var f = 1 + sr / 100; ar = f > 0 ? (Math.pow(f, 1 / years) - 1) * 100 : 0; }
    var be = findBreakEvenYear(data);
    setKPI('kpiTotalInvestment', fmtEur(totalAcqCost));
    setKPI('kpiMonthlyPayment', fmtEurPerMonth(monthlyPayment));
    setKPI('kpiAnnualROI', fmtPercent(ar), ar >= 0 ? 'positive' : 'negative');
    setKPI('kpiBreakEvenYear', be !== null ? '第 ' + be + ' 年' : '未达到');
    setKPI('kpiFinalEquity', fmtEur(last.equity), last.equity >= 0 ? 'positive' : 'negative');
    setKPI('kpiTotalReturn', fmtEur(last.netWorth), last.netWorth >= 0 ? 'positive' : 'negative');
  }
  function setKPI(id, value, cls) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = value;
    el.className = 'kpi-value' + (cls ? ' ' + cls : '');
  }
  var breakEvenPlugin = {
    id: 'breakEvenLine',
    afterDraw: function (chart) {
      var yr = chart.options.plugins && chart.options.plugins.breakEvenLine && chart.options.plugins.breakEvenLine.year;
      if (yr == null) return;
      var meta = chart.getDatasetMeta(3);
      if (!meta || !meta.data || meta.data.length === 0 || yr < 0 || yr >= meta.data.length) return;
      var ctx = chart.ctx, xs = chart.scales.x, ys = chart.scales.y;
      var x = xs.getPixelForValue(yr);
      ctx.save();
      ctx.beginPath(); ctx.setLineDash([6, 4]); ctx.strokeStyle = COLORS.breakEven; ctx.lineWidth = 2;
      ctx.moveTo(x, ys.top); ctx.lineTo(x, ys.bottom); ctx.stroke(); ctx.setLineDash([]);
      var label = '✨ 第 ' + yr + ' 年';
      ctx.font = 'bold 12px Inter, system-ui, sans-serif';
      var tw = ctx.measureText(label).width, ly = ys.top - 10;
      ctx.fillStyle = COLORS.breakEven + '22'; ctx.beginPath();
      ctx.roundRect(x - tw / 2 - 8, ly - 14, tw + 16, 22, 6); ctx.fill();
      ctx.strokeStyle = COLORS.breakEven; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = COLORS.breakEven; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(label, x, ly - 3);
      var pt = meta.data[yr];
      if (pt) {
        ctx.beginPath(); ctx.fillStyle = COLORS.breakEven;
        ctx.moveTo(pt.x, pt.y - 6); ctx.lineTo(pt.x - 7, pt.y - 20); ctx.lineTo(pt.x + 7, pt.y - 20);
        ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff'; ctx.fill();
        ctx.strokeStyle = COLORS.breakEven; ctx.lineWidth = 2.5; ctx.stroke();
      }
      ctx.restore();
    },
  };
  Chart.register(breakEvenPlugin);

  function renderChart(data) {
    var bey = findBreakEvenYear(data);
    var labels = data.map(function(d) { return d.year === 0 ? '0 (买入)' : String(d.year); });
    var isDark = document.body.getAttribute('data-theme') !== 'light';
    var gc = isDark ? '#1e293b' : '#e2e8f0';
    var tc = isDark ? '#64748b' : '#64748b';
    var tlc = isDark ? '#94a3b8' : '#475569';
    var lc = isDark ? '#94a3b8' : '#334155';
    var datasets = [
      { label: '累计净现金流 (Kum. Cashflow)', data: data.map(function(d){return d.cumulativeCashflow;}), borderColor: COLORS.cashflow, fill: false, tension: 0.3, pointRadius: 2, borderWidth: 2 },
      { label: '房屋净值 (Eigenkapital)', data: data.map(function(d){return d.equity;}), borderColor: COLORS.equity, fill: false, tension: 0.3, pointRadius: 2, borderWidth: 2 },
      { label: '剩余贷款 (Restschuld)', data: data.map(function(d){return d.remainingLoan;}), borderColor: COLORS.debt, fill: false, tension: 0.3, pointRadius: 2, borderWidth: 2, borderDash: [5,5] },
      { label: '总净资产 (Gesamtvermögen)', data: data.map(function(d){return d.netWorth;}), borderColor: COLORS.propertyValue, fill: false, tension: 0.3, pointRadius: 2, borderWidth: 2.5 },
    ];
    var config = {
      type: 'line', data: { labels: labels, datasets: datasets },
      options: {
        responsive: true, maintainAspectRatio: true, aspectRatio: 1.6,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'bottom', labels: { color: lc, boxWidth: 14, padding: 16, font: { family: 'Inter', size: 11 } } },
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#475569' : '#cbd5e1',
            borderWidth: 1, padding: 10,
            titleFont: { family: 'Inter', size: 12 }, bodyFont: { family: 'Inter', size: 12 },
            titleColor: isDark ? '#f1f5f9' : '#1e293b', bodyColor: isDark ? '#94a3b8' : '#475569',
            callbacks: { label: function(ctx) { return ctx.dataset.label + ': ' + fmtEur(ctx.raw); } },
          },
          breakEvenLine: { year: bey },
        },
        scales: {
          x: { title: { display: true, text: '年份 (Jahr)', color: tlc, font: { family: 'Inter', size: 12 } }, ticks: { color: tc, font: { family: 'Inter', size: 11 } }, grid: { color: gc } },
          y: { title: { display: true, text: '金额 (€)', color: tlc, font: { family: 'Inter', size: 12 } },
            ticks: { color: tc, font: { family: 'Inter', size: 11 }, callback: function(v) { if (Math.abs(v)>=1e6) return (v/1e6).toFixed(1)+'M'; if (Math.abs(v)>=1000) return (v/1e3).toFixed(0)+'k'; return v; } },
            grid: { color: gc } },
        },
      },
    };
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(chartCanvas, config);
  }
  function renderTable(data) {
    var thead = document.querySelector('#dataTable thead');
    var tbody = document.querySelector('#dataTable tbody');
    if (!thead || !tbody) return;
    var cols = [
      { key: 'year', label: '年份' }, { key: 'propertyValue', label: '房价' },
      { key: 'remainingLoan', label: '剩余贷款' }, { key: 'equity', label: '房屋净值' },
      { key: 'cumulativeCashflow', label: '累计现金流' }, { key: 'netWorth', label: '总净资产' },
      { key: 'rent', label: '租金收入' }, { key: 'loanInterest', label: '贷款利息' },
      { key: 'loanRepayment', label: '本金偿还' }, { key: 'netCashflow', label: '年度净现金流' },
    ];
    thead.innerHTML = '<tr>' + cols.map(function(c){return '<th>'+c.label+'</th>';}).join('') + '</tr>';
    tbody.innerHTML = data.map(function(row) {
      return '<tr>' + cols.map(function(c) {
        var v = row[c.key];
        return '<td>' + (c.key === 'year' ? String(v) : fmtEur(v)) + '</td>';
      }).join('') + '</tr>';
    }).join('');
  }
  function run() {
    var inp = getInputs();
    if (inp.downPayment >= inp.purchasePrice * (1 + inp.grunderwerbsteuer + inp.notar + inp.makler)) {
      alert('首付金额超过总购房成本！请减少首付或增加房屋价格。');
      return;
    }
    var result = calculate(inp);
    renderKPI(result.data, result.monthlyPayment, result.totalAcqCost);
    renderChart(result.data);
    renderTable(result.data);
  }
  form.addEventListener('submit', function(e) { e.preventDefault(); run(); });
  document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    bindNumberFormatting();
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    run();
  });
})();
