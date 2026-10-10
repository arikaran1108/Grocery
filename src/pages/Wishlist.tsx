import { useCart } from "@/hooks/useCart";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2, ArrowRight, ShoppingCart, Plus } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";

const Wishlist = () => {
  const { wishlist, products, addToCart, removeFromWishlist, clearWishlist } = useCart();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleAddAllToCart = () => {
    let addedCount = 0;
    wishlistedProducts.forEach((p) => {
      const stock = p.stock ?? (p.inStock ? 20 : 0);
      if (stock > 0 && p.inStock) {
        addToCart(p);
        addedCount++;
      }
    });
    if (addedCount > 0) {
      toast.success(`Added ${addedCount} available items to your cart!`);
    } else {
      toast.error("No available items in stock to add.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-extrabold text-foreground">
                My Saved Wishlist
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {wishlistedProducts.length} favorite {wishlistedProducts.length === 1 ? "grocery item" : "grocery items"} saved
              </p>
            </div>
          </div>
        </div>

        {wishlistedProducts.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={clearWishlist}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={handleAddAllToCart}
              className="inline-flex items-center gap-2 gradient-hero text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-xs hover:opacity-90 shadow-md"
            >
              <ShoppingCart className="w-4 h-4" /> Move All to Cart
            </button>
          </div>
        )}
      </div>

      {/* Wishlist Items Grid or Empty State */}
      {wishlistedProducts.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-3xl p-8 max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Your Wishlist is Empty
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Click the heart icon on any fresh fruit, vegetable, or pantry item to save your favorites for later!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 gradient-hero text-primary-foreground px-7 py-3 rounded-full font-semibold text-sm hover:opacity-90 shadow-md"
          >
            Browse Fresh Groceries <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
