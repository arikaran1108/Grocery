import { useState, useEffect, useRef } from "react";
import {
  X,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Phone,
  MessageSquare,
  Navigation,
  ShieldCheck,
  Bike,
  Package,
} from "lucide-react";
import { TRACKING_STAGES, type OrderHistoryItem, type TrackingStage } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

interface TrackingModalProps {
  order: OrderHistoryItem;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (status: "Processing" | "Shipped" | "Delivered", location: string) => void;
  onCloseModal?: () => void;
}

const getStageIndexFromOrder = (order: OrderHistoryItem): number => {
  if (order.status === "Delivered") return 3;
  if (order.location) {
    if (order.location.includes("Delivered")) return 3;
    if (order.location.includes("Delivery partner") || order.location.includes("Out for delivery")) return 2;
    if (order.location.includes("Pickup hub") || order.location.includes("In transit")) return 1;
    if (order.location.includes("Warehouse")) return 0;
  }
  if (order.status === "Shipped") return 1;
  return 0;
};

const UPDATE_INTERVAL_SECONDS = 5;

const TrackingModal = ({ order, isOpen, onClose, onUpdateStatus }: TrackingModalProps) => {
  const { toast } = useToast();
  const initialIndex = getStageIndexFromOrder(order);
  const [currentStageIndex, setCurrentStageIndex] = useState(initialIndex);
  const [isAutoTracking, setIsAutoTracking] = useState(true);
  const [countdown, setCountdown] = useState(UPDATE_INTERVAL_SECONDS);
  const prevStageRef = useRef(initialIndex);

  // Sync stage if order changes externally
  useEffect(() => {
    if (isOpen) {
      const idx = getStageIndexFromOrder(order);
      setCurrentStageIndex(idx);
      prevStageRef.current = idx;
      if (idx >= TRACKING_STAGES.length - 1) {
        setIsAutoTracking(false);
      } else {
        setIsAutoTracking(true);
        setCountdown(UPDATE_INTERVAL_SECONDS);
      }
    }
  }, [isOpen, order.id, order.location, order.status]);

  // Automatic countdown & stage advancement timer
  useEffect(() => {
    if (!isOpen || !isAutoTracking || currentStageIndex >= TRACKING_STAGES.length - 1) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Advance to next stage automatically
          const nextIndex = currentStageIndex + 1;
          if (nextIndex < TRACKING_STAGES.length) {
            const nextStage = TRACKING_STAGES[nextIndex];
            setCurrentStageIndex(nextIndex);
            onUpdateStatus(nextStage.status, nextStage.location);

            // Inform user with live notification
            toast({
              title: `Live Update: ${nextStage.title}`,
              description: nextStage.description,
            });

            if (nextIndex >= TRACKING_STAGES.length - 1) {
              setIsAutoTracking(false);
            }
          }
          return UPDATE_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isAutoTracking, currentStageIndex, onUpdateStatus, toast]);

  if (!isOpen) return null;

  const currentStage: TrackingStage = TRACKING_STAGES[currentStageIndex];
  const isDelivered = currentStageIndex >= TRACKING_STAGES.length - 1;

  const handleNextStep = () => {
    if (currentStageIndex < TRACKING_STAGES.length - 1) {
      const nextIndex = currentStageIndex + 1;
      const nextStage = TRACKING_STAGES[nextIndex];
      setCurrentStageIndex(nextIndex);
      setCountdown(UPDATE_INTERVAL_SECONDS);
      onUpdateStatus(nextStage.status, nextStage.location);

      toast({
        title: `Live Update: ${nextStage.title}`,
        description: nextStage.description,
      });

      if (nextIndex >= TRACKING_STAGES.length - 1) {
        setIsAutoTracking(false);
      }
    }
  };

  const handleResetSimulation = () => {
    const firstStage = TRACKING_STAGES[0];
    setCurrentStageIndex(0);
    setCountdown(UPDATE_INTERVAL_SECONDS);
    setIsAutoTracking(true);
    onUpdateStatus(firstStage.status, firstStage.location);

    toast({
      title: "Live Tracking Reset",
      description: "Restarted real-time tracking simulation from AK Devil Hub.",
    });
  };

  const handleCallRider = () => {
    toast({
      title: "Connecting Call 📞",
      description: "Calling rider Arun Kumar (+91 93457 45016)...",
    });
  };

  const handleMessageRider = () => {
    toast({
      title: "Rider Message 💬",
      description: "Rider note: 'Arriving quickly with your fresh items!'",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-card rounded-2xl max-w-xl w-full p-5 sm:p-6 border border-border shadow-2xl animate-fade-in my-auto max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block animate-ping absolute -top-0.5 -right-0.5" />
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Navigation className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">
                  Live Order Tracking
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  ● Live GPS
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Order <span className="font-semibold text-foreground">{order.id}</span> • {order.date}
                {order.paymentMethod && (
                  <span className="ml-2 font-medium text-primary">
                    • {order.paymentMethod === "Online UPI" ? "💳 UPI Paid" : "💵 Direct Pay"}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close tracking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Automatic Status & Countdown Banner */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-primary/10 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {isDelivered ? "Delivered" : "Automatic Live Tracking"}
              </span>
              {!isDelivered && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-card/80 border border-border font-medium text-foreground">
                  ETA: {currentStage.eta}
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-foreground mt-1">
              {currentStage.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentStage.description}
            </p>
          </div>

          {/* Auto update toggle & Countdown display */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/50">
            {!isDelivered ? (
              <>
                <button
                  onClick={() => setIsAutoTracking(!isAutoTracking)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isAutoTracking
                      ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                  title={isAutoTracking ? "Click to pause auto-updating" : "Click to resume auto-updating"}
                >
                  {isAutoTracking ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  {isAutoTracking ? "Auto: ON" : "Auto: Paused"}
                </button>
                {isAutoTracking && (
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-primary" />
                    <span>Next update in {countdown}s</span>
                  </div>
                )}
              </>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Order Completed
              </span>
            )}
          </div>
        </div>

        {/* Live Automatic Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5 font-medium">
            <span>Trip Progress</span>
            <span className="text-primary font-bold">{currentStage.progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-primary to-emerald-400 transition-all duration-700 ease-out rounded-full relative"
              style={{ width: `${currentStage.progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Simulated Route Visualization */}
        <div className="mt-5 p-4 rounded-xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
              Active Delivery Route
            </span>
            <span className="text-[11px] text-primary flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Egmore, Chennai
            </span>
          </div>

          {/* Interactive Road Line */}
          <div className="relative py-4 px-2">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1.5 bg-muted rounded-full" />
            <div
              className="absolute left-6 top-1/2 -translate-y-1/2 h-1.5 bg-emerald-500 transition-all duration-700 ease-out rounded-full"
              style={{ width: `${Math.max(0, (currentStageIndex / (TRACKING_STAGES.length - 1)) * 88)}%` }}
            />

            <div className="relative flex justify-between items-center z-10">
              {TRACKING_STAGES.map((stage, idx) => {
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCurrent
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110 shadow-lg"
                          : isPassed
                          ? "bg-emerald-500 text-white"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {idx === 0 && <Package className="w-4 h-4" />}
                      {idx === 1 && <Truck className="w-4 h-4" />}
                      {idx === 2 && <Bike className="w-4 h-4" />}
                      {idx === 3 && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <span
                      className={`text-[10px] mt-2 font-medium text-center max-w-[70px] leading-tight ${
                        isCurrent ? "text-primary font-bold" : isPassed ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {idx === 0 && "1. Placed"}
                      {idx === 1 && "2. Packed"}
                      {idx === 2 && "3. Shipped"}
                      {idx === 3 && "4. Delivered"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Delivery Partner Details Card */}
        <div className="mt-4 p-4 rounded-xl bg-muted/60 border border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0">
              AK
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground truncate">
                  K. Arun Kumar
                </p>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold shrink-0">
                  ⭐ 4.9
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                AK Devil Express Rider • TVS iQube (TN-02-AK-2026)
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                {isDelivered ? "Delivered successfully" : "Speed: 28 km/h • On Fastest Route"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCallRider}
              className="p-2 rounded-lg bg-card border border-border hover:bg-muted text-foreground transition-colors"
              title="Call Rider"
            >
              <Phone className="w-4 h-4 text-primary" />
            </button>
            <button
              onClick={handleMessageRider}
              className="p-2 rounded-lg bg-card border border-border hover:bg-muted text-foreground transition-colors"
              title="Message Rider"
            >
              <MessageSquare className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>

        {/* Detailed Timeline Steps */}
        <div className="mt-5 space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Live Milestone Log
          </h3>
          <div className="space-y-3 border-l-2 border-border ml-3 pl-4">
            {TRACKING_STAGES.map((stage, idx) => {
              const isPassed = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div key={idx} className="relative group">
                  {/* Dot */}
                  <div
                    className={`absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                      isCurrent
                        ? "bg-primary border-primary ring-4 ring-primary/20 scale-125"
                        : isPassed
                        ? "bg-emerald-500 border-emerald-500"
                        : "bg-card border-muted-foreground/30"
                    }`}
                  />
                  <div>
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm font-semibold ${
                          isCurrent
                            ? "text-primary font-bold"
                            : isPassed
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {stage.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {isPassed ? (isCurrent ? "In Progress" : "Completed") : "Pending"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stage.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Simulation Interactive Controls */}
        <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-center gap-2">
          {!isDelivered ? (
            <button
              onClick={handleNextStep}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs gradient-hero text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm"
            >
              <SkipForward className="w-4 h-4" /> Fast Forward Next Step
            </button>
          ) : (
            <button
              onClick={handleResetSimulation}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Replay Live Tracking
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl font-semibold text-xs bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            Close
          </button>
        </div>

        {/* Safety & Quality Guarantee */}
        <div className="mt-3 text-center">
          <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            100% Temperature-Controlled Delivery • Freshness Guaranteed by AK Devil
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrackingModal;
