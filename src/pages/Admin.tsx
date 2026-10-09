import { useState } from "react";
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
  Filter,
} from "lucide-react";
import { categories, type Product } from "@/data/products";
import TrackingModal from "@/components/TrackingModal";
import { useToast } from "@/hooks/use-toast";
import type { OrderHistoryItem, UserRole } from "@/context/CartContext";

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
    updateUserRole,
    loginAsDemo,
    signOut,
  } = useCart();

  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "products" | "users">("overview");
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<OrderHistoryItem | null>(null);

  // Orders Tab filters
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [customLocations, setCustomLocations] = useState<Record<string, string>>({});

  // Products Tab filters & state
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");

  // New product form
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "fruits",
    unit: "1 kg",
    description: "",
    image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400",
    rating: 4.8,
    inStock: true,
  });

  // Calculate Metrics
  const totalRevenue = orderHistory
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const activeOrdersCount = orderHistory.filter(
    (o) => o.status === "Processing" || o.status === "Shipped"
  ).length;

  const deliveredOrdersCount = orderHistory.filter((o) => o.status === "Delivered").length;
  const outOfStockCount = products.filter((p) => !p.inStock).length;

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
          You are currently viewing with <strong className="text-foreground">People / Customer Access</strong>. Store inventory, live order dispatching, and analytics are restricted to Administrators.
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
            className="w-full sm:w-auto px-6 py-3 rounded-full font-bold text-xs gradient-hero text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md"
          >
            <ShieldCheck className="w-4 h-4" /> 1-Click Login as Admin
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 rounded-full font-semibold text-xs bg-muted text-foreground hover:bg-muted/80 transition-colors"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  // Filtered Orders
  const filteredOrders = orderHistory.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.location?.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Products
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = productCategoryFilter === "all" || prod.category === productCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      toast({ title: "Name and Price required", variant: "destructive" });
      return;
    }

    addProduct({
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      originalPrice: newProduct.originalPrice ? parseFloat(newProduct.originalPrice) : undefined,
      category: newProduct.category,
      unit: newProduct.unit,
      description: newProduct.description || "Fresh product from AK Devil store",
      image: newProduct.image || "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400",
      rating: 4.8,
      inStock: newProduct.inStock,
    });

    setIsAddProductOpen(false);
    setNewProduct({
      name: "",
      price: "",
      originalPrice: "",
      category: "fruits",
      unit: "1 kg",
      description: "",
      image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400",
      rating: 4.8,
      inStock: true,
    });
  };

  const handleSavePrice = (prodId: string) => {
    const priceNum = parseFloat(editPrice);
    if (!isNaN(priceNum) && priceNum > 0) {
      updateProduct(prodId, { price: priceNum });
      setEditingProductId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Top Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl md:text-3xl font-black text-foreground">
                AK DEVIL Admin Portal
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Logged in as <strong className="text-foreground">{user.fullName}</strong> ({user.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              loginAsDemo("customer");
              toast({
                title: "Switched to Customer Access 🛍️",
                description: "Now browsing as a standard shopper.",
              });
              navigate("/");
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" /> View as Customer
          </button>
          <Link
            to="/products"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-card border border-border hover:bg-muted text-foreground transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Live Store
          </Link>
          <button
            onClick={() => {
              signOut();
              navigate("/signin");
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-px mb-8 overflow-x-auto">
        {[
          { id: "overview" as const, label: "Overview & Analytics", icon: TrendingUp },
          { id: "orders" as const, label: `Live Orders (${orderHistory.length})`, icon: Package },
          { id: "products" as const, label: `Inventory (${products.length})`, icon: ShoppingBag },
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
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-fade-in">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-muted-foreground font-medium block">Total Store Revenue</span>
              <p className="font-display text-2xl md:text-3xl font-black text-foreground mt-2">
                ₹{totalRevenue.toFixed(2)}
              </p>
              <span className="text-[11px] text-emerald-500 font-semibold mt-1 block flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Live Gross Sales
              </span>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-muted-foreground font-medium block">Total Orders Placed</span>
              <p className="font-display text-2xl md:text-3xl font-black text-foreground mt-2">
                {orderHistory.length}
              </p>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                {deliveredOrdersCount} completed
              </span>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-muted-foreground font-medium block">Active Deliveries</span>
              <p className="font-display text-2xl md:text-3xl font-black text-primary mt-2">
                {activeOrdersCount}
              </p>
              <span className="text-[11px] text-primary font-semibold mt-1 block flex items-center gap-1">
                <Truck className="w-3 h-3 animate-pulse" /> Real-time in Transit
              </span>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-muted-foreground font-medium block">Catalog Items</span>
              <p className="font-display text-2xl md:text-3xl font-black text-foreground mt-2">
                {products.length}
              </p>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                {outOfStockCount} out of stock
              </span>
            </div>
          </div>

          {/* Quick Shortcuts & Recent Activity */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-foreground">Recent Store Orders</h3>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              {orderHistory.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No orders have been placed yet. Place an order in the store to see it here!
                </div>
              ) : (
                <div className="space-y-3">
                  {orderHistory.slice(0, 4).map((order) => (
                    <div
                      key={order.id}
                      className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{order.id}</span>
                          <span className="text-muted-foreground">• {order.date}</span>
                        </div>
                        <p className="text-muted-foreground mt-0.5">
                          {order.items.length} item(s) • Total: <strong className="text-foreground">₹{order.totalPrice.toFixed(2)}</strong>
                        </p>
                        <p className="text-[11px] text-primary mt-0.5">
                          {order.paymentMethod || "Online UPI"} • {order.location || "Warehouse"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
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
                        <button
                          onClick={() => setSelectedOrderForTracking(order)}
                          className="p-1.5 rounded-lg bg-card border border-border hover:bg-muted text-foreground"
                          title="View Live Tracking"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-display text-lg font-bold text-foreground">Admin Quick Actions</h3>
              <button
                onClick={() => {
                  setActiveTab("products");
                  setIsAddProductOpen(true);
                }}
                className="w-full p-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center gap-2 transition-colors text-left"
              >
                <Plus className="w-4 h-4" /> Add New Grocery Product
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className="w-full p-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs flex items-center gap-2 transition-colors text-left"
              >
                <Truck className="w-4 h-4 text-primary" /> Dispatch Live Deliveries
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className="w-full p-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs flex items-center gap-2 transition-colors text-left"
              >
                <Users className="w-4 h-4 text-primary" /> Manage Customer Roles
              </button>
              <div className="pt-2 border-t border-border text-[11px] text-muted-foreground">
                <p>💡 Tip: Changing an order's status to <strong>"Out for delivery"</strong> or <strong>"Delivered"</strong> immediately syncs with the customer's live GPS screen.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE ORDERS & DISPATCH CONTROL */}
      {activeTab === "orders" && (
        <div className="space-y-6 animate-fade-in">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by Order ID or location..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs text-muted-foreground font-medium shrink-0">Filter Status:</span>
              {["all", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => setOrderStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                    orderStatusFilter === status
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-semibold text-foreground">No orders matching the filter</p>
              <p className="text-xs mt-1">Try changing your search term or status filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const customLoc = customLocations[order.id] ?? (order.location || "");

                return (
                  <div
                    key={order.id}
                    className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-primary/30 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-base text-foreground">{order.id}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              order.status === "Delivered"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : order.status === "Shipped"
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : order.status === "Cancelled"
                                ? "bg-destructive/10 text-destructive border border-destructive/20"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {order.status}
                          </span>
                          <span className="text-xs text-muted-foreground">• {order.date}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>
                            Payment:{" "}
                            <strong className="text-foreground">
                              {order.paymentMethod || "Online UPI"}
                            </strong>
                          </span>
                          <span>•</span>
                          <span>
                            Status:{" "}
                            <strong className={order.paymentStatus === "Paid" ? "text-emerald-500" : "text-amber-500"}>
                              {order.paymentStatus || "Paid"}
                            </strong>
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">Total Bill</span>
                        <p className="font-display text-xl font-black text-foreground leading-none mt-0.5">
                          ₹{order.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Items preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 py-1">
                      {order.items.map(({ product, quantity }) => (
                        <div key={product.id} className="flex items-center gap-2 text-xs bg-muted/40 p-2 rounded-lg">
                          <img src={product.image} alt={product.name} className="w-8 h-8 rounded object-cover" />
                          <div className="min-w-0 flex-1 truncate">
                            <p className="font-medium text-foreground truncate">{product.name}</p>
                            <p className="text-muted-foreground text-[10px]">
                              Qty: {quantity} • ₹{(product.price * quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Admin Status & Location Controller */}
                    <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-foreground">Update Dispatch Status:</span>
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "Processing", "Warehouse - Order confirmed")
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              order.status === "Processing"
                                ? "bg-amber-500 text-white shadow-sm"
                                : "bg-card border border-border hover:bg-muted text-foreground"
                            }`}
                          >
                            1. Processing
                          </button>
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "Shipped", "Pickup hub - In transit")
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              order.status === "Shipped" && order.location?.includes("Pickup hub")
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-card border border-border hover:bg-muted text-foreground"
                            }`}
                          >
                            2. In Transit
                          </button>
                          <button
                            onClick={() =>
                              updateOrderStatus(
                                order.id,
                                "Shipped",
                                "Delivery partner - Out for delivery"
                              )
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              order.status === "Shipped" && order.location?.includes("Delivery partner")
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-card border border-border hover:bg-muted text-foreground"
                            }`}
                          >
                            3. Out for Delivery
                          </button>
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "Delivered", "Delivered to receiver")
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              order.status === "Delivered"
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "bg-card border border-border hover:bg-muted text-foreground"
                            }`}
                          >
                            4. Delivered
                          </button>
                          {order.status !== "Cancelled" && (
                            <button
                              onClick={() => updateOrderStatus(order.id, "Cancelled", "Cancelled by Admin")}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-card border border-border hover:bg-destructive/10 text-destructive transition-all"
                            >
                              Cancel
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => setSelectedOrderForTracking(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold gradient-hero text-primary-foreground hover:opacity-90 shrink-0 shadow-sm"
                        >
                          <Navigation className="w-3.5 h-3.5" /> Customer View
                        </button>
                      </div>

                      {/* Custom GPS Location Text */}
                      <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                        <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                          Custom Location Note:
                        </span>
                        <input
                          type="text"
                          value={customLoc}
                          onChange={(e) =>
                            setCustomLocations({ ...customLocations, [order.id]: e.target.value })
                          }
                          placeholder="e.g. Rider arriving in 3 mins at door..."
                          className="flex-1 px-3 py-1 text-xs rounded-lg bg-card border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                        />
                        <button
                          onClick={() => {
                            updateOrderStatus(order.id, order.status, customLoc);
                            toast({ title: "Location updated for customer live tracking!" });
                          }}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:opacity-90"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INVENTORY & PRODUCT MANAGEMENT */}
      {activeTab === "products" && (
        <div className="space-y-6 animate-fade-in">
          {/* Product Header & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-muted border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs gradient-hero text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" /> Add New Product
            </button>
          </div>

          {/* Add Product Modal / Drawer */}
          {isAddProductOpen && (
            <div className="bg-card border-2 border-primary/20 rounded-2xl p-6 shadow-elevated space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="font-display text-lg font-bold text-foreground">
                  Add New Grocery Item to Catalog
                </h3>
                <button
                  onClick={() => setIsAddProductOpen(false)}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Fresh Alphonso Mangoes"
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
                  <label className="text-xs font-semibold text-foreground block mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="199"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Unit Weight/Pack</label>
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

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground block mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Farm fresh and premium quality..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground"
                  />
                </div>

                <div className="sm:col-span-4 flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddProductOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg text-xs font-bold gradient-hero text-primary-foreground hover:opacity-90"
                  >
                    Save & Publish to Store
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Unit</th>
                    <th className="py-3 px-4">Price (₹)</th>
                    <th className="py-3 px-4">Stock Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((prod) => {
                    const isEditing = editingProductId === prod.id;

                    return (
                      <tr key={prod.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-foreground">{prod.name}</p>
                            <p className="text-[10px] text-muted-foreground line-clamp-1">{prod.description}</p>
                          </div>
                        </td>

                        <td className="py-3 px-4 capitalize font-medium text-foreground">
                          {prod.category}
                        </td>

                        <td className="py-3 px-4 text-muted-foreground">{prod.unit}</td>

                        <td className="py-3 px-4 font-bold text-foreground">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                className="w-20 px-2 py-1 text-xs rounded bg-muted border border-border text-foreground"
                              />
                              <button
                                onClick={() => handleSavePrice(prod.id)}
                                className="p-1 rounded bg-primary text-primary-foreground"
                                title="Save"
                              >
                                <Save className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>₹{prod.price.toFixed(2)}</span>
                              <button
                                onClick={() => {
                                  setEditingProductId(prod.id);
                                  setEditPrice(prod.price.toString());
                                }}
                                className="opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity"
                                title="Edit Price"
                              >
                                <Edit className="w-3 h-3 text-muted-foreground" />
                              </button>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => updateProduct(prod.id, { inStock: !prod.inStock })}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              prod.inStock
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {prod.inStock ? "● In Stock" : "✕ Out of Stock"}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => deleteProduct(prod.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* TAB 4: USERS & ACCESS ROLE MANAGEMENT */}
      {activeTab === "users" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
            <h3 className="font-display text-lg font-bold text-foreground mb-1">
              Store User Access Control
            </h3>
            <p className="text-xs text-muted-foreground">
              Manage permissions between <strong>People Access (Customer)</strong> and <strong>Admin Access (Store Management)</strong>.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Contact Phone</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4">Current Access Level</th>
                    <th className="py-3 px-4 text-right">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-foreground flex items-center gap-1.5">
                          {u.fullName}
                          {u.id === user.id && (
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                              (You)
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono">{u.email}</p>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-muted-foreground">{u.phone}</td>

                      <td className="py-3.5 px-4 text-muted-foreground">{u.createdAt || "Active"}</td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.role === "admin"
                              ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                              : "bg-primary/10 text-primary border border-primary/20"
                          }`}
                        >
                          {u.role === "admin" ? "🛡️ Store Admin" : "🛍️ People / Customer"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <select
                          value={u.role}
                          onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                          className="px-2.5 py-1 text-xs rounded-lg bg-muted border border-border text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="customer">Customer (People Access)</option>
                          <option value="admin">Admin (Store Access)</option>
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

      {/* Inspect Customer Live Tracking Modal from Admin */}
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
