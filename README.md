# ImmoCalculator 🏠

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"></a>
  <a href="https://bowardzhang.github.io/ImmoCalculator"><img src="https://img.shields.io/badge/GitHub%20Pages-live-brightgreen.svg" alt="GitHub Pages"></a>
  <a href="https://github.com/bowardzhang/ImmoCalculator"><img src="https://img.shields.io/github/stars/bowardzhang/ImmoCalculator?style=social" alt="GitHub Stars"></a>
</p>

<p align="center">
  <a href="#chinese"><b>🇨🇳 中文</b></a> &nbsp;·&nbsp; 
  <a href="#german"><b>🇩🇪 Deutsch</b></a> &nbsp;·&nbsp; 
  <a href="#english"><b>🇬🇧 English</b></a>
</p>

---

<a id="chinese"></a>
<details open>
<summary><b>🇨🇳 中文</b> <i>(默认)</i></summary>

**德国贷款买投资公寓收益周期曲线计算器**

纯前端 SPA，模拟和可视化在德国贷款购买投资公寓的长期收益。输入房价、贷款参数、租金与各项持有成本，即可查看现金流与净资产随年份变化的曲线。

### 功能特点

- 全面覆盖德国购房场景（Grunderwerbsteuer、Notar、Makler 等交易成本）
- Annuitätendarlehen（年金贷款）逐年模拟
- 多维度图表：累计现金流、房屋净值、剩余贷款、总净资产
- 核心统计指标：年化 ROI、盈亏平衡年、月供
- 税务影响计算（个人所得税、AfA 折旧）
- 纯前端，部署于 GitHub Pages，无需后端

### 输入参数

| 类别 | 参数 | 说明 |
|------|------|------|
| **房屋** | 购买价格、年增值率 | 房价与长期增值预期 |
| **交易成本** | Grunderwerbsteuer、Notar、Makler | 各州不同，默认使用常见值 |
| **贷款** | 首付金额、贷款利率、初始 Tilgung | Annuitätendarlehen 参数 |
| **收入** | 月租金、年租金涨幅 | 租金增长假设 |
| **持有成本** | Hausgeld、Grundsteuer、保险、维修储备 | 年度/月度支出 |
| **税务** | 个人所得税率、AfA 折旧率 | 可选税后计算 |
| **周期** | 持有年限 | 模拟时间范围（最多 60 年） |

### 核心算法

**年金贷款 (Annuitätendarlehen)**
- 月供固定 = 贷款总额 × (年利率 + 初始 Tilgung) / 12
- 利息部分 = 剩余贷款 × 月利率（逐年递减）
- 本金部分 = 月供 − 利息部分（逐年递增）
- 贷款还清后月供归零

**年度净现金流**
- 税前现金流 = 租金收入 − 贷款本息 − 维修 − Hausgeld − Grundsteuer − 保险
- 税务影响 = (租金 − 利息 − AfA − 各项费用) × 税率（负数 → 退税）
- 税后现金流 = 税前现金流 − 税务影响

**净资产追踪**
- 房屋净值 = 当前房价 − 剩余贷款
- 总净资产 = 房屋净值 + 累计净现金流

### 在线使用

👉 **[https://bowardzhang.github.io/ImmoCalculator](https://bowardzhang.github.io/ImmoCalculator)**

直接在浏览器中打开即可，无需安装。

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/bowardzhang/ImmoCalculator.git
cd ImmoCalculator

# 直接用浏览器打开
open index.html
# 或用 Python 启动本地服务器
python3 -m http.server 8080
# 访问 http://localhost:8080
```

</details>

---

<a id="german"></a>
<details>
<summary><b>🇩🇪 Deutsch</b></summary>

**Rechnungs-Tool für Renditezyklen von Immobilien-Investitionen in Deutschland**

Eine reine Frontend-SPA zur Simulation und Visualisierung der langfristigen Rendite einer als Kapitalanlage finanzierten Eigentumswohnung in Deutschland. Geben Sie Kaufpreis, Darlehensparameter, Mieteinnahmen und laufende Kosten ein, um die Entwicklung von Cashflow und Vermögen über die Jahre zu sehen.

### Funktionen

- Vollständige Abbildung typischer deutscher Erwerbsnebenkosten (Grunderwerbsteuer, Notar, Makler)
- Annuitätendarlehen mit jährlicher Simulation
- Mehrdimensionale Diagramme: kumulierter Cashflow, Eigenkapital, Restschuld, Gesamtvermögen
- Kernkennzahlen: jährliche ROI, Break-Even-Jahr, Annuitätsrate
- Steuerliche Effekte (Einkommensteuer, AfA)
- Kein Backend erforderlich, gehostet auf GitHub Pages

### Eingabeparameter

| Kategorie | Parameter | Beschreibung |
|-----------|-----------|-------------|
| **Immobilie** | Kaufpreis, jährl. Wertsteigerung | Preis & langfristige Wertentwicklung |
| **Erwerbskosten** | Grunderwerbsteuer, Notar, Makler | Variiert nach Bundesland |
| **Darlehen** | Eigenkapital, Sollzins, anfängl. Tilgung | Annuitätendarlehen |
| **Einnahmen** | Monatsmiete, jährl. Mietsteigerung | Mietwachstumsannahme |
| **Betriebskosten** | Hausgeld, Grundsteuer, Versicherung, Instandhaltung | Jährliche/monatliche Ausgaben |
| **Steuern** | Einkommensteuersatz, AfA-Satz | Optionale Nachsteuerberechnung |
| **Zeitraum** | Haltedauer | Simulationshorizont (max. 60 Jahre) |

### Kernalgorithmus

**Annuitätendarlehen**
- Feste monatliche Rate = Darlehenssumme × (Sollzins + anfängl. Tilgung) / 12
- Zinsanteil = Restschuld × Monatszins (sinkt jährlich)
- Tilgungsanteil = Rate − Zinsanteil (steigt jährlich)
- Nach vollständiger Tilgung entfällt die Rate

**Jährlicher Netto-Cashflow**
- Cashflow vor Steuern = Miete − Zins+Tilgung − Instandhaltung − Hausgeld − Grundsteuer − Versicherung
- Steuereffekt = (Miete − Zinsen − AfA − Kosten) × Steuersatz (negativ → Steuerrückerstattung)
- Cashflow nach Steuern = Cashflow vor Steuern − Steuereffekt

**Vermögensentwicklung**
- Eigenkapital = aktueller Immobilienwert − Restschuld
- Gesamtvermögen = Eigenkapital + kumulierter Cashflow

### Online nutzen

👉 **[https://bowardzhang.github.io/ImmoCalculator](https://bowardzhang.github.io/ImmoCalculator)**

Einfach im Browser öffnen, keine Installation erforderlich.

### Lokale Entwicklung

```bash
git clone https://github.com/bowardzhang/ImmoCalculator.git
cd ImmoCalculator
open index.html
# oder
python3 -m http.server 8080
# → http://localhost:8080
```

</details>

---

<a id="english"></a>
<details>
<summary><b>🇬🇧 English</b></summary>

**German Investment Property ROI Calculator**

A pure frontend SPA for simulating and visualizing the long-term returns of buying a rental apartment in Germany with a mortgage. Input the purchase price, loan parameters, rent, and holding costs to see cash flow and net worth curves over time.

### Features

- Full coverage of German acquisition costs (Grunderwerbsteuer, Notar, Makler)
- Annuity loan (Annuitätendarlehen) year-by-year simulation
- Multi-dimensional charts: cumulative cash flow, equity, remaining debt, total net worth
- Key metrics: annualized ROI, break-even year, monthly payment
- Tax impact calculation (income tax, AfA depreciation)
- Pure frontend, deployed on GitHub Pages, no backend needed

### Input Parameters

| Category | Parameter | Description |
|----------|-----------|-------------|
| **Property** | Purchase price, annual appreciation | Price & long-term value growth |
| **Acquisition costs** | Grunderwerbsteuer, Notar, Makler | Varies by German state |
| **Loan** | Down payment, interest rate, initial repayment | Annuity loan parameters |
| **Income** | Monthly rent, annual rent increase | Rent growth assumption |
| **Holding costs** | Hausgeld, property tax, insurance, maintenance reserve | Annual/monthly expenses |
| **Tax** | Income tax rate, AfA depreciation rate | Optional after-tax calculation |
| **Period** | Holding period | Simulation horizon (max 60 years) |

### Core Algorithm

**Annuity Loan (Annuitätendarlehen)**
- Fixed monthly payment = Loan amount × (interest rate + initial repayment) / 12
- Interest portion = remaining debt × monthly interest rate (decreases yearly)
- Principal portion = payment − interest portion (increases yearly)
- Payments stop once loan is fully repaid

**Annual Net Cash Flow**
- Pre-tax cash flow = rent − loan payment − maintenance − Hausgeld − property tax − insurance
- Tax effect = (rent − interest − AfA − expenses) × tax rate (negative → tax refund)
- After-tax cash flow = pre-tax cash flow − tax effect

**Net Worth Tracking**
- Property equity = current property value − remaining loan
- Total net worth = property equity + cumulative cash flow

### Online Usage

👉 **[https://bowardzhang.github.io/ImmoCalculator](https://bowardzhang.github.io/ImmoCalculator)**

Open in your browser directly, no installation required.

### Local Development

```bash
git clone https://github.com/bowardzhang/ImmoCalculator.git
cd ImmoCalculator
open index.html
# or
python3 -m http.server 8080
# → http://localhost:8080
```

</details>

---

<p align="center">
  <a href="https://bowardzhang.github.io/ImmoCalculator"><b>🚀 在线使用 · Online nutzen · Use Online</b></a>
</p>

<p align="center"><i>Made with ❤️ for the German property market</i></p>