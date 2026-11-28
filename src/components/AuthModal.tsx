import React, { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type AuthMode = 'signin' | 'signup';

type AuthClient = {
  signIn?: (payload: { email: string; password: string }) => Promise<unknown>;
  signUp?: (payload: { email: string; password: string; name?: string }) => Promise<unknown>;
  refreshSession?: () => Promise<unknown>;
};

declare const authClient: AuthClient | undefined;

export type AuthModalProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultMode?: AuthMode;
  className?: string;
};

export function AuthModal({ open = false, onOpenChange = () => {}, defaultMode = 'signin', className = '' }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => setMode(defaultMode), [defaultMode, open]);
  useEffect(() => {
    if (!open) return;
    setBusy(false);
  }, [open]);

  const passwordPolicy = useMemo(() => {
    const checks = [
      { ok: password.length >= 8, label: '8+ characters' },
      { ok: /[A-Z]/.test(password), label: 'One uppercase letter' },
      { ok: /[a-z]/.test(password), label: 'One lowercase letter' },
      { ok: /\d/.test(password), label: 'One number' },
    ];
    return checks;
  }, [password]);

  const canSubmit = useMemo(() => {
    const emailOk = /^\S+@\S+\.\S+$/.test(email.trim());
    const passOk = passwordPolicy.every((c) => c.ok);
    const nameOk = mode === 'signin' || name.trim().length >= 2;
    return emailOk && passOk && nameOk && !busy;
  }, [email, name, mode, passwordPolicy, busy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error('Please complete the required fields.');
      return;
    }
    setBusy(true);
    try {
      const client = authClient ?? {};
      if (mode === 'signin') {
        if (!client.signIn) throw new Error('Authentication service is unavailable.');
        await client.signIn({ email: email.trim(), password });
        await client.refreshSession?.();
        toast.success('Welcome back.');
      } else {
        if (!client.signUp) throw new Error('Authentication service is unavailable.');
        await client.signUp({ email: email.trim(), password, name: name.trim() });
        await client.refreshSession?.();
        toast.success('Account created.');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content
          className={cn(
            'fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-[#C9BEB4] bg-[#F9F7F6] shadow-2xl outline-none',
            className
          )}
        >
          <motion.div
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex h-full flex-col"
          >
            <div className="flex items-start justify-between border-b border-[#C9BEB4] px-6 py-5">
              <div className="min-w-0">
                <Dialog.Title className="font-['Playfair_Display'] text-2xl font-medium tracking-tight text-[#2E2E2E]">
                  {mode === 'signin' ? 'Sign in' : 'Create account'}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-[#6F665F]">
                  {mode === 'signin' ? 'Access your saved orders and checkout faster.' : 'Join NDDN Store for a refined checkout experience.'}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center border border-[#C9BEB4] text-[#2E2E2E] transition-colors hover:bg-[#F1ECE7]"
                  aria-label="Close authentication dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            <div className="border-b border-[#C9BEB4] px-6 py-4">
              <div className="grid grid-cols-2 gap-2">
                {(['signin', 'signup'] as AuthMode[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMode(item)}
                    className={cn(
                      'border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors',
                      mode === item
                        ? 'border-[#8B0000] bg-[#8B0000] text-white'
                        : 'border-[#C9BEB4] bg-transparent text-[#2E2E2E] hover:bg-[#F1ECE7]'
                    )}
                  >
                    {item === 'signin' ? 'Sign In' : 'Sign Up'}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-6 py-5">
              <div className="flex-1 space-y-4">
                {mode === 'signup' && (
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F]">
                      <User className="h-3.5 w-3.5" />
                      Name
                    </span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      className="w-full border border-[#C9BEB4] bg-white px-3 py-3 text-sm text-[#2E2E2E] outline-none transition-colors placeholder:text-[#6F665F]/60 focus:border-[#8B0000]"
                      placeholder="Your name"
                    />
                  </label>
                )}

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F]">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    inputMode="email"
                    className="w-full border border-[#C9BEB4] bg-white px-3 py-3 text-sm text-[#2E2E2E] outline-none transition-colors placeholder:text-[#6F665F]/60 focus:border-[#8B0000]"
                    placeholder="name@example.com"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F]">
                    <Lock className="h-3.5 w-3.5" />
                    Password
                  </span>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    className="w-full border border-[#C9BEB4] bg-white px-3 py-3 text-sm text-[#2E2E2E] outline-none transition-colors placeholder:text-[#6F665F]/60 focus:border-[#8B0000]"
                    placeholder="••••••••"
                  />
                </label>

                <div className="space-y-2 border border-[#C9BEB4] bg-[#F1ECE7] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F]">Password policy</div>
                  <div className="space-y-2">
                    {passwordPolicy.map((rule) => (
                      <div key={rule.label} className="flex items-center gap-2 text-sm text-[#2E2E2E]">
                        {rule.ok ? <CheckCircle2 className="h-4 w-4 text-[#8B0000]" /> : <AlertCircle className="h-4 w-4 text-[#6F665F]" />}
                        <span>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex w-full items-center justify-center gap-2 border border-[#8B0000] bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? 'Please wait' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'))}
                  className="w-full text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F] transition-colors hover:text-[#2E2E2E]"
                >
                  {mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
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