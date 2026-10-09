import { useState, useRef } from "react";
import { useCart } from "@/hooks/useCart";
import type { OrderHistoryItem } from "@/context/CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2, Navigation, MapPin, QrCode, Banknote, Smartphone, ShieldCheck, ArrowRight } from "lucide-react";
import UpiPaymentScanner from "@/components/UpiPaymentScanner";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef<HTMLFormElement>(null);

  const [slot, setSlot] = useState("");
  const [placed, setPlaced] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "direct">("online");
  const [completedPaymentDetails, setCompletedPaymentDetails] = useState<{
    method: "Online UPI" | "Direct Pay (COD)";
    status: "Paid" | "Pending";
    upiRef?: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Check if coming from Buy Now (last order in history)
  const lastOrder = orderHistory.length > 0 ? orderHistory[0] : null;
  const isBuyNow = lastOrder && location.state?.fromBuyNow;

  // Calculate totals
  const cartTotal = items.length > 0 ? totalPrice : (lastOrder?.totalPrice ?? 0);
  const deliveryFee = cartTotal >= 500 ? 0 : 49;
  const finalTotal = cartTotal + deliveryFee;

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

  const getValidatedFormData = (): FormData | null => {
    if (!formRef.current) return null;
    const formData = new FormData(formRef.current);
    const errors = validateForm(formData);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstErrorKey = Object.keys(errors)[0];
      const elem = document.getElementById(firstErrorKey);
      if (elem) elem.focus();
      return null;
    }
    setFormErrors({});
    return formData;
  };

  // Called when online QR scanner verifies payment
  const handleOnlinePaymentSuccess = async (upiRef: string) => {
    const formData = getValidatedFormData();
    if (!formData) {
      toast({
        title: "Please complete delivery details",
        description: "Fill in your delivery name, phone, address, and slot above.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const payDetails = {
        method: "Online UPI" as const,
        status: "Paid" as const,
        upiRef,
      };
      setCompletedPaymentDetails(payDetails);

      if (items.length > 0) {
        const orderId = addOrder(items, finalTotal, payDetails);
        setCreatedOrderId(orderId);
        clearCart();
      } else if (lastOrder) {
        setCreatedOrderId(lastOrder.id);
      }

      setPlaced(true);
    } catch (err) {
      setFormErrors({ submit: "Error placing order. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const errors = validateForm(formData);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (paymentMethod === "online") {
      // Direct attention to scanner
      const scanner = document.getElementById("upi-scanner-section");
      if (scanner) {
        scanner.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      toast({
        title: "Scan & Complete Payment",
        description: "Please scan the QR code with GPay/Paytm or click 'I Have Paid' to finalize your order.",
      });
      return;
    }

    // Direct Pay (Cash on Delivery)
    setIsLoading(true);
    setFormErrors({});

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const payDetails = {
        method: "Direct Pay (COD)" as const,
        status: "Pending" as const,
      };
      setCompletedPaymentDetails(payDetails);

      if (items.length > 0) {
        const orderId = addOrder(items, finalTotal, payDetails);
        setCreatedOrderId(orderId);
        clearCart();
      } else if (lastOrder) {
        setCreatedOrderId(lastOrder.id);
      }

      setPlaced(true);
    } catch (error) {
      setFormErrors({ submit: "Error placing order. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  if (placed) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-fade-in max-w-xl">
        <div className="relative inline-block mb-6">
          <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto" />
          <span className="w-4 h-4 rounded-full bg-emerald-500 absolute top-0 right-0 animate-ping inline-block" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-1">Your groceries are on their way with express delivery 🚚</p>
        {createdOrderId && (
          <p className="text-xs font-mono font-semibold text-primary mb-3">Order ID: {createdOrderId}</p>
        )}

        {/* Payment Confirmation Badge */}
        <div className="mb-5 inline-flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold bg-card border border-border shadow-sm max-w-md w-full justify-center">
          {completedPaymentDetails?.method === "Online UPI" ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="text-left">
                <span className="text-foreground font-bold block">Online Payment Verified (UPI) ✅</span>
                <span className="text-muted-foreground block text-[11px]">
                  Paid: ₹{finalTotal.toFixed(2)} • GPay / Paytm / PhonePe
                </span>
              </div>
            </>
          ) : (
            <>
              <Banknote className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="text-left">
                <span className="text-foreground font-bold block">Direct Pay (Cash / Pay on Delivery) 💵</span>
                <span className="text-muted-foreground block text-[11px]">
                  Due: ₹{finalTotal.toFixed(2)} • Pay cash or scan rider's QR upon arrival
                </span>
              </div>
            </>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-8">Delivery Slot: {slot}</p>

        <div className="p-4 rounded-xl bg-accent/20 border border-accent/30 text-left mb-8 flex items-start gap-3">
          <Navigation className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-foreground">Live GPS Tracking Enabled</p>
            <p className="text-muted-foreground mt-0.5">
              Your order updates automatically in real-time. Follow the delivery rider on the map as items move from the hub to your doorstep.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => {
              setPlaced(false);
              navigate("/cart", { state: { trackOrderId: createdOrderId } });
            }} 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 gradient-hero text-primary-foreground px-8 py-3.5 rounded-full font-semibold hover:opacity-90 transition-opacity shadow-md"
          >
            <Navigation className="w-4 h-4" /> Track Order Live
          </button>
          <button 
            onClick={() => {
              setPlaced(false);
              navigate("/");
            }} 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-muted text-muted-foreground hover:text-foreground px-8 py-3.5 rounded-full font-semibold transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // If no items in cart and not from Buy Now, redirect
  if (items.length === 0 && !isBuyNow) {
    navigate("/cart");
    return null;
  }

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
        <form ref={formRef} onSubmit={handleOrder} className="space-y-8">
          {formErrors.submit && (
            <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg text-sm">
              {formErrors.submit}
            </div>
          )}

          {/* Section 1: Delivery Address */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold mb-4 text-foreground">Delivery Address</h2>
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
                <Label htmlFor="phone">Phone Number</Label>
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
                  placeholder="Chennai" 
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
                  placeholder="600008" 
                  className={`mt-1 ${formErrors.zip ? "border-destructive" : ""}`}
                  disabled={isLoading}
                />
                {formErrors.zip && <p className="text-xs text-destructive mt-1">{formErrors.zip}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Slot */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold mb-4 text-foreground">Delivery Slot</h2>
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
                    slot === s ? "border-primary bg-accent text-accent-foreground shadow-sm" : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Payment Method Selection */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">Payment Method</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose between Online UPI (Scanner) or Direct Pay on Delivery
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                100% Safe & Secure
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
              {/* Option A: Online Pay */}
              <div
                onClick={() => setPaymentMethod("online")}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative ${
                  paymentMethod === "online"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-border/80 bg-card"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Online Pay (UPI / QR)</p>
                      <p className="text-xs text-muted-foreground">GPay, Paytm, PhonePe, BHIM</p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 ${
                    paymentMethod === "online" ? "border-primary bg-primary" : "border-muted-foreground"
                  }`}>
                    {paymentMethod === "online" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">GPay</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">Paytm</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">PhonePe</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Instant</span>
                </div>
              </div>

              {/* Option B: Direct Pay */}
              <div
                onClick={() => setPaymentMethod("direct")}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative ${
                  paymentMethod === "direct"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-border/80 bg-card"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent border border-accent flex items-center justify-center text-accent-foreground">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Direct Pay (Cash / Delivery)</p>
                      <p className="text-xs text-muted-foreground">Pay when rider arrives</p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 ${
                    paymentMethod === "direct" ? "border-primary bg-primary" : "border-muted-foreground"
                  }`}>
                    {paymentMethod === "direct" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">Cash on Delivery</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-500/10 text-slate-600 dark:text-slate-400">Rider QR</span>
                </div>
              </div>
            </div>

            {/* Online Scanner or Direct Pay Details */}
            {paymentMethod === "online" ? (
              <div id="upi-scanner-section" className="mt-2">
                <UpiPaymentScanner
                  amount={finalTotal}
                  onPaymentSuccess={handleOnlinePaymentSuccess}
                  isVerifying={isLoading}
                />
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-muted/70 border border-border flex items-start gap-3">
                <Banknote className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold text-foreground text-sm">Pay at Doorstep</p>
                  <p className="text-muted-foreground mt-1">
                    Keep exact cash of <strong className="text-foreground">₹{finalTotal.toFixed(2)}</strong> ready, or pay using any UPI app by scanning our delivery partner's handheld QR scanner when your order arrives.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Order Summary */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold mb-4 text-foreground">Order Summary</h2>
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
                <span className={deliveryFee === 0 ? "text-primary font-medium" : ""}>
                  {deliveryFee === 0 ? "Free" : `₹${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Button for Direct Pay or Reminder for Online */}
          {paymentMethod === "direct" ? (
            <button
              type="submit"
              disabled={!slot || isLoading || displayItems.length === 0}
              className="w-full gradient-hero text-primary-foreground py-3.5 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <Banknote className="w-4 h-4" />
                  Confirm Order with Direct Pay (COD) — ₹{finalTotal.toFixed(2)}
                </>
              )}
            </button>
          ) : (
            <p className="text-xs text-center text-muted-foreground">
              Please scan the QR code above or click <strong className="text-foreground">"I Have Paid"</strong> in the scanner to confirm your order.
            </p>
          )}
        </form>
      )}
    </div>
  );
};

export default Checkout;
