import { Link } from "react-router-dom";
import { ShoppingCart, Search, Menu, X, Shield, LogOut, User as UserIcon } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const { totalItems, user, signOut } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.jpg"
            alt="AK Devil Grocery Shop"
            className="w-10 h-10 rounded-full object-cover border border-border shadow-sm group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-display text-lg font-black tracking-wider text-foreground leading-none">
              AK DEVIL
            </span>
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase leading-tight mt-0.5">
              Grocery Shop
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link to="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Products</Link>
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
          <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors flex items-center gap-1"
            >
              <Shield className="w-4 h-4" /> Admin Panel
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/products" className="p-2 rounded-full hover:bg-muted transition-colors">
            <Search className="w-5 h-5 text-muted-foreground" />
          </Link>
          <Link to="/cart" className="p-2 rounded-full hover:bg-muted transition-colors relative">
            <ShoppingCart className="w-5 h-5 text-muted-foreground" />
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                {totalItems}
              </Badge>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-border">
            {user ? (
              <div className="flex items-center gap-2.5">
                {user.role === "admin" ? (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-black hover:bg-amber-500/25 transition-colors shadow-sm"
                  >
                    👑 Admin Portal
                  </Link>
                ) : (
                  <Link
                    to="/cart"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-xs font-semibold text-foreground hover:bg-muted/80"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-primary" />
                    <span>{user.fullName.split(" ")[0]}</span>
                    <span className="text-[10px] text-muted-foreground font-normal">(Customer)</span>
                  </Link>
                )}
                <button
                  onClick={signOut}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/signin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted">
                  Sign In
                </Link>
                <Link to="/signup" className="text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 transition-opacity px-4 py-1.5 rounded-lg">
                  Sign Up
                </Link>
              </>
            )}
          </div>
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-4 space-y-3 animate-fade-in">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block text-sm font-medium py-2">Home</Link>
          <Link to="/products" onClick={() => setMobileOpen(false)} className="block text-sm font-medium py-2">Products</Link>
          <Link to="/about" onClick={() => setMobileOpen(false)} className="block text-sm font-medium py-2">About</Link>
          <Link to="/contact" onClick={() => setMobileOpen(false)} className="block text-sm font-medium py-2">Contact</Link>
          {user?.role === "admin" && (
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-bold text-amber-600 dark:text-amber-400 py-2 flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4" /> Admin Portal
            </Link>
          )}
          <div className="border-t border-border pt-3 space-y-2">
            {user ? (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Signed in as: <strong className="text-foreground">{user.fullName}</strong> ({user.role})
                </div>
                {user.role === "admin" ? (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="block text-sm font-bold text-center py-2 text-amber-600 bg-amber-500/10 rounded-lg"
                  >
                    Open Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/cart"
                    onClick={() => setMobileOpen(false)}
                    className="block text-sm font-medium text-center py-2 text-foreground bg-muted rounded-lg"
                  >
                    My Purchases & Orders
                  </Link>
                )}
                <button
                  onClick={() => {
                    signOut();
                    setMobileOpen(false);
                  }}
                  className="w-full text-sm font-medium text-center py-2 text-destructive bg-destructive/10 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link to="/signin" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-center py-2 text-muted-foreground hover:text-foreground">Sign In</Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-center py-2 text-primary-foreground bg-primary rounded-lg hover:opacity-90">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
