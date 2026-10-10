import { Link } from "react-router-dom";
import { ArrowRight, Truck, Clock, Shield, Wallet, Hourglass, CalendarDays, Leaf, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-groceries.jpg";
import { categories } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/hooks/useCart";

const Index = () => {
  const { products, nearExpiryProducts } = useCart();
  const featuredProducts = products.filter((p) => p.originalPrice).concat(products.slice(0, 4)).slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Fresh groceries" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-foreground/60" />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-36">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-semibold mb-5 shadow-sm">
              <img src="/logo.jpg" alt="AK Devil" className="w-5 h-5 rounded-full object-cover" />
              <span>AK DEVIL GROCERY SHOP • Good Food • Better Life</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-background mb-4 leading-tight">
              Fresh Groceries,<br />Delivered <span className="text-secondary">Fast</span>
            </h1>
            <p className="text-background/80 text-lg mb-8 max-w-md">
              Get farm-fresh produce and daily essentials delivered to your doorstep in under 30 minutes.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 gradient-hero text-primary-foreground px-8 py-3.5 rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/weekly-planner"
                className="inline-flex items-center gap-2 bg-background/90 text-foreground px-6 py-3.5 rounded-full font-semibold hover:bg-background transition-colors border border-white/20 shadow-sm"
              >
                <CalendarDays className="w-4 h-4 text-primary" /> Weekly Planner
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 New Smart Shopping Features Spotlight */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/cart"
            className="bg-card rounded-2xl p-5 border border-border shadow-elevated flex items-center gap-4 hover:border-primary/40 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-body font-bold text-foreground text-sm">Smart Budget Shopping</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">₹500 Cap</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set a grocery budget. If you exceed it, app suggests cheaper alternatives to swap!
              </p>
            </div>
          </Link>

          <Link
            to="/products"
            className="bg-card rounded-2xl p-5 border border-border shadow-elevated flex items-center gap-4 hover:border-primary/40 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Hourglass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-body font-bold text-foreground text-sm">Expiry Smart Discounts</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">Save 40%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Save food & save money! Deep discounts on items nearing best-before dates.
              </p>
            </div>
          </Link>

          <Link
            to="/weekly-planner"
            className="bg-card rounded-2xl p-5 border border-border shadow-elevated flex items-center gap-4 hover:border-primary/40 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-body font-bold text-foreground text-sm">Weekly Grocery Planner</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">Recurring</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Create a recurring weekly shopping routine and push all items to cart in 1 tap!
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="font-display text-3xl font-bold text-foreground mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-elevated hover:border-primary/30 transition-all group"
            >
              <span className="text-4xl block mb-3">{cat.emoji}</span>
              <span className="font-body font-medium text-foreground group-hover:text-primary transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">Featured Products</h2>
            <p className="text-xs text-muted-foreground mt-1">Handpicked daily farm freshness and seasonal favorites</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Requirement 2: Zero Food Waste Expiry Deals Showcase */}
      {nearExpiryProducts.length > 0 && (
        <section className="container mx-auto px-4 pb-16">
          <div className="bg-gradient-to-r from-emerald-500/10 via-card to-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                  <Hourglass className="w-3.5 h-3.5" /> Save Food • Save Money
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground">
                  Zero Food Waste Deals (Up to 40% OFF)
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  100% fresh & safe groceries nearing their best-before date. Help us eliminate food waste!
                </p>
              </div>
              <Link
                to="/products"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-xl transition-colors self-start md:self-auto flex items-center gap-1.5"
              >
                View All Rescue Deals <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {nearExpiryProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Requirement 14: Recommended For You Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
              ✨ Personalized Suggestions
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground">Recommended For You</h2>
            <p className="text-xs text-muted-foreground">High-rated customer favorites and chef's daily picks</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            Explore More <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.filter((p) => p.rating >= 4.8 && (p.stock ?? 20) > 0).slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* CTA Banner & Coupon Promo */}
      <section className="container mx-auto px-4 pb-16">
        <div className="gradient-hero rounded-3xl p-8 md:p-12 text-primary-foreground text-center shadow-lg relative overflow-hidden">
          <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold mb-4">
            🏷️ Use Coupon Code: <strong>WELCOME20</strong>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-black mb-4">Get 20% Off Your First Order</h2>
          <p className="opacity-90 mb-8 max-w-lg mx-auto text-sm sm:text-base">
            Apply <strong>WELCOME20</strong> or <strong>FRESH50</strong> at checkout and enjoy express 30-min doorstep delivery across the city.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-card text-foreground px-8 py-3.5 rounded-full font-bold shadow-md hover:scale-105 transition-all text-sm"
          >
            Start Shopping Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
