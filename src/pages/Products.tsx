import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { categories } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/useCart";

const Products = () => {
  const { products } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const [search, setSearch] = useState("");

  const [specialFilter, setSpecialFilter] = useState<"all" | "near-expiry" | "under-50" | "under-100">("all");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeCategory === "all" || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      
      let matchesSpecial = true;
      if (specialFilter === "near-expiry") {
        matchesSpecial = Boolean(p.isNearExpiry && (p.expiryDiscountPercent ?? 0) > 0);
      } else if (specialFilter === "under-50") {
        matchesSpecial = p.price <= 50;
      } else if (specialFilter === "under-100") {
        matchesSpecial = p.price <= 100;
      }

      return matchesCategory && matchesSearch && matchesSpecial;
    });
  }, [products, activeCategory, search, specialFilter]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">All Products</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Fresh produce, daily essentials, and zero food waste smart deals.
          </p>
        </div>

        {/* Special Filter Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSpecialFilter(specialFilter === "near-expiry" ? "all" : "near-expiry")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              specialFilter === "near-expiry"
                ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
            }`}
          >
            <span>⏳ Expiry Smart Deals</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">Save Food</span>
          </button>

          <button
            onClick={() => setSpecialFilter(specialFilter === "under-50" ? "all" : "under-50")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              specialFilter === "under-50"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            Under ₹50
          </button>

          <button
            onClick={() => setSpecialFilter(specialFilter === "under-100" ? "all" : "under-100")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              specialFilter === "under-100"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            Under ₹100
          </button>
        </div>
      </div>

      {/* Zero Waste Banner if Expiry deals selected */}
      {specialFilter === "near-expiry" && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">🌱</span>
          <div>
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
              Zero Food Waste Smart Deals Active
            </p>
            <p className="text-[11px] text-muted-foreground">
              These items are near their best-before dates and offered at up to 40% discount. Help us save food while saving on your grocery bill!
            </p>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSearchParams({})}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSearchParams({ category: cat.id })}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-muted-foreground">No products found. Try a different search.</p>
        </div>
      )}
    </div>
  );
};

export default Products;
