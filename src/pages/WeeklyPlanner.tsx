import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { WeeklyPlanItem, INITIAL_WEEKLY_TEMPLATES } from "@/data/weeklyPlanner";
import {
  CalendarDays,
  Plus,
  Trash2,
  ShoppingCart,
  Sparkles,
  CheckCircle2,
  Circle,
  RotateCcw,
  Search,
  Wallet,
  ArrowRight,
  TrendingDown,
  Clock,
  Layers,
  Check,
} from "lucide-react";
import { toast } from "sonner";

const DAYS_OF_WEEK: (WeeklyPlanItem["day"] | "All")[] = [
  "All",
  "All Week",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const WeeklyPlanner = () => {
  const navigate = useNavigate();
  const {
    weeklyPlan,
    addToWeeklyPlan,
    removeFromWeeklyPlan,
    updateWeeklyPlanItem,
    loadWeeklyPlanTemplate,
    clearWeeklyPlan,
    addWeeklyPlanToCart,
    products,
    getProductEffectivePrice,
    budget,
    setBudget,
  } = useCart();

  const [selectedDayFilter, setSelectedDayFilter] = useState<WeeklyPlanItem["day"] | "All">("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Toggle checklist status
  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Map weekly plan items to product objects
  const plannedItemsWithProducts = useMemo(() => {
    return weeklyPlan
      .map((item) => {
        const prod = products.find((p) => p.id === item.productId);
        return {
          ...item,
          product: prod,
        };
      })
      .filter((item) => Boolean(item.product));
  }, [weeklyPlan, products]);

  // Filter items by selected day
  const filteredPlanItems = useMemo(() => {
    if (selectedDayFilter === "All") return plannedItemsWithProducts;
    return plannedItemsWithProducts.filter((item) => item.day === selectedDayFilter);
  }, [plannedItemsWithProducts, selectedDayFilter]);

  // Calculate totals
  const totalWeeklyCost = useMemo(() => {
    return plannedItemsWithProducts.reduce((sum, item) => {
      if (!item.product) return sum;
      return sum + getProductEffectivePrice(item.product) * item.quantity;
    }, 0);
  }, [plannedItemsWithProducts, getProductEffectivePrice]);

  const totalQuantity = useMemo(() => {
    return plannedItemsWithProducts.reduce((sum, item) => sum + item.quantity, 0);
  }, [plannedItemsWithProducts]);

  // Categories for product search modal
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, [products]);

  const searchableProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(productSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, productSearch]);

  const handleTransferToCart = () => {
    if (weeklyPlan.length === 0) {
      toast.error("Your weekly plan has no items to add.");
      return;
    }
    addWeeklyPlanToCart();
    toast.success("All weekly groceries transferred to your cart!");
    navigate("/cart");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> Recurring Shopping
            </span>
            <span className="text-xs font-bold bg-muted px-2.5 py-0.5 rounded-full text-muted-foreground">
              Feature 3
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">
            Weekly Grocery Planner
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Build your recurring grocery list once and reuse it every week. Schedule groceries by day, track your weekly budget, and push all items to your cart with one tap!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Add Groceries to Plan
          </button>
          <button
            onClick={handleTransferToCart}
            disabled={weeklyPlan.length === 0}
            className="inline-flex items-center gap-2 gradient-hero text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:opacity-95 disabled:opacity-40 transition-all"
          >
            <ShoppingCart className="w-4 h-4" /> Add Weekly Plan to Cart
          </button>
        </div>
      </div>

      {/* Summary KPI Cards & Budget Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground block">Planned Items</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-display text-2xl font-black text-foreground">
              {plannedItemsWithProducts.length} Products
            </span>
            <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {totalQuantity} Units
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground block">Est. Weekly Cost</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-display text-2xl font-black text-foreground">
              ₹{totalWeeklyCost.toFixed(2)}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Per Recurring Week
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground block">Weekly Budget Cap</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-display text-2xl font-black text-foreground">
              {budget ? `₹${budget}` : "Not Set"}
            </span>
            {budget && (
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  totalWeeklyCost <= budget
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {totalWeeklyCost <= budget ? "Within Budget" : "Exceeded"}
              </span>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground block">Checklist Progress</span>
            <span className="font-display text-2xl font-black text-foreground mt-1 block">
              {Object.values(checkedItems).filter(Boolean).length} / {plannedItemsWithProducts.length}
            </span>
          </div>
          {weeklyPlan.length > 0 && (
            <button
              onClick={clearWeeklyPlan}
              className="text-xs font-bold text-muted-foreground hover:text-destructive p-2 hover:bg-destructive/10 rounded-xl transition-colors"
              title="Clear entire plan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Pre-Built Weekly Plan Templates */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-8 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Pre-Built Weekly Routines
            </h2>
            <p className="text-xs text-muted-foreground">
              1-Click load popular recurring grocery baskets for families, fitness lovers, and students.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
          {INITIAL_WEEKLY_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-muted/40 border border-border rounded-xl p-4 flex flex-col justify-between hover:border-primary/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{tmpl.icon}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {tmpl.badge}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-foreground">{tmpl.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {tmpl.description}
                </p>
                <p className="text-[11px] text-muted-foreground font-semibold mt-2">
                  Includes {tmpl.items.length} weekly recurring essentials
                </p>
              </div>

              <button
                onClick={() => loadWeeklyPlanTemplate(tmpl.id)}
                className="mt-4 w-full py-2 text-xs font-bold rounded-xl bg-card border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all flex items-center justify-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" /> Load Routine
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Day Filter Navigator Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {DAYS_OF_WEEK.map((day) => {
          const count =
            day === "All"
              ? plannedItemsWithProducts.length
              : plannedItemsWithProducts.filter((i) => i.day === day).length;

          return (
            <button
              key={day}
              onClick={() => setSelectedDayFilter(day)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                selectedDayFilter === day
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border text-foreground hover:border-primary/40"
              }`}
            >
              <span>{day}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedDayFilter === day ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Planned Items Grid */}
      {filteredPlanItems.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
          <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-60" />
          <h3 className="font-display text-lg font-bold text-foreground">
            No items planned for {selectedDayFilter === "All" ? "your week" : selectedDayFilter}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            Choose a starter routine from above or search and add your favorite daily items to this day's grocery list.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Groceries Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlanItems.map((item) => {
            const prod = item.product!;
            const unitPrice = getProductEffectivePrice(prod);
            const isChecked = Boolean(checkedItems[item.id]);

            return (
              <div
                key={item.id}
                className={`bg-card border rounded-2xl p-4 transition-all shadow-sm flex flex-col justify-between ${
                  isChecked
                    ? "border-emerald-500/30 bg-emerald-500/5 opacity-80"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div>
                  <div className="flex items-start gap-3">
                    {/* Checklist checkbox */}
                    <button
                      onClick={() => toggleCheck(item.id)}
                      className="mt-0.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
                      title={isChecked ? "Mark as pending" : "Mark as completed/bought"}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>

                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-14 h-14 rounded-xl object-cover bg-muted shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`font-bold text-sm leading-tight text-foreground truncate ${
                            isChecked ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {prod.name}
                        </h4>
                        <button
                          onClick={() => removeFromWeeklyPlan(item.id)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors"
                          title="Remove from plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-muted-foreground">{prod.unit} • {prod.category}</p>

                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="font-bold text-xs text-foreground">
                          ₹{unitPrice * item.quantity}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          (₹{unitPrice} × {item.quantity})
                        </span>
                        {prod.isNearExpiry && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600">
                            Deal
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Day selector & Quantity Stepper */}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                  <select
                    value={item.day || "All Week"}
                    onChange={(e) =>
                      updateWeeklyPlanItem(item.id, {
                        day: e.target.value as WeeklyPlanItem["day"],
                      })
                    }
                    className="text-[11px] font-semibold bg-muted border border-border rounded-lg px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="All Week">Everyday / All Week</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>

                  <div className="flex items-center gap-1.5 bg-muted p-1 rounded-lg">
                    <button
                      onClick={() => {
                        if (item.quantity <= 1) {
                          removeFromWeeklyPlan(item.id);
                        } else {
                          updateWeeklyPlanItem(item.id, { quantity: item.quantity - 1 });
                        }
                      }}
                      className="w-5 h-5 rounded bg-card flex items-center justify-center text-xs font-bold hover:bg-accent text-foreground"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold w-4 text-center text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateWeeklyPlanItem(item.id, { quantity: item.quantity + 1 })
                      }
                      className="w-5 h-5 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold hover:opacity-90"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Sticky Floating Bar */}
      {plannedItemsWithProducts.length > 0 && (
        <div className="mt-10 bg-card border-2 border-primary/20 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">
                Ready for this week's restock?
              </p>
              <p className="text-xs text-muted-foreground">
                {plannedItemsWithProducts.length} items ready • Estimated total: ₹{totalWeeklyCost.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/cart"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-muted text-foreground hover:bg-accent border border-border"
            >
              View Active Cart
            </Link>
            <button
              onClick={handleTransferToCart}
              className="inline-flex items-center gap-2 gradient-hero text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-xs shadow-md hover:opacity-90 transition-all"
            >
              <ShoppingCart className="w-4 h-4" /> Load Entire Plan to Cart
            </button>
          </div>
        </div>
      )}

      {/* Product Search & Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Add Groceries to Weekly Plan
                </h3>
                <p className="text-xs text-muted-foreground">
                  Select recurring items to include in your weekly shopping routine.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                ✕
              </button>
            </div>

            {/* Modal Filters */}
            <div className="p-4 border-b border-border bg-muted/20 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search products by name or category..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-card border border-border text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-foreground hover:bg-accent"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Product List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {searchableProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  No products found matching your search.
                </div>
              ) : (
                searchableProducts.map((prod) => {
                  const alreadyPlanned = weeklyPlan.find((i) => i.productId === prod.id);
                  const effectivePrice = getProductEffectivePrice(prod);

                  return (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-12 h-12 rounded-xl object-cover bg-muted shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{prod.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {prod.unit} • {prod.category}
                          </p>
                          <p className="text-xs font-black text-primary">₹{effectivePrice}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {alreadyPlanned ? (
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <Check className="w-3 h-3" /> Added ({alreadyPlanned.quantity})
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              addToWeeklyPlan(
                                prod.id,
                                1,
                                selectedDayFilter === "All" ? "All Week" : selectedDayFilter
                              );
                            }}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                          >
                            + Add to Plan
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-card flex justify-end">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyPlanner;
