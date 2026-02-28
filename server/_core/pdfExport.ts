/**
 * PDF Export Helper for Metrics Reports
 * Generates professional reports in Markdown/HTML format
 * Can be converted to PDF using manus-md-to-pdf utility
 */

export interface MetricsReportData {
  title: string;
  generatedDate: Date;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    mrr: number;
    arr: number;
    activeSubscriptions: number;
    churnRate: number;
    newSubscriptions: number;
    cac: number;
    ltv: number;
    ltvCacRatio: number;
  };
  trends: {
    revenue: Array<{ month: string; value: number }>;
    subscriptions: Array<{ month: string; value: number }>;
    churn: Array<{ month: string; value: number }>;
  };
  planDistribution: Record<string, number>;
}

/**
 * Generate Markdown report that can be converted to PDF
 */
export function generateMetricsReportMarkdown(data: MetricsReportData): string {
  const formatCurrency = (value: number) => `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`;
  const formatDate = (date: Date) => date.toLocaleDateString("pt-BR");

  return `# ${data.title}

**Data de Geração:** ${formatDate(data.generatedDate)}  
**Período:** ${formatDate(data.period.start)} a ${formatDate(data.period.end)}

---

## Resumo Executivo

Este relatório apresenta as principais métricas de negócio e performance do Núcleo Ventures durante o período especificado.

---

## KPIs Principais

| Métrica | Valor |
|---------|-------|
| MRR (Monthly Recurring Revenue) | ${formatCurrency(data.metrics.mrr)} |
| ARR (Annual Recurring Revenue) | ${formatCurrency(data.metrics.arr)} |
| Assinaturas Ativas | ${data.metrics.activeSubscriptions} |
| Churn Rate | ${data.metrics.churnRate.toFixed(2)}% |
| Novas Assinaturas | ${data.metrics.newSubscriptions} |

---

## Métricas de Aquisição

| Métrica | Valor |
|---------|-------|
| CAC (Customer Acquisition Cost) | ${formatCurrency(data.metrics.cac)} |
| LTV (Lifetime Value) | ${formatCurrency(data.metrics.ltv)} |
| LTV:CAC Ratio | ${data.metrics.ltvCacRatio.toFixed(1)}:1 |

**Análise:** Um LTV:CAC ratio de ${data.metrics.ltvCacRatio.toFixed(1)}:1 indica ${
    data.metrics.ltvCacRatio >= 3
      ? "um negócio saudável com boa rentabilidade de aquisição"
      : "oportunidade de otimizar custos de aquisição ou aumentar LTV"
  }.

---

## Tendências de Receita

| Mês | Receita |
|-----|---------|
${data.trends.revenue.map((item) => `| ${item.month} | ${formatCurrency(item.value)} |`).join("\n")}

---

## Tendências de Assinaturas

| Mês | Assinaturas |
|-----|-------------|
${data.trends.subscriptions.map((item) => `| ${item.month} | ${item.value} |`).join("\n")}

---

## Tendências de Churn Rate

| Mês | Churn Rate |
|-----|-----------|
${data.trends.churn.map((item) => `| ${item.month} | ${item.value.toFixed(2)}% |`).join("\n")}

---

## Distribuição por Plano

| Plano | Assinaturas |
|------|-------------|
${Object.entries(data.planDistribution)
  .map(([plan, count]) => `| ${plan.charAt(0).toUpperCase() + plan.slice(1)} | ${count} |`)
  .join("\n")}

---

## Recomendações

${generateRecommendations(data)}

---

## Glossário

- **MRR:** Receita mensal recorrente de todas as assinaturas ativas
- **ARR:** Receita anual recorrente (MRR × 12)
- **Churn Rate:** Percentual de clientes que cancelaram no período
- **CAC:** Custo médio para adquirir um novo cliente
- **LTV:** Valor total que um cliente gera ao longo de sua vida
- **LTV:CAC Ratio:** Deve ser ≥ 3:1 para um negócio saudável

---

*Relatório gerado automaticamente pelo Núcleo Ventures Dashboard*  
*${new Date().toLocaleString("pt-BR")}*
`;
}

/**
 * Generate HTML report
 */
export function generateMetricsReportHTML(data: MetricsReportData): string {
  const markdown = generateMetricsReportMarkdown(data);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #1a1a1a;
      border-bottom: 3px solid #10b981;
      padding-bottom: 10px;
    }
    h2 {
      color: #10b981;
      margin-top: 30px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f0f9ff;
      color: #1a1a1a;
      font-weight: 600;
    }
    tr:hover {
      background-color: #f9fafb;
    }
    .metric-box {
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 15px;
      margin: 15px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${data.title}</h1>
    <p><strong>Data de Geração:</strong> ${data.generatedDate.toLocaleDateString("pt-BR")}</p>
    <p><strong>Período:</strong> ${data.period.start.toLocaleDateString("pt-BR")} a ${data.period.end.toLocaleDateString("pt-BR")}</p>
    
    <div class="metric-box">
      <h2>Resumo Executivo</h2>
      <p>Este relatório apresenta as principais métricas de negócio e performance do Núcleo Ventures durante o período especificado.</p>
    </div>

    ${markdown}

    <div class="footer">
      <p>Relatório gerado automaticamente pelo Núcleo Ventures Dashboard</p>
      <p>${new Date().toLocaleString("pt-BR")}</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generate CSV format
 */
export function generateMetricsCSV(data: MetricsReportData): string {
  const rows = [
    ["Núcleo Ventures - Relatório de Métricas"],
    [`Data de Geração: ${data.generatedDate.toLocaleDateString("pt-BR")}`],
    [`Período: ${data.period.start.toLocaleDateString("pt-BR")} a ${data.period.end.toLocaleDateString("pt-BR")}`],
    [],
    ["KPIs Principais"],
    ["Métrica", "Valor"],
    ["MRR", `R$ ${data.metrics.mrr}`],
    ["ARR", `R$ ${data.metrics.arr}`],
    ["Assinaturas Ativas", data.metrics.activeSubscriptions],
    ["Churn Rate", `${data.metrics.churnRate}%`],
    ["Novas Assinaturas", data.metrics.newSubscriptions],
    [],
    ["Métricas de Aquisição"],
    ["CAC", `R$ ${data.metrics.cac}`],
    ["LTV", `R$ ${data.metrics.ltv}`],
    ["LTV:CAC Ratio", `${data.metrics.ltvCacRatio}:1`],
    [],
    ["Tendências de Receita"],
    ["Mês", "Receita"],
    ...data.trends.revenue.map((item) => [item.month, `R$ ${item.value}`]),
    [],
    ["Tendências de Assinaturas"],
    ["Mês", "Assinaturas"],
    ...data.trends.subscriptions.map((item) => [item.month, item.value]),
  ];

  return rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
}

/**
 * Generate recommendations based on metrics
 */
function generateRecommendations(data: MetricsReportData): string {
  const recommendations: string[] = [];

  if (data.metrics.churnRate > 5) {
    recommendations.push("- **Reduzir Churn:** Churn rate acima de 5% requer atenção. Considere implementar programas de retenção e análise de satisfação do cliente.");
  }

  if (data.metrics.ltvCacRatio < 3) {
    recommendations.push("- **Otimizar CAC:** LTV:CAC ratio abaixo de 3:1 indica oportunidade de reduzir custos de aquisição ou aumentar lifetime value.");
  }

  if (data.metrics.newSubscriptions === 0) {
    recommendations.push("- **Aumentar Aquisição:** Sem novas assinaturas no período, considere revisar estratégia de marketing e vendas.");
  }

  if (recommendations.length === 0) {
    recommendations.push("- Métricas saudáveis. Continue monitorando tendências e otimizando operações.");
  }

  return recommendations.join("\n");
}
