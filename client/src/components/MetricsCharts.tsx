import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card } from "@/components/ui/card";

interface ChartData {
  month?: string;
  date?: string;
  [key: string]: string | number | undefined;
}

interface MetricsChartProps {
  title: string;
  data: ChartData[];
  type: "line" | "bar" | "pie";
  dataKeys: Array<{ key: string; name: string; color: string }>;
  height?: number;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export function RevenueChart({ data }: { data: ChartData[] }) {
  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Receita (Últimos 12 Meses)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="month" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
            labelStyle={{ color: "#fff" }}
            formatter={(value) => `R$ ${(value as number).toLocaleString("pt-BR")}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#10b981"
            name="Receita"
            strokeWidth={2}
            dot={{ fill: "#10b981", r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="mrr"
            stroke="#3b82f6"
            name="MRR"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function SubscriptionChart({ data }: { data: ChartData[] }) {
  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Assinaturas (Últimos 12 Meses)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="month" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
            labelStyle={{ color: "#fff" }}
          />
          <Legend />
          <Bar dataKey="active" fill="#10b981" name="Ativas" />
          <Bar dataKey="new" fill="#3b82f6" name="Novas" />
          <Bar dataKey="cancelled" fill="#ef4444" name="Canceladas" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function ChurnChart({ data }: { data: ChartData[] }) {
  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Churn Rate (Últimos 12 Meses)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="month" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" label={{ value: "%" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
            labelStyle={{ color: "#fff" }}
            formatter={(value) => `${(value as number).toFixed(2)}%`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="churnRate"
            stroke="#ef4444"
            name="Churn Rate"
            strokeWidth={2}
            dot={{ fill: "#ef4444", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function PlanDistributionChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Distribuição por Plano</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
            labelStyle={{ color: "#fff" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function MetricsTable({
  title,
  data,
  columns,
}: {
  title: string;
  data: Record<string, any>[];
  columns: Array<{ key: string; label: string; format?: (value: any) => string }>;
}) {
  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              {columns.map((col) => (
                <th key={col.key} className="text-left py-3 px-4 text-slate-400 font-medium">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/50">
                {columns.map((col) => (
                  <td key={col.key} className="py-3 px-4 text-slate-300">
                    {col.format ? col.format(row[col.key]) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
