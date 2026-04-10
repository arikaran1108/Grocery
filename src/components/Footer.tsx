import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🥬</span>
              <span className="font-display text-xl font-bold">FreshCart</span>
            </div>
            <p className="text-sm opacity-70">Fresh groceries delivered to your doorstep in under 30 minutes.</p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/about" className="hover:opacity-100 transition-opacity">About Us</Link></li>
              <li><Link to="/products" className="hover:opacity-100 transition-opacity">Products</Link></li>
              <li><Link to="/contact" className="hover:opacity-100 transition-opacity">Contact</Link></li>
              <li><Link to="#" className="hover:opacity-100 transition-opacity">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/signin" className="hover:opacity-100 transition-opacity">Sign In</Link></li>
              <li><Link to="/signup" className="hover:opacity-100 transition-opacity">Create Account</Link></li>
              <li><Link to="/cart" className="hover:opacity-100 transition-opacity">My Orders</Link></li>
              <li><Link to="#" className="hover:opacity-100 transition-opacity">Wishlist</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li>📧 arikaran1108@gmail.com</li>
              <li>📞 9345745016</li>
              <li>📍 Ak Grocery Store, 32 Egmore, Chennai</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm opacity-50">
          © 2026 FreshCart. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
