import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Check, Clock, MapPin, Plus, Trash2, User } from 'lucide-react';
import type { Address, Order, User as AppUser } from '@/types';
import { cn } from '@/lib/utils';

export interface DashboardPageProps {
  className?: string;
}

const statusTone: Record<Order['status'], string> = {
  pending: 'border-stone-300 text-stone-700',
  paid: 'border-amber-300 text-amber-800',
  processing: 'border-sky-300 text-sky-800',
  shipped: 'border-violet-300 text-violet-800',
  delivered: 'border-emerald-300 text-emerald-800',
  cancelled: 'border-rose-300 text-rose-800',
};

export function DashboardPage({ className = '' }: DashboardPageProps) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [meRes, ordersRes, addressesRes] = await Promise.all([
          fetch('/api/auth/session'),
          fetch('/api/orders'),
          fetch('/api/addresses'),
        ]);
        const meJson = await meRes.json().catch(() => ({}));
        const ordersJson = await ordersRes.json().catch(() => ({}));
        const addressesJson = await addressesRes.json().catch(() => ({}));
        setUser(meJson?.data?.user ?? meJson?.user ?? null);
        setOrders(Array.isArray(ordersJson?.data) ? ordersJson.data : ordersJson?.data?.orders ?? []);
        setAddresses(Array.isArray(addressesJson?.data) ? addressesJson.data : addressesJson?.data?.addresses ?? []);
      } catch {
        toast.error('Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const defaultAddress = useMemo(() => addresses.find((a) => a?.isDefault) ?? addresses?.[0] ?? null, [addresses]);

  useEffect(() => {
    if (!defaultAddress) return;
    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || defaultAddress?.fullName || '',
      line1: prev.line1 || defaultAddress?.line1 || '',
      line2: prev.line2 || defaultAddress?.line2 || '',
      city: prev.city || defaultAddress?.city || '',
      state: prev.state || defaultAddress?.state || '',
      postalCode: prev.postalCode || defaultAddress?.postalCode || '',
      country: prev.country || defaultAddress?.country || 'India',
      phone: prev.phone || defaultAddress?.phone || '',
    }));
  }, [defaultAddress]);

  const saveAddress = async () => {
    if (!form.fullName || !form.line1 || !form.city || !form.state || !form.postalCode || !form.country) {
      toast.error('Please complete the address fields.');
      return;
    }
    try {
      setSaving(true);
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? 'Failed to save address');
      const next = json?.data ?? json?.address ?? null;
      if (next) setAddresses((prev) => [next, ...prev]);
      toast.success('Address saved.');
      setForm({ fullName: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India', phone: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const removeAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove address');
      setAddresses((prev) => prev.filter((address) => address?.id !== id));
      toast.success('Address removed.');
    } catch {
      toast.error('Unable to remove address.');
    }
  };

  return (
    <main className={cn('bg-[#F5F1EB] px-4 py-8 text-[#2B2B2B] sm:px-6 lg:px-8', className)}>
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="border border-[#CFC6BA] bg-[#FFFDF9] p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#716A63]">Account</p>
                <h1 className="mt-2 font-['Playfair_Display'] text-4xl font-light tracking-tight sm:text-5xl">Dashboard</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#716A63]">
                  Manage your profile, review live order status, and keep shipping details current.
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center border border-[#CFC6BA] bg-white">
                <User className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Stat label="Profile" value={user?.name ?? user?.email ?? 'Guest'} />
              <Stat label="Orders" value={String(orders?.length ?? 0)} />
              <Stat label="Addresses" value={String(addresses?.length ?? 0)} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="border border-[#CFC6BA] bg-[#FFFDF9] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#716A63]">Shipping Address</p>
            <div className="mt-4 space-y-3">
              {['fullName', 'line1', 'line2', 'city', 'state', 'postalCode', 'country', 'phone'].map((key) => (
                <input
                  key={key}
                  value={(form as Record<string, string>)[key] ?? ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={key === 'line2' ? 'Apartment, suite, etc. (optional)' : key.replace(/([A-Z])/g, ' $1')}
                  className="w-full border border-[#CFC6BA] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#8B0000]"
                />
              ))}
            </div>
            <button
              type="button"
              onClick={saveAddress}
              disabled={saving}
              className="mt-4 inline-flex items-center gap-2 border border-[#8B0000] bg-[#8B0000] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#650000] disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {saving ? 'Saving' : 'Save Address'}
            </button>
          </motion.div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="border border-[#CFC6BA] bg-[#FFFDF9] p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-['Playfair_Display'] text-2xl font-light">Order History</h2>
              <Clock className="h-4 w-4 text-[#716A63]" />
            </div>
            <div className="mt-5 space-y-4">
              {loading ? (
                <p className="text-sm text-[#716A63]">Loading orders...</p>
              ) : orders.length === 0 ? (
                <p className="text-sm text-[#716A63]">No orders yet.</p>
              ) : (
                orders.map((order) => (
                  <article key={order?.id} className="border border-[#CFC6BA] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#716A63]">Order {order?.id}</p>
                        <p className="mt-1 text-sm text-[#716A63]">{order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recently placed'}</p>
                      </div>
                      <span className={cn('border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]', statusTone[order?.status ?? 'pending'])}>
                        {order?.status ?? 'pending'}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-[#716A63]">{order?.items?.length ?? 0} item(s)</span>
                      <span className="font-semibold">₹{Number(order?.total ?? 0).toLocaleString('en-IN')}</span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="border border-[#CFC6BA] bg-[#FFFDF9] p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-['Playfair_Display'] text-2xl font-light">Saved Addresses</h2>
              <MapPin className="h-4 w-4 text-[#716A63]" />
            </div>
            <div className="mt-5 space-y-3">
              {addresses.length === 0 ? (
                <p className="text-sm text-[#716A63]">No saved addresses yet.</p>
              ) : (
                addresses.map((address) => (
                  <div key={address?.id} className="border border-[#CFC6BA] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{address?.fullName}</p>
                        <p className="mt-1 text-sm text-[#716A63]">
                          {address?.line1}
                          {address?.line2 ? `, ${address.line2}` : ''}
                        </p>
                        <p className="text-sm text-[#716A63]">
                          {address?.city}, {address?.state} {address?.postalCode}
                        </p>
                        <p className="text-sm text-[#716A63]">{address?.country}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAddress(address?.id ?? '')}
                        className="inline-flex items-center gap-1 border border-[#CFC6BA] px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#2B2B2B] transition hover:border-[#8B0000] hover:text-[#8B0000]"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                    {address?.isDefault ? (
                      <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#8B0000]">
                        <Check className="h-4 w-4" />
                        Default
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label = '', value = '' }: { label?: string; value?: string }) {
  return (
    <div className="border border-[#CFC6BA] bg-white p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#716A63]">{label}</p>
      <p className="mt-2 truncate text-sm font-medium">{value}</p>
    </div>
  );
}

export default DashboardPage;