import { useState, useMemo } from "react";
import { useCart } from "@/hooks/useCart";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Package,
  TrendingUp,
  Users,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Trash2,
  Edit,
  Save,
  Search,
  ExternalLink,
  LogOut,
  Navigation,
  RefreshCw,
  DollarSign,
  AlertCircle,
  AlertTriangle,
  Filter,
  BarChart3,
  Tag,
  Sparkles,
  Layers,
  Hourglass,
  Leaf,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { categories, type Product } from "@/data/products";
import TrackingModal from "@/components/TrackingModal";
import { useToast } from "@/hooks/use-toast";
import type { OrderHistoryItem, UserRole } from "@/context/CartContext";
import { Coupon } from "@/data/coupons";

const CHART_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316", "#64748b"];

const Admin = () => {
  const {
    user,
    users,
    products,
    orderHistory,
    updateOrderStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    restockProduct,
    lowStockProducts,
    updateUserRole,
    loginAsDemo,
    signOut,
    coupons,
    applyCoupon,
    updateExpiryDiscount,
    nearExpiryProducts,
    getProductEffectivePrice,
  } = useCart();

  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"overview" | "reports" | "orders" | "products" | "expiry-discounts" | "coupons" | "users">("overview");
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<OrderHistoryItem | null>(null);

  // Orders Tab filters
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [customLocations, setCustomLocations] = useState<Record<string, string>>({});

  // Products Tab filters & state
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Expiry Smart Discounts Tab filters & state (Requirement 2)
  const [expirySearch, setExpirySearch] = useState("");
  const [expiryFilter, setExpiryFilter] = useState<"all" | "near-expiry" | "standard">("all");
  const [editingExpiryDiscount, setEditingExpiryDiscount] = useState<Record<string, { percent: number; days: number; date: string }>>({});

  // New product form
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "fruits",
    unit: "1 kg",
    stock: "20",
    description: "",
    image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400",
    rating: 4.8,
    inStock: true,
  });

  // Calculate Metrics
  const validOrders = orderHistory.filter((o) => o.status !== "Cancelled");
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const deliveredOrders = orderHistory.filter((o) => o.status === "Delivered");
  const deliveredRevenue = deliveredOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const activeOrdersCount = orderHistory.filter(
    (o) => o.status === "Processing" || o.status === "Shipped"
  ).length;
  const outOfStockCount = products.filter((p) => (p.stock ?? 0) <= 0 || !p.inStock).length;
  const averageOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;
  const totalItemsSold = validOrders.reduce((sum, o) => sum + o.items.reduce((isum, i) => isum + i.quantity, 0), 0);

  // Requirement 10: Sales & Revenue Reports Data Processing
  const categorySalesData = useMemo(() => {
    const map: Record<string, number> = {};
    validOrders.forEach((order) => {
      order.items.forEach(({ product, quantity }) => {
        const cat = product.category || "pantry";
        map[cat] = (map[cat] || 0) + product.price * quantity;
      });
    });

    const result = Object.entries(map).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      revenue: value,
    }));

    // If no sales yet, provide baseline category distribution
    if (result.length === 0) {
      return [
        { name: "Fruits", revenue: 1450 },
        { name: "Vegetables", revenue: 980 },
        { name: "Dairy", revenue: 1120 },
        { name: "Bakery", revenue: 640 },
        { name: "Snacks", revenue: 520 },
      ];
    }
    return result;
  }, [validOrders]);

  const salesTrendData = useMemo(() => {
    // Generate recent 7 day sales trend
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"];
    if (validOrders.length === 0) {
      return [
        { day: "Mon", revenue: 850, orders: 3 },
        { day: "Tue", revenue: 1240, orders: 5 },
        { day: "Wed", revenue: 990, orders: 4 },
        { day: "Thu", revenue: 1490, orders: 6 },
        { day: "Fri", revenue: 2100, orders: 8 },
        { day: "Sat", revenue: 2750, orders: 11 },
        { day: "Today", revenue: totalRevenue > 0 ? totalRevenue : 1800, orders: validOrders.length > 0 ? validOrders.length : 7 },
      ];
    }

    // Dynamic grouping based on order dates
    const map: Record<string, { revenue: number; orders: number }> = {};
    validOrders.forEach((o) => {
      const dateKey = o.date.split(",")[0] || o.date;
      if (!map[dateKey]) map[dateKey] = { revenue: 0, orders: 0 };
      map[dateKey].revenue += o.totalPrice;
      map[dateKey].orders += 1;
    });

    return Object.entries(map).map(([day, val]) => ({
      day,
      revenue: Math.round(val.revenue),
      orders: val.orders,
    }));
  }, [validOrders, totalRevenue]);

  const orderStatusDistribution = useMemo(() => {
    const placed = orderHistory.filter((o) => o.status === "Processing" && o.location?.includes("Placed")).length;
    const packed = orderHistory.filter((o) => o.status === "Processing" && o.location?.includes("Packed")).length;
    const shipped = orderHistory.filter((o) => o.status === "Shipped").length;
    const delivered = orderHistory.filter((o) => o.status === "Delivered").length;
    const cancelled = orderHistory.filter((o) => o.status === "Cancelled").length;

    return [
      { status: "Placed", count: placed || 1 },
      { status: "Packed", count: packed || 1 },
      { status: "Shipped", count: shipped || 2 },
      { status: "Delivered", count: delivered || 4 },
      { status: "Cancelled", count: cancelled || 0 },
    ];
  }, [orderHistory]);

  const topSellingProducts = useMemo(() => {
    const countMap: Record<string, { product: Product; quantity: number; revenue: number }> = {};
    validOrders.forEach((o) => {
      o.items.forEach(({ product, quantity }) => {
        if (!countMap[product.id]) {
          countMap[product.id] = { product, quantity: 0, revenue: 0 };
        }
        countMap[product.id].quantity += quantity;
        countMap[product.id].revenue += product.price * quantity;
      });
    });

    const list = Object.values(countMap).sort((a, b) => b.quantity - a.quantity);
    if (list.length > 0) return list.slice(0, 5);

    // Fallback bestsellers from catalog
    return products.slice(0, 5).map((p, idx) => ({
      product: p,
      quantity: 15 - idx * 2,
      revenue: (15 - idx * 2) * p.price,
    }));
  }, [validOrders, products]);

  // Access Control: Gate for non-admin users
  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-20 max-w-xl text-center animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 text-amber-500">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Admin Access Required
        </h1>
        <p className="text-muted-foreground mb-6 text-sm">
          You are currently viewing with <strong className="text-foreground">People / Customer Access</strong>. Store inventory, live order dispatching, and sales reports are restricted to Administrators.
        </p>

        <div className="p-4 rounded-xl bg-card border border-border shadow-sm mb-6 text-left text-xs space-y-1.5">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-primary" /> Admin Demonstration Credentials:
          </p>
          <p className="text-muted-foreground font-mono">Email: admin@akdevil.com • Password: admin123</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              loginAsDemo("admin");
              toast({
                title: "Logged in as Admin 🛡️",
                description: "Full store administrative privileges enabled.",
              });
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Instant Demo Admin Login
          </button>
          <Link
            to="/signin"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-xs bg-muted hover:bg-muted/80 text-foreground transition-all"
          >
            Sign In with Email
          </Link>
        </div>
      </div>
    );
  }

  // Filter Orders
  const filteredOrders = orderHistory.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.location?.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = productCategoryFilter === "all" || p.category === productCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Add Product Form Handler (Requirement 9)
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newProduct.price);
    const stockNum = parseInt(newProduct.stock) || 20;

    if (isNaN(priceNum) || priceNum <= 0) {
      toast({ title: "Please enter a valid selling price", variant: "destructive" });
      return;
    }

    addProduct({
      name: newProduct.name,
      price: priceNum,
      originalPrice: newProduct.originalPrice ? parseFloat(newProduct.originalPrice) : undefined,
      category: newProduct.category,
      unit: newProduct.unit,
      stock: stockNum,
      inStock: stockNum > 0,
      description: newProduct.description || "Farm fresh and premium grocery item.",
      image: newProduct.image || "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400",
      rating: 4.8,
    });

    setNewProduct({
      name: "",
      price: "",
      originalPrice: "",
      category: "fruits",
      unit: "1 kg",
      stock: "20",
      description: "",
      image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400",
      rating: 4.8,
      inStock: true,
    });
    setIsAddProductOpen(false);
  };

  // Full Edit Product Save Handler (Requirement 9)
  const handleSaveEditedProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct.id, {
      name: editingProduct.name,
      price: editingProduct.price,
      originalPrice: editingProduct.originalPrice,
      category: editingProduct.category,
      unit: editingProduct.unit,
      stock: editingProduct.stock,
      inStock: (editingProduct.stock ?? 0) > 0,
      description: editingProduct.description,
      image: editingProduct.image,
    });
    setEditingProduct(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-extrabold text-foreground">
                AK Devil Store Administration
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Central Operations: Stock Management • Live Dispatches • Sales Reports • Roles
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-muted border border-border text-xs flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-muted-foreground">Admin:</span>
            <strong className="text-foreground">{user.fullName}</strong>
          </div>
          <button
            onClick={signOut}
            className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Requirement 13: Low-Stock Alerts Banner */}
      {lowStockProducts.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                Low-Stock Alert: {lowStockProducts.length} items require immediate inventory replenishment!
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Items with stock ≤ 5 units risk selling out and preventing customer orders.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("products")}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all shrink-0"
          >
            View Low Stock Items →
          </button>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-px mb-8 overflow-x-auto">
        {[
          { id: "overview" as const, label: "Overview & Alerts", icon: TrendingUp },
          { id: "reports" as const, label: "Sales Reports", icon: BarChart3 },
          { id: "orders" as const, label: `Live Orders (${orderHistory.length})`, icon: Package },
          { id: "products" as const, label: `Inventory & Stock (${products.length})`, icon: ShoppingBag },
          { id: "expiry-discounts" as const, label: `Expiry Smart Deals (${nearExpiryProducts.length})`, icon: Hourglass },
          { id: "coupons" as const, label: `Discount Coupons (${coupons.length})`, icon: Tag },
          { id: "users" as const, label: `User Roles (${users.length})`, icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 -mb-px ${
                isActive
                  ? "border-primary text-primary bg-primary/5 font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.id === "products" && lowStockProducts.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 ml-1 inline-block" />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ALERTS */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-fade-in">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-muted-foreground font-medium block">Total Store Revenue</span>
              <p className="font-display text-2xl md:text-3xl font-black text-foreground mt-2">
                ₹{totalRevenue.toFixed(2)}
              </p>
              <span className="text-[11px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Live Gross Sales
              </span>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-muted-foreground font-medium block">Total Orders Placed</span>
              <p className="font-display text-2xl md:text-3xl font-black text-foreground mt-2">
                {orderHistory.length}
              </p>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                {deliveredOrders.length} delivered
              </span>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-muted-foreground font-medium block">Active In-Transit</span>
              <p className="font-display text-2xl md:text-3xl font-black text-primary mt-2">
                {activeOrdersCount}
              </p>
              <span className="text-[11px] text-primary font-semibold mt-1 flex items-center gap-1">
                <Truck className="w-3 h-3 animate-pulse" /> Live Express Riders
              </span>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-muted-foreground font-medium block">Catalog Items</span>
              <p className="font-display text-2xl md:text-3xl font-black text-foreground mt-2">
                {products.length}
              </p>
              <span className="text-[11px] text-amber-500 font-semibold mt-1 block">
                {lowStockProducts.length} low stock warnings
              </span>
            </div>
          </div>

          {/* Requirement 13: Low-Stock Management Center */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-display text-lg font-bold text-foreground">
                  Low-Stock Warning Center (≤ 5 Units)
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600">
                {lowStockProducts.length} Items Need Restocking
              </span>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground bg-muted/20 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                All inventory levels are healthy! No low-stock items detected.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
                        <p className="text-[11px] text-amber-600 font-bold">
                          Stock: {p.stock ?? 0} left
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => restockProduct(p.id, 10)}
                        className="px-2 py-1 text-[10px] font-bold rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => restockProduct(p.id, 25)}
                        className="px-2 py-1 text-[10px] font-bold rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                      >
                        +25
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SALES REPORTS & REVENUE CHARTS (Requirement 10) */}
      {activeTab === "reports" && (
        <div className="space-y-8 animate-fade-in">
          {/* Executive Revenue Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-muted-foreground font-medium">Gross Revenue</span>
              <p className="font-display text-2xl font-black text-foreground mt-1">₹{totalRevenue.toFixed(2)}</p>
              <span className="text-[10px] text-emerald-600 font-bold">All confirmed purchases</span>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-muted-foreground font-medium">Delivered Net Revenue</span>
              <p className="font-display text-2xl font-black text-emerald-600 mt-1">₹{deliveredRevenue.toFixed(2)}</p>
              <span className="text-[10px] text-muted-foreground">{deliveredOrders.length} completed dispatches</span>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-muted-foreground font-medium">Average Order Value (AOV)</span>
              <p className="font-display text-2xl font-black text-primary mt-1">₹{averageOrderValue.toFixed(2)}</p>
              <span className="text-[10px] text-muted-foreground">Per order basket size</span>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-muted-foreground font-medium">Total Grocery Units Sold</span>
              <p className="font-display text-2xl font-black text-foreground mt-1">{totalItemsSold} units</p>
              <span className="text-[10px] text-muted-foreground">Across all categories</span>
            </div>
          </div>

          {/* Visual Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Chart 1: Revenue Trends */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-base font-bold text-foreground">
                  📈 Daily Revenue & Orders Trend
                </h3>
                <span className="text-xs font-semibold text-muted-foreground">Last 7 Days</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrendData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="day" stroke="#888888" fontSize={11} />
                    <YAxis stroke="#888888" fontSize={11} />
                    <Tooltip
                      formatter={(val: number) => [`₹${val}`, "Revenue"]}
                      contentStyle={{ backgroundColor: "#1e293b", borderRadius: "10px", border: "none", color: "#fff" }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Category Revenue Breakdown */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-base font-bold text-foreground">
                  🥧 Category Revenue Share
                </h3>
                <span className="text-xs font-semibold text-muted-foreground">By Category</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categorySalesData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                    <YAxis stroke="#888888" fontSize={11} />
                    <Tooltip
                      formatter={(val: number) => [`₹${val}`, "Sales"]}
                      contentStyle={{ backgroundColor: "#1e293b", borderRadius: "10px", border: "none", color: "#fff" }}
                    />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                      {categorySalesData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Selling Products Table */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-display text-base font-bold text-foreground mb-4">
              🏆 Top-Selling Grocery Products
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Units Sold</th>
                    <th className="py-3 px-4">Total Revenue</th>
                    <th className="py-3 px-4">Inventory Left</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topSellingProducts.map(({ product, quantity, revenue }) => (
                    <tr key={product.id} className="hover:bg-muted/30">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="w-9 h-9 rounded-lg object-cover" />
                        <span className="font-bold text-foreground">{product.name}</span>
                      </td>
                      <td className="py-3 px-4 capitalize text-muted-foreground">{product.category}</td>
                      <td className="py-3 px-4 font-bold text-foreground">{quantity} units</td>
                      <td className="py-3 px-4 font-black text-emerald-600">₹{revenue.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            (product.stock ?? 20) <= 5
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-emerald-500/10 text-emerald-600"
                          }`}
                        >
                          {product.stock ?? 20} in stock
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE ORDERS & DISPATCH */}
      {activeTab === "orders" && (
        <div className="space-y-6 animate-fade-in">
          {/* Order Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by Order ID or location..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {["all", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => setOrderStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize ${
                    orderStatusFilter === status
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-primary/20 transition-all"
              >
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-foreground">{order.id}</span>
                      <span className="text-xs text-muted-foreground">• {order.date}</span>
                    </div>
                    {order.deliverySlot && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Slot: <strong className="text-foreground">{order.deliverySlot}</strong>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Total: </span>
                    <strong className="text-foreground text-sm font-black">₹{order.totalPrice.toFixed(2)}</strong>
                  </div>
                </div>

                {/* 4-Stage Dispatch Buttons (Requirement 5) */}
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-semibold text-foreground">Update Dispatch Milestone:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => updateOrderStatus(order.id, "Processing", "Warehouse - Order Placed & Confirmed")}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-card border border-border hover:bg-muted"
                    >
                      1. Placed
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, "Processing", "Packaging - Items Quality Checked & Packed")}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-card border border-border hover:bg-muted"
                    >
                      2. Packed
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, "Shipped", "Delivery partner Arun Kumar - In Transit")}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-primary text-primary-foreground"
                    >
                      3. Shipped
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, "Delivered", "Delivered to receiver")}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white"
                    >
                      4. Delivered
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: INVENTORY & STOCK MANAGEMENT (Requirement 8 & 9) */}
      {activeTab === "products" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search catalog products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
                />
              </div>
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-muted border border-border text-foreground"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsAddProductOpen(!isAddProductOpen)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs gradient-hero text-primary-foreground shadow-md flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add New Grocery Item
            </button>
          </div>

          {/* Add Product Drawer */}
          {isAddProductOpen && (
            <div className="bg-card border-2 border-primary/20 rounded-2xl p-6 shadow-md space-y-4 animate-fade-in">
              <h3 className="font-display text-base font-bold text-foreground">Add New Grocery Product</h3>
              <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fresh Mangoes"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.emoji} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="149"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    placeholder="25"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground block mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="1 kg or 500g"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground block mb-1">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground"
                  />
                </div>
                <div className="sm:col-span-4 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddProductOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg text-xs font-bold gradient-hero text-primary-foreground"
                  >
                    Save to Catalog
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Edit Product Modal (Requirement 9) */}
          {editingProduct && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border-2 border-primary/30 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Edit Product: {editingProduct.name}
                  </h3>
                  <button onClick={() => setEditingProduct(null)} className="text-xs text-muted-foreground">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveEditedProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Name</label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Stock Count</label>
                    <input
                      type="number"
                      value={editingProduct.stock ?? 20}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Unit Pack</label>
                    <input
                      type="text"
                      value={editingProduct.unit}
                      onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-foreground block mb-1">Image URL</label>
                    <input
                      type="text"
                      value={editingProduct.image}
                      onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
                    />
                  </div>

                  <div className="sm:col-span-2 flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl text-xs font-bold gradient-hero text-primary-foreground shadow-md"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Products Inventory Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Unit</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock Left</th>
                    <th className="py-3 px-4">Restock</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((prod) => {
                    const stock = prod.stock ?? 20;
                    const isLow = stock <= 5;
                    const isOut = stock <= 0;

                    return (
                      <tr key={prod.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img src={prod.image} alt={prod.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                          <span className="font-semibold text-foreground">{prod.name}</span>
                        </td>
                        <td className="py-3 px-4 capitalize">{prod.category}</td>
                        <td className="py-3 px-4 text-muted-foreground">{prod.unit}</td>
                        <td className="py-3 px-4 font-bold text-foreground">₹{prod.price}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isOut
                                ? "bg-destructive/10 text-destructive"
                                : isLow
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-emerald-500/10 text-emerald-600"
                            }`}
                          >
                            {isOut ? "Out of Stock (0)" : isLow ? `⚠️ Low: ${stock}` : `In Stock (${stock})`}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => restockProduct(prod.id, 10)}
                            className="px-2 py-1 text-[10px] font-bold rounded bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            +10 Units
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingProduct(prod)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                              title="Edit Product"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteProduct(prod.id)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: EXPIRY-BASED SMART DISCOUNTS (Requirement 2) */}
      {activeTab === "expiry-discounts" && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Impact Summary */}
          <div className="bg-gradient-to-r from-card via-card to-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Hourglass className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl font-extrabold text-foreground">
                      Expiry-Based Smart Discounts
                    </h2>
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <Leaf className="w-3 h-3" /> Zero Food Waste
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
                    Configure promotional discounts on products nearing their best-before dates. Help customers save money on fresh groceries while eliminating store food wastage and recovering revenue.
                  </p>
                </div>
              </div>

              {/* Bulk Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    const perishables = products.filter(
                      (p) => ["fruits", "vegetables", "dairy", "bakery"].includes(p.category) && !p.isNearExpiry
                    );
                    perishables.slice(0, 4).forEach((p) => {
                      updateExpiryDiscount(p.id, true, 30, 2, "12 Oct 2026");
                    });
                    toast({
                      title: "Smart Deals Activated! ⏳",
                      description: "Applied 30% discount on fresh perishable staples nearing expiry.",
                    });
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Quick Rescue: 30% Off Perishables
                </button>
              </div>
            </div>

            {/* Impact Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-border">
              <div className="bg-card/70 border border-border p-3.5 rounded-2xl">
                <span className="text-[11px] font-semibold text-muted-foreground block">Active Smart Deals</span>
                <span className="font-display text-xl font-black text-foreground mt-0.5 block">
                  {nearExpiryProducts.length} Products
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">Live in store</span>
              </div>

              <div className="bg-card/70 border border-border p-3.5 rounded-2xl">
                <span className="text-[11px] font-semibold text-muted-foreground block">Food Waste Prevented</span>
                <span className="font-display text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {(nearExpiryProducts.length * 8.5).toFixed(1)} kg
                </span>
                <span className="text-[10px] text-muted-foreground">Eco-friendly impact</span>
              </div>

              <div className="bg-card/70 border border-border p-3.5 rounded-2xl">
                <span className="text-[11px] font-semibold text-muted-foreground block">Customer Savings Rate</span>
                <span className="font-display text-xl font-black text-foreground mt-0.5 block">
                  Up to 40% OFF
                </span>
                <span className="text-[10px] text-muted-foreground">Max budget value</span>
              </div>

              <div className="bg-card/70 border border-border p-3.5 rounded-2xl">
                <span className="text-[11px] font-semibold text-muted-foreground block">Recovered Revenue</span>
                <span className="font-display text-xl font-black text-foreground mt-0.5 block">
                  ₹{nearExpiryProducts.reduce((sum, p) => sum + getProductEffectivePrice(p) * Math.min(p.stock ?? 5, 5), 0).toFixed(0)}
                </span>
                <span className="text-[10px] text-muted-foreground">Stock protected</span>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-card border border-border p-4 rounded-2xl flex flex-col sm:flex-row gap-3 justify-between items-center shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search products to discount..."
                value={expirySearch}
                onChange={(e) => setExpirySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-muted border border-border text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setExpiryFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  expiryFilter === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                All Products ({products.length})
              </button>
              <button
                onClick={() => setExpiryFilter("near-expiry")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  expiryFilter === "near-expiry"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20"
                }`}
              >
                ⏳ Active Deals ({nearExpiryProducts.length})
              </button>
              <button
                onClick={() => setExpiryFilter("standard")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  expiryFilter === "standard"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                Standard Pricing ({products.length - nearExpiryProducts.length})
              </button>
            </div>
          </div>

          {/* Expiry Discount Management Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-4">Category & Stock</th>
                    <th className="py-3 px-4">Standard Price</th>
                    <th className="py-3 px-4">Discount %</th>
                    <th className="py-3 px-4">Best Before (Days)</th>
                    <th className="py-3 px-4">Effective Price</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products
                    .filter((p) => {
                      const matchSearch =
                        p.name.toLowerCase().includes(expirySearch.toLowerCase()) ||
                        p.category.toLowerCase().includes(expirySearch.toLowerCase());
                      const isNear = Boolean(p.isNearExpiry && (p.expiryDiscountPercent ?? 0) > 0);
                      const matchFilter =
                        expiryFilter === "all" ||
                        (expiryFilter === "near-expiry" && isNear) ||
                        (expiryFilter === "standard" && !isNear);
                      return matchSearch && matchFilter;
                    })
                    .map((product) => {
                      const isNear = Boolean(product.isNearExpiry && (product.expiryDiscountPercent ?? 0) > 0);
                      const effectivePrice = getProductEffectivePrice(product);
                      const editState = editingExpiryDiscount[product.id] || {
                        percent: product.expiryDiscountPercent || 30,
                        days: product.daysUntilExpiry || 2,
                        date: product.expiryDate || "12 Oct 2026",
                      };

                      return (
                        <tr
                          key={product.id}
                          className={`hover:bg-muted/30 transition-colors ${
                            isNear ? "bg-emerald-500/5" : ""
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-10 h-10 rounded-xl object-cover bg-muted shrink-0"
                              />
                              <div>
                                <p className="font-bold text-foreground text-sm">{product.name}</p>
                                <p className="text-[11px] text-muted-foreground">{product.unit}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="capitalize text-muted-foreground block">{product.category}</span>
                            <span
                              className={`text-[10px] font-bold ${
                                (product.stock ?? 20) <= 5 ? "text-amber-600" : "text-emerald-600"
                              }`}
                            >
                              {product.stock ?? 20} in stock
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                            ₹{product.price}
                          </td>

                          <td className="py-3.5 px-4">
                            <select
                              value={editState.percent}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setEditingExpiryDiscount((prev) => ({
                                  ...prev,
                                  [product.id]: { ...editState, percent: val },
                                }));
                              }}
                              className="px-2.5 py-1 text-xs rounded-lg bg-muted border border-border text-foreground font-semibold"
                            >
                              <option value="15">15% OFF</option>
                              <option value="20">20% OFF</option>
                              <option value="25">25% OFF</option>
                              <option value="30">30% OFF</option>
                              <option value="40">40% OFF</option>
                              <option value="50">50% OFF</option>
                            </select>
                          </td>

                          <td className="py-3.5 px-4">
                            <select
                              value={editState.days}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setEditingExpiryDiscount((prev) => ({
                                  ...prev,
                                  [product.id]: { ...editState, days: val },
                                }));
                              }}
                              className="px-2.5 py-1 text-xs rounded-lg bg-muted border border-border text-foreground font-semibold"
                            >
                              <option value="1">1 Day Left</option>
                              <option value="2">2 Days Left</option>
                              <option value="3">3 Days Left</option>
                              <option value="5">5 Days Left</option>
                            </select>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                                ₹{isNear ? effectivePrice : Math.round(product.price * (1 - editState.percent / 100))}
                              </span>
                              {isNear && (
                                <span className="text-[10px] text-muted-foreground line-through">
                                  ₹{product.price}
                                </span>
                              )}
                            </div>
                            {isNear && (
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.2 rounded inline-block mt-0.5">
                                Active ({product.expiryDiscountPercent}% off)
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {isNear ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    updateExpiryDiscount(
                                      product.id,
                                      true,
                                      editState.percent,
                                      editState.days,
                                      editState.date
                                    );
                                  }}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:opacity-90"
                                  title="Update discount"
                                >
                                  Update
                                </button>
                                <button
                                  onClick={() => updateExpiryDiscount(product.id, false)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-destructive/10 text-destructive hover:bg-destructive/20"
                                  title="Remove expiry discount"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  updateExpiryDiscount(
                                    product.id,
                                    true,
                                    editState.percent,
                                    editState.days,
                                    editState.date
                                  );
                                }}
                                className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                              >
                                + Offer {editState.percent}% Deal
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COUPONS MANAGER (Requirement 7) */}
      {activeTab === "coupons" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
            <h3 className="font-display text-lg font-bold text-foreground mb-1">
              Active Store Discount Coupons
            </h3>
            <p className="text-xs text-muted-foreground">
              Coupons available for customer carts and checkout discount codes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {coupons.map((c) => (
              <div key={c.code} className="p-4 rounded-2xl bg-card border-2 border-primary/20 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-primary text-sm bg-primary/10 px-2 py-0.5 rounded">
                    {c.code}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <p className="text-xs text-foreground font-semibold">{c.description}</p>
                <div className="text-[11px] text-muted-foreground pt-2 border-t border-border">
                  <span>Min Order: <strong>₹{c.minOrderValue}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: USERS ROLES */}
      {activeTab === "users" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
            <h3 className="font-display text-lg font-bold text-foreground mb-1">Store User Permissions</h3>
            <p className="text-xs text-muted-foreground">
              Manage accounts between Customer and Administrator roles.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4">Current Role</th>
                    <th className="py-3 px-4 text-right">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-foreground">
                          {u.fullName} {u.id === user.id && <span className="text-primary">(You)</span>}
                        </p>
                        <p className="text-muted-foreground text-[10px]">{u.email}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-muted-foreground">{u.phone}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">{u.createdAt || "Active"}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.role === "admin"
                              ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {u.role === "admin" ? "🛡️ Store Admin" : "🛍️ Customer"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <select
                          value={u.role}
                          onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                          className="px-2.5 py-1 text-xs rounded-lg bg-muted border border-border text-foreground font-semibold"
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Customer Live Tracking Modal from Admin */}
      {selectedOrderForTracking && (
        <TrackingModal
          order={selectedOrderForTracking}
          isOpen={true}
          onClose={() => setSelectedOrderForTracking(null)}
          onUpdateStatus={(status, loc) => {
            updateOrderStatus(selectedOrderForTracking.id, status, loc);
            setSelectedOrderForTracking({ ...selectedOrderForTracking, status, location: loc });
          }}
        />
      )}
    </div>
  );
};

export default Admin;
