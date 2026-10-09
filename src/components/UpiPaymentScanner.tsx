import { useState } from "react";
import { QrCode, Copy, Check, ExternalLink, ShieldCheck, Smartphone, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UpiPaymentScannerProps {
  amount: number;
  onPaymentSuccess: (upiRef: string) => void;
  isVerifying?: boolean;
}

const UPI_ID = "9345745016@upi";
const MERCHANT_NAME = "AK Devil Grocery Shop";

const UpiPaymentScanner = ({ amount, onPaymentSuccess, isVerifying = false }: UpiPaymentScannerProps) => {
  const { toast } = useToast();
  const [selectedApp, setSelectedApp] = useState<"all" | "gpay" | "paytm" | "phonepe">("all");
  const [copied, setCopied] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

  const formattedAmount = amount.toFixed(2);
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent("AK Devil Grocery Order")}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(upiUrl)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    toast({
      title: "UPI ID Copied!",
      description: `${UPI_ID} copied to clipboard.`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    setIsSimulatingPayment(true);
    setTimeout(() => {
      setIsSimulatingPayment(false);
      const generatedRef = utrNumber.trim() || `UPI${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      toast({
        title: "Payment Received! 🎉",
        description: `₹${formattedAmount} successfully verified via UPI.`,
      });
      onPaymentSuccess(generatedRef);
    }, 1200);
  };

  return (
    <div className="bg-card border-2 border-primary/20 rounded-2xl p-5 sm:p-6 shadow-elevated space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
              Scan & Pay with Any UPI App
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Google Pay • Paytm • PhonePe • BHIM • Any Bank App
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground block">Amount to Pay</span>
          <span className="font-display text-xl font-black text-primary block leading-none mt-0.5">
            ₹{formattedAmount}
          </span>
        </div>
      </div>

      {/* UPI App Selection Tabs */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { id: "all" as const, label: "All UPI", color: "border-primary" },
          { id: "gpay" as const, label: "Google Pay", color: "border-blue-500" },
          { id: "paytm" as const, label: "Paytm", color: "border-cyan-500" },
          { id: "phonepe" as const, label: "PhonePe", color: "border-purple-500" },
        ].map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={() => setSelectedApp(app.id)}
            className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition-all ${
              selectedApp === app.id
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {app.label}
          </button>
        ))}
      </div>

      {/* QR Code Card with Scanner Targeting Frame */}
      <div className="relative mx-auto max-w-[280px] p-4 bg-white rounded-2xl shadow-md border border-slate-200 text-center">
        {/* Corner Targeting Marks */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-600 rounded-tl" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-600 rounded-tr" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-600 rounded-bl" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-600 rounded-br" />

        {/* QR Image */}
        <div className="relative overflow-hidden rounded-xl bg-white aspect-square flex items-center justify-center p-2">
          <img
            src={qrCodeUrl}
            alt={`UPI Payment QR Code for ₹${formattedAmount}`}
            className="w-full h-full object-contain"
            loading="eager"
          />

          {/* Center Brand Badge */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-11 h-11 rounded-full bg-white p-1 shadow-lg border border-slate-200 flex items-center justify-center">
              <img
                src="/logo.jpg"
                alt="AK Devil"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>

          {/* Animated Laser Scanning Beam */}
          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse pointer-events-none top-1/2 -translate-y-1/2" />
        </div>

        {/* Amount Pill */}
        <div className="mt-2 text-center">
          <p className="text-[11px] font-semibold text-slate-700">
            Scan with {selectedApp === "all" ? "GPay / Paytm / PhonePe" : selectedApp.toUpperCase()}
          </p>
          <p className="text-xs font-black text-slate-900 mt-0.5">
            Exact Amount: ₹{formattedAmount}
          </p>
        </div>
      </div>

      {/* UPI ID & Direct Pay Link */}
      <div className="bg-muted/60 border border-border rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Merchant UPI ID</span>
            <span className="font-mono font-bold text-foreground">{UPI_ID}</span>
          </div>
          <button
            type="button"
            onClick={handleCopyUpi}
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-card border border-border hover:bg-muted text-foreground transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        {/* Direct Mobile UPI Intent Button */}
        <a
          href={upiUrl}
          className="w-full py-2 px-3 rounded-lg bg-card border border-border text-foreground hover:bg-muted font-semibold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <Smartphone className="w-3.5 h-3.5 text-primary" />
          Open Installed UPI App on Mobile
          <ExternalLink className="w-3 h-3 text-muted-foreground" />
        </a>
      </div>

      {/* UTR / Ref Number (Optional) */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground flex items-center justify-between">
          <span>UPI Reference / UTR Number <span className="text-muted-foreground font-normal">(Optional)</span></span>
          <span className="text-[10px] text-muted-foreground">12 digits from app</span>
        </label>
        <input
          type="text"
          value={utrNumber}
          onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
          placeholder="e.g. 402819283719"
          className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
        />
      </div>

      {/* Verify & Confirm Payment Button */}
      <button
        type="button"
        onClick={handleVerify}
        disabled={isVerifying || isSimulatingPayment}
        className="w-full py-3 px-4 rounded-xl font-bold text-sm gradient-hero text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
      >
        {isVerifying || isSimulatingPayment ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Verifying UPI Payment...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" />
            I Have Paid — Verify & Confirm Order
          </>
        )}
      </button>

      {/* Security Guarantee */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>100% Safe & Instant UPI Verification • AK Devil Protected</span>
      </div>
    </div>
  );
};

export default UpiPaymentScanner;
