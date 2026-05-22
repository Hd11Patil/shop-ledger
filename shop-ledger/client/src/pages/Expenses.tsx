import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ReceiptText, Filter } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useGetSettings } from "@/features/settings/api";
import { useListCategories } from "@/features/categories/api";
import {
  useCreateExpense,
  useDeleteExpense,
  useListExpenses,
  useUpdateExpense,
} from "@/features/expenses/api";
import { expenseSchema, type ExpenseInput } from "@/features/expenses/validation";
import { getApiErrorMessage } from "@/services/api";
import type { Expense } from "@/features/expenses/types";

export default function Expenses() {
  const { data: settings } = useGetSettings();
  const symbol = settings?.currencySymbol || "₹";

  const [categoryIdFilter, setCategoryIdFilter] = useState<number | undefined>(undefined);

  const { data: expenses, isLoading } = useListExpenses({ categoryId: categoryIdFilter });
  const { data: categories } = useListCategories();

  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const form = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: 0,
      categoryId: 0,
      note: "",
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = { ...values, note: values.note || null };
    try {
      if (editingExpense) {
        await updateExpense.mutateAsync({ id: editingExpense.id, input: payload });
        toast.success("Expense updated");
      } else {
        await createExpense.mutateAsync(payload);
        toast.success("Expense added");
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not save expense"));
    }
  });

  const openAddDialog = () => {
    setEditingExpense(null);
    form.reset({
      amount: 0,
      categoryId: categories?.[0]?.id ?? 0,
      note: "",
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense);
    form.reset({
      amount: expense.amount,
      categoryId: expense.categoryId,
      note: expense.note ?? "",
      date: format(new Date(expense.date), "yyyy-MM-dd'T'HH:mm"),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteExpense.mutateAsync(id);
      toast.success("Expense deleted");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not delete expense"));
    }
  };

  const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
  const submitting = createExpense.isPending || updateExpense.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground">Track inventory, supplies, and shop costs.</p>
        </div>
        <Button onClick={openAddDialog} className="shrink-0 hover-elevate">
          <Plus className="h-4 w-4 mr-2" /> Add Expense
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch gap-4">
        <Card className="flex-1 w-full bg-destructive/5 border-destructive/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-destructive text-destructive-foreground rounded-full">
                <ReceiptText className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Displayed</p>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(totalExpenses, symbol)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full sm:w-auto bg-card shadow-sm">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" /> Filter by Category
            </div>
            <Select
              value={categoryIdFilter ? categoryIdFilter.toString() : "all"}
              onValueChange={(val) =>
                setCategoryIdFilter(val === "all" ? undefined : parseInt(val))
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : expenses?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No expenses recorded matching the criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date &amp; Time</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses?.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(expense.date)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: expense.categoryColor,
                            color: expense.categoryColor,
                            backgroundColor: `${expense.categoryColor}15`,
                          }}
                        >
                          {expense.categoryName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {expense.note || (
                          <span className="text-muted-foreground italic">No note</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        -{formatCurrency(expense.amount, symbol)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(expense)}
                          >
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
                                <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Delete this expense of {formatCurrency(expense.amount, symbol)}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(expense.id)}
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
            <DialogTitle>{editingExpense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
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
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(parseInt(v))}
                      value={field.value ? field.value.toString() : ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      <Input placeholder="e.g., Bought from local vendor…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                  {editingExpense ? "Update Expense" : "Save Expense"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
