window.IMMO_UI_TEXT = {
  cn: {
    htmlLang: 'zh-CN',
    languageButton: '中文',
    sectionLegends: [
      '📋 房屋参数', '💰 交易成本',
      '🏦 贷款参数 <small>Annuitätendarlehen</small>',
      '🔧 持有成本', '📊 税务参数 <small>(可选)</small>', '⏱ 模拟周期'
    ],
    parameterLabels: {
      purchasePrice: '购买价格 <small>(Kaufpreis)</small>',
      appreciationRate: '年增值率 <small>(Wertsteigerung)</small>',
      monthlyRent: '月租金 <small>(Kaltmiete)</small>',
      rentIncrease: '年租金涨幅',
      grunderwerbsteuer: '房产交易税 <small>(Grunderwerbsteuer)</small>',
      notar: '公证及土地登记 <small>(Notar + Grundbuch)</small>',
      makler: '中介费 <small>(Maklergebühr)</small>',
      downPayment: '首付 <small>(Eigenkapital)</small>',
      interestRate: '贷款利率 <small>(Sollzins)</small>',
      tilgung: '初始本金偿还 <small>(Tilgung)</small>',
      hausgeld: '物业管理费 <small>(Hausgeld，非分摊部分)</small>',
      grundsteuer: '房产税 <small>(Grundsteuer)</small>',
      insurance: '房屋保险 <small>(Wohngebäudeversicherung)</small>',
      maintenanceRate: '维修/翻新储备',
      taxRate: '个人所得税率',
      afaRate: '房屋折旧率 <small>(AfA)</small>',
      buildingRatio: '建筑占房价比例',
      holdingPeriod: '持有年限'
    },
    suffixes: {
      purchasePrice: '€', appreciationRate: '%', monthlyRent: '€', rentIncrease: '%',
      grunderwerbsteuer: '%', notar: '%', makler: '%', downPayment: '€',
      interestRate: '%', tilgung: '%', hausgeld: '€/年', grundsteuer: '€/年',
      insurance: '€/年', maintenanceRate: '%/年', taxRate: '%', afaRate: '%',
      buildingRatio: '%', holdingPeriod: '年'
    },
    headerKpis: ['年化 ROI', '盈亏平衡', '终期净资产'],
    resultKpis: ['总购置成本', '月供 (Annuität)', '年化 ROI', '盈亏平衡年', '终期房屋净值', '总净资产'],
    tableTitle: '📋 年度明细表',
    rangeButtonTitle: '参数范围优化',
    themeTitle: '切换明暗主题',
    shareButtonTitle: '生成分享图片',
    modal: { current: '当前值：', min: '🟢 最小值', max: '🔴 最大值', optimize: '🔭 优化计算' },
    share: { title: '📷 分享图片', download: '💾 下载图片' },
    metricsTitle: '📖 指标解释',
    metrics: [
      { color:'#22c55e', title:'累计净现金流 (Kum. Cashflow)', paragraphs:['每年所有现金流入减去流出的累计值。','起始为负（首付支出），之后每年叠加：租金收入 − 贷款本息 − 维修 − Hausgeld − Grundsteuer − 保险 − 税费。','转正意味着累计现金回流已覆盖初始投入。'] },
      { color:'#3b82f6', title:'房屋净值 (Eigenkapital)', paragraphs:['当前房价 − 剩余贷款。','反映如果此时卖掉房产并还清贷款后能拿到的钱。','随房价增值和贷款还本逐年增加。'] },
      { color:'#06b6d4', title:'终期房屋净值', paragraphs:['持有期最后一年的房屋净值。','= 终期房价 − 终期剩余贷款。','只衡量房产权益，不包含累计净现金流。'] },
      { color:'#ef4444', title:'剩余贷款 (Restschuld)', paragraphs:['尚未还清的银行贷款余额。','每年递减 = 上年余额 − 当年本金偿还 (Tilgung)。','贷款还清后归零，此时月供停止，现金流大幅改善。'] },
      { color:'#eab308', title:'总净资产 (Gesamtvermögen)', paragraphs:['房屋净值 + 累计净现金流。','= 房价 − 剩余贷款 + 累计净现金流。','这是衡量投资总回报的核心指标：房产权益与累计现金的合计。'] },
      { color:'#a855f7', title:'年化 ROI', wide:true, paragraphs:['简化年化复利回报率。'], formula:'简单 ROI = 总利润 ÷ 用户总投入 × 100%<br>年化 ROI = (1 + 简单 ROI)<sup>1/年数</sup> − 1', after:['用户总投入 = 首付 + 历年所有负现金流补亏之和；总利润 = 终期净资产 − 初始净资产。','这是简化算法（非 XIRR），把所有投入视为初始投入。'] }
    ]
  },
  de: {
    htmlLang: 'de',
    languageButton: 'DE',
    sectionLegends: [
      '📋 Immobilie', '💰 Erwerbsnebenkosten',
      '🏦 Finanzierung <small>(Annuitätendarlehen)</small>',
      '🔧 Laufende Kosten', '📊 Steuerparameter <small>(optional)</small>', '⏱ Simulationszeitraum'
    ],
    parameterLabels: {
      purchasePrice: 'Kaufpreis', appreciationRate: 'Jährliche Wertsteigerung',
      monthlyRent: 'Monatliche Kaltmiete', rentIncrease: 'Jährliche Mietsteigerung',
      grunderwerbsteuer: 'Grunderwerbsteuer', notar: 'Notar + Grundbuch',
      makler: 'Maklergebühr', downPayment: 'Eigenkapital', interestRate: 'Sollzins',
      tilgung: 'Anfängliche Tilgung', hausgeld: 'Nicht umlagefähiges Hausgeld',
      grundsteuer: 'Grundsteuer', insurance: 'Wohngebäudeversicherung',
      maintenanceRate: 'Instandhaltungs-/Sanierungsrücklage', taxRate: 'Persönlicher Einkommensteuersatz',
      afaRate: 'AfA-Satz', buildingRatio: 'Gebäudeanteil am Kaufpreis', holdingPeriod: 'Haltedauer'
    },
    suffixes: {
      purchasePrice:'€', appreciationRate:'%', monthlyRent:'€', rentIncrease:'%',
      grunderwerbsteuer:'%', notar:'%', makler:'%', downPayment:'€', interestRate:'%',
      tilgung:'%', hausgeld:'€/Jahr', grundsteuer:'€/Jahr', insurance:'€/Jahr',
      maintenanceRate:'%/Jahr', taxRate:'%', afaRate:'%', buildingRatio:'%', holdingPeriod:'Jahre'
    },
    headerKpis: ['Jährl. ROI', 'Break-even', 'Endvermögen'],
    resultKpis: ['Gesamterwerbskosten', 'Monatsrate (Annuität)', 'Jährl. ROI', 'Break-even-Jahr', 'End-Eigenkapital', 'Gesamtvermögen'],
    tableTitle: '📋 Jahresübersicht', rangeButtonTitle: 'Parameterbereich optimieren',
    themeTitle: 'Helles/dunkles Design umschalten', shareButtonTitle: 'Bild zum Teilen erstellen',
    modal: { current:'Aktueller Wert:', min:'🟢 Minimum', max:'🔴 Maximum', optimize:'🔭 Optimieren' },
    share: { title:'📷 Bild teilen', download:'💾 Bild speichern' },
    metricsTitle: '📖 Erläuterung der Kennzahlen',
    metrics: [
      { color:'#22c55e', title:'Kumulierter Netto-Cashflow', paragraphs:['Summe aller jährlichen Ein- und Auszahlungen.','Startet wegen des Eigenkapitaleinsatzes negativ. Danach werden Mieteinnahmen abzüglich Annuität, Instandhaltung, Hausgeld, Grundsteuer, Versicherung und Steuern addiert.','Ein positiver Wert bedeutet, dass die kumulierten Rückflüsse den anfänglichen Kapitaleinsatz decken.'] },
      { color:'#3b82f6', title:'Eigenkapital in der Immobilie', paragraphs:['Aktueller Immobilienwert minus Restschuld.','Entspricht näherungsweise dem Betrag, der nach Verkauf und Ablösung des Darlehens verbleibt.','Steigt durch Wertsteigerung und Tilgung.'] },
      { color:'#06b6d4', title:'End-Eigenkapital in der Immobilie', paragraphs:['Eigenkapital in der Immobilie am Ende des Betrachtungszeitraums.','= Endwert der Immobilie − Restschuld am Ende.','Misst nur den Immobilienanteil, ohne den kumulierten Netto-Cashflow.'] },
      { color:'#ef4444', title:'Restschuld', paragraphs:['Noch nicht zurückgezahlter Darlehenssaldo.','Restschuld des Vorjahres minus jährliche Tilgung.','Nach vollständiger Tilgung entfällt die Annuität.'] },
      { color:'#eab308', title:'Gesamtvermögen', paragraphs:['Eigenkapital in der Immobilie plus kumulierter Netto-Cashflow.','= Immobilienwert − Restschuld + kumulierter Netto-Cashflow.','Zentrale Kennzahl für die gesamte Vermögensentwicklung.'] },
      { color:'#a855f7', title:'Jährlicher ROI', wide:true, paragraphs:['Vereinfachte annualisierte Rendite.'], formula:'Einfacher ROI = Gesamtgewinn ÷ eingesetztes Kapital × 100 %<br>Jährlicher ROI = (1 + einfacher ROI)<sup>1/Jahre</sup> − 1', after:['Eingesetztes Kapital = Eigenkapital plus alle später ausgeglichenen negativen Cashflows.','Vereinfachung, keine zeitgenaue XIRR-Berechnung.'] }
    ]
  },
  en: {
    htmlLang: 'en',
    languageButton: 'EN',
    sectionLegends: [
      '📋 Property', '💰 Acquisition costs',
      '🏦 Financing <small>(Annuitätendarlehen)</small>',
      '🔧 Ongoing costs', '📊 Tax assumptions <small>(optional)</small>', '⏱ Simulation period'
    ],
    parameterLabels: {
      purchasePrice:'Purchase price <small>(Kaufpreis)</small>',
      appreciationRate:'Annual appreciation <small>(Wertsteigerung)</small>',
      monthlyRent:'Monthly base rent <small>(Kaltmiete)</small>', rentIncrease:'Annual rent increase',
      grunderwerbsteuer:'Property transfer tax <small>(Grunderwerbsteuer)</small>',
      notar:'Notary and land register <small>(Notar + Grundbuch)</small>',
      makler:'Broker fee <small>(Maklergebühr)</small>',
      downPayment:'Down payment/equity <small>(Eigenkapital)</small>',
      interestRate:'Mortgage interest rate <small>(Sollzins)</small>',
      tilgung:'Initial principal repayment <small>(Tilgung)</small>',
      hausgeld:'Non-recoverable service charge <small>(Hausgeld)</small>',
      grundsteuer:'Property tax <small>(Grundsteuer)</small>',
      insurance:'Building insurance <small>(Wohngebäudeversicherung)</small>',
      maintenanceRate:'Maintenance/renovation reserve <small>(Instandhaltungsrücklage)</small>',
      taxRate:'Personal income tax rate', afaRate:'Depreciation rate <small>(AfA)</small>',
      buildingRatio:'Building share of purchase price', holdingPeriod:'Holding period'
    },
    suffixes: {
      purchasePrice:'€', appreciationRate:'%', monthlyRent:'€', rentIncrease:'%',
      grunderwerbsteuer:'%', notar:'%', makler:'%', downPayment:'€', interestRate:'%',
      tilgung:'%', hausgeld:'€/yr', grundsteuer:'€/yr', insurance:'€/yr',
      maintenanceRate:'%/yr', taxRate:'%', afaRate:'%', buildingRatio:'%', holdingPeriod:'years'
    },
    headerKpis: ['Annualized ROI', 'Break-even', 'Final net worth'],
    resultKpis: ['Total acquisition cost', 'Monthly payment (Annuität)', 'Annualized ROI', 'Break-even year', 'Final property equity', 'Total net worth'],
    tableTitle:'📋 Annual breakdown', rangeButtonTitle:'Optimize parameter range',
    themeTitle:'Toggle light/dark theme', shareButtonTitle:'Create share image',
    modal: { current:'Current value:', min:'🟢 Minimum', max:'🔴 Maximum', optimize:'🔭 Optimize' },
    share: { title:'📷 Share image', download:'💾 Download image' },
    metricsTitle:'📖 Metric explanations',
    metrics: [
      { color:'#22c55e', title:'Cumulative net cash flow', paragraphs:['The running total of all annual cash inflows minus cash outflows.','It starts negative because of the down payment. Each year adds rent minus mortgage payments, maintenance, Hausgeld, Grundsteuer, insurance and taxes.','A positive value means cumulative cash returns have covered the initial cash invested.'] },
      { color:'#3b82f6', title:'Property equity (Eigenkapital)', paragraphs:['Current property value minus the remaining loan balance.','It approximates the amount left after selling the property and repaying the mortgage.','It grows through appreciation and principal repayment (Tilgung).'] },
      { color:'#06b6d4', title:'Final property equity', paragraphs:['Property equity at the end of the holding period.','= Final property value − final remaining loan balance.','It measures only the property stake and excludes cumulative net cash flow.'] },
      { color:'#ef4444', title:'Remaining loan (Restschuld)', paragraphs:['The outstanding mortgage balance.','Previous balance minus principal repaid (Tilgung) during the year.','Once it reaches zero, mortgage payments stop.'] },
      { color:'#eab308', title:'Total net worth (Gesamtvermögen)', paragraphs:['Property equity plus cumulative net cash flow.','= Property value − remaining loan + cumulative net cash flow.','The main measure of overall wealth created by the investment.'] },
      { color:'#a855f7', title:'Annualized ROI', wide:true, paragraphs:['A simplified compound annual return.'], formula:'Simple ROI = total profit ÷ total capital invested × 100%<br>Annualized ROI = (1 + simple ROI)<sup>1/years</sup> − 1', after:['Capital invested = down payment plus all later negative cash-flow contributions.','This is a simplified measure, not a timing-accurate XIRR calculation.'] }
    ]
  }
};
