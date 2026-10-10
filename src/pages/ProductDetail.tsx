import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import {
  ArrowLeft,
  Plus,
  Minus,
  Star,
  ShoppingCart,
  ShoppingBag,
  Heart,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  MessageSquare,
  ThumbsUp,
  CalendarDays,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    products,
    items,
    addToCart,
    updateQuantity,
    buyNow,
    toggleWishlist,
    isInWishlist,
    reviews,
    addReview,
    getProductReviews,
    user,
    getProductEffectivePrice,
    addToWeeklyPlan,
  } = useCart();

  const product = products.find((p) => p.id === id);

  // Review Form State
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState(user?.fullName || "");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">😕</p>
        <p className="text-muted-foreground mb-4">Product not found</p>
        <Link to="/products" className="text-primary hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const stock = product.stock ?? (product.inStock ? 20 : 0);
  const isOutOfStock = stock <= 0 || !product.inStock;
  const isLowStock = !isOutOfStock && stock <= 5;
  const isNearExpiry = Boolean(product.isNearExpiry && (product.expiryDiscountPercent ?? 0) > 0);
  const effectivePrice = getProductEffectivePrice(product);

  const cartItem = items.find((i) => i.product.id === product.id);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  // Requirement 14: Frequently Bought Together Bundle
  const bundleItems = products
    .filter((p) => p.id !== product.id && (p.stock ?? 20) > 0)
    .slice(0, 2);
  const bundlePrice = effectivePrice + bundleItems.reduce((s, b) => s + getProductEffectivePrice(b), 0);
  const bundleDiscountedPrice = Math.round(bundlePrice * 0.9); // 10% bundle discount

  const handleAddBundleToCart = () => {
    addToCart(product);
    bundleItems.forEach((item) => addToCart(item));
    toast.success(`Bundle added to cart! Saved ₹${bundlePrice - bundleDiscountedPrice} with bundle deal.`);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      toast.error(`"${product.name}" is currently out of stock.`);
      return;
    }
    buyNow(product);
    toast.success(`Proceeding to checkout with "${product.name}"!`);
    navigate("/checkout");
  };

  const productReviews = getProductReviews(product.id);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      toast.error("Please provide a title and detailed feedback.");
      return;
    }
    setIsSubmittingReview(true);
    addReview({
      productId: product.id,
      userName: reviewerName.trim() || (user ? user.fullName : "Verified Customer"),
      rating: newRating,
      title: reviewTitle.trim(),
      comment: reviewComment.trim(),
      verifiedPurchase: true,
    });
    setReviewTitle("");
    setReviewComment("");
    setIsSubmittingReview(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      {/* Main Product Showcase */}
      <div className="grid md:grid-cols-2 gap-10 mb-16 items-start">
        {/* Left: Product Image & Badges */}
        <div className="relative rounded-3xl overflow-hidden bg-muted/40 border border-border shadow-md group">
          <img
            src={product.image}
            alt={product.name}
            className={`w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500 ${
              isOutOfStock ? "grayscale opacity-75" : ""
            }`}
          />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {isNearExpiry && !isOutOfStock && (
              <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1.5">
                ⏳ {product.expiryDiscountPercent}% OFF • Save Food
              </span>
            )}
            {product.originalPrice && !isNearExpiry && !isOutOfStock && (
              <span className="gradient-warm text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-md">
                Special Offer
              </span>
            )}
            {isOutOfStock ? (
              <span className="bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full shadow-md">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Only {stock} units left!
              </span>
            ) : (
              <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({stock} available)
              </span>
            )}
          </div>

          {/* Wishlist Button (Requirement 2) */}
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md backdrop-blur-md ${
              isWishlisted
                ? "bg-rose-500 text-white scale-105 shadow-rose-500/20"
                : "bg-background/80 hover:bg-background text-muted-foreground hover:text-rose-500 hover:scale-110"
            }`}
            aria-label={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
          >
            <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? "fill-white" : ""}`} />
          </button>
        </div>

        {/* Right: Product Details & Purchase Actions */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-md">
              {product.category}
            </span>
            <span className="text-xs text-muted-foreground">• Fast 30-min Delivery</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground mb-3 leading-tight">
            {product.name}
          </h1>

          {/* Star Rating & Reviews Summary */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating) ? "fill-amber-500 text-amber-500" : "text-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-foreground">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">
              ({productReviews.length} customer {productReviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-4xl font-black text-foreground">₹{effectivePrice}</span>
            {isNearExpiry ? (
              <>
                <span className="text-xl text-muted-foreground line-through">₹{product.price}</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Save ₹{product.price - effectivePrice} ({product.expiryDiscountPercent}% OFF)
                </span>
              </>
            ) : product.originalPrice ? (
              <>
                <span className="text-xl text-muted-foreground line-through">₹{product.originalPrice}</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Save ₹{product.originalPrice - product.price}
                </span>
              </>
            ) : null}
          </div>

          {/* Expiry Deal Banner */}
          {isNearExpiry && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
              <span className="text-xl">🌱</span>
              <div>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  Zero Food Waste Smart Deal
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Best before: <strong>{product.daysUntilExpiry ?? 2} days</strong> ({product.expiryDate ?? "Soon"}). Quality inspected, fresh to consume, and discounted to reduce food waste.
                </p>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground font-semibold mb-4">Unit: {product.unit}</p>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6 bg-card p-4 rounded-2xl border border-border">
            {product.description}
          </p>

          {/* Stock Availability Indicator (Requirement 8) */}
          <div className="mb-6 p-3.5 rounded-xl border flex items-center gap-3 bg-muted/40">
            {isOutOfStock ? (
              <>
                <div className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                  ✕
                </div>
                <div>
                  <p className="text-xs font-bold text-destructive">Currently Out of Stock</p>
                  <p className="text-[11px] text-muted-foreground">
                    This grocery item is being restocked by the farm. Check back shortly.
                  </p>
                </div>
              </>
            ) : isLowStock ? (
              <>
                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-600">Hurry! Only {stock} units left in stock</p>
                  <p className="text-[11px] text-muted-foreground">High demand product. Order before stock runs out.</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-600">Fresh Stock Available ({stock} items in inventory)</p>
                  <p className="text-[11px] text-muted-foreground">Packed & dispatched in temperature-controlled bags.</p>
                </div>
              </>
            )}
          </div>

          {/* Cart & Buy Buttons */}
          <div className="space-y-3 mb-8">
            {cartItem ? (
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-3 bg-muted rounded-full px-4 py-2 border border-border">
                  <button
                    onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-card flex items-center justify-center hover:bg-accent transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold w-8 text-center text-foreground">{cartItem.quantity}</span>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={cartItem.quantity >= stock}
                    className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Link
                  to="/cart"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4" /> View in Cart ({cartItem.quantity})
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3.5 flex-wrap">
                <button
                  onClick={() => addToCart(product)}
                  disabled={isOutOfStock}
                  className={`inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold transition-all shadow-md ${
                    isOutOfStock
                      ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                      : "gradient-hero text-primary-foreground hover:opacity-90 active:scale-[0.98]"
                  }`}
                >
                  <Plus className="w-4 h-4" /> {isOutOfStock ? "Unavailable" : "Add to Cart"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold transition-all shadow-md ${
                    isOutOfStock
                      ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                      : "bg-secondary text-secondary-foreground hover:opacity-90 active:scale-[0.98]"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" /> Buy Now
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3.5 rounded-full border transition-all ${
                    isWishlisted
                      ? "bg-rose-50 border-rose-300 text-rose-500"
                      : "border-border hover:bg-muted text-muted-foreground"
                  }`}
                  title={isWishlisted ? "In Wishlist" : "Save to Wishlist"}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? "fill-rose-500" : ""}`} />
                </button>
                <button
                  onClick={() => addToWeeklyPlan(product.id, 1, "All Week")}
                  className="p-3.5 rounded-full border border-border hover:bg-muted text-muted-foreground hover:text-primary transition-all"
                  title="Add to Weekly Recurring Plan"
                >
                  <CalendarDays className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Quality Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-muted/30">
              <Truck className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">30-Min Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-muted/30">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">100% Quality Checked</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-muted/30">
              <RotateCcw className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">Hassle-free Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Requirement 14: Frequently Bought Together Bundle */}
      {bundleItems.length > 0 && !isOutOfStock && (
        <div className="mb-16 bg-card border-2 border-primary/20 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Frequently Bought Together
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            Pair & Save Deal
          </h2>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              {/* Product 1 */}
              <div className="flex items-center gap-2.5 bg-muted/40 p-2.5 rounded-2xl border border-border">
                <img src={product.image} alt={product.name} className="w-14 h-14 rounded-xl object-cover" />
                <div>
                  <p className="text-xs font-bold text-foreground line-clamp-1">{product.name}</p>
                  <p className="text-xs font-semibold text-primary">₹{product.price}</p>
                </div>
              </div>

              <span className="text-lg font-bold text-muted-foreground">+</span>

              {/* Bundled Items */}
              {bundleItems.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2.5 bg-muted/40 p-2.5 rounded-2xl border border-border">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover" />
                    <div>
                      <p className="text-xs font-bold text-foreground line-clamp-1">{item.name}</p>
                      <p className="text-xs font-semibold text-primary">₹{item.price}</p>
                    </div>
                  </div>
                  {idx < bundleItems.length - 1 && (
                    <span className="text-lg font-bold text-muted-foreground">+</span>
                  )}
                </div>
              ))}
            </div>

            {/* Bundle Action */}
            <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/20 shrink-0">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-foreground">₹{bundleDiscountedPrice}</span>
                  <span className="text-sm text-muted-foreground line-through">₹{bundlePrice}</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 block">
                  10% Bundle Discount Applied!
                </span>
              </div>
              <button
                onClick={handleAddBundleToCart}
                className="gradient-hero text-primary-foreground px-5 py-2.5 rounded-full text-xs font-bold hover:opacity-90 shadow-md whitespace-nowrap"
              >
                Add 3 Items to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Requirement 11: Product Reviews & Customer Feedback */}
      <div className="mb-16 bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2.5">
              <MessageSquare className="w-6 h-6 text-primary" /> Customer Reviews & Ratings
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Real verified opinions from happy shoppers in your neighborhood
            </p>
          </div>

          <div className="flex items-center gap-4 bg-muted/40 px-4 py-2 rounded-2xl border border-border">
            <div className="text-center">
              <span className="text-2xl font-black text-foreground">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground block">out of 5</span>
            </div>
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating) ? "fill-amber-500 text-amber-500" : "text-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Write a Review Form */}
          <div className="bg-muted/30 border border-border rounded-2xl p-6 h-fit">
            <h3 className="font-display text-base font-bold text-foreground mb-1">
              Write a Review
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Share your feedback on quality, freshness, and delivery.
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Rating Select */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Your Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-amber-500 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= (hoverRating || newRating)
                            ? "fill-amber-500 text-amber-500"
                            : "text-muted"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-foreground ml-2">
                    {hoverRating || newRating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="Your Name (e.g. Ramesh K.)"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Super sweet & fresh!"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Your Detailed Feedback
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tell us what you liked about the freshness, taste, and packaging..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full gradient-hero text-primary-foreground py-2.5 rounded-xl font-bold text-xs hover:opacity-90 transition-opacity shadow-sm"
              >
                Submit Review
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="md:col-span-2 space-y-4">
            {productReviews.length === 0 ? (
              <div className="text-center py-12 bg-muted/20 border border-border rounded-2xl">
                <Star className="w-10 h-10 text-muted mx-auto mb-2" />
                <p className="font-semibold text-foreground text-sm">No reviews yet for this product</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Be the first verified customer to share your thoughts!
                </p>
              </div>
            ) : (
              productReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-muted/20 border border-border hover:border-primary/20 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                        {rev.userName[0]?.toUpperCase() || "U"}
                      </div>
                      <span className="font-bold text-xs text-foreground">{rev.userName}</span>
                      {rev.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">{rev.date}</span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? "fill-amber-500 text-amber-500" : "text-muted"
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-foreground ml-1.5">{rev.title}</span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Related Products Grid */}
      {related.length > 0 && (
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            Related Products in {product.category.toUpperCase()}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
