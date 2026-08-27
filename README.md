# ImmoCalculator 🏠

**德国贷款买投资公寓收益周期曲线计算器**

一个纯前端 SPA，用于模拟和可视化在德国贷款购买投资公寓的长期收益。输入房价、贷款参数、租金与各项持有成本，即可查看现金流与净资产随年份变化的曲线。

## 功能特点

- 全面覆盖德国购房场景（Grunderwerbsteuer、Notar、Makler 等交易成本）
- Annuitätendarlehen（年金贷款）逐年模拟
- 多维度图表：累计现金流、净资产、剩余贷款
- 核心统计指标：年化 ROI、盈亏平衡年、总收益
- 纯前端，无需后端，可部署在 GitHub Pages

## 输入参数

| 类别 | 参数 | 说明 |
|------|------|------|
| **房屋** | 购买价格、年增值率 | 房价与长期增值预期 |
| **交易成本** | Grunderwerbsteuer、Notar、Makler | 各州不同，默认使用常见值 |
| **贷款** | 首付金额、贷款利率、初始 Tilgung | Annuitätendarlehen 参数 |
| **收入** | 月租金、年租金涨幅 | 租金增长假设 |
| **持有成本** | Hausgeld、Grundsteuer、保险、维修储备 | 年度/月度支出 |
| **税务** | 个人所得税率、AfA 折旧率 | 可选税后计算 |
| **周期** | 持有年限 | 模拟时间范围 |

## 计算公式

### 年金贷款 (Annuitätendarlehen)
- 月供 = 贷款总额 × (年利率 + 初始 Tilgung) / 12
- 月供固定不变
- 利息部分 = 剩余贷款 × 月利率
- 本金部分 = 月供 - 利息部分

### 年度现金流
- 税后现金流 = 租金收入 - 贷款支出 - 各项持有成本 ± 税务影响
- 其中贷款支出分为利息（经营支出）和 Tilgung（本金偿还，非支出）

### 净资产追踪
- 净资产 = 房价（含增值） - 剩余贷款 + 累计现金流 - 初始投入

## 本地使用

直接在浏览器打开 `index.html` 即可，无需构建步骤。

## 部署

将仓库设置为 GitHub Pages（Settings → Pages → 选择 main branch），即可通过 `https://bowardzhang.github.io/ImmoCalculator` 访问。

---

*Made with ❤️ for the German property market*