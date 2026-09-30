import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/auth/AuthProvider";

export function Login() {
  const { login, isAuthenticated } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await login({
        email,
        password,
      });

      const from =
        (
          location.state as {
            from?: string;
          } | null
        )?.from || "/dashboard";

      navigate(from, {
        replace: true,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ??
            error.response?.data?.error?.message ??
            "Invalid email or password",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ================================================== */}
        {/* LEFT - ENGINEERING IMAGE */}
        {/* ================================================== */}

        <div className="relative hidden overflow-hidden lg:block">
          <img
            src="/engineering-service.jpg"
            alt="Muthammal Engineering Services"
            className="absolute inset-0 h-full w-full object-cover object-right"
          />

          {/* Image overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Engineering content */}
          <div className="absolute inset-x-0 bottom-0 p-8 xl:p-12">
            <div className="max-w-lg text-white">
              <h2 className="text-3xl font-semibold tracking-tight xl:text-4xl">
                Engineering Excellence
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-white/85 xl:text-base">
                Delivering reliable engineering solutions, technical expertise,
                and quality services for every project.
              </p>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* RIGHT - LOGIN */}
        {/* ================================================== */}

        <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-10 xl:px-16">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <img
                src="/logo.png"
                alt="Muthammal Engineering"
                className="h-20 w-auto object-contain"
              />
            </div>

            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Muthammal Engineering
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to your admin panel
              </p>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    className="pr-10"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* Footer */}
            <p className="mt-8 text-center text-xs text-muted-foreground">
              Muthammal Engineering
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
