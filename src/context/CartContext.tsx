import React, { createContext, useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Product, products as initialProducts } from "@/data/products";

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
    location: "Warehouse - Order confirmed",
    status: "Processing",
    title: "Order Confirmed & Packed",
    description: "AK Devil Grocery Store verified and packed fresh items.",
    eta: "Estimated 25-30 mins",
    progressPercent: 15,
  },
  {
    location: "Pickup hub - In transit",
    status: "Shipped",
    title: "Dispatched from Hub",
    description: "Handed over to courier partner. Heading towards your local hub.",
    eta: "Estimated 15-20 mins",
    progressPercent: 45,
  },
  {
    location: "Delivery partner - Out for delivery",
    status: "Shipped",
    title: "Out for Delivery",
    description: "Rider Arun Kumar is on the way to your delivery address.",
    eta: "Estimated 5-8 mins",
    progressPercent: 80,
  },
  {
    location: "Delivered to receiver",
    status: "Delivered",
    title: "Delivered Successfully",
    description: "Order safely handed over at your doorstep. Enjoy!",
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
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  buyNow: (product: Product) => void;
  addOrder: (
    items: CartItem[],
    totalPrice: number,
    paymentDetails?: { method?: "Online UPI" | "Direct Pay (COD)"; status?: "Paid" | "Pending"; upiRef?: string }
  ) => string;
  totalItems: number;
  totalPrice: number;
  orderHistory: OrderHistoryItem[];
  user: User | null;
  users: User[];
  products: Product[];
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (fullName: string, email: string, phone: string, password: string, role?: UserRole) => Promise<boolean>;
  signOut: () => void;
  loginAsDemo: (role: UserRole) => User;
  updateOrderStatus: (orderId: string, status: "Processing" | "Shipped" | "Delivered" | "Cancelled", location?: string) => void;
  cancelOrder: (orderId: string) => void;
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateUserRole: (userId: string, role: UserRole) => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // Initialize and persist products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("akdevil_products");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge in any new default products that are not yet in the saved list
          const existingIds = new Set(parsed.map((p: Product) => p.id));
          const missingDefaults = initialProducts.filter((p) => !existingIds.has(p.id));
          if (missingDefaults.length > 0) {
            const merged = [...parsed, ...missingDefaults];
            localStorage.setItem("akdevil_products", JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return initialProducts;
  });

  // Initialize and persist user accounts database
  const [accountsDb, setAccountsDb] = useState<StoredUserAccount[]>(() => {
    const saved = localStorage.getItem("akdevil_users_db");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_ACCOUNTS;
  });

  // Restore orders and user session on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem("akdevil_orders") || localStorage.getItem("freshcart_orders");
    if (savedOrders) {
      try {
        setOrderHistory(JSON.parse(savedOrders));
      } catch (e) {
        console.error(e);
      }
    }

    const savedUser = localStorage.getItem("akdevil_user") || localStorage.getItem("freshcart_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveOrders = useCallback((ordersToSave: OrderHistoryItem[]) => {
    localStorage.setItem("akdevil_orders", JSON.stringify(ordersToSave));
  }, []);

  const saveProducts = useCallback((prodsToSave: Product[]) => {
    localStorage.setItem("akdevil_products", JSON.stringify(prodsToSave));
  }, []);

  const saveAccounts = useCallback((accsToSave: StoredUserAccount[]) => {
    localStorage.setItem("akdevil_users_db", JSON.stringify(accsToSave));
  }, []);

  // Background auto-update for active live orders
  useEffect(() => {
    const timer = setInterval(() => {
      setOrderHistory((prev) => {
        let hasChanges = false;
        const updated = prev.map((order) => {
          if (order.status === "Delivered" || order.status === "Cancelled" || order.isCancelled) {
            return order;
          }

          let currentIndex = 0;
          if (order.location?.includes("Delivery partner") || order.location?.includes("Out for delivery")) {
            currentIndex = 2;
          } else if (order.location?.includes("Pickup hub") || order.location?.includes("In transit")) {
            currentIndex = 1;
          } else if (order.location?.includes("Warehouse")) {
            currentIndex = 0;
          } else if (order.status === "Shipped") {
            currentIndex = 1;
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
    }, 10000);

    return () => clearInterval(timer);
  }, [saveOrders]);

  const addToCart = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const buyNow = useCallback((product: Product) => {
    setItems([{ product, quantity: 1 }]);
  }, []);

  const addOrder = useCallback((
    cartItems: CartItem[],
    totalPrice: number,
    paymentDetails?: { method?: "Online UPI" | "Direct Pay (COD)"; status?: "Paid" | "Pending"; upiRef?: string }
  ): string => {
    const orderId = `ORD-${Date.now()}`;
    const order: OrderHistoryItem = {
      id: orderId,
      items: cartItems,
      totalPrice,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      status: "Processing",
      location: "Warehouse - Order confirmed",
      trackingUrl: `https://tracking.example.com/${Date.now()}`,
      paymentMethod: paymentDetails?.method || "Online UPI",
      paymentStatus: paymentDetails?.status || "Paid",
      paymentUpiRef: paymentDetails?.upiRef,
    };
    setOrderHistory((prev) => {
      const updated = [order, ...prev];
      saveOrders(updated);
      return updated;
    });
    return orderId;
  }, [saveOrders]);

  // Authentication: Sign In
  const signIn = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 1. Direct admin shortcut check
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

          // 2. Direct demo customer check
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

          // 3. Check registered users
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
        }, 700);
      });
    },
    [accountsDb]
  );

  // Authentication: Sign Up
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

          const updatedAccounts = [newAccount, ...accountsDb.filter((a) => a.user.email.toLowerCase() !== email.toLowerCase())];
          setAccountsDb(updatedAccounts);
          saveAccounts(updatedAccounts);

          setUser(newUser);
          localStorage.setItem("akdevil_user", JSON.stringify(newUser));
          resolve(true);
        }, 700);
      });
    },
    [accountsDb, saveAccounts]
  );

  // Instant demo switch
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

  // Update order status (Admin operation & customer cancel)
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

  const cancelOrder = useCallback((orderId: string) => {
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
  }, [saveOrders, toast]);

  // Admin Product Management
  const addProduct = useCallback((productData: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...productData,
      id: `PROD-${Date.now()}`,
    };
    setProducts((prev) => {
      const updated = [newProduct, ...prev];
      saveProducts(updated);
      return updated;
    });
    toast({
      title: "Product Added",
      description: `${newProduct.name} has been added to the store inventory.`,
    });
  }, [saveProducts, toast]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      saveProducts(updated);
      return updated;
    });
    toast({
      title: "Product Updated",
      description: "Product details updated successfully.",
    });
  }, [saveProducts, toast]);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveProducts(updated);
      return updated;
    });
    toast({
      title: "Product Removed",
      description: "Product deleted from inventory.",
    });
  }, [saveProducts, toast]);

  // Admin User Role Management
  const updateUserRole = useCallback((userId: string, newRole: UserRole) => {
    setAccountsDb((prev) => {
      const updated = prev.map((acc) => {
        if (acc.user.id === userId) {
          const updatedUser: User = { ...acc.user, role: newRole };
          // If editing currently logged in user
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
      description: `User role changed to ${newRole.toUpperCase()}.`,
    });
  }, [saveAccounts, toast, user?.id]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const users = accountsDb.map((acc) => acc.user);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        buyNow,
        addOrder,
        totalItems,
        totalPrice,
        orderHistory,
        user,
        users,
        products,
        signIn,
        signUp,
        signOut,
        loginAsDemo,
        updateOrderStatus,
        cancelOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        updateUserRole,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
