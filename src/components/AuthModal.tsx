import React, { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Eye, EyeOff, Lock, Mail, User, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface AuthModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultMode?: 'sign-in' | 'sign-up';
  trigger?: React.ReactNode;
}

type Mode = 'sign-in' | 'sign-up';

const authClient = {
  async signIn(email: string, password: string) {
    const res = await fetch('/api/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => null))?.message ?? 'Sign in failed');
    return res.json().catch(() => null);
  },
  async signUp(name: string, email: string, password: string) {
    const res = await fetch('/api/auth/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => null))?.message ?? 'Sign up failed');
    return res.json().catch(() => null);
  },
};

export function AuthModal({ open = false, onOpenChange, defaultMode = 'sign-in', trigger = null }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong'][Math.max(0, strength - 1)] ?? 'Weak';

  const reset = () => {
    setName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter your email and password.');
      return;
    }
    if (mode === 'sign-up' && name.trim().length < 2) {
      toast.error('Please enter your full name.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'sign-in') await authClient.signIn(email.trim(), password);
      else await authClient.signUp(name.trim(), email.trim(), password);
      toast.success(mode === 'sign-in' ? 'Welcome back.' : 'Account created successfully.');
      onOpenChange?.(false);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { onOpenChange?.(next); if (!next) reset(); }}>
      {trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : null}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,460px)] -translate-x-1/2 -translate-y-1/2 border border-[#C9BDB2] bg-[#F9F7F6] p-5 text-[#2B2B2B] shadow-[0_24px_80px_rgba(0,0,0,0.18)] outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-[#C9BDB2] pb-4">
            <div className="min-w-0">
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-[#6E655F]">Account</p>
              <Dialog.Title className="mt-2 font-['Playfair_Display'] text-3xl font-normal tracking-tight">
                {mode === 'sign-in' ? 'Sign in' : 'Create account'}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button type="button" className="inline-flex h-9 w-9 items-center justify-center border border-[#C9BDB2] text-[#2B2B2B] transition-colors hover:bg-[#EFEAE5]" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-4 flex gap-2 border-b border-[#C9BDB2]">
            {(['sign-in', 'sign-up'] as Mode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={cn(
                  'border-b-2 px-0 py-2 font-sans text-xs font-semibold uppercase tracking-[0.24em] transition-colors',
                  mode === item ? 'border-[#B11226] text-[#2B2B2B]' : 'border-transparent text-[#6E655F] hover:text-[#2B2B2B]'
                )}
              >
                {item === 'sign-in' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {mode === 'sign-up' && (
              <label className="block">
                <span className="mb-2 block font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-[#6E655F]">Full name</span>
                <div className="flex items-center gap-2 border border-[#C9BDB2] bg-white px-3 py-2">
                  <User className="h-4 w-4 shrink-0 text-[#6E655F]" />
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent font-serif text-sm text-[#2B2B2B] outline-none placeholder:text-[#6E655F]/70" placeholder="Your name" autoComplete="name" />
                </div>
              </label>
            )}

            <label className="block">
              <span className="mb-2 block font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-[#6E655F]">Email</span>
              <div className="flex items-center gap-2 border border-[#C9BDB2] bg-white px-3 py-2">
                <Mail className="h-4 w-4 shrink-0 text-[#6E655F]" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent font-serif text-sm text-[#2B2B2B] outline-none placeholder:text-[#6E655F]/70" placeholder="you@example.com" autoComplete="email" inputMode="email" />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-[#6E655F]">Password</span>
              <div className="flex items-center gap-2 border border-[#C9BDB2] bg-white px-3 py-2">
                <Lock className="h-4 w-4 shrink-0 text-[#6E655F]" />
                <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent font-serif text-sm text-[#2B2B2B] outline-none placeholder:text-[#6E655F]/70" placeholder="••••••••" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="inline-flex h-8 w-8 items-center justify-center text-[#6E655F] transition-colors hover:text-[#2B2B2B]" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mode === 'sign-up' && (
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="h-1 flex-1 overflow-hidden bg-[#EFEAE5]">
                    <div className={cn('h-full transition-all', strength <= 1 ? 'w-1/4 bg-[#B11226]' : strength === 2 ? 'w-2/4 bg-[#B11226]' : strength === 3 ? 'w-3/4 bg-[#B11226]' : 'w-full bg-[#B11226]')} />
                  </div>
                  <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-[#6E655F]">{strengthLabel}</span>
                </div>
              )}
            </label>

            <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 bg-[#B11226] px-4 py-3 font-sans text-xs font-semibold uppercase tracking-[0.24em] text-white transition-colors hover:bg-[#8F0E1F] disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? 'Please wait' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default AuthModal;