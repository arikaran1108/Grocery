import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingCart,
  Package,
  Clock,
  X,
  AlertCircle,
  Navigation,
  Tag,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Wallet,
  ArrowRightLeft,
  CalendarDays,
  TrendingDown,
  Hourglass,
  Leaf,
  SlidersHorizontal,
} from "lucide-react";
import TrackingModal from "@/components/TrackingModal";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    items,
    updateQuantity,
    removeFromCart,
    totalPrice,
    orderHistory,
    updateOrderStatus,
    cancelOrder,
    reorder,
    coupons,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    calculateDiscount,
    products,
    addToCart,
    // Requirement 1 & 2 & 3 Additions
    budget,
    setBudget,
    getCheaperAlternatives,
    swapCartItemWithAlternative,
    autoFillBudgetBasket,
    getProductEffectivePrice,
    saveCartAsWeeklyPlan,
  } = useCart();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [customBudgetInput, setCustomBudgetInput] = useState("");

  const selectedOrder = orderHistory.find((o) => o.id === selectedOrderId) || null;

  // Auto-open live tracking if redirected from checkout with an order id
  useEffect(() => {
    if (location.state?.trackOrderId) {
      setSelectedOrderId(location.state.trackOrderId);
      setIsTrackingOpen(true);
    }
  }, [location.state]);

  const handleTrackOrder = (order: typeof orderHistory[0]) => {
    setSelectedOrderId(order.id);
    setIsTrackingOpen(true);
  };

  const handleUpdateStatus = (status: "Processing" | "Shipped" | "Delivered", location: string) => {
    if (selectedOrderId) {
      updateOrderStatus(selectedOrderId, status, location);
    }
  };

  const handleCancelOrder = (orderId: string) => {
    cancelOrder(orderId);
    setCancelConfirmId(null);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    applyCoupon(couponInput, totalPrice);
    setCouponInput("");
  };

  const discountAmount = calculateDiscount(totalPrice);
  const deliveryFee = totalPrice - discountAmount >= 500 ? 0 : 49;
  const grandTotal = Math.max(0, totalPrice - discountAmount + deliveryFee);

  // Recommendations: products not in cart
  const cartProductIds = new Set(items.map((i) => i.product.id));
  const recommendedItems = products
    .filter((p) => !cartProductIds.has(p.id) && (p.stock ?? 20) > 0)
    .slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-8">
      {items.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-3xl p-8 max-w-xl mx-auto shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-foreground mb-2">
            Your cart is empty
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            Looks like you haven't added any fresh groceries yet. Explore farm fruits, organic veggies, or use our Smart Budget Basket!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 gradient-hero text-primary-foreground px-6 py-3.5 rounded-full font-bold text-sm shadow-md hover:opacity-90 transition-opacity"
            >
              Browse Products <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                setBudget(500);
                autoFillBudgetBasket(500);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-6 py-3.5 rounded-full font-bold text-sm hover:bg-emerald-500/20 transition-all"
            >
              <Wallet className="w-4 h-4" /> Auto-Fill ₹500 Budget Basket
            </button>
            <Link
              to="/weekly-planner"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-muted text-foreground border border-border px-6 py-3.5 rounded-full font-bold text-sm hover:bg-accent transition-all"
            >
              <CalendarDays className="w-4 h-4" /> Weekly Planner
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-3xl font-extrabold text-foreground">
                Shopping Cart
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Manage your items, track your shopping budget, and swap for cheaper alternatives.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={saveCartAsWeeklyPlan}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground border border-primary/20 px-3.5 py-2 rounded-xl transition-all"
                title="Save this cart as recurring Weekly Grocery Plan"
              >
                <CalendarDays className="w-4 h-4" /> Save as Weekly Plan
              </button>
              <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                {items.reduce((s, i) => s + i.quantity, 0)} Items
              </span>
            </div>
          </div>

          {/* ================= REQUIREMENT 1: SMART BUDGET SHOPPING CARD ================= */}
          <div className="bg-gradient-to-r from-card via-card to-primary/5 border border-border rounded-2xl p-5 mb-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-base font-bold text-foreground">
                      Smart Budget Shopping
                    </h2>
                    {budget ? (
                      <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Target: ₹{budget}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        No Budget Set
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Set a grocery spending cap (e.g. ₹500). If you exceed it, we will alert you and suggest cheaper alternatives to swap!
                  </p>
                </div>
              </div>

              {/* Budget Quick Selectors */}
              <div className="flex flex-wrap items-center gap-2">
                {[300, 500, 1000, 1500].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setBudget(amt)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                      budget === amt
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/70 text-foreground border-border hover:border-primary/40"
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const val = parseFloat(customBudgetInput);
                    if (!isNaN(val) && val > 0) {
                      setBudget(val);
                      setCustomBudgetInput("");
                    }
                  }}
                  className="flex items-center gap-1.5"
                >
                  <input
                    type="number"
                    min="50"
                    max="10000"
                    placeholder="Custom ₹"
                    value={customBudgetInput}
                    onChange={(e) => setCustomBudgetInput(e.target.value)}
                    className="w-24 px-2.5 py-1.5 text-xs rounded-xl bg-muted border border-border text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 transition-colors"
                  >
                    Set
                  </button>
                </form>

                {budget && (
                  <button
                    onClick={() => setBudget(null)}
                    className="text-xs font-semibold text-muted-foreground hover:text-destructive px-2 py-1"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Budget Progress Bar */}
            {budget !== null && budget > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                {(() => {
                  const isExceeded = totalPrice > budget;
                  const diff = Math.abs(totalPrice - budget);
                  const percent = Math.min(100, Math.round((totalPrice / budget) * 100));

                  return (
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className={isExceeded ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}>
                          {isExceeded
                            ? `⚠️ Budget Exceeded by ₹${diff.toFixed(2)} (${percent}% of ₹${budget})`
                            : `✅ Within Budget! ₹${diff.toFixed(2)} remaining (${percent}% spent)`}
                        </span>
                        <span className="text-foreground">
                          ₹{totalPrice.toFixed(2)} / ₹{budget.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            isExceeded
                              ? "bg-destructive"
                              : percent > 80
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* ================= REQUIREMENT 1: EXCEEDED BUDGET ALERT & CHEAPER ALTERNATIVES ================= */}
          {budget !== null && budget > 0 && totalPrice > budget && (
            <div className="bg-destructive/5 border-2 border-destructive/20 rounded-2xl p-5 mb-8 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="font-display font-bold text-sm sm:text-base text-destructive">
                      Cart Total Exceeds Your ₹{budget} Budget by ₹{(totalPrice - budget).toFixed(2)}!
                    </h3>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive">
                      Reduce Cart
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Don't worry! Here are cheaper alternatives for items in your cart. Swap any item with a single click to bring your bill back under ₹{budget}:
                  </p>

                  {/* Cheaper Alternatives Suggestions List */}
                  {(() => {
                    const itemsWithAlternatives = items
                      .map((cartItem) => ({
                        cartItem,
                        alternatives: getCheaperAlternatives(cartItem),
                      }))
                      .filter((entry) => entry.alternatives.length > 0);

                    if (itemsWithAlternatives.length === 0) {
                      return (
                        <p className="text-xs text-muted-foreground mt-3 italic">
                          You already have the most economical options selected in these categories! Consider reducing item quantities to meet your budget.
                        </p>
                      );
                    }

                    return (
                      <div className="mt-4 space-y-3">
                        {itemsWithAlternatives.map(({ cartItem, alternatives }) => {
                          const currentUnitPrice = getProductEffectivePrice(cartItem.product);
                          return (
                            <div
                              key={cartItem.product.id}
                              className="bg-card border border-border rounded-xl p-3 sm:p-4 shadow-xs"
                            >
                              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-border text-xs">
                                <span className="font-semibold text-foreground">
                                  Current: <strong className="text-primary">{cartItem.product.name}</strong> ({cartItem.quantity} × ₹{currentUnitPrice} = ₹{currentUnitPrice * cartItem.quantity})
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  Category: {cartItem.product.category}
                                </span>
                              </div>

                              <div className="mt-2.5 grid sm:grid-cols-2 gap-2.5">
                                {alternatives.map((alt) => {
                                  const altUnitPrice = getProductEffectivePrice(alt);
                                  const currentTotal = currentUnitPrice * cartItem.quantity;
                                  const newTotal = altUnitPrice * cartItem.quantity;
                                  const savings = currentTotal - newTotal;

                                  return (
                                    <div
                                      key={alt.id}
                                      className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-muted/50 border border-border hover:border-emerald-500/30 transition-all"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <img
                                          src={alt.image}
                                          alt={alt.name}
                                          className="w-10 h-10 rounded-lg object-cover bg-muted shrink-0"
                                        />
                                        <div className="min-w-0">
                                          <p className="text-xs font-bold text-foreground truncate">
                                            {alt.name}
                                          </p>
                                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                            ₹{altUnitPrice}/{alt.unit} • Save ₹{savings.toFixed(2)}
                                          </p>
                                        </div>
                                      </div>

                                      <button
                                        onClick={() => swapCartItemWithAlternative(cartItem.product.id, alt)}
                                        className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
                                      >
                                        <ArrowRightLeft className="w-3 h-3" /> Swap
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(({ product, quantity }) => {
                const stock = product.stock ?? 20;
                const unitPrice = getProductEffectivePrice(product);
                const isNearExpiry = product.isNearExpiry && (product.expiryDiscountPercent ?? 0) > 0;
                const cheaperAlts = getCheaperAlternatives({ product, quantity });

                return (
                  <div
                    key={product.id}
                    className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex gap-4 animate-fade-in shadow-sm hover:border-primary/20 transition-colors"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 bg-muted"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-body font-bold text-foreground text-sm sm:text-base leading-snug">
                          {product.name}
                        </h3>
                        {/* Requirement 2: Near Expiry Smart Discount Badge */}
                        {isNearExpiry && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                            <Hourglass className="w-3 h-3" /> {product.expiryDiscountPercent}% OFF • Save Food
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{product.unit}</p>
                      
                      {isNearExpiry && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                          ⏳ Best before {product.daysUntilExpiry ?? 2} days ({product.expiryDate ?? "Soon"})
                        </p>
                      )}

                      {/* Price Display */}
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="font-black text-foreground text-base">
                          ₹{(unitPrice * quantity).toFixed(2)}
                        </span>
                        {isNearExpiry && (
                          <span className="text-xs text-muted-foreground line-through">
                            ₹{(product.price * quantity).toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Quick Cheaper Alternative Link if available */}
                      {cheaperAlts.length > 0 && (
                        <div className="mt-2.5">
                          <button
                            onClick={() => swapCartItemWithAlternative(product.id, cheaperAlts[0])}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            <TrendingDown className="w-3 h-3" /> Cheaper option: {cheaperAlts[0].name} (₹{getProductEffectivePrice(cheaperAlts[0])}) - Swap
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded-lg hover:bg-destructive/10 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-full border border-border">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-7 h-7 rounded-full bg-card flex items-center justify-center hover:bg-accent transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold w-5 text-center text-foreground">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= stock}
                          className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-opacity"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Requirement 14: You Might Also Like Add-ons in Cart */}
              {recommendedItems.length > 0 && (
                <div className="mt-8 bg-card border border-border rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-primary">
                    <Sparkles className="w-3.5 h-3.5" /> Frequently Added Essentials
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {recommendedItems.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-muted/40 border border-border rounded-xl p-2.5 flex flex-col justify-between"
                      >
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full aspect-square rounded-lg object-cover mb-2"
                        />
                        <div>
                          <p className="font-semibold text-xs text-foreground line-clamp-1">{prod.name}</p>
                          <p className="text-[11px] font-bold text-primary">₹{prod.price}</p>
                        </div>
                        <button
                          onClick={() => addToCart(prod)}
                          className="mt-2 w-full py-1 text-[11px] font-bold rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary & Coupon Card */}
            <div className="space-y-4">
              {/* Requirement 7: Coupon System Box */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" /> Apply Promo Code
                </h3>

                {appliedCoupon ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-600 block flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {appliedCoupon.code} Applied
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Saving ₹{discountAmount.toFixed(2)} on this order
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-bold text-destructive hover:underline p-1"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. FRESH50"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 text-xs uppercase rounded-xl bg-muted border border-border text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {/* Available Coupons Pills */}
                <div className="mt-4 pt-3 border-t border-border">
                  <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
                    Available Offers:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {coupons.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => applyCoupon(c.code, totalPrice)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                          appliedCoupon?.code === c.code
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                            : "bg-muted border-border text-foreground hover:border-primary/40 hover:text-primary"
                        }`}
                        title={c.description}
                      >
                        🏷️ {c.code} (₹{c.discountValue}{c.discountType === "percentage" ? "%" : ""} off)
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24">
                <h2 className="font-display text-lg font-bold text-foreground mb-4">
                  Order Summary
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cart Subtotal</span>
                    <span className="font-semibold text-foreground">₹{totalPrice.toFixed(2)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Coupon Discount ({appliedCoupon?.code})</span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Charge</span>
                    <span className={`font-semibold ${deliveryFee === 0 ? "text-primary" : "text-foreground"}`}>
                      {deliveryFee === 0 ? "FREE" : `₹${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>

                  {totalPrice - discountAmount < 500 && (
                    <p className="text-xs text-muted-foreground bg-primary/5 p-2 rounded-lg border border-primary/10">
                      🚚 Add ₹{(500 - (totalPrice - discountAmount)).toFixed(2)} more for <strong>Free Delivery</strong>!
                    </p>
                  )}

                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-bold text-foreground text-base">To Pay</span>
                    <span className="font-black text-xl text-foreground">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 gradient-hero text-primary-foreground px-6 py-3.5 rounded-full font-bold shadow-md hover:opacity-90 transition-opacity"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Requirement 6: Order History with Reorder Button */}
      <div className="mt-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-primary" /> Purchase History & Reordering
          </h2>
          <span className="text-xs text-muted-foreground font-semibold">
            {orderHistory.length} total orders placed
          </span>
        </div>

        {orderHistory.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-sm">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-60" />
            <p className="text-muted-foreground font-medium text-sm">
              No previous orders found. Place your first order to track it live here!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orderHistory.map((order) => (
              <div
                key={order.id}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/20 transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-foreground text-sm">{order.id}</span>
                      <span className="text-xs text-muted-foreground">• {order.date}</span>
                    </div>
                    {order.deliverySlot && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Slot: <strong className="text-foreground">{order.deliverySlot}</strong>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Live Tracking Status */}
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        order.status === "Delivered"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : order.status === "Shipped"
                          ? "bg-primary/10 text-primary"
                          : order.status === "Cancelled"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {order.status}
                    </span>

                    {/* Reorder Button (Requirement 6) */}
                    <button
                      onClick={() => reorder(order.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reorder
                    </button>

                    {/* Cancel Order if pending */}
                    {!order.isCancelled && order.status !== "Delivered" && (
                      <button
                        onClick={() => setCancelConfirmId(order.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                    )}

                    {/* Live Track Modal Button */}
                    {order.status !== "Cancelled" && (
                      <button
                        onClick={() => handleTrackOrder(order)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full gradient-hero text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
                      >
                        <Navigation className="w-3.5 h-3.5" /> Track Live
                      </button>
                    )}
                  </div>
                </div>

                {/* Items in order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {order.items.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-2.5 bg-muted/40 p-2 rounded-xl text-xs"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate">{product.name}</p>
                        <p className="text-muted-foreground text-[10px]">
                          Qty: {quantity} • ₹{(product.price * quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer with totals */}
                <div className="border-t border-border pt-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-muted-foreground">Total Paid: </span>
                    <strong className="text-foreground text-sm font-black">
                      ₹{order.totalPrice.toFixed(2)}
                    </strong>
                    {order.couponCode && (
                      <span className="text-[10px] text-emerald-600 block mt-0.5">
                        🏷️ Coupon {order.couponCode} saved ₹{order.discountAmount?.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {order.location && (
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">Current Status / Location:</p>
                      <p className="font-bold text-foreground text-xs">{order.location}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tracking Modal */}
      {selectedOrder && (
        <TrackingModal
          order={selectedOrder}
          isOpen={isTrackingOpen}
          onClose={() => {
            setIsTrackingOpen(false);
            setSelectedOrderId(null);
          }}
          onUpdateStatus={handleUpdateStatus}
          onCloseModal={() => {
            setIsTrackingOpen(false);
            setSelectedOrderId(null);
          }}
        />
      )}

      {/* Cancel Order Confirmation Dialog */}
      <AlertDialog
        open={cancelConfirmId !== null}
        onOpenChange={(open) => !open && setCancelConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" /> Cancel Order
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone. You will be able to reorder the items later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="p-3 bg-muted rounded-xl text-xs font-mono">
            Order Reference: {cancelConfirmId}
          </div>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleCancelOrder(cancelConfirmId!)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Cancel
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Cart;
