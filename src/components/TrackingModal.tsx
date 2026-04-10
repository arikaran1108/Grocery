import { useState } from "react";
import { X, MapPin, Clock, Truck, CheckCircle, AlertCircle } from "lucide-react";
import type { OrderHistoryItem } from "@/context/CartContext";

interface TrackingModalProps {
  order: OrderHistoryItem;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (status: "Processing" | "Shipped" | "Delivered", location: string) => void;
  onCloseModal: () => void;
}

const mockLocations = [
  { location: "Warehouse - Order confirmed", status: "Processing" as const },
  { location: "Pickup hub - In transit", status: "Shipped" as const },
  { location: "Delivery partner - Out for delivery", status: "Shipped" as const },
  { location: "Delivered to receiver", status: "Delivered" as const },
];

const TrackingModal = ({ order, isOpen, onClose, onUpdateStatus }: TrackingModalProps) => {
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const handleSimulateTracking = () => {
    if (isSimulating) return;
    setIsSimulating(true);

    let nextIndex = currentLocationIndex + 1;
    if (nextIndex >= mockLocations.length) nextIndex = 0;

    setTimeout(() => {
      const nextLocation = mockLocations[nextIndex];
      onUpdateStatus(nextLocation.status, nextLocation.location);
      setCurrentLocationIndex(nextIndex);
      setIsSimulating(false);
    }, 1500);
  };

const getStatusIcon = (status: OrderHistoryItem['status']) => {
    switch (status) {
      case "Processing":
        return <AlertCircle className="w-5 h-5" />;
      case "Shipped":
        return <Truck className="w-5 h-5" />;
      case "Delivered":
        return <CheckCircle className="w-5 h-5" />;
      case "Cancelled":
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl max-w-md w-full p-6 border border-border shadow-lg animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-foreground">Track Order</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close tracking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order ID */}
        <div className="mb-6 pb-4 border-b border-border">
          <p className="text-xs text-muted-foreground mb-1">Order ID</p>
          <p className="font-semibold text-foreground">{order.id}</p>
          <p className="text-xs text-muted-foreground mt-2">{order.date}</p>
        </div>

        {/* Current Status */}
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            {getStatusIcon(order.status)}
            <div>
              <p className="text-sm font-semibold text-foreground">{order.status}</p>
              <p className="text-xs text-muted-foreground">{order.location}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Live Tracking</h3>
          <div className="space-y-4">
            {mockLocations.map((item, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      index <= currentLocationIndex
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-border bg-card"
                    }`}
                  >
                    {index <= currentLocationIndex && (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </div>
                  {index < mockLocations.length - 1 && (
                    <div
                      className={`w-0.5 h-8 ${
                        index < currentLocationIndex ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
                <div className="pb-4">
                  <p className={`text-sm font-medium ${
                    index <= currentLocationIndex
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}>
                    {item.location}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.status === "Delivered" ? "Completed" : "In progress"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Track Progress Button */}
        <button
          onClick={handleSimulateTracking}
          disabled={isSimulating || currentLocationIndex >= mockLocations.length - 1}
          className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
            isSimulating || currentLocationIndex >= mockLocations.length - 1
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "gradient-hero text-primary-foreground hover:opacity-90"
          }`}
        >
          {isSimulating ? "Updating..." : currentLocationIndex >= mockLocations.length - 1 ? "Delivery Complete" : "Update Tracking"}
        </button>

        {/* Live Location Info */}
        <div className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-accent mb-1">Live Location Tracking</p>
              <p>Your order is being tracked in real-time. Updates appear automatically.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingModal;
