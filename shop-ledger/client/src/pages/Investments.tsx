import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Target } from "lucide-react";
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
  useCreateInvestment,
  useDeleteInvestment,
  useListInvestments,
  useUpdateInvestment,
} from "@/features/investments/api";
import {
  investmentSchema,
  type InvestmentInput,
} from "@/features/investments/validation";
import { getApiErrorMessage } from "@/services/api";
import type { Investment } from "@/features/investments/types";

export default function Investments() {
  const { data: settings } = useGetSettings();
  const symbol = settings?.currencySymbol || "₹";

  const { data: investments, isLoading } = useListInvestments();
  const createInvestment = useCreateInvestment();
  const updateInvestment = useUpdateInvestment();
  const deleteInvestment = useDeleteInvestment();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);

  const form = useForm<InvestmentInput>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      amount: 0,
      note: "",
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = { ...values, note: values.note || null };
    try {
      if (editingInvestment) {
        await updateInvestment.mutateAsync({ id: editingInvestment.id, input: payload });
        toast.success("Investment updated");
      } else {
        await createInvestment.mutateAsync(payload);
        toast.success("Investment added");
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not save investment"));
    }
  });

  const openAddDialog = () => {
    setEditingInvestment(null);
    form.reset({
      amount: 0,
      note: "",
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (inv: Investment) => {
    setEditingInvestment(inv);
    form.reset({
      amount: inv.amount,
      note: inv.note ?? "",
      date: format(new Date(inv.date), "yyyy-MM-dd'T'HH:mm"),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteInvestment.mutateAsync(id);
      toast.success("Investment deleted");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not delete investment"));
    }
  };

  const totalInvested = investments?.reduce((sum, i) => sum + i.amount, 0) ?? 0;
  const submitting = createInvestment.isPending || updateInvestment.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Investments</h2>
          <p className="text-muted-foreground">Track money you've put back into the shop.</p>
        </div>
        <Button onClick={openAddDialog} className="shrink-0 hover-elevate">
          <Plus className="h-4 w-4 mr-2" /> Add Investment
        </Button>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary text-primary-foreground rounded-full">
              <Target className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Invested</p>
              <p className="text-3xl font-bold text-foreground">
                {formatCurrency(totalInvested, symbol)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Investments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : investments?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No investments recorded yet.
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
                  {investments?.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(inv.date)}
                      </TableCell>
                      <TableCell>
                        {inv.note || (
                          <span className="text-muted-foreground italic">No note</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        {formatCurrency(inv.amount, symbol)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(inv)}>
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
                                <AlertDialogTitle>Delete Investment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Delete this investment of {formatCurrency(inv.amount, symbol)}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(inv.id)}
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
            <DialogTitle>
              {editingInvestment ? "Edit Investment" : "Add New Investment"}
            </DialogTitle>
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
                    <FormLabel>Note / Purpose</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., New Kadhai, Display Board…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                  {editingInvestment ? "Update Investment" : "Save Investment"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
