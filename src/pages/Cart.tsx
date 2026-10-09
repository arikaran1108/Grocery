import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { Minus, Plus, Trash2, ArrowRight, ShoppingCart, Package, Clock, MapPin, X, AlertCircle, Navigation } from "lucide-react";
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

const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, updateQuantity, removeFromCart, totalPrice, orderHistory, updateOrderStatus, cancelOrder } = useCart();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

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

  return (
    <div className="container mx-auto px-4 py-8">
      {items.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some fresh groceries to get started!</p>
          <Link to="/products" className="inline-flex items-center gap-2 gradient-hero text-primary-foreground px-8 py-3 rounded-full font-semibold">
            Browse Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <>
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="bg-card border border-border rounded-lg p-4 flex gap-4 animate-fade-in">
                  <img src={product.image} alt={product.name} className="w-20 h-20 rounded-lg object-cover" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-body font-semibold text-foreground text-sm">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.unit}</p>
                    <p className="font-bold text-foreground mt-1">₹{(product.price * quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => removeFromCart(product.id)} className="text-muted-foreground hover:text-destructive transition-colors" aria-label="Remove item">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center" aria-label="Decrease quantity">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-semibold w-5 text-center">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, quantity + 1)} className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center" aria-label="Increase quantity">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-lg p-6 h-fit sticky top-24">
              <h2 className="font-display text-lg font-bold text-foreground mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className={`font-medium ${totalPrice >= 500 ? "text-primary" : "text-foreground"}`}>
                    {totalPrice >= 500 ? "Free" : "₹49.00"}
                  </span>
                </div>
                {totalPrice < 500 && (
                  <p className="text-xs text-muted-foreground">Add ₹{(500 - totalPrice).toFixed(2)} more for free delivery</p>
                )}
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-lg text-foreground">₹{(totalPrice + (totalPrice >= 500 ? 0 : 49)).toFixed(2)}</span>
                </div>
              </div>
              <Link
                to="/checkout"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 gradient-hero text-primary-foreground px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Order History */}
      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6" /> Purchase History
        </h2>
        {orderHistory.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No purchases yet. Buy a product to see your history here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orderHistory.map((order) => (
              <div key={order.id} className="bg-card border border-border rounded-lg p-5 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-semibold text-foreground text-sm">{order.id}</span>
                    <span className="text-xs text-muted-foreground ml-3">{order.date}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                    {order.status !== "Delivered" && !order.isCancelled && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                        Live GPS Active
                      </span>
                    )}
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      order.status === "Delivered" ? "bg-primary/10 text-primary" :
                      order.status === "Shipped" ? "bg-secondary/20 text-secondary-foreground" :
                      order.status === "Cancelled" ? "bg-destructive/10 text-destructive" :
                      "bg-accent text-accent-foreground"
                    }`}>
                      {order.status}
                    </span>
                    {!order.isCancelled && order.status !== "Delivered" && (
                      <button
                        onClick={() => cancelOrder !== undefined && setCancelConfirmId(order.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                    )}
                    {order.status !== "Cancelled" && (
                      <button
                        onClick={() => handleTrackOrder(order)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Navigation className="w-3 h-3" /> Live Track
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  {order.items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-foreground">₹{(product.price * quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border mt-3 pt-3 flex justify-between items-center">
                  <div>
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="font-bold text-foreground block">₹{order.totalPrice.toFixed(2)}</span>
                    {order.paymentMethod && (
                      <span className="text-[11px] font-semibold text-primary block mt-0.5">
                        {order.paymentMethod === "Online UPI" ? "💳 Paid via UPI" : "💵 Direct Pay (COD)"}
                      </span>
                    )}
                  </div>
                  {order.location && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-xs font-medium text-foreground">{order.location}</p>
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
      <AlertDialog open={cancelConfirmId !== null} onOpenChange={(open) => !open && setCancelConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Cancel Order
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone. You will be able to re-order the items later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            {cancelConfirmId && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p className="font-medium text-foreground">Order ID: {cancelConfirmId}</p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
<AlertDialogAction onClick={() => handleCancelOrder(cancelConfirmId!)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Cancel Order
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Cart;
