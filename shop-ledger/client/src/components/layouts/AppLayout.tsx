import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  IndianRupee,
  ReceiptText,
  Tags,
  TrendingUp,
  FileBarChart2,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/AuthContext";
import { useGetSettings } from "@/features/settings/api";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sales", label: "Sales", icon: IndianRupee },
  { href: "/expenses", label: "Expenses", icon: ReceiptText },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/investments", label: "Investments", icon: TrendingUp },
  { href: "/reports", label: "Reports", icon: FileBarChart2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

function userInitial(user: ReturnType<typeof useAuth>["user"]) {
  return user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "O";
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const { data: settings } = useGetSettings();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLinks = () => (
    <div className="flex flex-col space-y-1 py-4">
      {navItems.map((item) => {
        const active = location === item.href;
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href}>
            <div
              onClick={() => setMobileOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg mx-2 transition-colors cursor-pointer ${
                active
                  ? "bg-primary text-primary-foreground font-medium shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border z-10 sticky top-0">
        <div className="flex items-center space-x-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-foreground">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar border-r-sidebar-border">
              <div className="p-6 border-b border-sidebar-border">
                <h2 className="text-xl font-bold text-sidebar-foreground tracking-tight">
                  {settings?.shopName || "Shop Ledger"}
                </h2>
              </div>
              <NavLinks />
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border bg-sidebar">
                <div className="flex items-center space-x-3 mb-4 px-2">
                  <Avatar className="h-10 w-10 border border-sidebar-border">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {userInitial(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-sidebar-foreground line-clamp-1">
                      {user?.firstName || "Shop Owner"}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={() => void logout()}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-bold text-foreground">
            {settings?.shopName || "Shop Ledger"}
          </h1>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {userInitial(user)}
          </AvatarFallback>
        </Avatar>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border fixed top-0 bottom-0 overflow-y-auto">
        <div className="p-6 border-b border-sidebar-border">
          <h2 className="text-2xl font-bold text-sidebar-foreground tracking-tight">
            {settings?.shopName || "Shop Ledger"}
          </h2>
        </div>
        <div className="flex-1">
          <NavLinks />
        </div>
        <div className="p-4 border-t border-sidebar-border bg-sidebar/50">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <Avatar className="h-10 w-10 border border-sidebar-border">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {userInitial(user)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.firstName || "Shop Owner"}
              </span>
              <span className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => void logout()}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-0 bg-background">
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6 pb-20 md:pb-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
