"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { X, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function SignInModal({
  open,
  onClose,
  hasGoogle,
}: {
  open: boolean;
  onClose: () => void;
  hasGoogle: boolean;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState<"google" | "demo" | null>(null);

  async function handleGoogle() {
    setLoading("google");
    try {
      await signIn("google", { callbackUrl: window.location.href });
    } finally {
      setLoading(null);
    }
  }

  async function handleDemo(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setLoading("demo");
    try {
      await signIn("demo", {
        email: email.trim().toLowerCase(),
        name: name.trim() || undefined,
        callbackUrl: window.location.href,
      });
    } finally {
      setLoading(null);
    }
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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[min(420px,calc(100vw-2rem))] bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition z-10"
            >
              <X size={20} />
            </button>

            <div className="bg-gradient-to-br from-[#1a3d2b] to-[#0d2818] px-8 pt-10 pb-6 text-white text-center">
              <div className="w-16 h-16 mx-auto bg-[#c9a84c] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#c9a84c]/30">
                <Mail className="text-[#1a3d2b]" size={28} />
              </div>
              <h2 className="font-playfair text-2xl font-bold">Sign in to NomadTrails</h2>
              <p className="text-white/60 text-xs mt-1">Book tours, manage your trips</p>
            </div>

            <div className="p-8 space-y-5">
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
                      <span className="bg-white px-4 text-gray-400 font-bold uppercase tracking-widest">or</span>
                    </div>
                  </div>
                </>
              )}

              <form onSubmit={handleDemo} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                    Quick login {!hasGoogle && "(any email works)"}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a3d2b] focus:outline-none transition text-sm"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name (optional)"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a3d2b] focus:outline-none transition text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading !== null || !email.includes("@")}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#1a3d2b] text-white font-bold text-sm hover:bg-[#0d2818] transition disabled:opacity-50"
                >
                  {loading === "demo" ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      Continue <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                {!hasGoogle && (
                  <>
                    Google OAuth is not configured — using demo login.
                    <br />
                  </>
                )}
                The first user to sign in becomes admin automatically.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
