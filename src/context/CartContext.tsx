import React, { createContext, useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Product, products as initialProducts } from "@/data/products";
import { Coupon, initialCoupons } from "@/data/coupons";
import { ProductReview, initialReviews } from "@/data/reviews";
import { WeeklyPlanItem, INITIAL_WEEKLY_TEMPLATES, WeeklyPlanTemplate } from "@/data/weeklyPlanner";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TrackingStage {
  location: string;
  status: "Processing" | "Shipped" | "Delivered";
  title: string;
  description: string;
  eta: string;
  progressPercent: number;
}

export const TRACKING_STAGES: TrackingStage[] = [
  {
    location: "Warehouse - Order Placed & Confirmed",
    status: "Processing",
    title: "1. Placed",
    description: "AK Devil Grocery confirmed your order. Payment verified and items locked.",
    eta: "Estimated 25-30 mins",
    progressPercent: 25,
  },
  {
    location: "Packaging Station - Items Quality Checked & Packed",
    status: "Processing",
    title: "2. Packed",
    description: "Fresh farm items picked, hygienically checked, and packed in eco-friendly bag.",
    eta: "Estimated 20-25 mins",
    progressPercent: 50,
  },
  {
    location: "Delivery partner Arun Kumar - In Transit",
    status: "Shipped",
    title: "3. Shipped",
    description: "Handed over to delivery rider. Heading towards your doorstep with express delivery.",
    eta: "Estimated 8-12 mins",
    progressPercent: 75,
  },
  {
    location: "Delivered to receiver",
    status: "Delivered",
    title: "4. Delivered",
    description: "Order safely handed over at your doorstep. Enjoy your fresh groceries!",
    eta: "Delivered",
    progressPercent: 100,
  },
];

export interface OrderHistoryItem {
  id: string;
  items: CartItem[];
  totalPrice: number;
  date: string;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  location?: string;
  trackingUrl?: string;
  isCancelled?: boolean;
  paymentMethod?: "Online UPI" | "Direct Pay (COD)";
  paymentStatus?: "Paid" | "Pending";
  paymentUpiRef?: string;
  deliverySlot?: string;
  couponCode?: string;
  discountAmount?: number;
}

export type UserRole = "customer" | "admin";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt?: string;
}

interface StoredUserAccount {
  password: string;
  user: User;
}

const DEFAULT_ACCOUNTS: StoredUserAccount[] = [
  {
    password: "admin123",
    user: {
      id: "USR-ADMIN-1",
      fullName: "AK Devil Admin",
      email: "admin@akdevil.com",
      phone: "+91 93457 45016",
      role: "admin",
      createdAt: "10 Feb 2026",
    },
  },
  {
    password: "customer123",
    user: {
      id: "USR-CUST-1",
      fullName: "Arikaran K. (Customer)",
      email: "customer@gmail.com",
      phone: "+91 98765 43210",
      role: "customer",
      createdAt: "12 Feb 2026",
    },
  },
];

export interface CartContextType {
  // 1. Cart Items & Persistence
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  buyNow: (product: Product) => void;
  totalItems: number;
  totalPrice: number;

  // 2. Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;

  // 3. Orders & Tracking
  orderHistory: OrderHistoryItem[];
  addOrder: (
    items: CartItem[],
    totalPrice: number,
    paymentDetails?: { method?: "Online UPI" | "Direct Pay (COD)"; status?: "Paid" | "Pending"; upiRef?: string },
    orderDetails?: { deliverySlot?: string; couponCode?: string; discountAmount?: number }
  ) => string;
  updateOrderStatus: (orderId: string, status: "Processing" | "Shipped" | "Delivered" | "Cancelled", location?: string) => void;
  cancelOrder: (orderId: string) => void;
  reorder: (orderId: string) => void;

  // 4. Coupons
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string, currentTotal?: number) => { success: boolean; message: string; discount: number };
  removeCoupon: () => void;
  calculateDiscount: (cartTotal: number, couponToUse?: Coupon | null) => number;

  // 5. Products & Stock Management
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  restockProduct: (productId: string, amount: number) => void;
  lowStockProducts: Product[];

  // 6. Expiry-Based Smart Discounts (NEW: Requirement 2)
  getProductEffectivePrice: (product: Product) => number;
  nearExpiryProducts: Product[];
  updateExpiryDiscount: (productId: string, isNearExpiry: boolean, discountPercent?: number, daysUntilExpiry?: number, expiryDate?: string) => void;

  // 7. Smart Budget Shopping (NEW: Requirement 1)
  budget: number | null;
  setBudget: (amount: number | null) => void;
  getCheaperAlternatives: (cartItem: CartItem) => Product[];
  swapCartItemWithAlternative: (oldProductId: string, alternativeProduct: Product) => void;
  autoFillBudgetBasket: (budgetAmount: number) => void;

  // 8. Weekly Grocery Planner (NEW: Requirement 3)
  weeklyPlan: WeeklyPlanItem[];
  addToWeeklyPlan: (productId: string, quantity?: number, day?: WeeklyPlanItem["day"]) => void;
  removeFromWeeklyPlan: (planItemId: string) => void;
  updateWeeklyPlanItem: (planItemId: string, updates: Partial<WeeklyPlanItem>) => void;
  loadWeeklyPlanTemplate: (templateId: string) => void;
  clearWeeklyPlan: () => void;
  addWeeklyPlanToCart: () => void;
  saveCartAsWeeklyPlan: () => void;

  // 9. Product Reviews
  reviews: ProductReview[];
  addReview: (review: Omit<ProductReview, "id" | "date">) => void;
  getProductReviews: (productId: string) => ProductReview[];

  // 10. Users & Auth
  user: User | null;
  users: User[];
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (fullName: string, email: string, phone: string, password: string, role?: UserRole) => Promise<boolean>;
  signOut: () => void;
  loginAsDemo: (role: UserRole) => User;
  updateUserRole: (userId: string, role: UserRole) => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();

  // Helper: Get product effective price (accounting for near-expiry discounts)
  const getProductEffectivePrice = useCallback((product: Product): number => {
    if (product.isNearExpiry && (product.expiryDiscountPercent ?? 0) > 0) {
      const discount = (product.price * (product.expiryDiscountPercent ?? 0)) / 100;
      return Math.round(product.price - discount);
    }
    return product.price;
  }, []);

  // 1. Persistent Cart (Requirement 3: Keep cart items after refreshing)
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("akdevil_cart");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed to parse cart items:", e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("akdevil_cart", JSON.stringify(items));
  }, [items]);

  // 2. Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem("akdevil_wishlist");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed to parse wishlist:", e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("akdevil_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // 3. Orders History
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>(() => {
    const saved = localStorage.getItem("akdevil_orders") || localStorage.getItem("freshcart_orders");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed to parse order history:", e);
      }
    }
    return [];
  });

  // 4. User Session
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("akdevil_user") || localStorage.getItem("freshcart_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse user:", e);
      }
    }
    return null;
  });

  // 5. Products Catalog with stock & expiry discounts defaults
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("akdevil_products");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: Product) => ({
            ...p,
            stock: typeof p.stock === "number" ? p.stock : p.inStock ? 20 : 0,
          }));
        }
      } catch (e) {
        console.error("Failed to parse products:", e);
      }
    }
    return initialProducts.map((p) => ({
      ...p,
      stock: typeof p.stock === "number" ? p.stock : p.inStock ? 20 : 0,
    }));
  });

  // 6. User Accounts Database
  const [accountsDb, setAccountsDb] = useState<StoredUserAccount[]>(() => {
    const saved = localStorage.getItem("akdevil_users_db");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse users db:", e);
      }
    }
    return DEFAULT_ACCOUNTS;
  });

  // 7. Coupons Database
  const [coupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem("akdevil_coupons");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse coupons:", e);
      }
    }
    return initialCoupons;
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    const saved = localStorage.getItem("akdevil_applied_coupon");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse applied coupon:", e);
      }
    }
    return null;
  });

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem("akdevil_applied_coupon", JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem("akdevil_applied_coupon");
    }
  }, [appliedCoupon]);

  // 8. Reviews Database
  const [reviews, setReviews] = useState<ProductReview[]>(() => {
    const saved = localStorage.getItem("akdevil_product_reviews");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse reviews:", e);
      }
    }
    return initialReviews;
  });

  useEffect(() => {
    localStorage.setItem("akdevil_product_reviews", JSON.stringify(reviews));
  }, [reviews]);

  // ================= NEW: FEATURE 1 - SMART BUDGET SHOPPING =================
  const [budget, setBudgetState] = useState<number | null>(() => {
    const saved = localStorage.getItem("akdevil_user_budget");
    if (saved) {
      try {
        const parsed = parseFloat(saved);
        return isNaN(parsed) ? 500 : parsed;
      } catch {
        return 500;
      }
    }
    return 500; // default ₹500 budget as specified in requirement
  });

  const setBudget = useCallback((amount: number | null) => {
    setBudgetState(amount);
    if (amount !== null) {
      localStorage.setItem("akdevil_user_budget", amount.toString());
      toast({
        title: `Shopping Budget Set to ₹${amount} 🎯`,
        description: "We'll track your cart total and recommend cheaper alternatives if you exceed it.",
      });
    } else {
      localStorage.removeItem("akdevil_user_budget");
      toast({ title: "Budget Limit Cleared" });
    }
  }, [toast]);

  // Suggest cheaper alternatives for an item in the cart
  const getCheaperAlternatives = useCallback(
    (cartItem: CartItem): Product[] => {
      const currentPrice = getProductEffectivePrice(cartItem.product);
      // Look for same category items that cost less and are in stock
      const alternatives = products
        .filter(
          (p) =>
            p.id !== cartItem.product.id &&
            p.category === cartItem.product.category &&
            getProductEffectivePrice(p) < currentPrice &&
            (p.stock ?? 20) > 0 &&
            p.inStock
        )
        .sort((a, b) => getProductEffectivePrice(a) - getProductEffectivePrice(b));

      if (alternatives.length > 0) return alternatives.slice(0, 3);

      // Fallback: affordable everyday staples across pantry/veggies
      return products
        .filter(
          (p) =>
            p.id !== cartItem.product.id &&
            getProductEffectivePrice(p) <= 60 &&
            (p.stock ?? 20) > 0 &&
            p.inStock
        )
        .sort((a, b) => getProductEffectivePrice(a) - getProductEffectivePrice(b))
        .slice(0, 3);
    },
    [products, getProductEffectivePrice]
  );

  // 1-Click swap item in cart with a cheaper alternative
  const swapCartItemWithAlternative = useCallback(
    (oldProductId: string, alternativeProduct: Product) => {
      const oldItem = items.find((i) => i.product.id === oldProductId);
      if (!oldItem) return;

      const oldCost = getProductEffectivePrice(oldItem.product) * oldItem.quantity;
      const newCost = getProductEffectivePrice(alternativeProduct) * oldItem.quantity;
      const savedAmount = oldCost - newCost;

      setItems((prev) =>
        prev.map((i) =>
          i.product.id === oldProductId
            ? { product: alternativeProduct, quantity: i.quantity }
            : i
        )
      );

      toast({
        title: "Item Swapped! 💰",
        description: `Replaced "${oldItem.product.name}" with "${alternativeProduct.name}". Saved ₹${savedAmount.toFixed(2)} to stay within budget!`,
      });
    },
    [items, getProductEffectivePrice, toast]
  );

  // 1-Click build an optimal basket within budget
  const autoFillBudgetBasket = useCallback(
    (budgetAmount: number) => {
      // Pick affordable essentials that sum up near the budget limit
      const candidates = [
        products.find((p) => p.id === "1"), // Bananas ~49
        products.find((p) => p.id === "17"), // Potatoes ~38
        products.find((p) => p.id === "18"), // Onions ~45
        products.find((p) => p.id === "25"), // Milk ~72 (or near expiry discounted)
        products.find((p) => p.id === "34"), // Bread ~55
        products.find((p) => p.id === "15"), // Tomatoes ~79
        products.find((p) => p.id === "26"), // Eggs ~119
      ].filter(Boolean) as Product[];

      let accumulated = 0;
      const chosenItems: CartItem[] = [];

      for (const prod of candidates) {
        const cost = getProductEffectivePrice(prod);
        if (accumulated + cost <= budgetAmount && (prod.stock ?? 20) > 0) {
          chosenItems.push({ product: prod, quantity: 1 });
          accumulated += cost;
        }
      }

      setItems(chosenItems);
      toast({
        title: `Smart Budget Basket Created! 🧺`,
        description: `Added ${chosenItems.length} essentials for ₹${accumulated.toFixed(2)} (within your ₹${budgetAmount} budget).`,
      });
    },
    [products, getProductEffectivePrice, toast]
  );

  // ================= NEW: FEATURE 2 - EXPIRY-BASED SMART DISCOUNTS =================
  const updateExpiryDiscount = useCallback(
    (
      productId: string,
      isNearExpiry: boolean,
      discountPercent: number = 30,
      daysUntilExpiry: number = 2,
      expiryDate: string = "12 Oct 2026"
    ) => {
      setProducts((prev) => {
        const updated = prev.map((p) => {
          if (p.id === productId) {
            return {
              ...p,
              isNearExpiry,
              expiryDiscountPercent: isNearExpiry ? discountPercent : undefined,
              daysUntilExpiry: isNearExpiry ? daysUntilExpiry : undefined,
              expiryDate: isNearExpiry ? expiryDate : undefined,
            };
          }
          return p;
        });
        localStorage.setItem("akdevil_products", JSON.stringify(updated));
        return updated;
      });

      toast({
        title: isNearExpiry ? "Expiry Smart Deal Activated! ⏳" : "Expiry Deal Removed",
        description: isNearExpiry
          ? `${discountPercent}% discount applied to reduce food waste!`
          : "Product returned to standard price.",
      });
    },
    [toast]
  );

  const nearExpiryProducts = products.filter((p) => p.isNearExpiry && (p.expiryDiscountPercent ?? 0) > 0);

  // ================= NEW: FEATURE 3 - WEEKLY GROCERY PLANNER =================
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlanItem[]>(() => {
    const saved = localStorage.getItem("akdevil_weekly_planner");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed to parse weekly planner:", e);
      }
    }
    // Default initial weekly plan
    return INITIAL_WEEKLY_TEMPLATES[0].items.map((item, idx) => ({
      id: `WPI-${Date.now()}-${idx}`,
      productId: item.productId,
      quantity: item.quantity,
      day: item.day,
    }));
  });

  useEffect(() => {
    localStorage.setItem("akdevil_weekly_planner", JSON.stringify(weeklyPlan));
  }, [weeklyPlan]);

  const addToWeeklyPlan = useCallback(
    (productId: string, quantity: number = 1, day: WeeklyPlanItem["day"] = "All Week") => {
      setWeeklyPlan((prev) => {
        const existing = prev.find((i) => i.productId === productId);
        if (existing) {
          return prev.map((i) =>
            i.productId === productId ? { ...i, quantity: i.quantity + quantity, day } : i
          );
        }
        return [
          ...prev,
          {
            id: `WPI-${Date.now()}`,
            productId,
            quantity,
            day,
          },
        ];
      });

      const prod = products.find((p) => p.id === productId);
      toast({
        title: "Added to Weekly Planner 📅",
        description: `"${prod?.name || "Item"}" scheduled for your recurring weekly groceries.`,
      });
    },
    [products, toast]
  );

  const removeFromWeeklyPlan = useCallback((planItemId: string) => {
    setWeeklyPlan((prev) => prev.filter((i) => i.id !== planItemId));
  }, []);

  const updateWeeklyPlanItem = useCallback(
    (planItemId: string, updates: Partial<WeeklyPlanItem>) => {
      setWeeklyPlan((prev) =>
        prev.map((i) => (i.id === planItemId ? { ...i, ...updates } : i))
      );
    },
    []
  );

  const loadWeeklyPlanTemplate = useCallback(
    (templateId: string) => {
      const template = INITIAL_WEEKLY_TEMPLATES.find((t) => t.id === templateId);
      if (!template) return;

      const newItems: WeeklyPlanItem[] = template.items.map((item, idx) => ({
        id: `WPI-${Date.now()}-${idx}`,
        productId: item.productId,
        quantity: item.quantity,
        day: item.day,
      }));

      setWeeklyPlan(newItems);
      toast({
        title: `Loaded: ${template.name}`,
        description: `Loaded ${newItems.length} planned items into your weekly routine!`,
      });
    },
    [toast]
  );

  const clearWeeklyPlan = useCallback(() => {
    setWeeklyPlan([]);
    toast({ title: "Weekly Planner Cleared" });
  }, [toast]);

  // 1-Click Transfer Weekly Plan into Active Cart
  const addWeeklyPlanToCart = useCallback(() => {
    if (weeklyPlan.length === 0) {
      toast({ title: "Weekly Planner is empty", variant: "destructive" });
      return;
    }

    setItems((prev) => {
      const updated = [...prev];
      weeklyPlan.forEach((planItem) => {
        const prod = products.find((p) => p.id === planItem.productId);
        if (!prod || (prod.stock ?? 20) <= 0 || !prod.inStock) return;

        const existing = updated.find((i) => i.product.id === planItem.productId);
        if (existing) {
          existing.quantity += planItem.quantity;
        } else {
          updated.push({ product: prod, quantity: planItem.quantity });
        }
      });
      return updated;
    });

    toast({
      title: "Weekly Grocery Plan Added to Cart! 🛒",
      description: `Loaded ${weeklyPlan.length} scheduled items ready for checkout.`,
    });
  }, [weeklyPlan, products, toast]);

  // Save current cart as recurring weekly plan
  const saveCartAsWeeklyPlan = useCallback(() => {
    if (items.length === 0) {
      toast({ title: "Cart is empty to save as weekly plan", variant: "destructive" });
      return;
    }

    const newPlan: WeeklyPlanItem[] = items.map((cartItem, idx) => ({
      id: `WPI-${Date.now()}-${idx}`,
      productId: cartItem.product.id,
      quantity: cartItem.quantity,
      day: "All Week",
    }));

    setWeeklyPlan(newPlan);
    toast({
      title: "Saved as Weekly Grocery Routine! 📅",
      description: "You can reuse this exact shopping basket every week in 1 click.",
    });
  }, [items, toast]);

  // Storage persistence helpers
  const saveOrders = useCallback((ordersToSave: OrderHistoryItem[]) => {
    localStorage.setItem("akdevil_orders", JSON.stringify(ordersToSave));
  }, []);

  const saveProducts = useCallback((prodsToSave: Product[]) => {
    localStorage.setItem("akdevil_products", JSON.stringify(prodsToSave));
  }, []);

  const saveAccounts = useCallback((accsToSave: StoredUserAccount[]) => {
    localStorage.setItem("akdevil_users_db", JSON.stringify(accsToSave));
  }, []);

  // Background auto-update for active live orders through the 4 stages
  useEffect(() => {
    const timer = setInterval(() => {
      setOrderHistory((prev) => {
        let hasChanges = false;
        const updated = prev.map((order) => {
          if (order.status === "Delivered" || order.status === "Cancelled" || order.isCancelled) {
            return order;
          }

          let currentIndex = 0;
          if (order.location?.includes("Delivery partner") || order.location?.includes("In Transit")) {
            currentIndex = 2;
          } else if (order.location?.includes("Packaging") || order.location?.includes("Packed")) {
            currentIndex = 1;
          } else if (order.location?.includes("Warehouse") || order.location?.includes("Placed")) {
            currentIndex = 0;
          }

          const nextIndex = currentIndex + 1;
          if (nextIndex < TRACKING_STAGES.length) {
            hasChanges = true;
            const nextStage = TRACKING_STAGES[nextIndex];
            return {
              ...order,
              status: nextStage.status,
              location: nextStage.location,
            };
          }
          return order;
        });

        if (hasChanges) {
          saveOrders(updated);
          return updated;
        }
        return prev;
      });
    }, 12000);

    return () => clearInterval(timer);
  }, [saveOrders]);

  // Wishlist Actions
  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlist((prev) => {
        const exists = prev.includes(productId);
        const prod = products.find((p) => p.id === productId);
        const prodName = prod ? prod.name : "Product";
        const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];

        toast({
          title: exists ? "Removed from Wishlist" : "Saved to Wishlist ❤️",
          description: exists
            ? `"${prodName}" was removed from your favorites.`
            : `"${prodName}" saved to your wishlist!`,
        });
        return updated;
      });
    },
    [products, toast]
  );

  const isInWishlist = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist((prev) => prev.filter((id) => id !== productId));
  }, []);

  const clearWishlist = useCallback(() => setWishlist([]), []);

  // Cart Actions with Stock Management & Effective Price
  const addToCart = useCallback(
    (product: Product) => {
      const currentStock = product.stock ?? (product.inStock ? 20 : 0);
      if (currentStock <= 0 || !product.inStock) {
        toast({
          title: "Out of Stock",
          description: `Sorry, "${product.name}" is currently unavailable.`,
          variant: "destructive",
        });
        return;
      }

      setItems((prev) => {
        const existing = prev.find((i) => i.product.id === product.id);
        if (existing) {
          if (existing.quantity >= currentStock) {
            toast({
              title: "Stock Limit Reached",
              description: `Only ${currentStock} units available for "${product.name}".`,
              variant: "destructive",
            });
            return prev;
          }
          return prev.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prev, { product, quantity: 1 }];
      });
      toast({
        title: "Added to Cart 🛒",
        description: `"${product.name}" added to your grocery basket.`,
      });
    },
    [toast]
  );

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      const prod = products.find((p) => p.id === productId);
      const maxStock = prod?.stock ?? 20;

      if (quantity <= 0) {
        setItems((prev) => prev.filter((i) => i.product.id !== productId));
      } else if (quantity > maxStock) {
        toast({
          title: "Stock Limit Reached",
          description: `Only ${maxStock} units currently available.`,
          variant: "destructive",
        });
        setItems((prev) =>
          prev.map((i) => (i.product.id === productId ? { ...i, quantity: maxStock } : i))
        );
      } else {
        setItems((prev) =>
          prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
        );
      }
    },
    [products, toast]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const buyNow = useCallback(
    (product: Product) => {
      const currentStock = product.stock ?? (product.inStock ? 20 : 0);
      if (currentStock <= 0 || !product.inStock) {
        toast({
          title: "Out of Stock",
          description: `Sorry, "${product.name}" is currently unavailable.`,
          variant: "destructive",
        });
        return;
      }
      setItems([{ product, quantity: 1 }]);
    },
    [toast]
  );

  // Coupon System
  const calculateDiscount = useCallback(
    (cartTotal: number, couponToUse?: Coupon | null): number => {
      const coupon = couponToUse !== undefined ? couponToUse : appliedCoupon;
      if (!coupon) return 0;
      if (cartTotal < coupon.minOrderValue) return 0;
      if (coupon.discountType === "fixed") {
        return Math.min(coupon.discountValue, cartTotal);
      } else {
        const calculated = (cartTotal * coupon.discountValue) / 100;
        return coupon.maxDiscount ? Math.min(calculated, coupon.maxDiscount) : calculated;
      }
    },
    [appliedCoupon]
  );

  const applyCoupon = useCallback(
    (code: string, currentTotal?: number) => {
      const activeTotal = currentTotal ?? items.reduce((s, i) => s + getProductEffectivePrice(i.product) * i.quantity, 0);
      const cleanCode = code.trim().toUpperCase();
      const found = coupons.find((c) => c.code.toUpperCase() === cleanCode);

      if (!found) {
        toast({
          title: "Invalid Coupon Code",
          description: `"${code}" is not valid. Please try another discount code.`,
          variant: "destructive",
        });
        return { success: false, message: "Invalid coupon code", discount: 0 };
      }

      if (activeTotal < found.minOrderValue) {
        toast({
          title: "Minimum Order Required",
          description: `Coupon ${found.code} requires a minimum order of ₹${found.minOrderValue}.`,
          variant: "destructive",
        });
        return { success: false, message: `Minimum cart value of ₹${found.minOrderValue} required`, discount: 0 };
      }

      const discount = calculateDiscount(activeTotal, found);
      setAppliedCoupon(found);
      toast({
        title: `Coupon ${found.code} Applied! 🏷️`,
        description: `You've unlocked ₹${discount.toFixed(2)} savings on your purchase!`,
      });
      return { success: true, message: `Saved ₹${discount.toFixed(2)}`, discount };
    },
    [coupons, items, calculateDiscount, getProductEffectivePrice, toast]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    toast({
      title: "Coupon Removed",
      description: "Coupon discount has been removed.",
    });
  }, [toast]);

  // Order Placement
  const addOrder = useCallback(
    (
      cartItems: CartItem[],
      totalPrice: number,
      paymentDetails?: { method?: "Online UPI" | "Direct Pay (COD)"; status?: "Paid" | "Pending"; upiRef?: string },
      orderDetails?: { deliverySlot?: string; couponCode?: string; discountAmount?: number }
    ): string => {
      const orderId = `ORD-${Date.now()}`;
      const order: OrderHistoryItem = {
        id: orderId,
        items: cartItems,
        totalPrice,
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "Processing",
        location: "Warehouse - Order Placed & Confirmed",
        trackingUrl: `https://tracking.example.com/${Date.now()}`,
        paymentMethod: paymentDetails?.method || "Online UPI",
        paymentStatus: paymentDetails?.status || "Paid",
        paymentUpiRef: paymentDetails?.upiRef,
        deliverySlot: orderDetails?.deliverySlot,
        couponCode: orderDetails?.couponCode,
        discountAmount: orderDetails?.discountAmount,
      };

      // Automatically deduct stock for bought items
      setProducts((prev) => {
        const updated = prev.map((prod) => {
          const item = cartItems.find((ci) => ci.product.id === prod.id);
          if (item) {
            const currentStock = prod.stock ?? 20;
            const newStock = Math.max(0, currentStock - item.quantity);
            return {
              ...prod,
              stock: newStock,
              inStock: newStock > 0,
            };
          }
          return prod;
        });
        saveProducts(updated);
        return updated;
      });

      setOrderHistory((prev) => {
        const updated = [order, ...prev];
        saveOrders(updated);
        return updated;
      });

      setAppliedCoupon(null);
      return orderId;
    },
    [saveOrders, saveProducts]
  );

  const reorder = useCallback(
    (orderId: string) => {
      const pastOrder = orderHistory.find((o) => o.id === orderId);
      if (!pastOrder) return;

      setItems((prev) => {
        const updated = [...prev];
        pastOrder.items.forEach(({ product, quantity }) => {
          const existing = updated.find((i) => i.product.id === product.id);
          if (existing) {
            existing.quantity += quantity;
          } else {
            updated.push({ product, quantity });
          }
        });
        return updated;
      });

      toast({
        title: "Reordered Successfully! 🛍️",
        description: `Added ${pastOrder.items.length} item(s) from Order #${pastOrder.id} to your cart.`,
      });
    },
    [orderHistory, toast]
  );

  // Reviews System
  const addReview = useCallback(
    (newReviewData: Omit<ProductReview, "id" | "date">) => {
      const review: ProductReview = {
        ...newReviewData,
        id: `REV-${Date.now()}`,
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      };

      setReviews((prev) => [review, ...prev]);

      setProducts((prev) => {
        const updated = prev.map((p) => {
          if (p.id === review.productId) {
            const productReviews = reviews.filter((r) => r.productId === p.id).concat(review);
            const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
            return { ...p, rating: parseFloat(avg.toFixed(1)) };
          }
          return p;
        });
        saveProducts(updated);
        return updated;
      });

      toast({
        title: "Review Published! ⭐",
        description: "Thank you for sharing your feedback on this product.",
      });
    },
    [reviews, saveProducts, toast]
  );

  const getProductReviews = useCallback(
    (productId: string) => reviews.filter((r) => r.productId === productId),
    [reviews]
  );

  const restockProduct = useCallback(
    (productId: string, amount: number) => {
      setProducts((prev) => {
        const updated = prev.map((p) => {
          if (p.id === productId) {
            const currentStock = p.stock ?? 0;
            const newStock = currentStock + amount;
            return {
              ...p,
              stock: newStock,
              inStock: newStock > 0,
            };
          }
          return p;
        });
        saveProducts(updated);
        return updated;
      });
      toast({
        title: "Stock Restocked! 📦",
        description: `Added ${amount} units to product inventory.`,
      });
    },
    [saveProducts, toast]
  );

  // Authentication
  const signIn = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          if (
            (email.toLowerCase() === "admin@akdevil.com" || email.toLowerCase() === "admin") &&
            (password === "admin123" || password === "admin")
          ) {
            const adminAcc = DEFAULT_ACCOUNTS[0].user;
            setUser(adminAcc);
            localStorage.setItem("akdevil_user", JSON.stringify(adminAcc));
            resolve(true);
            return;
          }

          if (
            email.toLowerCase() === "customer@gmail.com" &&
            (password === "customer123" || password === "customer")
          ) {
            const custAcc = DEFAULT_ACCOUNTS[1].user;
            setUser(custAcc);
            localStorage.setItem("akdevil_user", JSON.stringify(custAcc));
            resolve(true);
            return;
          }

          const found = accountsDb.find(
            (acc) => acc.user.email.toLowerCase() === email.toLowerCase() && acc.password === password
          );

          if (found) {
            setUser(found.user);
            localStorage.setItem("akdevil_user", JSON.stringify(found.user));
            resolve(true);
          } else {
            resolve(false);
          }
        }, 600);
      });
    },
    [accountsDb]
  );

  const signUp = useCallback(
    async (
      fullName: string,
      email: string,
      phone: string,
      password: string,
      role: UserRole = "customer"
    ): Promise<boolean> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newUser: User = {
            id: `USR-${Date.now()}`,
            fullName,
            email,
            phone,
            role,
            createdAt: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          };

          const newAccount: StoredUserAccount = {
            password,
            user: newUser,
          };

          const updatedAccounts = [
            newAccount,
            ...accountsDb.filter((a) => a.user.email.toLowerCase() !== email.toLowerCase()),
          ];
          setAccountsDb(updatedAccounts);
          saveAccounts(updatedAccounts);

          setUser(newUser);
          localStorage.setItem("akdevil_user", JSON.stringify(newUser));
          resolve(true);
        }, 600);
      });
    },
    [accountsDb, saveAccounts]
  );

  const loginAsDemo = useCallback((role: UserRole): User => {
    if (role === "admin") {
      const adminUser = DEFAULT_ACCOUNTS[0].user;
      setUser(adminUser);
      localStorage.setItem("akdevil_user", JSON.stringify(adminUser));
      return adminUser;
    } else {
      const customerUser = DEFAULT_ACCOUNTS[1].user;
      setUser(customerUser);
      localStorage.setItem("akdevil_user", JSON.stringify(customerUser));
      return customerUser;
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem("akdevil_user");
    localStorage.removeItem("freshcart_user");
  }, []);

  const updateOrderStatus = useCallback(
    (orderId: string, status: "Processing" | "Shipped" | "Delivered" | "Cancelled", location?: string) => {
      setOrderHistory((prev) => {
        const updated = prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status,
                location: location || order.location,
              }
            : order
        );
        saveOrders(updated);
        return updated;
      });
    },
    [saveOrders]
  );

  const cancelOrder = useCallback(
    (orderId: string) => {
      setOrderHistory((prev) => {
        const updated = prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: "Cancelled" as const,
                isCancelled: true,
              }
            : order
        );
        saveOrders(updated);
        return updated;
      });
      toast({
        title: "Order Cancelled",
        description: `Order #${orderId} has been cancelled successfully.`,
      });
    },
    [saveOrders, toast]
  );

  // Admin Catalog Management
  const addProduct = useCallback(
    (productData: Omit<Product, "id">) => {
      const newProduct: Product = {
        ...productData,
        id: `PROD-${Date.now()}`,
        stock: typeof productData.stock === "number" ? productData.stock : 20,
        inStock: typeof productData.stock === "number" ? productData.stock > 0 : true,
      };
      setProducts((prev) => {
        const updated = [newProduct, ...prev];
        saveProducts(updated);
        return updated;
      });
      toast({
        title: "Product Added 🥑",
        description: `${newProduct.name} has been added to store inventory.`,
      });
    },
    [saveProducts, toast]
  );

  const updateProduct = useCallback(
    (id: string, updates: Partial<Product>) => {
      setProducts((prev) => {
        const updated = prev.map((p) => {
          if (p.id === id) {
            const merged = { ...p, ...updates };
            if (typeof updates.stock === "number") {
              merged.inStock = updates.stock > 0;
            }
            return merged;
          }
          return p;
        });
        saveProducts(updated);
        return updated;
      });
      toast({
        title: "Product Updated",
        description: "Catalog details saved successfully.",
      });
    },
    [saveProducts, toast]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      setProducts((prev) => {
        const updated = prev.filter((p) => p.id !== id);
        saveProducts(updated);
        return updated;
      });
      toast({
        title: "Product Removed",
        description: "Product removed from catalog.",
      });
    },
    [saveProducts, toast]
  );

  const updateUserRole = useCallback(
    (userId: string, newRole: UserRole) => {
      setAccountsDb((prev) => {
        const updated = prev.map((acc) => {
          if (acc.user.id === userId) {
            const updatedUser: User = { ...acc.user, role: newRole };
            if (user?.id === userId) {
              setUser(updatedUser);
              localStorage.setItem("akdevil_user", JSON.stringify(updatedUser));
            }
            return { ...acc, user: updatedUser };
          }
          return acc;
        });
        saveAccounts(updated);
        return updated;
      });
      toast({
        title: "Role Updated",
        description: `User role updated to ${newRole.toUpperCase()}.`,
      });
    },
    [saveAccounts, toast, user?.id]
  );

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  // Calculate cart total respecting near-expiry effective discounted prices!
  const totalPrice = items.reduce((sum, i) => sum + getProductEffectivePrice(i.product) * i.quantity, 0);
  const users = accountsDb.map((acc) => acc.user);
  const lowStockProducts = products.filter((p) => (p.stock ?? 20) <= 5);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        buyNow,
        totalItems,
        totalPrice,
        wishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
        orderHistory,
        addOrder,
        updateOrderStatus,
        cancelOrder,
        reorder,
        coupons,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        calculateDiscount,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        restockProduct,
        lowStockProducts,
        getProductEffectivePrice,
        nearExpiryProducts,
        updateExpiryDiscount,
        budget,
        setBudget,
        getCheaperAlternatives,
        swapCartItemWithAlternative,
        autoFillBudgetBasket,
        weeklyPlan,
        addToWeeklyPlan,
        removeFromWeeklyPlan,
        updateWeeklyPlanItem,
        loadWeeklyPlanTemplate,
        clearWeeklyPlan,
        addWeeklyPlanToCart,
        saveCartAsWeeklyPlan,
        reviews,
        addReview,
        getProductReviews,
        user,
        users,
        signIn,
        signUp,
        signOut,
        loginAsDemo,
        updateUserRole,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
