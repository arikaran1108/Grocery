import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Lock, Loader2, Shield, User as UserIcon } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

const SignIn = () => {
  const navigate = useNavigate();
  const { signIn, loginAsDemo } = useCart();
  const [roleTab, setRoleTab] = useState<"customer" | "admin">("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleRoleTabChange = (role: "customer" | "admin") => {
    setRoleTab(role);
    if (role === "admin") {
      setEmail("admin@akdevil.com");
      setPassword("admin123");
    } else {
      setEmail("customer@gmail.com");
      setPassword("customer123");
    }
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 4) newErrors.password = "Password must be at least 4 characters";
    return newErrors;
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
      const success = await signIn(email, password);
      if (success) {
        toast.success("Signed in successfully!");
        if (email.toLowerCase().includes("admin") || roleTab === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        toast.error("Invalid email or password");
        setPassword("");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (role: "customer" | "admin") => {
    loginAsDemo(role);
    if (role === "admin") {
      toast.success("Logged in with Store Admin Privileges! 🛡️");
      navigate("/admin");
    } else {
      toast.success("Logged in with Customer / Shopper Access! 🛍️");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/logo.jpg"
              alt="AK Devil Grocery Shop Logo"
              className="w-20 h-20 rounded-full object-cover border-2 border-border shadow-lg"
            />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Access AK Devil Grocery as a Customer or Admin
          </p>
        </div>

        {/* 1-Click Demo Buttons for Fast Evaluation */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-2.5">
          <p className="text-xs font-semibold text-foreground text-center">
            🚀 1-Click Instant Demo Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo("customer")}
              className="p-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <UserIcon className="w-3.5 h-3.5" /> Customer Access
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("admin")}
              className="p-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" /> Admin Access
            </button>
          </div>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-5 shadow-lg">
          {/* Account Type Selector Tab */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => handleRoleTabChange("customer")}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                roleTab === "customer"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" /> People / Customer
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabChange("admin")}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                roleTab === "admin"
                  ? "bg-card text-amber-600 dark:text-amber-400 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Store Admin
            </button>
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                disabled={isLoading}
                className={`pl-9 text-xs ${errors.email ? "border-destructive" : ""}`}
              />
            </div>
            {errors.email && <p className="text-[11px] text-destructive">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                disabled={isLoading}
                className={`pl-9 pr-10 text-xs ${errors.password ? "border-destructive" : ""}`}
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
            {errors.password && <p className="text-[11px] text-destructive">{errors.password}</p>}
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-hero text-primary-foreground font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In as {roleTab === "admin" ? "Admin" : "Customer"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          {/* Hint */}
          <div className="text-[11px] text-muted-foreground text-center bg-muted/40 p-2 rounded-lg">
            {roleTab === "admin" ? (
              <span>🛡️ Admin account unlocks product inventory, store analytics, and dispatch control.</span>
            ) : (
              <span>🛍️ Customer account enables purchasing, shopping cart, and live order tracking.</span>
            )}
          </div>
        </form>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-muted-foreground text-xs">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-bold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
