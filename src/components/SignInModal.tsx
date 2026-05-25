"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

type Mode = "login" | "register";

export default function SignInModal({
  open,
  onClose,
  hasGoogle,
}: {
  open: boolean;
  onClose: () => void;
  hasGoogle: boolean;
}) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState<"google" | "credentials" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function reset() {
    setError(null);
    setSuccess(null);
  }

  async function handleGoogle() {
    reset();
    setLoading("google");
    try {
      await signIn("google", { callbackUrl: window.location.href });
    } catch (e: any) {
      setError(e?.message || "Google sign-in failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    reset();
    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading("credentials");

    try {
      if (mode === "register") {
        // Step 1: create account
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Registration failed");
          setLoading(null);
          return;
        }
        setSuccess("Account created! Signing you in...");
      }

      // Step 2: sign in with credentials (works for both login and just-registered)
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          mode === "login"
            ? "Invalid email or password"
            : "Account created but sign-in failed. Try logging in."
        );
        setLoading(null);
        return;
      }

      // Success — refresh the page to pick up new session
      window.location.reload();
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
      setLoading(null);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    reset();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[min(440px,calc(100vw-2rem))] max-h-[calc(100vh-2rem)] overflow-y-auto bg-white rounded-3xl shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition z-10"
            >
              <X size={20} />
            </button>

            <div className="bg-gradient-to-br from-[#1a3d2b] to-[#0d2818] px-8 pt-10 pb-6 text-white text-center">
              <div className="w-16 h-16 mx-auto bg-[#c9a84c] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#c9a84c]/30">
                {mode === "login" ? (
                  <Lock className="text-[#1a3d2b]" size={28} />
                ) : (
                  <UserIcon className="text-[#1a3d2b]" size={28} />
                )}
              </div>
              <h2 className="font-playfair text-2xl font-bold">
                {mode === "login" ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-white/60 text-xs mt-1">
                {mode === "login"
                  ? "Sign in to manage your bookings"
                  : "Join NomadTrails and start your journey"}
              </p>
            </div>

            {/* Mode tabs */}
            <div className="grid grid-cols-2 border-b border-gray-100">
              <button
                onClick={() => switchMode("login")}
                className={`py-4 font-bold text-sm transition relative ${
                  mode === "login"
                    ? "text-[#1a3d2b]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Sign In
                {mode === "login" && (
                  <motion.div
                    layoutId="auth-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c9a84c]"
                  />
                )}
              </button>
              <button
                onClick={() => switchMode("register")}
                className={`py-4 font-bold text-sm transition relative ${
                  mode === "register"
                    ? "text-[#1a3d2b]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Register
                {mode === "register" && (
                  <motion.div
                    layoutId="auth-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c9a84c]"
                  />
                )}
              </button>
            </div>

            <div className="p-8 space-y-4">
              {hasGoogle && (
                <>
                  <button
                    onClick={handleGoogle}
                    disabled={loading !== null}
                    className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 font-bold text-sm transition disabled:opacity-50"
                  >
                    {loading === "google" ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    )}
                    Continue with Google
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-4 text-gray-400 font-bold uppercase tracking-widest">
                        or
                      </span>
                    </div>
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === "register" && (
                  <div className="relative">
                    <UserIcon
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      autoComplete="name"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a3d2b] focus:outline-none transition text-sm"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete={mode === "login" ? "username" : "email"}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a3d2b] focus:outline-none transition text-sm"
                  />
                </div>

                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      mode === "register" ? "Password (min 6 chars)" : "Password"
                    }
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    required
                    minLength={6}
                    className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a3d2b] focus:outline-none transition text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-100 rounded-lg p-3 text-xs">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-start gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-xs">
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                    <span>{success}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading !== null}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#1a3d2b] text-white font-bold text-sm hover:bg-[#0d2818] transition disabled:opacity-50"
                >
                  {loading === "credentials" ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : mode === "login" ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              <p className="text-xs text-gray-400 text-center">
                {mode === "login" ? (
                  <>
                    No account?{" "}
                    <button
                      onClick={() => switchMode("register")}
                      className="text-[#1a3d2b] font-bold hover:underline"
                    >
                      Register here
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => switchMode("login")}
                      className="text-[#1a3d2b] font-bold hover:underline"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
