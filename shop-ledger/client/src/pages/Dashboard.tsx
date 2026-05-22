import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  ReceiptText,
  Flame,
  Target,
  Trophy,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/format";
import {
  useBusinessInsights,
  useDashboardSummary,
  useExpenseBreakdown,
  useRecentActivity,
} from "@/features/dashboard/api";
import { useGetSettings } from "@/features/settings/api";

export default function Dashboard() {
  const { data: settings } = useGetSettings();
  const symbol = settings?.currencySymbol || "₹";

  const { data: summary, isLoading: loadingSummary } = useDashboardSummary();
  const { data: breakdown, isLoading: loadingBreakdown } = useExpenseBreakdown();
  const { data: insights, isLoading: loadingInsights } = useBusinessInsights();
  const { data: activity, isLoading: loadingActivity } = useRecentActivity();

  if (loadingSummary || loadingBreakdown || loadingInsights || loadingActivity) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-64 bg-muted rounded"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-xl"></div>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-muted rounded-xl"></div>
          <div className="h-96 bg-muted rounded-xl"></div>
        </div>
      </div>
    );
  }

  const todayProfit = summary?.today.profit ?? 0;
  const todayProfitColor = todayProfit >= 0 ? "text-secondary" : "text-destructive";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Today's Business</h2>
          <p className="text-muted-foreground">
            Here's how {settings?.shopName || "your shop"} is doing today.
          </p>
        </div>
      </div>

      {/* Hero stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary text-primary-foreground border-primary-border shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary-foreground/80 font-medium">Sales</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(summary?.today.sales ?? 0, symbol)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium opacity-90 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              {summary?.today.salesCount ?? 0} entries
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium">Expenses</CardDescription>
            <CardTitle className="text-3xl text-foreground">
              {formatCurrency(summary?.today.expenses ?? 0, symbol)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground flex items-center">
              <ReceiptText className="h-4 w-4 mr-1" />
              {summary?.today.expensesCount ?? 0} entries
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm lg:col-span-2 bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium">Net Profit</CardDescription>
            <CardTitle className={`text-4xl ${todayProfitColor}`}>
              {formatCurrency(todayProfit, symbol)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Month to date:{" "}
              <span className="font-semibold">
                {formatCurrency(summary?.thisMonth.profit ?? 0, symbol)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Expenses by Category</CardTitle>
            <CardDescription>Where your money went this month</CardDescription>
          </CardHeader>
          <CardContent>
            {breakdown && breakdown.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdown}
                      dataKey="total"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {breakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.categoryColor || "hsl(var(--primary))"}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: number) => formatCurrency(value, symbol)}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No expenses recorded yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest transactions</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {activity && activity.length > 0 ? (
              <div className="space-y-4">
                {activity.map((item) => (
                  <div
                    key={`${item.kind}-${item.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          item.kind === "sale"
                            ? "bg-secondary/20 text-secondary"
                            : item.kind === "expense"
                            ? "bg-destructive/20 text-destructive"
                            : "bg-primary/20 text-primary"
                        }`}
                      >
                        {item.kind === "sale" && <TrendingUp className="h-4 w-4" />}
                        {item.kind === "expense" && <TrendingDown className="h-4 w-4" />}
                        {item.kind === "investment" && <Target className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {item.kind === "sale"
                            ? "Sale"
                            : item.kind === "expense"
                            ? "Expense"
                            : "Investment"}
                          {item.label && (
                            <span className="text-muted-foreground font-normal ml-1">
                              - {item.label}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(item.date)}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`font-semibold ${
                        item.kind === "sale"
                          ? "text-secondary"
                          : item.kind === "expense"
                          ? "text-foreground"
                          : "text-primary"
                      }`}
                    >
                      {item.kind === "sale" ? "+" : "-"}
                      {formatCurrency(item.amount, symbol)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No activity yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-muted/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/20 text-primary rounded-xl">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Best Day</p>
              <p className="font-bold text-lg">
                {insights?.bestSalesDay
                  ? formatCurrency(insights.bestSalesDay.amount, symbol)
                  : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-destructive/20 text-destructive rounded-xl">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Top Expense</p>
              <p className="font-bold text-lg truncate max-w-[120px]">
                {insights?.topExpenseCategory?.categoryName || "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-secondary/20 text-secondary rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Daily Profit</p>
              <p className="font-bold text-lg">
                {formatCurrency(insights?.avgDailyProfit30d ?? 0, symbol)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-accent text-accent-foreground rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Days Tracked</p>
              <p className="font-bold text-lg">{insights?.daysTracked ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
