import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, CreditCard, Mail, MapPin, Phone, Truck, User } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import type { Address, CheckoutPayload } from '@/types';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items = [], clearCart = () => {} } = useCart() as any;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const subtotal = useMemo(() => items.reduce((sum: number, item: any) => sum + (item?.price ?? 0) * (item?.quantity ?? 0), 0), [items]);
  const shipping = subtotal > 0 ? 0 : 0;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const luhn = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let sum = 0;
    let alt = false;
    for (let i = digits.length - 1; i >= 0; i -= 1) {
      let n = Number(digits[i] ?? 0);
      if (alt) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alt = !alt;
    }
    return digits.length >= 12 && sum % 10 === 0;
  };

  const validate = () => {
    const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(form.expiry.trim());
    const month = Number(expiryMatch?.[1] ?? 0);
    const year = Number(`20${expiryMatch?.[2] ?? '00'}`);
    const now = new Date();
    const expiryValid = !!expiryMatch && month >= 1 && month <= 12 && new Date(year, month, 0) >= new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const cvvValid = /^\d{3,4}$/.test(form.cvv.trim());
    const postalValid = form.postalCode.trim().length >= 4;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    const required = [form.fullName, form.email, form.line1, form.city, form.country].every((v) => v.trim().length > 0);
    if (!required) return 'Please complete all required fields.';
    if (!emailValid) return 'Please enter a valid email address.';
    if (!postalValid) return 'Please enter a valid ZIP or postal code.';
    if (!luhn(form.cardNumber)) return 'Please enter a valid card number.';
    if (!expiryValid) return 'Please enter a valid expiry date in MM/YY format.';
    if (!cvvValid) return 'Please enter a valid CVV.';
    return '';
  };

  const submitOrder = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    if (!items.length) {
      toast.error('Your cart is empty.');
      navigate('/shop');
      return;
    }
    setLoading(true);
    try {
      const shippingAddress: Address = {
        fullName: form.fullName.trim(),
        line1: form.line1.trim(),
        line2: form.line2.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim() || undefined,
        postalCode: form.postalCode.trim(),
        country: form.country.trim(),
        phone: form.phone.trim() || undefined,
      };
      const payload: CheckoutPayload = { items, shippingAddress, email: form.email.trim() };
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Checkout failed');
      clearCart();
      setSuccess(true);
      toast.success('Order placed successfully.');
      setTimeout(() => navigate('/'), 1200);
    } catch {
      toast.error('Unable to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, value, onChange, type = 'text', placeholder = '', required = false }: any) => (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#68625C]">
        {label}{required ? ' *' : ''}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-sm border border-[#CFC5B8] bg-[#FAF9F6] px-3 py-3 text-sm text-[#1C1C1C] outline-none transition focus:border-[#8B0000]"
      />
    </label>
  );

  return (
    <div className="bg-[#F5F1EB] text-[#1C1C1C]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <section className="space-y-8">
          <div className="border-b border-[#CFC5B8] pb-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8B0000]">Checkout</p>
            <h1 className="mt-3 font-['Playfair_Display'] text-4xl font-light tracking-tight md:text-5xl">Complete your purchase</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#68625C]">Securely confirm your contact, shipping, billing, and payment details before placing your order.</p>
          </div>

          {success ? (
            <div className="flex items-start gap-3 border border-[#CFC5B8] bg-[#FAF9F6] p-5">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#8B0000]" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em]">Order confirmed</p>
                <p className="mt-1 text-sm text-[#68625C]">Redirecting you back to the collection.</p>
              </div>
            </div>
          ) : null}

          <div className="grid gap-6">
            <section className="border border-[#CFC5B8] bg-[#FAF9F6] p-5">
              <div className="mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-[#8B0000]" />
                <h2 className="text-xs font-semibold uppercase tracking-[0.25em]">Contact</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Full name" value={form.fullName} onChange={(v: string) => setForm((p) => ({ ...p, fullName: v }))} required />
                <Field label="Email" type="email" value={form.email} onChange={(v: string) => setForm((p) => ({ ...p, email: v }))} required />
                <Field label="Phone" type="tel" value={form.phone} onChange={(v: string) => setForm((p) => ({ ...p, phone: v }))} />
              </div>
            </section>

            <section className="border border-[#CFC5B8] bg-[#FAF9F6] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#8B0000]" />
                <h2 className="text-xs font-semibold uppercase tracking-[0.25em]">Shipping</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2"><Field label="Address line 1" value={form.line1} onChange={(v: string) => setForm((p) => ({ ...p, line1: v }))} required /></div>
                <div className="md:col-span-2"><Field label="Address line 2" value={form.line2} onChange={(v: string) => setForm((p) => ({ ...p, line2: v }))} /></div>
                <Field label="City" value={form.city} onChange={(v: string) => setForm((p) => ({ ...p, city: v }))} required />
                <Field label="State" value={form.state} onChange={(v: string) => setForm((p) => ({ ...p, state: v }))} />
                <Field label="ZIP / Postal code" value={form.postalCode} onChange={(v: string) => setForm((p) => ({ ...p, postalCode: v }))} required />
                <Field label="Country" value={form.country} onChange={(v: string) => setForm((p) => ({ ...p, country: v }))} required />
              </div>
            </section>

            <section className="border border-[#CFC5B8] bg-[#FAF9F6] p-5">
              <div className="mb-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#8B0000]" />
                <h2 className="text-xs font-semibold uppercase tracking-[0.25em]">Payment</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2"><Field label="Card number" value={form.cardNumber} onChange={(v: string) => setForm((p) => ({ ...p, cardNumber: v }))} placeholder="1234 5678 9012 3456" required /></div>
                <Field label="Expiry" value={form.expiry} onChange={(v: string) => setForm((p) => ({ ...p, expiry: v }))} placeholder="MM/YY" required />
                <Field label="CVV" value={form.cvv} onChange={(v: string) => setForm((p) => ({ ...p, cvv: v }))} placeholder="123" required />
              </div>
            </section>
          </div>
        </section>

        <aside className="h-fit border border-[#CFC5B8] bg-[#FAF9F6] p-5 lg:sticky lg:top-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em]">Order summary</h2>
          <div className="mt-4 space-y-3 border-y border-[#CFC5B8] py-4">
            {items.map((item: any) => (
              <div key={item?.id ?? item?.productId ?? item?.name} className="flex items-start gap-3">
                <div className="h-16 w-12 overflow-hidden bg-[#F5F1EB]">
                  <img src={item?.image ?? item?.product?.images?.[0]?.url ?? 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80'} alt={item?.name ?? 'Product'} crossOrigin="anonymous" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item?.name ?? 'Item'}</p>
                  <p className="text-xs text-[#68625C]">Qty {item?.quantity ?? 1}</p>
                </div>
                <p className="text-sm font-semibold">₹{((item?.price ?? 0) * (item?.quantity ?? 0)).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2 py-4 text-sm">
            <div className="flex justify-between"><span className="text-[#68625C]">Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between"><span className="text-[#68625C]">Shipping</span><span>{shipping === 0 ? 'Complimentary' : `₹${shipping.toLocaleString('en-IN')}`}</span></div>
            <div className="flex justify-between"><span className="text-[#68625C]">Tax</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between border-t border-[#CFC5B8] pt-2 text-base font-semibold"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
          </div>
          <button
            type="button"
            onClick={() => submitOrder()}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Processing' : 'Place order'}
          </button>
          <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-[#68625C]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            By placing your order, you confirm your shipping and payment details are accurate.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default CheckoutPage;