import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import type { OrderHistoryItem } from "@/context/CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2 } from "lucide-react";

const deliverySlots = [
  "Today, 2:00 PM - 4:00 PM",
  "Today, 4:00 PM - 6:00 PM",
  "Today, 6:00 PM - 8:00 PM",
  "Tomorrow, 9:00 AM - 11:00 AM",
  "Tomorrow, 11:00 AM - 1:00 PM",
  "Tomorrow, 2:00 PM - 4:00 PM",
];

const Checkout = () => {
  const { items, totalPrice, clearCart, addOrder, orderHistory } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [slot, setSlot] = useState("");
  const [placed, setPlaced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Check if coming from Buy Now (last order in history)
  const lastOrder = orderHistory.length > 0 ? orderHistory[0] : null;
  const isBuyNow = lastOrder && location.state?.fromBuyNow;

  // Calculate totals
  const cartTotal = items.length > 0 ? totalPrice : (lastOrder?.totalPrice ?? 0);
  const deliveryFee = cartTotal >= 500 ? 0 : 49;
  const finalTotal = cartTotal + deliveryFee;

  if (placed) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
        <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6" />
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-2">Your groceries are on their way 🚚</p>
        <p className="text-sm text-muted-foreground mb-8">Delivery: {slot}</p>
        <button 
          onClick={() => {
            setPlaced(false);
            navigate("/");
          }} 
          className="gradient-hero text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  // If no items in cart and not from Buy Now, redirect
  if (items.length === 0 && !isBuyNow) {
    navigate("/cart");
    return null;
  }

  const validateForm = (formData: FormData): Record<string, string> => {
    const errors: Record<string, string> = {};
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const zip = formData.get("zip") as string;

    if (!name?.trim()) errors.name = "Full name is required";
    if (!phone?.trim()) errors.phone = "Phone number is required";
    if (!/^\d{10}$|^\+\d{1,3}\d{9,}$/.test(phone?.replace(/\s/g, "") || "")) errors.phone = "Invalid phone number";
    if (!address?.trim()) errors.address = "Address is required";
    if (!city?.trim()) errors.city = "City is required";
    if (!zip?.trim()) errors.zip = "PIN code is required";
    if (!slot) errors.slot = "Please select a delivery slot";

    return errors;
  };

  const handleOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const errors = validateForm(formData);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    setFormErrors({});

    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // If from Buy Now, the order is already in history
      // Otherwise add cart items to order history
      if (items.length > 0) {
        addOrder(items, finalTotal);
        clearCart();
      }

      setPlaced(true);
    } catch (error) {
      setFormErrors({ submit: "Error placing order. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Get items to display
  const displayItems = items.length > 0 ? items : (lastOrder?.items ?? []);
  const displayTotal = items.length > 0 ? totalPrice : (lastOrder?.totalPrice ?? 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">Checkout</h1>

      {displayItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No items to checkout</p>
          <button 
            onClick={() => navigate("/products")}
            className="gradient-hero text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <form onSubmit={handleOrder} className="space-y-8">
          {formErrors.submit && (
            <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg text-sm">
              {formErrors.submit}
            </div>
          )}

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Delivery Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  required 
                  placeholder="Rahul Sharma" 
                  className={`mt-1 ${formErrors.name ? "border-destructive" : ""}`}
                  disabled={isLoading}
                />
                {formErrors.name && <p className="text-xs text-destructive mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  name="phone"
                  required 
                  placeholder="+91 98765 43210" 
                  className={`mt-1 ${formErrors.phone ? "border-destructive" : ""}`}
                  disabled={isLoading}
                />
                {formErrors.phone && <p className="text-xs text-destructive mt-1">{formErrors.phone}</p>}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  name="address"
                  required 
                  placeholder="123 MG Road, Apt 4" 
                  className={`mt-1 ${formErrors.address ? "border-destructive" : ""}`}
                  disabled={isLoading}
                />
                {formErrors.address && <p className="text-xs text-destructive mt-1">{formErrors.address}</p>}
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  name="city"
                  required 
                  placeholder="Mumbai" 
                  className={`mt-1 ${formErrors.city ? "border-destructive" : ""}`}
                  disabled={isLoading}
                />
                {formErrors.city && <p className="text-xs text-destructive mt-1">{formErrors.city}</p>}
              </div>
              <div>
                <Label htmlFor="zip">PIN Code</Label>
                <Input 
                  id="zip" 
                  name="zip"
                  required 
                  placeholder="400001" 
                  className={`mt-1 ${formErrors.zip ? "border-destructive" : ""}`}
                  disabled={isLoading}
                />
                {formErrors.zip && <p className="text-xs text-destructive mt-1">{formErrors.zip}</p>}
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Delivery Slot</h2>
            {formErrors.slot && <p className="text-xs text-destructive mb-3">{formErrors.slot}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {deliverySlots.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSlot(s);
                    if (formErrors.slot) {
                      setFormErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.slot;
                        return newErrors;
                      });
                    }
                  }}
                  disabled={isLoading}
                  className={`p-3 rounded-lg border text-sm font-medium text-left transition-all disabled:opacity-50 ${
                    slot === s ? "border-primary bg-accent text-accent-foreground" : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              {displayItems.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between">
                  <span className="text-muted-foreground">{product.name} × {quantity}</span>
                  <span className="text-foreground">₹{(product.price * quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">₹{displayTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className={deliveryFee === 0 ? "text-primary font-medium" : ""}>{deliveryFee === 0 ? "Free" : `₹${deliveryFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!slot || isLoading || displayItems.length === 0}
            className="w-full gradient-hero text-primary-foreground py-3.5 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Place Order — ₹${finalTotal.toFixed(2)}`
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default Checkout;
