import React, { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Mode = 'sign-in' | 'sign-up' | 'reset';

type AuthValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type AuthModalProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialMode?: Mode;
  onSubmit?: (payload: { mode: Mode; values: AuthValues }) => Promise<void> | void;
};

const defaultValues: AuthValues = { name: '', email: '', password: '', confirmPassword: '' };

const passwordPolicy = (password: string) => ({
  length: password.length >= 8,
  upper: /[A-Z]/.test(password),
  lower: /[a-z]/.test(password),
  number: /\d/.test(password),
  special: /[^A-Za-z0-9]/.test(password),
});

export function AuthModal({ open = false, onOpenChange = () => {}, initialMode = 'sign-in', onSubmit = async () => {} }: AuthModalProps = {}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [values, setValues] = useState<AuthValues>(defaultValues);
  const [errors, setErrors] = useState<Partial<Record<keyof AuthValues, string>>>({});
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const policy = useMemo(() => passwordPolicy(values.password ?? ''), [values.password]);

  const resetState = () => {
    setValues(defaultValues);
    setErrors({});
    setPending(false);
    setShowPassword(false);
  };

  const validate = () => {
    const next: Partial<Record<keyof AuthValues, string>> = {};
    const email = values.email?.trim() ?? '';
    if (!email) next.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address.';
    if (mode !== 'reset') {
      if (mode === 'sign-up' && !(values.name?.trim() ?? '')) next.name = 'Name is required.';
      if (!(values.password?.trim() ?? '')) next.password = 'Password is required.';
      else if (!policy.length || !policy.upper || !policy.lower || !policy.number || !policy.special) next.password = 'Password does not meet policy requirements.';
      if (mode === 'sign-up' && values.password !== values.confirmPassword) next.confirmPassword = 'Passwords do not match.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setPending(true);
    try {
      await onSubmit({ mode, values });
      toast.success(mode === 'reset' ? 'Reset link sent.' : mode === 'sign-up' ? 'Account created.' : 'Signed in successfully.');
      onOpenChange(false);
      resetState();
    } catch (error) {
      toast.error((error as Error)?.message ?? 'Authentication failed.');
    } finally {
      setPending(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrors({});
  };

  const inputBase = 'w-full rounded-sm border border-[#C9BFB1] bg-[#FFFCF7] px-3 py-3 text-sm text-[#2E2B28] outline-none transition focus:border-[#8B0000]';
  const labelBase = 'mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#71695F]';

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { onOpenChange(next); if (!next) resetState(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 focus:outline-none">
          <motion.div initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.98 }} transition={{ duration: 0.28 }} className="overflow-hidden border border-[#C9BFB1] bg-[#F5F1EB] text-[#2E2B28] shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
            <div className="flex items-start justify-between border-b border-[#C9BFB1] px-5 py-4">
              <div className="min-w-0">
                <Dialog.Title className="font-['Playfair_Display'] text-2xl font-medium tracking-tight">
                  {mode === 'sign-up' ? 'Create account' : mode === 'reset' ? 'Reset password' : 'Welcome back'}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-[#71695F]">
                  {mode === 'sign-up' ? 'Join the NDDN Store private client list.' : mode === 'reset' ? 'We will send a secure reset link to your inbox.' : 'Sign in to manage orders, wishlist, and checkout.'}
                </Dialog.Description>
              </div>
              <Dialog.Close className="rounded-none border border-[#C9BFB1] p-2 text-[#2E2B28] transition hover:border-[#8B0000] hover:text-[#8B0000]">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>

            <div className="border-b border-[#C9BFB1] px-5 py-3">
              <div className="grid grid-cols-3 gap-2">
                {(['sign-in', 'sign-up', 'reset'] as Mode[]).map((item) => (
                  <button key={item} type="button" onClick={() => switchMode(item)} className={cn('border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] transition', mode === item ? 'border-[#8B0000] bg-[#8B0000] text-white' : 'border-[#C9BFB1] bg-transparent text-[#71695F] hover:border-[#8B0000] hover:text-[#8B0000]')}>
                    {item === 'sign-in' ? 'Sign in' : item === 'sign-up' ? 'Sign up' : 'Reset'}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
              {mode === 'sign-up' && (
                <div>
                  <label className={labelBase}>Name</label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71695F]" />
                    <input value={values.name} onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))} className={cn(inputBase, 'pl-10')} placeholder="Your full name" autoComplete="name" />
                  </div>
                  {errors.name ? <p className="mt-1 text-xs text-[#8B0000]">{errors.name}</p> : null}
                </div>
              )}

              <div>
                <label className={labelBase}>Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71695F]" />
                  <input value={values.email} onChange={(e) => setValues((p) => ({ ...p, email: e.target.value }))} className={cn(inputBase, 'pl-10')} placeholder="name@example.com" autoComplete="email" />
                </div>
                {errors.email ? <p className="mt-1 text-xs text-[#8B0000]">{errors.email}</p> : null}
              </div>

              {mode !== 'reset' && (
                <div>
                  <label className={labelBase}>Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71695F]" />
                    <input type={showPassword ? 'text' : 'password'} value={values.password} onChange={(e) => setValues((p) => ({ ...p, password: e.target.value }))} className={cn(inputBase, 'pl-10 pr-10')} placeholder="Enter password" autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'} />
                    <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#71695F] transition hover:text-[#8B0000]">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password ? <p className="mt-1 text-xs text-[#8B0000]">{errors.password}</p> : null}
                  {mode === 'sign-up' ? (
                    <div className="mt-3 grid gap-2 text-xs text-[#71695F]">
                      {[
                        ['At least 8 characters', policy.length],
                        ['One uppercase letter', policy.upper],
                        ['One lowercase letter', policy.lower],
                        ['One number', policy.number],
                        ['One special character', policy.special],
                      ].map(([label, ok]) => (
                        <div key={label as string} className="flex items-center gap-2">
                          <CheckCircle2 className={cn('h-3.5 w-3.5', ok ? 'text-[#8B0000]' : 'text-[#C9BFB1]')} />
                          <span>{label as string}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}

              {mode === 'sign-up' && (
                <div>
                  <label className={labelBase}>Confirm password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71695F]" />
                    <input type={showPassword ? 'text' : 'password'} value={values.confirmPassword} onChange={(e) => setValues((p) => ({ ...p, confirmPassword: e.target.value }))} className={cn(inputBase, 'pl-10')} placeholder="Repeat password" autoComplete="new-password" />
                  </div>
                  {errors.confirmPassword ? <p className="mt-1 text-xs text-[#8B0000]">{errors.confirmPassword}</p> : null}
                </div>
              )}

              <button type="submit" disabled={pending} className="flex w-full items-center justify-center gap-2 border border-[#8B0000] bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-70">
                {pending ? 'Please wait' : mode === 'reset' ? 'Send reset link' : mode === 'sign-up' ? 'Create account' : 'Sign in'}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex items-center justify-between text-xs text-[#71695F]">
                <button type="button" onClick={() => switchMode(mode === 'sign-in' ? 'reset' : 'sign-in')} className="font-semibold uppercase tracking-[0.18em] text-[#8B0000] transition hover:text-[#650000]">
                  {mode === 'sign-in' ? 'Forgot password?' : 'Back to sign in'}
                </button>
                <button type="button" onClick={() => switchMode(mode === 'sign-up' ? 'sign-in' : 'sign-up')} className="font-semibold uppercase tracking-[0.18em] text-[#8B0000] transition hover:text-[#650000]">
                  {mode === 'sign-up' ? 'Have an account?' : 'Create account'}
                </button>
              </div>
            </form>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default AuthModal;