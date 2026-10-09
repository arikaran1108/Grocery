import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Lock, User, Phone, Loader2, Shield } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import type { UserRole } from "@/context/CartContext";
import { toast } from "sonner";

const SignUp = () => {
  const navigate = useNavigate();
  const { signUp } = useCart();
  const [role, setRole] = useState<UserRole>("customer");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.phone) newErrors.phone = "Phone is required";
    else if (!/^\d{10}$|^\+\d{1,3}\d{9,}$/.test(formData.phone.replace(/\s/g, ""))) newErrors.phone = "Phone is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.confirmPassword !== formData.password) newErrors.confirmPassword = "Passwords don't match";
    if (!agreeTerms) newErrors.terms = "Please accept terms and conditions";
    
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const success = await signUp(
        formData.fullName,
        formData.email,
        formData.phone,
        formData.password,
        role
      );
      
      if (success) {
        toast.success(`Account created as ${role === "admin" ? "Admin" : "Customer"}!`);
        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/logo.jpg"
              alt="AK Devil Grocery Shop Logo"
              className="w-20 h-20 rounded-full object-cover border-2 border-border shadow-lg"
            />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground mt-2">Join AK Devil Grocery Shop with your preferred access</p>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-8 space-y-4 shadow-lg max-h-[85vh] overflow-y-auto">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Select Account Access Level</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("customer")}
                disabled={isLoading}
                className={`p-3 rounded-lg border text-left transition-all ${
                  role === "customer"
                    ? "bg-primary/10 border-primary text-primary ring-1 ring-primary shadow-sm"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <User className="w-4 h-4" /> Customer
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Shop, cart & live GPS order tracking</p>
              </button>

              <button
                type="button"
                onClick={() => setRole("admin")}
                disabled={isLoading}
                className={`p-3 rounded-lg border text-left transition-all ${
                  role === "admin"
                    ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500 shadow-sm"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <Shield className="w-4 h-4" /> Store Admin
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Orders, catalog, dispatch & analytics</p>
              </button>
            </div>
          </div>

          {/* Full Name Field */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-semibold">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Rahul Sharma"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isLoading}
                className={`pl-10 ${errors.fullName ? "border-destructive" : ""}`}
              />
            </div>
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
              />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-semibold">
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                disabled={isLoading}
                className={`pl-10 ${errors.phone ? "border-destructive" : ""}`}
              />
            </div>
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground text-xs disabled:opacity-50"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-semibold">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                className={`pl-10 pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
              />
            </div>
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
          </div>

          {/* Terms & Conditions */}
          <label className="flex items-start gap-2 cursor-pointer mt-4">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                if (errors.terms) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.terms;
                    return newErrors;
                  });
                }
              }}
              disabled={isLoading}
              className="w-4 h-4 rounded border-border mt-1"
            />
            <span className="text-xs text-muted-foreground">
              I agree to the{" "}
              <Link to="#" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="#" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.terms && <p className="text-xs text-destructive">{errors.terms}</p>}

          {/* Sign Up Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-hero text-primary-foreground font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative mt-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isLoading}
              className="border border-border rounded-lg py-2 hover:bg-muted transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>🔵</span>
              <span className="text-sm font-medium">Google</span>
            </button>
            <button
              type="button"
              disabled={isLoading}
              className="border border-border rounded-lg py-2 hover:bg-muted transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>📘</span>
              <span className="text-sm font-medium">Facebook</span>
            </button>
          </div>
        </form>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary font-semibold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
