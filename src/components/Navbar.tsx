import { Link } from "react-router-dom";
import { ShoppingCart, Search, Menu, X, Shield, LogOut, User as UserIcon, Heart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const { totalItems, wishlist, user, signOut } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card/85 backdrop-blur-md border-b border-border shadow-sm">
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

        <div className="hidden md:flex items-center gap-7">
          <Link to="/" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/products" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Products
          </Link>
          <Link to="/weekly-planner" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
            Weekly Plan
          </Link>
          <Link to="/wishlist" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Wishlist
          </Link>
          <Link to="/about" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Link to="/contact" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20"
            >
              <Shield className="w-3.5 h-3.5" /> Admin Panel
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/products"
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Search products"
          >
            <Search className="w-5 h-5" />
          </Link>

          {/* Wishlist Icon Button (Requirement 2) */}
          <Link
            to="/wishlist"
            className="p-2 rounded-full hover:bg-muted transition-colors relative text-muted-foreground hover:text-rose-500"
            aria-label="View Wishlist"
          >
            <Heart className={`w-5 h-5 ${wishlist.length > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
            {wishlist.length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] font-bold bg-rose-500 text-white border-2 border-card">
                {wishlist.length}
              </Badge>
            )}
          </Link>

          {/* Cart Icon Button */}
          <Link
            to="/cart"
            className="p-2 rounded-full hover:bg-muted transition-colors relative text-muted-foreground hover:text-foreground"
            aria-label="View Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground border-2 border-card">
                {totalItems}
              </Badge>
            )}
          </Link>

          {/* User Profile / Auth Area */}
          <div className="hidden md:flex items-center gap-2 ml-2 pl-3 border-l border-border">
            {user ? (
              <div className="flex items-center gap-2.5">
                {user.role === "admin" ? (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-black hover:bg-amber-500/25 transition-colors shadow-sm"
                  >
                    👑 Admin
                  </Link>
                ) : (
                  <Link
                    to="/cart"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-muted text-xs font-semibold text-foreground hover:bg-muted/80 border border-border"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-primary" />
                    <span>{user.fullName.split(" ")[0]}</span>
                  </Link>
                )}
                <button
                  onClick={signOut}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Sign Out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-xl hover:bg-muted"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-xs font-bold text-primary-foreground gradient-hero hover:opacity-90 transition-opacity px-4 py-1.5 rounded-xl shadow-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-4 space-y-3 animate-fade-in shadow-lg">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold py-2">
            Home
          </Link>
          <Link to="/products" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold py-2">
            Products
          </Link>
          <Link to="/weekly-planner" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold py-2 flex items-center justify-between">
            <span>📅 Weekly Planner</span>
          </Link>
          <Link
            to="/wishlist"
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-semibold py-2 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> Wishlist
            </span>
            {wishlist.length > 0 && (
              <Badge className="bg-rose-500 text-white text-xs">{wishlist.length}</Badge>
            )}
          </Link>
          <Link to="/cart" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold py-2">
            Cart & History
          </Link>
          <Link to="/about" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold py-2">
            About
          </Link>
          <Link to="/contact" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold py-2">
            Contact
          </Link>
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
                  Signed in as: <strong className="text-foreground">{user.fullName}</strong>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setMobileOpen(false);
                  }}
                  className="w-full text-xs font-bold text-center py-2.5 text-destructive bg-destructive/10 rounded-xl"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/signin"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 text-xs font-bold bg-muted rounded-xl text-foreground"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 text-xs font-bold gradient-hero text-primary-foreground rounded-xl"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
