import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, IndianRupee } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useGetSettings } from "@/features/settings/api";
import {
  useCreateSale,
  useDeleteSale,
  useListSales,
  useUpdateSale,
} from "@/features/sales/api";
import { saleSchema, type SaleInput } from "@/features/sales/validation";
import { getApiErrorMessage } from "@/services/api";
import type { Sale } from "@/features/sales/types";

export default function Sales() {
  const { data: settings } = useGetSettings();
  const symbol = settings?.currencySymbol || "₹";

  const { data: sales, isLoading } = useListSales();
  const createSale = useCreateSale();
  const updateSale = useUpdateSale();
  const deleteSale = useDeleteSale();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const form = useForm<SaleInput>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      amount: 0,
      note: "",
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = { ...values, note: values.note || null };
    try {
      if (editingSale) {
        await updateSale.mutateAsync({ id: editingSale.id, input: payload });
        toast.success("Sale updated");
      } else {
        await createSale.mutateAsync(payload);
        toast.success("Sale added");
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not save sale"));
    }
  });

  const openAddDialog = () => {
    setEditingSale(null);
    form.reset({
      amount: 0,
      note: "",
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (sale: Sale) => {
    setEditingSale(sale);
    form.reset({
      amount: sale.amount,
      note: sale.note ?? "",
      date: format(new Date(sale.date), "yyyy-MM-dd'T'HH:mm"),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSale.mutateAsync(id);
      toast.success("Sale deleted");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not delete sale"));
    }
  };

  const totalSales = sales?.reduce((sum, s) => sum + s.amount, 0) ?? 0;
  const submitting = createSale.isPending || updateSale.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sales</h2>
          <p className="text-muted-foreground">Log your daily sales and income.</p>
        </div>
        <Button onClick={openAddDialog} className="shrink-0 hover-elevate">
          <Plus className="h-4 w-4 mr-2" /> Add Sale
        </Button>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary text-primary-foreground rounded-full">
              <IndianRupee className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Sales Recorded</p>
              <p className="text-3xl font-bold text-foreground">
                {formatCurrency(totalSales, symbol)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : sales?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sales recorded yet. Click "Add Sale" to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date &amp; Time</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales?.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(sale.date)}
                      </TableCell>
                      <TableCell>
                        {sale.note || (
                          <span className="text-muted-foreground italic">No note</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium text-secondary">
                        +{formatCurrency(sale.amount, symbol)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(sale)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Sale</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Delete this sale of {formatCurrency(sale.amount, symbol)}? This
                                  cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(sale.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingSale ? "Edit Sale" : "Add New Sale"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ({symbol})</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date &amp; Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Evening rush, large order…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                  {editingSale ? "Update Sale" : "Save Sale"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
