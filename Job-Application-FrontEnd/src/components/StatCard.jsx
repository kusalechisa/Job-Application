import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ title, value, icon: Icon, change, trend = "up" }) {
  const isPositive = trend === "up";
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const trendColor = isPositive ? "text-emerald-600" : "text-rose-600";
  const bgColor = isPositive ? "bg-emerald-50" : "bg-rose-50";

  return (
    <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
            {change !== undefined && (
              <div className={`mt-2 flex items-center gap-1 ${trendColor}`}>
                <TrendIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{Math.abs(change)}%</span>
                <span className="text-xs text-slate-500">from last period</span>
              </div>
            )}
          </div>
          <div className={`rounded-xl p-3 ${bgColor}`}>
            <Icon className="h-6 w-6 text-slate-700 dark:text-slate-300" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
