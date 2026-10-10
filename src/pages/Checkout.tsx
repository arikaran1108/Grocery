import { useState, useRef, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import type { OrderHistoryItem } from "@/context/CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  Loader2,
  Navigation,
  MapPin,
  QrCode,
  Banknote,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  Calendar,
  Clock,
  Tag,
  AlertTriangle,
} from "lucide-react";
import UpiPaymentScanner from "@/components/UpiPaymentScanner";
import { useToast } from "@/hooks/use-toast";

const deliveryDays = [
  { id: "today", label: "Today", sub: "Fastest Delivery" },
  { id: "tomorrow", label: "Tomorrow", sub: "Scheduled" },
  { id: "day_after", label: "Day After Tomorrow", sub: "Advance Order" },
];

const timeSlots = [
  { id: "morning", time: "07:00 AM - 09:00 AM", label: "🌅 Morning Express" },
  { id: "midday", time: "11:00 AM - 01:00 PM", label: "☀️ Midday Delivery" },
  { id: "afternoon", time: "02:00 PM - 04:00 PM", label: "🌤️ Afternoon Slot" },
  { id: "evening", time: "06:00 PM - 08:00 PM", label: "🌆 Evening Express" },
  { id: "night", time: "08:00 PM - 10:00 PM", label: "🌙 Night Delivery" },
];

const Checkout = () => {
  const {
    items,
    totalPrice,
    clearCart,
    addOrder,
    orderHistory,
    user,
    appliedCoupon,
    calculateDiscount,
    applyCoupon,
    removeCoupon,
    coupons,
    products,
  } = useCart();

  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef<HTMLFormElement>(null);

  // Requirement 12: Delivery Date & Time Slot Booking
  const [selectedDay, setSelectedDay] = useState(deliveryDays[0].label);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(timeSlots[1].time);
  const selectedFullSlot = `${selectedDay}, ${selectedTimeSlot}`;

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
  const [couponInput, setCouponInput] = useState("");

  // Buy Now check
  const lastOrder = orderHistory.length > 0 ? orderHistory[0] : null;
  const isBuyNow = lastOrder && location.state?.fromBuyNow;

  // Totals & Discount calculation
  const cartTotal = items.length > 0 ? totalPrice : (lastOrder?.totalPrice ?? 0);
  const discountAmount = calculateDiscount(cartTotal);
  const deliveryFee = cartTotal - discountAmount >= 500 ? 0 : 49;
  const finalTotal = Math.max(0, cartTotal - discountAmount + deliveryFee);

  // Form Validation
  const validateForm = (formData: FormData): Record<string, string> => {
    const errors: Record<string, string> = {};
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const zip = formData.get("zip") as string;

    if (!name?.trim()) errors.name = "Full name is required";
    if (!phone?.trim()) errors.phone = "Phone number is required";
    if (!/^\d{10}$|^\+\d{1,3}\d{9,}$/.test(phone?.replace(/\s/g, "") || ""))
      errors.phone = "Invalid 10-digit mobile number";
    if (!address?.trim()) errors.address = "Delivery street address is required";
    if (!city?.trim()) errors.city = "City is required";
    if (!zip?.trim()) errors.zip = "PIN code is required";
    if (!selectedTimeSlot) errors.slot = "Please select a delivery time slot";

    // Requirement 8: Stock check before placing order
    for (const item of items) {
      const prod = products.find((p) => p.id === item.product.id);
      const availableStock = prod?.stock ?? 20;
      if (availableStock <= 0 || !prod?.inStock) {
        errors.submit = `Sorry, "${item.product.name}" is now out of stock. Please remove it from cart.`;
        break;
      }
      if (item.quantity > availableStock) {
        errors.submit = `Only ${availableStock} units of "${item.product.name}" are available. Please adjust quantity.`;
        break;
      }
    }

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

  // Online UPI success callback
  const handleOnlinePaymentSuccess = async (upiRef: string) => {
    const formData = getValidatedFormData();
    if (!formData) {
      toast({
        title: "Please complete delivery address",
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

      const orderMeta = {
        deliverySlot: selectedFullSlot,
        couponCode: appliedCoupon?.code,
        discountAmount,
      };

      if (items.length > 0) {
        const orderId = addOrder(items, finalTotal, payDetails, orderMeta);
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

  // Direct Pay (COD) handler
  const handleOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const errors = validateForm(formData);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (paymentMethod === "online") {
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

    setIsLoading(true);
    setFormErrors({});

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const payDetails = {
        method: "Direct Pay (COD)" as const,
        status: "Pending" as const,
      };
      setCompletedPaymentDetails(payDetails);

      const orderMeta = {
        deliverySlot: selectedFullSlot,
        couponCode: appliedCoupon?.code,
        discountAmount,
      };

      if (items.length > 0) {
        const orderId = addOrder(items, finalTotal, payDetails, orderMeta);
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

  // Order Confirmed Screen
  if (placed) {
    return (
      <div className="container mx-auto px-4 py-16 text-center animate-fade-in max-w-xl">
        <div className="relative inline-block mb-6">
          <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto" />
          <span className="w-4 h-4 rounded-full bg-emerald-500 absolute top-0 right-0 animate-ping inline-block" />
        </div>
        <h1 className="font-display text-3xl font-extrabold text-foreground mb-2">
          Order Successfully Confirmed!
        </h1>
        <p className="text-muted-foreground text-sm mb-2">
          Your groceries are scheduled for express delivery 🚚
        </p>
        {createdOrderId && (
          <p className="text-xs font-mono font-bold text-primary mb-4 bg-primary/10 inline-block px-3 py-1 rounded-full">
            Order Reference: {createdOrderId}
          </p>
        )}

        {/* Payment Confirmation Badge */}
        <div className="mb-6 p-4 rounded-2xl bg-card border border-border shadow-sm text-left space-y-2">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-border">
            <span className="text-muted-foreground">Delivery Slot:</span>
            <strong className="text-foreground">{selectedFullSlot}</strong>
          </div>
          <div className="flex items-center justify-between text-xs pb-2 border-b border-border">
            <span className="text-muted-foreground">Payment Mode:</span>
            <span className="font-bold text-primary">
              {completedPaymentDetails?.method === "Online UPI"
                ? "UPI Online Paid (GPay / Paytm) ✅"
                : "Cash on Delivery / Direct Pay 💵"}
            </span>
          </div>
          {appliedCoupon && (
            <div className="flex items-center justify-between text-xs pb-2 border-b border-border text-emerald-600">
              <span>Applied Discount ({appliedCoupon.code}):</span>
              <strong>-₹{discountAmount.toFixed(2)}</strong>
            </div>
          )}
          <div className="flex items-center justify-between text-sm pt-1">
            <span className="font-bold text-foreground">Total Paid:</span>
            <span className="font-black text-foreground text-base">₹{finalTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Live GPS Tracking Notice */}
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-left mb-8 flex items-start gap-3">
          <Navigation className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-foreground">Live GPS Tracking Enabled</p>
            <p className="text-muted-foreground mt-0.5">
              Follow your order in real-time through all 4 milestones: Placed, Packed, Shipped, and Delivered to your doorstep!
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              setPlaced(false);
              navigate("/cart", { state: { trackOrderId: createdOrderId } });
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 gradient-hero text-primary-foreground px-8 py-3.5 rounded-full font-bold shadow-md hover:opacity-90 transition-opacity"
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

  // Redirect if no items
  if (items.length === 0 && !isBuyNow) {
    navigate("/cart");
    return null;
  }

  const displayItems = items.length > 0 ? items : (lastOrder?.items ?? []);
  const displayTotal = items.length > 0 ? totalPrice : (lastOrder?.totalPrice ?? 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="font-display text-3xl font-extrabold text-foreground mb-8">
        Checkout & Express Delivery
      </h1>

      <form ref={formRef} onSubmit={handleOrder} className="space-y-8">
        {formErrors.submit && (
          <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {formErrors.submit}
          </div>
        )}

        {/* Section 1: Delivery Address (Requirement 4) */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Delivery Address
            </h2>
            {user && (
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                Auto-filled for {user.fullName}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-xs font-semibold text-foreground">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={user?.fullName || ""}
                placeholder="Arikaran K."
                className={`mt-1 text-xs rounded-xl ${formErrors.name ? "border-destructive" : ""}`}
                disabled={isLoading}
              />
              {formErrors.name && <p className="text-xs text-destructive mt-1">{formErrors.name}</p>}
            </div>

            <div>
              <Label htmlFor="phone" className="text-xs font-semibold text-foreground">
                Mobile Number
              </Label>
              <Input
                id="phone"
                name="phone"
                required
                defaultValue={user?.phone || ""}
                placeholder="+91 98765 43210"
                className={`mt-1 text-xs rounded-xl ${formErrors.phone ? "border-destructive" : ""}`}
                disabled={isLoading}
              />
              {formErrors.phone && <p className="text-xs text-destructive mt-1">{formErrors.phone}</p>}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address" className="text-xs font-semibold text-foreground">
                Door No, Flat / Street Address
              </Label>
              <Input
                id="address"
                name="address"
                required
                defaultValue="42, Anna Nagar 2nd Avenue"
                placeholder="42, Anna Nagar 2nd Avenue"
                className={`mt-1 text-xs rounded-xl ${formErrors.address ? "border-destructive" : ""}`}
                disabled={isLoading}
              />
              {formErrors.address && <p className="text-xs text-destructive mt-1">{formErrors.address}</p>}
            </div>

            <div>
              <Label htmlFor="city" className="text-xs font-semibold text-foreground">
                City / Town
              </Label>
              <Input
                id="city"
                name="city"
                required
                defaultValue="Chennai"
                placeholder="Chennai"
                className={`mt-1 text-xs rounded-xl ${formErrors.city ? "border-destructive" : ""}`}
                disabled={isLoading}
              />
              {formErrors.city && <p className="text-xs text-destructive mt-1">{formErrors.city}</p>}
            </div>

            <div>
              <Label htmlFor="zip" className="text-xs font-semibold text-foreground">
                PIN Code
              </Label>
              <Input
                id="zip"
                name="zip"
                required
                defaultValue="600040"
                placeholder="600040"
                className={`mt-1 text-xs rounded-xl ${formErrors.zip ? "border-destructive" : ""}`}
                disabled={isLoading}
              />
              {formErrors.zip && <p className="text-xs text-destructive mt-1">{formErrors.zip}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Delivery Slot Booking (Requirement 12) */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-foreground mb-1 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Delivery Slot Booking
          </h2>
          <p className="text-xs text-muted-foreground mb-5">
            Choose your preferred delivery date and express time window.
          </p>

          {/* Select Date */}
          <div className="mb-5">
            <span className="text-xs font-bold text-foreground block mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" /> Select Delivery Date:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {deliveryDays.map((day) => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => setSelectedDay(day.label)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedDay === day.label
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card hover:bg-muted/40"
                  }`}
                >
                  <p className="font-bold text-xs text-foreground">{day.label}</p>
                  <p className="text-[10px] text-muted-foreground">{day.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Select Time Slot */}
          <div>
            <span className="text-xs font-bold text-foreground block mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" /> Select Preferred Time Slot:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {timeSlots.map((ts) => (
                <button
                  key={ts.id}
                  type="button"
                  onClick={() => setSelectedTimeSlot(ts.time)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedTimeSlot === ts.time
                      ? "border-primary bg-accent text-accent-foreground font-semibold shadow-sm"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-foreground">{ts.label}</p>
                    <p className="text-[11px] text-muted-foreground">{ts.time}</p>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedTimeSlot === ts.time ? "border-primary bg-primary" : "border-border"
                    }`}
                  >
                    {selectedTimeSlot === ts.time && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Payment Method Selection */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Payment Method
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Instant UPI (GPay/Paytm) or Direct Pay on Delivery
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              100% Encrypted
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
                    <p className="font-bold text-sm text-foreground">Online Pay (UPI / QR)</p>
                    <p className="text-xs text-muted-foreground">GPay, Paytm, PhonePe, BHIM</p>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 ${
                    paymentMethod === "online" ? "border-primary bg-primary" : "border-muted-foreground"
                  }`}
                >
                  {paymentMethod === "online" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
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
                    <p className="font-bold text-sm text-foreground">Direct Pay (COD)</p>
                    <p className="text-xs text-muted-foreground">Pay cash or scan rider QR</p>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 ${
                    paymentMethod === "direct" ? "border-primary bg-primary" : "border-muted-foreground"
                  }`}
                >
                  {paymentMethod === "direct" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
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
            <div className="p-4 rounded-xl bg-muted/60 border border-border flex items-start gap-3">
              <Banknote className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-foreground text-sm">Pay at Doorstep</p>
                <p className="text-muted-foreground mt-1">
                  Keep exact cash of <strong className="text-foreground">₹{finalTotal.toFixed(2)}</strong> ready, or pay using any UPI app by scanning our delivery partner's handheld QR scanner upon arrival.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Order Summary & Coupon Breakdown */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold mb-4 text-foreground">
            Order Bill Summary
          </h2>
          <div className="space-y-2.5 text-sm mb-4">
            {displayItems.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {product.name} × {quantity}
                </span>
                <span className="font-semibold text-foreground">
                  ₹{(product.price * quantity).toFixed(2)}
                </span>
              </div>
            ))}

            <div className="border-t border-border pt-2 flex justify-between text-xs">
              <span className="text-muted-foreground">Items Subtotal</span>
              <span className="font-medium text-foreground">₹{displayTotal.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-xs text-emerald-600 font-bold">
                <span>Coupon Savings ({appliedCoupon?.code})</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Express Delivery Fee</span>
              <span className={deliveryFee === 0 ? "text-primary font-bold" : "font-medium"}>
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between font-black text-lg pt-3 border-t border-border text-foreground">
              <span>Final Total Payable</span>
              <span>₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Button for Direct Pay */}
        {paymentMethod === "direct" ? (
          <button
            type="submit"
            disabled={isLoading || displayItems.length === 0}
            className="w-full gradient-hero text-primary-foreground py-4 rounded-full font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Placing Order...
              </>
            ) : (
              <>
                <Banknote className="w-4 h-4" /> Confirm Order with Direct Pay (COD) — ₹
                {finalTotal.toFixed(2)}
              </>
            )}
          </button>
        ) : (
          <p className="text-xs text-center text-muted-foreground">
            Please scan the QR code above or click <strong className="text-foreground">"I Have Paid"</strong> in the scanner to confirm your order.
          </p>
        )}
      </form>
    </div>
  );
};

export default Checkout;
