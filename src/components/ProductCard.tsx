import { Product } from "@/data/products";
import { useCart } from "@/hooks/useCart";
import { Plus, Minus, ShoppingBag, Heart, Star, AlertTriangle, Hourglass, Leaf } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { items, addToCart, updateQuantity, buyNow, toggleWishlist, isInWishlist, getProductEffectivePrice } = useCart();
  const cartItem = items.find((i) => i.product.id === product.id);

  const isWishlisted = isInWishlist(product.id);
  const stock = product.stock ?? (product.inStock ? 20 : 0);
  const isOutOfStock = stock <= 0 || !product.inStock;
  const isLowStock = !isOutOfStock && stock <= 5;
  const isNearExpiry = Boolean(product.isNearExpiry && (product.expiryDiscountPercent ?? 0) > 0);
  const effectivePrice = getProductEffectivePrice(product);

  const handleBuyNow = () => {
    if (isOutOfStock) {
      toast.error(`"${product.name}" is currently out of stock.`);
      return;
    }
    buyNow(product);
    toast.success(`Proceeding to checkout with "${product.name}"!`);
    navigate("/checkout");
  };

  return (
    <div className="group bg-card rounded-2xl border border-border overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col justify-between relative">
      {/* Product Image & Badges */}
      <div className="relative overflow-hidden aspect-square bg-muted/40">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              isOutOfStock ? "grayscale opacity-60" : ""
            }`}
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {/* Requirement 2: Expiry-Based Smart Discount Badge */}
          {isNearExpiry && !isOutOfStock && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 backdrop-blur-xs">
              <Hourglass className="w-2.5 h-2.5" /> {product.expiryDiscountPercent}% OFF • Save Food
            </span>
          )}
          {product.originalPrice && !isNearExpiry && !isOutOfStock && (
            <span className="gradient-warm text-secondary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Sale
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
              Out of Stock
            </span>
          )}
          {isLowStock && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <AlertTriangle className="w-2.5 h-2.5" /> Only {stock} left!
            </span>
          )}
        </div>

        {/* Wishlist Button (Requirement 2) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 backdrop-blur-md shadow-sm ${
            isWishlisted
              ? "bg-rose-500 text-white scale-105 shadow-rose-500/20"
              : "bg-background/80 hover:bg-background text-muted-foreground hover:text-rose-500 hover:scale-110"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? "fill-white" : ""}`} />
        </button>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <span className="bg-background/90 text-foreground font-bold text-xs px-3 py-1 rounded-full border border-border shadow-sm">
              Temporarily Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="capitalize">{product.category}</span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3 h-3 fill-amber-500" />
              <span>{product.rating}</span>
            </div>
          </div>

          <Link to={`/product/${product.id}`}>
            <h3 className="font-body font-semibold text-foreground text-sm leading-tight mb-1 hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center justify-between gap-1 mb-2">
            <p className="text-xs text-muted-foreground">{product.unit}</p>
            {isNearExpiry && (
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                ⏳ {product.daysUntilExpiry ?? 2}d left
              </span>
            )}
          </div>
        </div>

        <div>
          {/* Price & Quantity / Add Controls */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-lg font-bold text-foreground">₹{effectivePrice}</span>
              {isNearExpiry ? (
                <span className="text-xs text-muted-foreground line-through">₹{product.price}</span>
              ) : product.originalPrice ? (
                <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice}</span>
              ) : null}
            </div>

            {isOutOfStock ? (
              <span className="text-xs font-semibold text-destructive">Unavailable</span>
            ) : cartItem ? (
              <div className="flex items-center gap-1.5 bg-muted/60 p-0.5 rounded-full border border-border">
                <button
                  onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                  className="w-6 h-6 rounded-full bg-card flex items-center justify-center hover:bg-accent transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-bold w-5 text-center text-foreground">{cartItem.quantity}</span>
                <button
                  onClick={() => addToCart(product)}
                  disabled={cartItem.quantity >= stock}
                  className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(product)}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:scale-105 transition-all shadow-sm"
                aria-label="Add to cart"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Buy Now Button */}
          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className={`mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
              isOutOfStock
                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                : "bg-secondary text-secondary-foreground hover:opacity-90 active:scale-[0.98]"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {isOutOfStock ? "Out of Stock" : "Buy Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
