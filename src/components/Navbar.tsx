import { Link, useLocation } from "react-router-dom";
import { Film, Search, BarChart3, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/browse", label: "Browse", icon: Search },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-8">
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
          <Film className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          <span className="font-display text-xl sm:text-2xl tracking-wider text-primary">
            CineVault
          </span>
        </Link>
        <div className="flex items-center gap-0.5 sm:gap-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 sm:px-4 py-2 text-sm font-medium transition-all duration-200",
                location.pathname === item.to
                  ? "bg-primary/10 text-primary scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary active:scale-95"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
