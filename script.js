/* ================================
   ImmoCalculator — Calculation Engine
   ================================ */

(function () {
  'use strict';

  // ===== Chart instance (kept alive across recalculations) =====
  let chartInstance = null;

  // ===== Color palette =====
  const COLORS = {
    cashflow: '#22c55e',
    equity: '#3b82f6',
    debt: '#ef4444',
    propertyValue: '#eab308',
    zeroLine: '#475569',
  };

  // ===== Form & DOM refs =====
  const form = document.getElementById('calcForm');
  const chartCanvas = document.getElementById('chart');

  // ===== Read inputs =====
  function getInputs() {
    const g = (id) => parseFloat(document.getElementById(id).value) || 0;
    return {
      purchasePrice: g('purchasePrice'),
      appreciationRate: g('appreciationRate') / 100,
      monthlyRent: g('monthlyRent'),
      rentIncrease: g('rentIncrease') / 100,
      grunderwerbsteuer: g('grunderwerbsteuer') / 100,
      notar: g('notar') / 100,
      makler: g('makler') / 100,
      downPayment: g('downPayment'),
      interestRate: g('interestRate') / 100,
      tilgung: g('tilgung') / 100,
      hausgeld: g('hausgeld'),
      grundsteuer: g('grundsteuer'),
      insurance: g('insurance'),
      maintenanceRate: g('maintenanceRate') / 100,
      taxRate: g('taxRate') / 100,
      afaRate: g('afaRate') / 100,
      buildingRatio: g('buildingRatio') / 100,
      holdingPeriod: g('holdingPeriod'),
    };
  }

  // ===== Core Calculation =====
  function calculate(inp) {
    // --- Derived values ---
    const totalAcqCost =
      inp.purchasePrice * (1 + inp.grunderwerbsteuer + inp.notar + inp.makler);
    const loanAmount = Math.max(0, totalAcqCost - inp.downPayment);
    const annualPayment = loanAmount * (inp.interestRate + inp.tilgung);
    const monthlyPayment = annualPayment / 12;

    // --- Year-by-year simulation ---
    const years = inp.holdingPeriod;
    const data = [];

    // Year 0 (acquisition)
    let propertyValue = inp.purchasePrice;
    let remainingLoan = loanAmount;
    let cumulativeCashflow = -inp.downPayment; // initial outflow
    let totalCapitalInjected = inp.downPayment;
    let rent = inp.monthlyRent * 12;

    data.push({
      year: 0,
      propertyValue,
      remainingLoan,
      equity: propertyValue - remainingLoan,
      cumulativeCashflow,
      netWorth: propertyValue - remainingLoan + cumulativeCashflow,
      rent: 0,
      loanInterest: 0,
      loanRepayment: 0,
      maintenance: 0,
      hausgeld: 0,
      grundsteuer: 0,
      insurance: 0,
      taxEffect: 0,
      netCashflow: -inp.downPayment,
      totalCapitalInjected,
    });

    // Year 1..N
    for (let y = 1; y <= years; y++) {
      // Property value (appreciation)
      propertyValue *= 1 + inp.appreciationRate;

      // Rent (increase each year, starting year 2)
      if (y > 1) rent *= 1 + inp.rentIncrease;

      // Operating costs (with 1% yearly inflation for realism)
      const maintenance = propertyValue * inp.maintenanceRate;
      const hausgeldYr =
        y === 1
          ? inp.hausgeld * 12
          : data[y - 1].hausgeld * 1.01;
      const grundsteuerYr =
        y === 1 ? inp.grundsteuer : data[y - 1].grundsteuer * 1.01;
      const insuranceYr =
        y === 1 ? inp.insurance : data[y - 1].insurance * 1.01;

      // Loan (annuity) — only if loan not yet fully repaid
      let loanInterest = 0;
      let loanRepayment = 0;
      if (remainingLoan > 0) {
        loanInterest = remainingLoan * inp.interestRate;
        loanRepayment = Math.min(
          annualPayment - loanInterest,
          remainingLoan
        );
        if (loanRepayment < 0) loanRepayment = 0;
        remainingLoan -= loanRepayment;
      }

      // AfA depreciation (non-cash, for tax purposes)
      const afa = inp.purchasePrice * inp.buildingRatio * inp.afaRate;

      // Tax calculation
      const taxableIncome =
        rent -
        maintenance -
        hausgeldYr -
        grundsteuerYr -
        insuranceYr -
        loanInterest -
        afa;
      const taxEffect = taxableIncome * inp.taxRate; // negative → tax refund

      // Net cash flow (actual money movement)
      const netCashflow =
        rent -
        (loanInterest + loanRepayment) -
        maintenance -
        hausgeldYr -
        grundsteuerYr -
        insuranceYr -
        taxEffect;

      cumulativeCashflow += netCashflow;

      // Track total capital injected
      if (netCashflow < 0) {
        totalCapitalInjected += Math.abs(netCashflow);
      }

      const equity = propertyValue - Math.max(0, remainingLoan);
      const netWorth = equity + cumulativeCashflow;

      data.push({
        year: y,
        propertyValue: Math.round(propertyValue),
        remainingLoan: Math.round(Math.max(0, remainingLoan)),
        equity: Math.round(equity),
        cumulativeCashflow: Math.round(cumulativeCashflow),
        netWorth: Math.round(netWorth),
        rent: Math.round(rent),
        loanInterest: Math.round(loanInterest),
        loanRepayment: Math.round(loanRepayment),
        maintenance: Math.round(maintenance),
        hausgeld: Math.round(hausgeldYr),
        grundsteuer: Math.round(grundsteuerYr),
        insurance: Math.round(insuranceYr),
        afa: Math.round(afa),
        taxableIncome: Math.round(taxableIncome),
        taxEffect: Math.round(taxEffect),
        netCashflow: Math.round(netCashflow),
        totalCapitalInjected: Math.round(totalCapitalInjected),
      });
    }

    return { data, monthlyPayment, totalAcqCost, loanAmount };
  }

  // ===== Format helpers =====
  function fmtEur(v) {
    const abs = Math.abs(v).toLocaleString('de-DE', {
      maximumFractionDigits: 0,
    });
    return (v < 0 ? '−€' : '€') + abs;
  }

  function fmtPercent(v) {
    return v.toFixed(1) + '%';
  }

  function fmtEurPerYear(v) {
    return fmtEur(v) + '/年';
  }

  function fmtEurPerMonth(v) {
    return fmtEur(v) + '/月';
  }

  // ===== Render KPI Cards =====
  function renderKPI(data, monthlyPayment, totalAcqCost) {
    const last = data[data.length - 1];
    const first = data[0];

    // === Profit & ROI ===
    // Profit = net worth at end - net worth at start
    // At start (year 0): netWorth = purchasePrice - totalAcqCost = -transactionCosts (negative)
    // At end: netWorth = propertyEquity + cumulativeCashflow
    // profit = netWorth[N] - netWorth[0] = netWorth[N] + transactionCosts
    const profit = last.netWorth - first.netWorth;

    // Total capital user ever put in from their own pocket:
    // downPayment (year 0) + any annual cash deficits covered
    const totalCapital = last.totalCapitalInjected;

    const years = data.length - 1;

    // Simple ROI = profit / totalCapital * 100
    const simpleROI = totalCapital > 0 ? (profit / totalCapital) * 100 : 0;

    // Annualized ROI = (1 + totalROI)^(1/years) - 1
    let annualROI = 0;
    if (years > 0 && totalCapital > 0) {
      const totalReturnFactor = 1 + simpleROI / 100;
      annualROI = totalReturnFactor > 0
        ? (Math.pow(totalReturnFactor, 1 / years) - 1) * 100
        : 0;
    }

    // Break-even year: when netWorth >= 0
    let breakEvenYear = '—';
    for (let i = 0; i < data.length; i++) {
      if (data[i].netWorth >= 0) {
        breakEvenYear = data[i].year;
        break;
      }
    }

    // Update KPIs
    setKPI('kpiTotalInvestment', fmtEur(totalAcqCost));
    setKPI('kpiMonthlyPayment', fmtEurPerMonth(monthlyPayment));
    setKPI('kpiAnnualROI', fmtPercent(annualROI), annualROI >= 0 ? 'positive' : 'negative');
    setKPI('kpiBreakEvenYear', String(breakEvenYear));
    setKPI('kpiFinalEquity', fmtEur(last.equity), last.equity >= 0 ? 'positive' : 'negative');
    setKPI('kpiTotalReturn', fmtEur(last.netWorth), last.netWorth >= 0 ? 'positive' : 'negative');
  }

  function setKPI(id, value, cls) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value;
    el.className = 'kpi-value' + (cls ? ' ' + cls : '');
  }

  // ===== Render Chart =====
  function renderChart(data) {
    const labels = data.map((d) => (d.year === 0 ? '0 (买入)' : String(d.year)));

    const datasets = [
      {
        label: '累计净现金流 (Kum. Cashflow)',
        data: data.map((d) => d.cumulativeCashflow),
        borderColor: COLORS.cashflow,
        backgroundColor: COLORS.cashflow + '20',
        fill: false,
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 2,
      },
      {
        label: '房屋净值 (Eigenkapital)',
        data: data.map((d) => d.equity),
        borderColor: COLORS.equity,
        backgroundColor: COLORS.equity + '20',
        fill: false,
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 2,
      },
      {
        label: '剩余贷款 (Restschuld)',
        data: data.map((d) => d.remainingLoan),
        borderColor: COLORS.debt,
        backgroundColor: COLORS.debt + '20',
        fill: false,
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 2,
        borderDash: [5, 5],
      },
      {
        label: '总净资产 (Gesamtvermögen)',
        data: data.map((d) => d.netWorth),
        borderColor: COLORS.propertyValue,
        backgroundColor: COLORS.propertyValue + '20',
        fill: false,
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 2.5,
      },
    ];

    const config = {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.6,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              boxWidth: 14,
              padding: 16,
              font: { family: 'Inter', size: 11 },
            },
          },
          tooltip: {
            backgroundColor: '#1e293b',
            borderColor: '#475569',
            borderWidth: 1,
            padding: 10,
            bodyFont: { family: 'Inter', size: 12 },
            callbacks: {
              label: function (ctx) {
                return ctx.dataset.label + ': ' + fmtEur(ctx.raw);
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: '年份 (Jahr)',
              color: '#94a3b8',
              font: { family: 'Inter', size: 12 },
            },
            ticks: {
              color: '#64748b',
              font: { family: 'Inter', size: 11 },
            },
            grid: { color: '#1e293b' },
          },
          y: {
            title: {
              display: true,
              text: '金额 (€)',
              color: '#94a3b8',
              font: { family: 'Inter', size: 12 },
            },
            ticks: {
              color: '#64748b',
              font: { family: 'Inter', size: 11 },
              callback: function (v) {
                if (Math.abs(v) >= 1000000) return (v / 1000000).toFixed(1) + 'M';
                if (Math.abs(v) >= 1000) return (v / 1000).toFixed(0) + 'k';
                return v;
              },
            },
            grid: { color: '#1e293b' },
          },
        },
      },
    };


    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(chartCanvas, config);
  }

  // ===== Render Data Table =====
  function renderTable(data) {
    const thead = document.querySelector('#dataTable thead');
    const tbody = document.querySelector('#dataTable tbody');
    if (!thead || !tbody) return;

    const columns = [
      { key: 'year', label: '年份' },
      { key: 'propertyValue', label: '房价' },
      { key: 'remainingLoan', label: '剩余贷款' },
      { key: 'equity', label: '房屋净值' },
      { key: 'cumulativeCashflow', label: '累计现金流' },
      { key: 'netWorth', label: '总净资产' },
      { key: 'rent', label: '租金收入' },
      { key: 'loanInterest', label: '贷款利息' },
      { key: 'loanRepayment', label: '本金偿还' },
      { key: 'netCashflow', label: '年度净现金流' },
    ];

    // Header
    thead.innerHTML =
      '<tr>' +
      columns
        .map((c) => `<th>${c.label}</th>`)
        .join('') +
      '</tr>';

    // Body
    tbody.innerHTML = data
      .map((row) => {
        const vals = columns.map((c) => {
          const v = row[c.key];
          if (c.key === 'year') return String(v);
          return fmtEur(v);
        });
        return '<tr>' + vals.map((v) => `<td>${v}</td>`).join('') + '</tr>';
      })
      .join('');
  }

  // ===== Main =====
  function run() {
    const inp = getInputs();

    // Validation
    if (inp.downPayment >= inp.purchasePrice * (1 + inp.grunderwerbsteuer + inp.notar + inp.makler)) {
      alert('首付金额超过总购房成本！请减少首付或增加房屋价格。');
      return;
    }

    const result = calculate(inp);
    const { data, monthlyPayment, totalAcqCost } = result;

    renderKPI(data, monthlyPayment, totalAcqCost);
    renderChart(data);
    renderTable(data);
  }

  // ===== Boot =====
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    run();
  });

  // Run on page load
  document.addEventListener('DOMContentLoaded', run);
})();