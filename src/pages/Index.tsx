import { Link } from "react-router-dom";
import { ArrowRight, Truck, Clock, Shield } from "lucide-react";
import heroImage from "@/assets/hero-groceries.jpg";
import { categories, products } from "@/data/products";
import ProductCard from "@/components/ProductCard";

const Index = () => {
  const featuredProducts = products.filter((p) => p.originalPrice).concat(products.slice(0, 4)).slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Fresh groceries" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-foreground/60" />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-36">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-background mb-4 leading-tight">
              Fresh Groceries,<br />Delivered <span className="text-secondary">Fast</span>
            </h1>
            <p className="text-background/80 text-lg mb-8 max-w-md">
              Get farm-fresh produce and daily essentials delivered to your doorstep in under 30 minutes.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 gradient-hero text-primary-foreground px-8 py-3.5 rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Truck, title: "Free Delivery", desc: "On orders over ₹500" },
            { icon: Clock, title: "30 Min Delivery", desc: "Lightning fast service" },
            { icon: Shield, title: "100% Fresh", desc: "Quality guaranteed" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card rounded-lg p-6 shadow-elevated flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-body font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="font-display text-3xl font-bold text-foreground mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-elevated hover:border-primary/30 transition-all group"
            >
              <span className="text-4xl block mb-3">{cat.emoji}</span>
              <span className="font-body font-medium text-foreground group-hover:text-primary transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-3xl font-bold text-foreground">Featured Products</h2>
          <Link to="/products" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="container mx-auto px-4 pb-16">
        <div className="gradient-hero rounded-2xl p-8 md:p-12 text-primary-foreground text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Get 20% Off Your First Order</h2>
          <p className="opacity-90 mb-6 max-w-md mx-auto">Sign up today and enjoy fresh groceries at unbeatable prices.</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-card text-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
