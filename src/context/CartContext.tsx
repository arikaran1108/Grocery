import React, { createContext, useState, useCallback, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/data/products";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderHistoryItem {
  id: string;
  items: CartItem[];
  totalPrice: number;
  date: string;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  location?: string;
  trackingUrl?: string;
  isCancelled?: boolean;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  buyNow: (product: Product) => void;
  addOrder: (items: CartItem[], totalPrice: number) => void;
  totalItems: number;
  totalPrice: number;
  orderHistory: OrderHistoryItem[];
  user: User | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (fullName: string, email: string, phone: string, password: string) => Promise<boolean>;
  signOut: () => void;
  updateOrderStatus: (orderId: string, status: "Processing" | "Shipped" | "Delivered", location?: string) => void;
  cancelOrder: (orderId: string) => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const userDatabaseRef = useRef<Record<string, { password: string; user: User }>>({});

  useEffect(() => {
    const savedOrders = localStorage.getItem("freshcart_orders");
    if (savedOrders) {
      setOrderHistory(JSON.parse(savedOrders));
    }
  }, []);

  // Define saveOrders first since it's used by other callbacks
  const saveOrders = useCallback((ordersToSave: OrderHistoryItem[]) => {
    localStorage.setItem("freshcart_orders", JSON.stringify(ordersToSave));
  }, []);

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
    // Add product to cart temporarily for checkout
    setItems([{ product, quantity: 1 }]);
  }, []);

  const addOrder = useCallback((cartItems: CartItem[], totalPrice: number) => {
    const order: OrderHistoryItem = {
      id: `ORD-${Date.now()}`,
      items: cartItems,
      totalPrice,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      status: "Processing",
      location: "Warehouse - Order confirmed",
      trackingUrl: `https://tracking.example.com/${Date.now()}`,
    };
    setOrderHistory((prev) => {
      const updated = [order, ...prev];
      saveOrders(updated);
      return updated;
    });
  }, [saveOrders]);

  const signUp = useCallback(
    async (fullName: string, email: string, phone: string, password: string): Promise<boolean> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newUser: User = {
            id: `USR-${Date.now()}`,
            fullName,
            email,
            phone,
          };
          userDatabaseRef.current[email] = { password, user: newUser };
          setUser(newUser);
          localStorage.setItem("freshcart_user", JSON.stringify(newUser));
          resolve(true);
        }, 1000);
      });
    },
    []
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const userData = userDatabaseRef.current[email];
          if (userData && userData.password === password) {
            setUser(userData.user);
            localStorage.setItem("freshcart_user", JSON.stringify(userData.user));
            resolve(true);
          } else {
            resolve(false);
          }
        }, 1000);
      });
    },
    []
  );

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem("freshcart_user");
  }, []);

  const { toast } = useToast();

  const updateOrderStatus = useCallback(
    (orderId: string, status: "Processing" | "Shipped" | "Delivered", location?: string) => {
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

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, buyNow, addOrder, totalItems, totalPrice, orderHistory, user, signIn, signUp, signOut, updateOrderStatus, cancelOrder }}>
      {children}
    </CartContext.Provider>
  );
};


