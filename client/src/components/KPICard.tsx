import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  description?: string;
}

export default function KPICard({
  title,
  value,
  unit,
  change,
  trend,
  icon,
  description,
}: KPICardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;

    if (trend === "up") {
      return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    } else if (trend === "down") {
      return <TrendingDown className="w-4 h-4 text-red-400" />;
    } else {
      return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return "text-slate-400";
    if (trend === "up") return "text-emerald-400";
    if (trend === "down") return "text-red-400";
    return "text-slate-400";
  };

  const getChangeColor = () => {
    if (change === undefined) return "";
    if (change > 0) return "text-emerald-400";
    if (change < 0) return "text-red-400";
    return "text-slate-400";
  };

  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          {description && <p className="text-slate-500 text-xs mt-1">{description}</p>}
        </div>
        {icon && <div className="text-emerald-400">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">
          {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
        </span>
        {unit && <span className="text-slate-400 text-sm">{unit}</span>}
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-2 mt-4">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getChangeColor()}`}>
            {change > 0 ? "+" : ""}
            {change.toFixed(1)}%
          </span>
          <span className="text-slate-500 text-xs">vs mês anterior</span>
        </div>
      )}
    </Card>
  );
}
