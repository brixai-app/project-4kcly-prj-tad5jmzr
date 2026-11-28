import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Eye, EyeOff, Lock, Mail, X } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

type Mode = 'signin' | 'signup';

export function AuthModal({
  open = false,
  onOpenChange = () => {},
  defaultMode = 'signin',
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultMode?: Mode;
}) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => setMode(defaultMode), [defaultMode]);
  useEffect(() => {
    if (!open) {
      setError('');
      setPending(false);
      setShowPassword(false);
    }
  }, [open]);

  const passwordChecks = useMemo(() => {
    const v = password ?? '';
    return {
      length: v.length >= 8,
      upper: /[A-Z]/.test(v),
      lower: /[a-z]/.test(v),
      number: /\d/.test(v),
      special: /[^A-Za-z0-9]/.test(v),
    };
  }, [password]);

  const emailValid = /^\S+@\S+\.\S+$/.test(email.trim());
  const passwordValid = Object.values(passwordChecks).every(Boolean);
  const canSubmit = emailValid && passwordValid && (mode === 'signin' || (name.trim().length ?? 0) >= 2);

  const submit = async () => {
    if (!canSubmit || pending) return;
    setPending(true);
    setError('');
    try {
      const endpoint = mode === 'signin' ? '/api/auth/sign-in' : '/api/auth/sign-up';
      const payload = { email: email.trim(), password, name: name.trim() || undefined };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? data?.message ?? 'Authentication failed');
      toast.success(mode === 'signin' ? 'Signed in successfully' : 'Account created successfully');
      onOpenChange(false);
      if (location?.pathname?.includes('/checkout')) navigate('/checkout');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Authentication failed';
      setError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-[#C9BDB2] bg-[#F9F7F6] shadow-2xl outline-none"
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between border-b border-[#C9BDB2] px-6 py-5">
                    <div className="min-w-0">
                      <Dialog.Title className="font-['Playfair_Display'] text-2xl font-light tracking-tight text-[#2E2E2E]">
                        Access NDDN
                      </Dialog.Title>
                      <Dialog.Description className="mt-1 text-xs uppercase tracking-[0.24em] text-[#6E655E]">
                        Sign in or create an account
                      </Dialog.Description>
                    </div>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center border border-[#C9BDB2] text-[#2E2E2E] transition-colors hover:bg-[#EEE8E2]"
                        aria-label="Close"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="flex gap-2 border-b border-[#C9BDB2] px-6 py-4">
                    {(['signin', 'signup'] as Mode[]).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setMode(item)}
                        className={cn(
                          'min-w-0 flex-1 border px-3 py-2 text-xs uppercase tracking-[0.22em] transition-colors',
                          mode === item
                            ? 'border-[#8B0000] bg-[#8B0000] text-white'
                            : 'border-[#C9BDB2] text-[#2E2E2E] hover:bg-[#EEE8E2]'
                        )}
                      >
                        {item === 'signin' ? 'Sign In' : 'Sign Up'}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="space-y-4">
                      {mode === 'signup' && (
                        <Field
                          label="Full name"
                          value={name}
                          onChange={setName}
                          placeholder="Your name"
                          icon={<Check className="h-4 w-4" />}
                        />
                      )}
                      <Field
                        label="Email"
                        value={email}
                        onChange={setEmail}
                        placeholder="name@example.com"
                        icon={<Mail className="h-4 w-4" />}
                        type="email"
                        valid={emailValid || email.length === 0 ? undefined : false}
                      />
                      <Field
                        label="Password"
                        value={password}
                        onChange={setPassword}
                        placeholder="Minimum 8 characters"
                        icon={<Lock className="h-4 w-4" />}
                        type={showPassword ? 'text' : 'password'}
                        action={
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="text-[#6E655E] transition-colors hover:text-[#2E2E2E]"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        }
                        valid={password.length === 0 || passwordValid ? undefined : false}
                      />

                      <div className="border border-[#C9BDB2] bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-[#6E655E]">Password strength</p>
                        <ul className="mt-3 space-y-2 text-sm text-[#2E2E2E]">
                          {[
                            ['At least 8 characters', passwordChecks.length],
                            ['One uppercase letter', passwordChecks.upper],
                            ['One lowercase letter', passwordChecks.lower],
                            ['One number', passwordChecks.number],
                            ['One special character', passwordChecks.special],
                          ].map(([label, ok]) => (
                            <li key={label as string} className="flex items-center gap-2">
                              <span className={cn('inline-flex h-4 w-4 items-center justify-center border', ok ? 'border-[#8B0000] bg-[#8B0000] text-white' : 'border-[#C9BDB2] text-transparent')}>
                                <Check className="h-3 w-3" />
                              </span>
                              <span>{label as string}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {error ? <p className="text-sm text-[#8B0000]">{error}</p> : null}

                      <button
                        type="button"
                        onClick={submit}
                        disabled={!canSubmit || pending}
                        className="inline-flex w-full items-center justify-center gap-2 border border-[#8B0000] bg-[#8B0000] px-4 py-3 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {pending ? 'Please wait' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="h-4 w-4" />
                      </button>

                      <p className="text-sm leading-6 text-[#6E655E]">
                        By continuing, you agree to the boutique terms and privacy policy.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function Field({
  label = '',
  value = '',
  onChange = () => {},
  placeholder = '',
  icon,
  action,
  type = 'text',
  valid,
}: {
  label?: string;
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  type?: string;
  valid?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-[#6E655E]">{label}</span>
      <div className={cn('flex items-center gap-3 border bg-white px-3 py-3', valid === false ? 'border-[#8B0000]' : 'border-[#C9BDB2]')}>
        <span className="text-[#6E655E]">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-[#2E2E2E] outline-none placeholder:text-[#6E655E]/70"
        />
        {action}
      </div>
    </label>
  );
}

export default AuthModal;