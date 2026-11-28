import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Clock, History, Lock, Mail, MapPin, Phone, User, Shield, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'better-auth/react';
import { cn } from '@/lib/utils';
import type { Order, UserProfile } from '@/types';

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id ?? '';
  const email = session?.user?.email ?? '';
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', line1: '', city: '', postalCode: '', country: 'India' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    if (!isPending && !session?.user) {
      toast.error('Please sign in to access your dashboard.');
      navigate('/');
    }
  }, [isPending, navigate, session?.user]);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoading(true);
      try {
        const [profileRes, ordersRes] = await Promise.all([
          fetch(`/api/users/${encodeURIComponent(userId)}`),
          fetch(`/api/orders?userId=${encodeURIComponent(userId)}`),
        ]);
        const profileJson = await profileRes.json().catch(() => null);
        const ordersJson = await ordersRes.json().catch(() => null);
        const nextProfile = profileJson?.data ?? null;
        const nextOrders = ordersJson?.data ?? [];
        setProfile(nextProfile);
        setOrders(Array.isArray(nextOrders) ? nextOrders : []);
        setForm({
          name: nextProfile?.name ?? session?.user?.name ?? '',
          phone: nextProfile?.phone ?? '',
          line1: nextProfile?.address?.line1 ?? '',
          city: nextProfile?.address?.city ?? '',
          postalCode: nextProfile?.address?.postalCode ?? '',
          country: nextProfile?.address?.country ?? 'India',
        });
      } catch {
        toast.error('Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [session?.user?.name, userId]);

  const stats = useMemo(() => {
    const total = orders.length;
    const paid = orders.filter((o) => o.status === 'paid' || o.status === 'processing' || o.status === 'shipped' || o.status === 'delivered').length;
    const latest = orders[0]?.createdAt ?? '';
    return { total, paid, latest };
  }, [orders]);

  const saveProfile = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        address: {
          fullName: form.name,
          line1: form.line1,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country,
          phone: form.phone,
        },
      };
      const res = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('save failed');
      toast.success('Profile updated.');
    } catch {
      toast.error('Profile update failed.');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setPasswordSaving(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwords),
      });
      if (!res.ok) throw new Error('password failed');
      setPasswords({ currentPassword: '', newPassword: '' });
      toast.success('Password updated.');
    } catch {
      toast.error('Password change failed.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/sign-out', { method: 'POST' });
      toast.success('Signed out.');
      navigate('/');
    } catch {
      toast.error('Unable to sign out.');
    }
  };

  return (
    <main className="bg-[#F5F1EB] text-[#1C1C1C]">
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 border-b border-[#CFC5B8] pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#68625C]">Account</p>
          <h1 className="font-['Playfair_Display'] text-4xl font-light tracking-tight sm:text-5xl">Dashboard</h1>
          <p className="max-w-2xl text-sm leading-6 text-[#68625C]">Manage your profile, secure your account, and review your order history in one refined space.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_1.35fr]">
          <section className="rounded-sm border border-[#CFC5B8] bg-[#FAF9F6] p-5">
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-[#CFC5B8] pb-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#68625C]">Profile</p>
                <h2 className="mt-1 font-['Playfair_Display'] text-2xl font-light">Personal details</h2>
              </div>
              <User className="h-5 w-5 text-[#8B0000]" />
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} icon={<User className="h-4 w-4" />} />
                <Field label="Email" value={email} readOnly icon={<Mail className="h-4 w-4" />} />
                <Field label="Phone" value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} icon={<Phone className="h-4 w-4" />} />
                <Field label="Country" value={form.country} onChange={(v) => setForm((p) => ({ ...p, country: v }))} icon={<MapPin className="h-4 w-4" />} />
              </div>
              <Field label="Address line" value={form.line1} onChange={(v) => setForm((p) => ({ ...p, line1: v }))} icon={<MapPin className="h-4 w-4" />} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City" value={form.city} onChange={(v) => setForm((p) => ({ ...p, city: v }))} icon={<MapPin className="h-4 w-4" />} />
                <Field label="Postal code" value={form.postalCode} onChange={(v) => setForm((p) => ({ ...p, postalCode: v }))} icon={<MapPin className="h-4 w-4" />} />
              </div>

              <button onClick={saveProfile} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-60">
                <CheckCircle2 className="h-4 w-4" />
                {saving ? 'Saving' : 'Save profile'}
              </button>
            </div>

            <div className="mt-6 border-t border-[#CFC5B8] pt-5">
              <div className="mb-4 flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#8B0000]" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em]">Password</h3>
              </div>
              <div className="space-y-4">
                <Field label="Current password" type="password" value={passwords.currentPassword} onChange={(v) => setPasswords((p) => ({ ...p, currentPassword: v }))} icon={<Lock className="h-4 w-4" />} />
                <Field label="New password" type="password" value={passwords.newPassword} onChange={(v) => setPasswords((p) => ({ ...p, newPassword: v }))} icon={<Shield className="h-4 w-4" />} />
                <button onClick={changePassword} disabled={passwordSaving} className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#1C1C1C] px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] transition-colors hover:bg-[#1C1C1C] hover:text-white disabled:cursor-not-allowed disabled:opacity-60">
                  <Lock className="h-4 w-4" />
                  {passwordSaving ? 'Updating' : 'Change password'}
                </button>
              </div>
            </div>

            <button onClick={logout} className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#8B0000] transition-colors hover:text-[#650000]">
              <AlertCircle className="h-4 w-4" />
              Sign out
            </button>
          </section>

          <section className="rounded-sm border border-[#CFC5B8] bg-[#FAF9F6] p-5">
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-[#CFC5B8] pb-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#68625C]">Orders</p>
                <h2 className="mt-1 font-['Playfair_Display'] text-2xl font-light">Order history</h2>
              </div>
              <History className="h-5 w-5 text-[#8B0000]" />
            </div>

            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              <Stat label="Total orders" value={String(stats.total)} />
              <Stat label="Active" value={String(stats.paid)} />
              <Stat label="Latest" value={stats.latest ? new Date(stats.latest).toLocaleDateString() : '—'} />
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="rounded-sm border border-dashed border-[#CFC5B8] p-6 text-sm text-[#68625C]">Loading orders…</div>
              ) : orders.length ? (
                orders.map((order) => (
                  <article key={order.id} className="rounded-sm border border-[#CFC5B8] bg-white p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold">Order #{order.id}</p>
                          <StatusPill status={order.status} />
                        </div>
                        <p className="mt-1 text-sm text-[#68625C]">{new Date(order.createdAt).toLocaleString()}</p>
                        <p className="mt-2 text-sm text-[#68625C]">{order.items?.length ?? 0} item(s) · {order.shippingAddress?.city ?? '—'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">₹{order.total?.toLocaleString?.() ?? order.total}</p>
                        <p className="text-xs uppercase tracking-[0.25em] text-[#68625C]">Total</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(order.items ?? []).slice(0, 3).map((item) => (
                        <span key={item.id} className="inline-flex max-w-full items-center gap-2 rounded-sm border border-[#CFC5B8] px-3 py-1 text-xs text-[#68625C]">
                          <Truck className="h-3.5 w-3.5 shrink-0" />
                          <span className="min-w-0 truncate">{item.name}</span>
                        </span>
                      ))}
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-sm border border-dashed border-[#CFC5B8] p-6 text-sm text-[#68625C]">No orders found for this account.</div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Field({ label = '', value = '', onChange, type = 'text', readOnly = false, icon = null }: { label?: string; value?: string; onChange?: (value: string) => void; type?: string; readOnly?: boolean; icon?: React.ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#68625C]">
        {icon}
        {label}
      </span>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn('w-full rounded-sm border border-[#CFC5B8] bg-white px-3 py-3 text-sm text-[#1C1C1C] outline-none transition-colors placeholder:text-[#68625C]/60 focus:border-[#8B0000]', readOnly && 'bg-[#FAF9F6]')}
      />
    </label>
  );
}

function Stat({ label = '', value = '' }: { label?: string; value?: string }) {
  return (
    <div className="rounded-sm border border-[#CFC5B8] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#68625C]">{label}</p>
      <p className="mt-2 font-['Playfair_Display'] text-2xl font-light">{value}</p>
    </div>
  );
}

function StatusPill({ status = 'pending' }: { status?: Order['status'] }) {
  const tone = status === 'delivered' ? 'text-emerald-700' : status === 'cancelled' ? 'text-red-700' : 'text-[#8B0000]';
  const Icon = status === 'delivered' ? CheckCircle2 : status === 'shipped' ? Truck : Clock;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]', tone, 'border-current/20 bg-current/5')}>
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

export default DashboardPage;