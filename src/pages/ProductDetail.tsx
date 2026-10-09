import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { ArrowLeft, Plus, Minus, Star, ShoppingCart, ShoppingBag } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { products, items, addToCart, updateQuantity, buyNow } = useCart();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">😕</p>
        <p className="text-muted-foreground mb-4">Product not found</p>
        <Link to="/products" className="text-primary hover:underline">Back to Products</Link>
      </div>
    );
  }

  const cartItem = items.find((i) => i.product.id === product.id);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleBuyNow = () => {
    buyNow(product);
    toast.success(`Ordered "${product.name}" successfully!`);
    navigate("/checkout");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="aspect-square rounded-xl overflow-hidden bg-muted">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-sm text-muted-foreground capitalize mb-2">{product.category}</p>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-secondary text-secondary" : "text-muted"}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{product.rating}</span>
          </div>
          <p className="text-muted-foreground mb-6">{product.description}</p>
          <p className="text-sm text-muted-foreground mb-2">{product.unit}</p>
          <div className="flex items-baseline gap-3 mb-8">
            <span className="text-3xl font-bold text-foreground">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice}</span>
            )}
          </div>

          {cartItem ? (
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3 bg-muted rounded-full px-4 py-2">
                <button onClick={() => updateQuantity(product.id, cartItem.quantity - 1)} className="w-8 h-8 rounded-full bg-card flex items-center justify-center hover:bg-accent transition-colors" aria-label="Decrease quantity">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-semibold w-8 text-center">{cartItem.quantity}</span>
                <button onClick={() => addToCart(product)} className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90" aria-label="Increase quantity">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <Link to="/cart" className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity">
                <ShoppingCart className="w-4 h-4" /> View Cart
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4 flex-wrap">
              <button onClick={() => addToCart(product)} className="inline-flex items-center gap-2 gradient-hero text-primary-foreground px-8 py-3.5 rounded-full font-semibold hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" /> Add to Cart
              </button>
              <button onClick={handleBuyNow} className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-8 py-3.5 rounded-full font-semibold hover:opacity-90 transition-opacity">
                <ShoppingBag className="w-4 h-4" /> Buy Now
              </button>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">Related Products</h2>
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
