import React, { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Eye, EyeOff, Lock, Mail, X } from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "signup";

type AuthModalProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultMode?: AuthMode;
  onSuccess?: () => void;
};

type AuthPayload = {
  email: string;
  password: string;
  name?: string;
};

const passwordRules = [
  "At least 8 characters",
  "One uppercase letter",
  "One lowercase letter",
  "One number",
];

function validatePassword(password: string) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
  };
}

function AuthModal({ open = false, onOpenChange = () => undefined, defaultMode = "signin", onSuccess = () => undefined }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; name?: string; password?: string; form?: string }>({});

  useEffect(() => {
    if (open) {
      setMode(defaultMode);
      setErrors({});
    }
  }, [open, defaultMode]);

  const rules = useMemo(() => validatePassword(password), [password]);
  const allRulesMet = rules.length && rules.upper && rules.lower && rules.number;

  const reset = () => {
    setEmail("");
    setName("");
    setPassword("");
    setShowPassword(false);
    setErrors({});
  };

  const submit = async () => {
    const nextErrors: typeof errors = {};
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = "Enter a valid email address.";
    if (mode === "signup" && !name.trim()) nextErrors.name = "Enter your full name.";
    if (!password.trim()) nextErrors.password = "Enter your password.";
    if (mode === "signup" && !allRulesMet) nextErrors.password = "Password does not meet the required rules.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    try {
      const payload: AuthPayload = { email: email.trim(), password };
      if (mode === "signup") payload.name = name.trim();
      const endpoint = mode === "signin" ? "/api/auth/sign-in" : "/api/auth/sign-up";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as { message?: string; error?: string } | null;
      if (!res.ok) throw new Error(data?.error ?? data?.message ?? "Authentication failed.");
      toast.success(mode === "signin" ? "Signed in successfully." : "Account created successfully.");
      onSuccess();
      onOpenChange(false);
      reset();
      await fetch("/api/auth/session", { credentials: "include" }).catch(() => undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      setErrors((prev) => ({ ...prev, form: message }));
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#211F1D]/60 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,460px)] -translate-x-1/2 -translate-y-1/2 border border-[#CFC5B8] bg-[#FFFCF8] p-0 text-[#211F1D] shadow-[0_24px_80px_rgba(33,31,29,0.18)] outline-none">
          <div className="flex items-center justify-between border-b border-[#CFC5B8] px-5 py-4">
            <div className="min-w-0">
              <Dialog.Title className="font-['Bodoni_Moda'] text-2xl font-light tracking-tight">
                {mode === "signin" ? "Welcome back" : "Create account"}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-xs uppercase tracking-[0.24em] text-[#6F685F]">
                NDDN Store access
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button type="button" className="inline-flex h-9 w-9 items-center justify-center border border-[#CFC5B8] text-[#211F1D] transition-colors hover:bg-[#F5F1EC]" aria-label="Close authentication dialog">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="px-5 py-5">
            <div className="grid grid-cols-2 border border-[#CFC5B8]">
              {(["signin", "signup"] as AuthMode[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={cn(
                    "px-3 py-3 text-xs uppercase tracking-[0.24em] transition-colors",
                    mode === item ? "bg-[#211F1D] text-white" : "bg-transparent text-[#6F685F] hover:bg-[#F5F1EC]"
                  )}
                >
                  {item === "signin" ? "Sign in" : "Sign up"}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-[#6F685F]">Email</span>
                <div className="flex items-center gap-3 border border-[#CFC5B8] bg-white px-3 py-3">
                  <Mail className="h-4 w-4 shrink-0 text-[#6F685F]" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-[#6F685F]/70"
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email ? <p className="mt-2 text-xs text-[#8B0000]">{errors.email}</p> : null}
              </label>

              <AnimatePresence initial={false}>
                {mode === "signup" ? (
                  <motion.label
                    key="name"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="block"
                  >
                    <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-[#6F685F]">Full name</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      type="text"
                      autoComplete="name"
                      className="w-full border border-[#CFC5B8] bg-white px-3 py-3 text-sm outline-none placeholder:text-[#6F685F]/70"
                      placeholder="Your name"
                    />
                    {errors.name ? <p className="mt-2 text-xs text-[#8B0000]">{errors.name}</p> : null}
                  </motion.label>
                ) : null}
              </AnimatePresence>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-[#6F685F]">Password</span>
                <div className="flex items-center gap-3 border border-[#CFC5B8] bg-white px-3 py-3">
                  <Lock className="h-4 w-4 shrink-0 text-[#6F685F]" />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-[#6F685F]/70"
                    placeholder="Enter password"
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-[#6F685F] transition-colors hover:text-[#211F1D]" aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password ? <p className="mt-2 text-xs text-[#8B0000]">{errors.password}</p> : null}
              </label>

              {mode === "signup" ? (
                <div className="border border-[#CFC5B8] bg-[#F5F1EC] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#6F685F]">Password rules</p>
                  <ul className="mt-3 space-y-2">
                    {passwordRules.map((rule, index) => {
                      const met = [rules.length, rules.upper, rules.lower, rules.number][index] ?? false;
                      return (
                        <li key={rule} className="flex items-center gap-2 text-sm text-[#211F1D]">
                          <Check className={cn("h-4 w-4 shrink-0", met ? "text-[#8B0000]" : "text-[#CFC5B8]")} />
                          <span>{rule}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              {errors.form ? <p className="text-sm text-[#8B0000]">{errors.form}</p> : null}

              <button
                type="button"
                onClick={submit}
                disabled={pending}
                className="inline-flex w-full items-center justify-center gap-2 bg-[#8B0000] px-4 py-3 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {pending ? "Please wait" : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// [auto-removed: duplicate declaration of AuthModal]
// export function AuthModal(props: AuthModalProps) {
//   return <AuthModal {...props} />;
// }

export default AuthModal;