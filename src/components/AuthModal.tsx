import React, { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff, CheckCircle2, HelpCircle, ArrowRight, Circle as Icon } from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface AuthModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultMode?: "signin" | "signup";
  onSuccess?: () => void;
}

export function AuthModal({
  open = false,
  onOpenChange = () => {},
  defaultMode = "signin",
  onSuccess = () => {},
}: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);

  useEffect(() => {
    if (open) setMode(defaultMode);
  }, [open, defaultMode]);

  const strength = useMemo(() => {
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];
    return { score: checks.filter(Boolean).length, items: checks };
  }, [password]);

  const validate = () => {
    if (!email.trim() || !password.trim()) return "Email and password are required.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email address.";
    if (mode === "signup" && name.trim().length < 2) return "Please enter your full name.";
    if (mode === "signup" && strength.score < 4) return "Use a stronger password.";
    return "";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) return toast.error(error);
    setLoading(true);
    try {
      const endpoint = mode === "signin" ? "/api/auth/sign-in" : "/api/auth/sign-up";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message ?? "Authentication failed.");
      toast.success(mode === "signin" ? "Welcome back." : "Account created.");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const requestReset = async () => {
    if (!email.trim()) return toast.error("Enter your email first.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Unable to send reset link.");
      toast.success("Password reset link sent.");
      setForgot(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  const strengthLabel = ["Very weak", "Weak", "Fair", "Good", "Strong"][Math.max(0, strength.score - 1)] ?? "Very weak";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 outline-none">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden border border-[#CFC5B8] bg-[#FAF9F6] text-[#1C1C1C] shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
          >
            <div className="flex items-start justify-between border-b border-[#CFC5B8] px-5 py-4">
              <div className="min-w-0">
                <Dialog.Title className="font-['Playfair_Display'] text-2xl font-medium tracking-tight">
                  {forgot ? "Reset Password" : mode === "signin" ? "Welcome Back" : "Create Account"}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-[#68625C]">
                  {forgot ? "We’ll send a secure reset link to your inbox." : "Access your orders, wishlist, and checkout faster."}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center border border-[#CFC5B8] text-[#1C1C1C] transition-colors hover:bg-[#8B0000] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            <div className="px-5 pt-4">
              <div className="flex gap-2 border-b border-[#CFC5B8]">
                {(["signin", "signup"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setMode(item);
                      setForgot(false);
                    }}
                    className={cn(
                      "border-b-2 px-1 py-3 text-xs font-semibold uppercase tracking-[0.22em] transition-colors",
                      mode === item && !forgot
                        ? "border-[#8B0000] text-[#1C1C1C]"
                        : "border-transparent text-[#68625C] hover:text-[#1C1C1C]"
                    )}
                  >
                    {item === "signin" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4 px-5 py-5">
              <AnimatePresence mode="wait">
                {forgot ? (
                  <motion.div key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <Field icon={Mail} label="Email Address" value={email} onChange={setEmail} type="email" autoComplete="email" />
                    <button
                      type="button"
                      onClick={requestReset}
                      disabled={loading}
                      className="inline-flex w-full items-center justify-center gap-2 border border-[#8B0000] bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Sending..." : "Send Reset Link"}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setForgot(false)}
                      className="text-xs font-semibold uppercase tracking-[0.22em] text-[#68625C] transition-colors hover:text-[#1C1C1C]"
                    >
                      Back to sign in
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    {mode === "signup" && (
                      <Field label="Full Name" value={name} onChange={setName} type="text" autoComplete="name" />
                    )}
                    <Field icon={Mail} label="Email Address" value={email} onChange={setEmail} type="email" autoComplete="email" />
                    <div className="space-y-2">
                      <Field
                        icon={Lock}
                        label="Password"
                        value={password}
                        onChange={setPassword}
                        type={showPassword ? "text" : "password"}
                        autoComplete={mode === "signin" ? "current-password" : "new-password"}
                        trailing={
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="text-[#68625C] transition-colors hover:text-[#1C1C1C]"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        }
                      />
                      {mode === "signup" && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-[#68625C]">
                            <span>Password strength</span>
                            <span>{strengthLabel}</span>
                          </div>
                          <div className="grid grid-cols-5 gap-1">
                            {strength.items.map((ok, i) => (
                              <span key={i} className={cn("h-1.5 border border-[#CFC5B8]", ok ? "bg-[#8B0000]" : "bg-transparent")} />
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-[#68625C]">
                            {["8+ chars", "Uppercase", "Lowercase", "Number", "Symbol"].map((label, i) => (
                              <span key={label} className={cn("inline-flex items-center gap-1", strength.items[i] ? "text-[#1C1C1C]" : "")}>
                                {strength.items[i] ? <CheckCircle2 className="h-3.5 w-3.5 text-[#8B0000]" /> : <HelpCircle className="h-3.5 w-3.5" />}
                                {label}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setForgot(true)}
                        className="text-xs font-semibold uppercase tracking-[0.22em] text-[#68625C] transition-colors hover:text-[#1C1C1C]"
                      >
                        Forgot password?
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 border border-[#8B0000] bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({
  label = "",
  value = "",
  onChange = () => {},
  type = "text",
  autoComplete = "",
  icon: Icon,
  trailing,
}: {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
  autoComplete?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trailing?: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#68625C]">{label}</span>
      <div className="flex items-center gap-3 border border-[#CFC5B8] bg-white px-3 py-3">
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-[#68625C]" /> : null}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type={type}
          autoComplete={autoComplete}
          className="min-w-0 flex-1 bg-transparent text-sm text-[#1C1C1C] outline-none placeholder:text-[#9A948D]"
        />
        {trailing}
      </div>
    </label>
  );
}

export default AuthModal;