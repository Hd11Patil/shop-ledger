import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Store, User, LogOut } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/AuthContext";
import { useGetSettings, useUpdateSettings } from "@/features/settings/api";
import { settingsSchema, type SettingsInput } from "@/features/settings/validation";
import { getApiErrorMessage } from "@/services/api";

export default function Settings() {
  const { user, logout } = useAuth();
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();

  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      shopName: settings?.shopName ?? "Shop Ledger",
      currency: settings?.currency ?? "INR",
      currencySymbol: settings?.currencySymbol ?? "₹",
    },
    values: {
      shopName: settings?.shopName ?? "Shop Ledger",
      currency: settings?.currency ?? "INR",
      currencySymbol: settings?.currencySymbol ?? "₹",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateSettings.mutateAsync(values);
      toast.success("Settings updated");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update settings"));
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your shop preferences and account.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Shop Preferences
            </CardTitle>
            <CardDescription>Update how your shop appears in the app.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={onSubmit} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="shopName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shop Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Raju Chaat Corner" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency Code</FormLabel>
                          <FormControl>
                            <Input placeholder="INR" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currencySymbol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Symbol</FormLabel>
                          <FormControl>
                            <Input placeholder="₹" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={updateSettings.isPending}
                      className="w-full sm:w-auto"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-secondary" />
              Account
            </CardTitle>
            <CardDescription>Manage your shop owner account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card shadow-sm">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "O"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-foreground">
                  {user?.firstName ? `${user.firstName} ${user.lastName ?? ""}` : "Shop Owner"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {user?.email || "No email provided"}
                </span>
              </div>
            </div>

            <Button
              variant="destructive"
              onClick={() => void logout()}
              className="w-full group"
            >
              <LogOut className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
