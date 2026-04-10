import { Link } from "react-router-dom";
import { ShoppingCart, Search, User, Menu, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🥬</span>
          <span className="font-display text-xl font-bold text-foreground">FreshCart</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link to="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Products</Link>
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
          <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
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
            <Link to="/signin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-muted">
              Sign In
            </Link>
            <Link to="/signup" className="text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 transition-opacity px-4 py-2 rounded-lg">
              Sign Up
            </Link>
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
          <div className="border-t border-border pt-3 space-y-3">
            <Link to="/signin" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-center py-2 text-muted-foreground hover:text-foreground">Sign In</Link>
            <Link to="/signup" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-center py-2 text-primary-foreground bg-primary rounded-lg hover:opacity-90">Sign Up</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
