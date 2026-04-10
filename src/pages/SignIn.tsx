import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Lock, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

const SignIn = () => {
  const navigate = useNavigate();
  const { signIn } = useCart();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
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
        navigate("/");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <span className="text-5xl">🥬</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your FreshCart account</p>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-8 space-y-6 shadow-lg">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
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
                className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
              />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
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
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
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

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" disabled={isLoading} className="w-4 h-4 rounded border-border" />
              <span className="text-muted-foreground">Remember me</span>
            </label>
            <Link to="#" className="text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-hero text-primary-foreground font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
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

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Sign up here
            </Link>
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="text-center">
            <div className="text-2xl mb-2">🚀</div>
            <p className="text-xs font-medium text-muted-foreground">Fast Delivery</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">✅</div>
            <p className="text-xs font-medium text-muted-foreground">Fresh Products</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">💳</div>
            <p className="text-xs font-medium text-muted-foreground">Secure Payment</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;

