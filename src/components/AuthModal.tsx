import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface AuthModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultMode?: 'signin' | 'signup';
  trigger?: React.ReactNode;
}

type Mode = 'signin' | 'signup';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthModal({ open = false, onOpenChange = () => {}, defaultMode = 'signin', trigger = null }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) setTimeout(() => emailRef.current?.focus(), 50);
  }, [open, mode]);

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  const title = useMemo(() => (mode === 'signin' ? 'Sign in' : 'Create account'), [mode]);

  const validate = () => {
    const next: typeof errors = {};
    if (mode === 'signup' && !name.trim()) next.name = 'Name is required.';
    if (!email.trim()) next.email = 'Email is required.';
    else if (!emailPattern.test(email.trim())) next.email = 'Enter a valid email.';
    if (!password.trim()) next.password = 'Password is required.';
    else if (password.trim().length < 8) next.password = 'Use at least 8 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const reset = () => {
    setName('');
    setEmail('');
    setPassword('');
    setErrors({});
    setLoading(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please check your details and try again.');
      return;
    }
    setLoading(true);
    try {
      const endpoint = mode === 'signin' ? '/api/auth/sign-in' : '/api/auth/sign-up';
      const payload = { email: email.trim(), password, name: name.trim() || undefined };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as { message?: string; error?: string } | null;
      if (!res.ok) throw new Error(data?.error ?? data?.message ?? 'Authentication failed.');
      toast.success(mode === 'signin' ? 'Welcome back.' : 'Account created successfully.');
      onOpenChange(false);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : null}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-1.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 focus:outline-none">
          <motion.div initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }} transition={{ duration: 0.22, ease: 'easeOut' }} className="overflow-hidden border border-[#CFC6BA] bg-[#FFFDF9] text-[#2B2B2B] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="flex items-start justify-between border-b border-[#CFC6BA] px-5 py-4">
              <div className="min-w-0">
                <Dialog.Title className="font-['Playfair_Display'] text-2xl font-medium tracking-tight">{title}</Dialog.Title>
                <Dialog.Description className="mt-1 text-xs uppercase tracking-[0.24em] text-[#716A63]">NDDN Store access</Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button type="button" className="inline-flex h-9 w-9 items-center justify-center border border-[#CFC6BA] text-[#2B2B2B] transition-colors hover:bg-[#8B0000] hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            <div className="px-5 pt-4">
              <div className="grid grid-cols-2 border border-[#CFC6BA]">
                {(['signin', 'signup'] as Mode[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMode(item)}
                    className={cn('px-3 py-3 text-xs uppercase tracking-[0.24em] transition-colors', mode === item ? 'bg-[#8B0000] text-white' : 'bg-transparent text-[#716A63] hover:bg-black/5')}
                  >
                    {item === 'signin' ? 'Sign in' : 'Sign up'}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4 px-5 py-5">
              <AnimatePresence mode="wait">
                {mode === 'signup' ? (
                  <motion.div key="name" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-1.5">
                    <label className="text-xs uppercase tracking-[0.22em] text-[#716A63]">Name</label>
                    <div className="flex items-center gap-2 border border-[#CFC6BA] bg-white px-3 py-2.5">
                      <User className="h-4 w-4 text-[#716A63]" />
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full bg-transparent text-sm outline-none placeholder:text-[#A39A90]" />
                    </div>
                    {errors.name ? <p className="flex items-center gap-1 text-xs text-[#8B0000]"><AlertCircle className="h-3.5 w-3.5" />{errors.name}</p> : null}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-[0.22em] text-[#716A63]">Email</label>
                <div className="flex items-center gap-2 border border-[#CFC6BA] bg-white px-3 py-2.5">
                  <Mail className="h-4 w-4 text-[#716A63]" />
                  <input ref={emailRef} value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="you@example.com" className="w-full bg-transparent text-sm outline-none placeholder:text-[#A39A90]" />
                </div>
                {errors.email ? <p className="flex items-center gap-1 text-xs text-[#8B0000]"><AlertCircle className="h-3.5 w-3.5" />{errors.email}</p> : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-[0.22em] text-[#716A63]">Password</label>
                <div className="flex items-center gap-2 border border-[#CFC6BA] bg-white px-3 py-2.5">
                  <Lock className="h-4 w-4 text-[#716A63]" />
                  <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} placeholder="••••••••" className="w-full bg-transparent text-sm outline-none placeholder:text-[#A39A90]" />
                </div>
                {errors.password ? <p className="flex items-center gap-1 text-xs text-[#8B0000]"><AlertCircle className="h-3.5 w-3.5" />{errors.password}</p> : null}
              </div>

              <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 bg-[#8B0000] px-4 py-3 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-70">
                {loading ? <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 animate-pulse" />Processing</span> : mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default AuthModal;