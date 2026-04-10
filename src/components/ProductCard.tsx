import { Product } from "@/data/products";
import { useCart } from "@/hooks/useCart";
import { Plus, Minus, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { items, addToCart, updateQuantity, buyNow } = useCart();
  const cartItem = items.find((i) => i.product.id === product.id);

  const handleBuyNow = () => {
    buyNow(product);
    toast.success(`Ordered "${product.name}" successfully!`);
    navigate("/checkout");
  };

  return (
    <div className="group bg-card rounded-lg border border-border overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300">
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-square">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.originalPrice && (
          <span className="absolute top-3 left-3 gradient-warm text-secondary-foreground text-xs font-semibold px-2 py-1 rounded-full">
            Sale
          </span>
        )}
      </Link>
      <div className="p-4">
        <p className="text-xs text-muted-foreground capitalize mb-1">{product.category}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-body font-semibold text-foreground text-sm leading-tight mb-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground mb-3">{product.unit}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice}</span>
            )}
          </div>
          {cartItem ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-semibold w-5 text-center">{cartItem.quantity}</span>
              <button
                onClick={() => addToCart(product)}
                className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product)}
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity"
              aria-label="Add to cart"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={handleBuyNow}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <ShoppingBag className="w-3.5 h-3.5" /> Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
