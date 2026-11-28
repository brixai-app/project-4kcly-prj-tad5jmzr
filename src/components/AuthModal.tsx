import React, { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useLocation, useNavigate } from "react-router-dom";
import { X, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type AuthModalProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultTab?: "signin" | "signup";
};

type FormState = {
  email: string;
  password: string;
  name: string;
};

const initialForm: FormState = { email: "", password: "", name: "" };

export function AuthModal({ open = false, onOpenChange = () => {}, defaultTab = "signin" }: AuthModalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState<"signin" | "signup">(defaultTab);
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  useEffect(() => {
    if (open) setTab(defaultTab);
  }, [defaultTab, open]);

  useEffect(() => {
    const path = location?.pathname ?? "";
    if (path === "/auth" || path === "/login") onOpenChange(true);
  }, [location?.pathname, onOpenChange]);

  const title = useMemo(() => (tab === "signin" ? "Sign in" : "Create account"), [tab]);

  const validate = () => {
    const next: Partial<FormState> = {};
    if (!form.email?.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email.";
    if (!form.password?.trim() || form.password.length < 8) next.password = "Use at least 8 characters.";
    if (tab === "signup" && !form.name?.trim()) next.name = "Enter your name.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please review the highlighted fields.");
      return;
    }
    setLoading(true);
    try {
      const endpoint = tab === "signin" ? "/api/auth/sign-in" : "/api/auth/sign-up";
      const payload = tab === "signin" ? { email: form.email, password: form.password } : { email: form.email, password: form.password, name: form.name };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? "Authentication failed.");
      toast.success(tab === "signin" ? "Welcome back." : "Account created.");
      setForm(initialForm);
      onOpenChange(false);
      if (location?.pathname === "/auth" || location?.pathname === "/login") navigate("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const update = (key: keyof FormState, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,460px)] -translate-x-1/2 -translate-y-1/2 border border-[#CFC4BA] bg-[#F9F7F6] p-5 text-[#211E1D] shadow-2xl outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-[#CFC4BA] pb-4">
            <div className="min-w-0">
              <Dialog.Title className="font-['Bodoni_Moda'] text-3xl font-light tracking-tight">{title}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-[#665F5B]">
                Access your orders, saved items, and checkout details.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button type="button" className="inline-flex h-9 w-9 items-center justify-center border border-[#CFC4BA] text-[#211E1D] transition-colors hover:bg-[#EFE9E3]" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 border border-[#CFC4BA] p-1">
            {(["signin", "signup"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={cn(
                  "px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors",
                  tab === item ? "bg-[#8B0000] text-white" : "bg-transparent text-[#665F5B] hover:bg-[#EFE9E3]"
                )}
              >
                {item === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-5 space-y-4">
            {tab === "signup" && (
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#665F5B]">
                  <User className="h-4 w-4" /> Name
                </span>
                <input value={form.name} onChange={(e) => update("name", e.target.value)} className="w-full border border-[#CFC4BA] bg-white px-3 py-3 text-sm outline-none transition-colors placeholder:text-[#665F5B]/60 focus:border-[#8B0000]" placeholder="Your name" />
                {errors.name ? <p className="mt-1 text-xs text-[#8B0000]">{errors.name}</p> : null}
              </label>
            )}

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#665F5B]">
                <Mail className="h-4 w-4" /> Email
              </span>
              <input value={form.email} onChange={(e) => update("email", e.target.value)} className="w-full border border-[#CFC4BA] bg-white px-3 py-3 text-sm outline-none transition-colors placeholder:text-[#665F5B]/60 focus:border-[#8B0000]" placeholder="you@example.com" />
              {errors.email ? <p className="mt-1 text-xs text-[#8B0000]">{errors.email}</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#665F5B]">
                <Lock className="h-4 w-4" /> Password
              </span>
              <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} className="w-full border border-[#CFC4BA] bg-white px-3 py-3 text-sm outline-none transition-colors placeholder:text-[#665F5B]/60 focus:border-[#8B0000]" placeholder="At least 8 characters" />
              {errors.password ? <p className="mt-1 text-xs text-[#8B0000]">{errors.password}</p> : null}
            </label>

            <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#680000] disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? <CheckCircle2 className="h-4 w-4 animate-pulse" /> : null}
              {loading ? "Please wait" : tab === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default AuthModal;