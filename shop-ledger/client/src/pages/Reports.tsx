import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, TableProperties, BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useGetSettings } from "@/features/settings/api";
import { usePeriodReport } from "@/features/reports/api";
import type { Period } from "@/features/reports/types";

export default function Reports() {
  const { data: settings } = useGetSettings();
  const symbol = settings?.currencySymbol || "₹";
  const [period, setPeriod] = useState<Period>("daily");
  const { data: report, isLoading } = usePeriodReport(period);

  const exportPDF = () => {
    if (!report || !report.buckets.length) {
      toast.error("No data to export");
      return;
    }
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text(
        `${settings?.shopName || "Shop"} - ${period.charAt(0).toUpperCase() + period.slice(1)} Report`,
        14,
        22,
      );
      doc.setFontSize(11);
      doc.text(`Generated on: ${format(new Date(), "dd MMM yyyy")}`, 14, 30);

      const tableData = report.buckets.map((b) => [
        b.label,
        `${symbol}${b.sales.toFixed(2)}`,
        `${symbol}${b.expenses.toFixed(2)}`,
        `${symbol}${b.investments.toFixed(2)}`,
        `${symbol}${b.profit.toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: 40,
        head: [["Period", "Sales", "Expenses", "Investments", "Profit"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [224, 122, 95] },
      });

      doc.save(`shop-report-${period}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast.success("PDF exported");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export PDF");
    }
  };

  const exportExcel = () => {
    if (!report || !report.buckets.length) {
      toast.error("No data to export");
      return;
    }
    try {
      const exportData = report.buckets.map((b) => ({
        Period: b.label,
        Date: b.date,
        Sales: b.sales,
        Expenses: b.expenses,
        Investments: b.investments,
        Profit: b.profit,
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(wb, `shop-report-${period}-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
      toast.success("Excel exported");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export Excel");
    }
  };

  const totals = report?.buckets.reduce(
    (acc, b) => ({
      sales: acc.sales + b.sales,
      expenses: acc.expenses + b.expenses,
      investments: acc.investments + b.investments,
      profit: acc.profit + b.profit,
    }),
    { sales: 0, expenses: 0, investments: 0, profit: 0 },
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports &amp; Analytics</h2>
          <p className="text-muted-foreground">View trends and export your financial data.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v: Period) => setPeriod(v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportPDF} className="px-3 hover-elevate">
            <Download className="h-4 w-4 mr-2" /> PDF
          </Button>
          <Button variant="outline" onClick={exportExcel} className="px-3 hover-elevate">
            <TableProperties className="h-4 w-4 mr-2" /> Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card shadow-sm border-border">
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(totals?.sales ?? 0, symbol)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm border-border">
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(totals?.expenses ?? 0, symbol)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm border-border">
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Investments</p>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(totals?.investments ?? 0, symbol)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/20 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
            <p
              className={`text-2xl font-bold ${
                (totals?.profit ?? 0) >= 0 ? "text-secondary" : "text-destructive"
              }`}
            >
              {formatCurrency(totals?.profit ?? 0, symbol)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="chart">
            <BarChart3 className="h-4 w-4 mr-2" /> Chart View
          </TabsTrigger>
          <TabsTrigger value="table">
            <TableProperties className="h-4 w-4 mr-2" /> Table View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview ({period})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : report?.buckets && report.buckets.length > 0 ? (
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={report.buckets} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="label"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${symbol}${value}`}
                      />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <RechartsTooltip
                        formatter={(value: number) => formatCurrency(value, symbol)}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid hsl(var(--border))",
                          backgroundColor: "hsl(var(--card))",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="sales" name="Sales" stroke="hsl(var(--secondary))" fillOpacity={1} fill="url(#colorSales)" />
                      <Area type="monotone" dataKey="expenses" name="Expenses" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorExpenses)" />
                      <Area type="monotone" dataKey="profit" name="Profit" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorProfit)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  No data available for this period.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Breakdown ({period})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead className="text-right">Sales</TableHead>
                        <TableHead className="text-right">Expenses</TableHead>
                        <TableHead className="text-right">Investments</TableHead>
                        <TableHead className="text-right">Profit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report?.buckets?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No data available for this period.
                          </TableCell>
                        </TableRow>
                      ) : (
                        report?.buckets?.map((bucket, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium whitespace-nowrap">
                              {bucket.label}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(bucket.sales, symbol)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(bucket.expenses, symbol)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(bucket.investments, symbol)}
                            </TableCell>
                            <TableCell
                              className={`text-right font-bold ${
                                bucket.profit >= 0 ? "text-secondary" : "text-destructive"
                              }`}
                            >
                              {formatCurrency(bucket.profit, symbol)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
