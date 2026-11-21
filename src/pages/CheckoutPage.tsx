import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, CreditCard, Lock, MapPin, Truck, Circle as Icon } from 'lucide-react';
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import type { Address, CheckoutForm, CheckoutResponse, OrderItem } from "@/types";

type FieldProps = {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
};

function Field({ label = "", value = "", onChange = () => {}, placeholder = "", type = "text", required = false }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6F685F]">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-sm border border-[#CFC5B8] bg-[#FFFCF8] px-3 py-3 text-sm text-[#211F1D] outline-none transition focus:border-[#8B0000]"
      />
    </label>
  );
}

function SectionTitle({ title = "", icon: Icon = MapPin }: { title?: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-2 border-b border-[#CFC5B8] pb-3">
      <Icon className="h-4 w-4 text-[#8B0000]" />
      <h2 className="font-['Bodoni_Moda'] text-xl font-light tracking-tight text-[#211F1D]">{title}</h2>
    </div>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items = [], clearCart = () => {} } = useCart() as {
    items?: Array<{ productId?: string; variantId?: string | null; name?: string; image?: string | null; price?: number; quantity?: number; color?: string | null; size?: string | null }>;
    clearCart?: () => void;
  };
  const [loading, setLoading] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string>("");
  const [form, setForm] = useState<CheckoutForm>({
    email: "",
    name: "",
    phone: "",
    shippingAddress: { line1: "", line2: "", city: "", state: "", postalCode: "", country: "India" },
    billingAddress: { line1: "", line2: "", city: "", state: "", postalCode: "", country: "India" },
    notes: "",
  });

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + (item?.price ?? 0) * (item?.quantity ?? 0), 0), [items]);
  const shipping = subtotal > 0 ? 249 : 0;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const updateAddress = (key: "shippingAddress" | "billingAddress", field: keyof Address, value: string) =>
    setForm((prev) => ({ ...prev, [key]: { ...(prev[key] ?? { line1: "", city: "", postalCode: "", country: "India" }), [field]: value } }));

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return toast.error("Your cart is empty.");
    setLoading(true);
    try {
      const payload = {
        customer: { email: form.email, name: form.name, phone: form.phone ?? "" },
        shippingAddress: form.shippingAddress,
        billingAddress: form.billingAddress,
        notes: form.notes ?? "",
        items: items.map((item): OrderItem => ({
          productId: item?.productId ?? "",
          variantId: item?.variantId ?? null,
          name: item?.name ?? "",
          price: item?.price ?? 0,
          quantity: item?.quantity ?? 0,
          image: item?.image ?? null,
        })),
      };
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as CheckoutResponse | null;
      if (!res.ok) throw new Error(data?.error ?? "Unable to place order.");
      const orderId = data?.data?.orderId ?? "";
      setSuccessOrderId(orderId);
      clearCart();
      toast.success("Order placed successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!items.length && !successOrderId) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="border border-[#CFC5B8] bg-[#FFFCF8] p-8 text-center">
          <h1 className="font-['Bodoni_Moda'] text-4xl font-light tracking-tight text-[#211F1D]">Checkout</h1>
          <p className="mt-3 text-sm text-[#6F685F]">Your cart is currently empty.</p>
          <button
            type="button"
            onClick={() => navigate("/shop")}
            className="mt-6 inline-flex items-center justify-center rounded-sm bg-[#8B0000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-[#650000]"
          >
            Continue Shopping
          </button>
        </div>
      </main>
    );
  }

  if (successOrderId) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="border border-[#CFC5B8] bg-[#FFFCF8] p-8 sm:p-10">
          <CheckCircle2 className="h-10 w-10 text-[#8B0000]" />
          <h1 className="mt-4 font-['Bodoni_Moda'] text-4xl font-light tracking-tight text-[#211F1D]">Order confirmed</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#6F685F]">
            Thank you for your purchase. Your order has been received and is now being prepared.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="border border-[#CFC5B8] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6F685F]">Order ID</p>
              <p className="mt-2 break-all text-sm text-[#211F1D]">{successOrderId}</p>
            </div>
            <div className="border border-[#CFC5B8] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6F685F]">Next step</p>
              <p className="mt-2 text-sm text-[#211F1D]">You will receive a confirmation email shortly.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/shop")}
            className="mt-8 inline-flex items-center justify-center rounded-sm bg-[#8B0000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-[#650000]"
          >
            Back to Shop
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={submitOrder} className="space-y-8">
          <section className="border border-[#CFC5B8] bg-[#FFFCF8] p-5 sm:p-6">
            <SectionTitle title="Contact" icon={Lock} />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} required />
              <Field label="Email" type="email" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} required />
              <Field label="Phone" value={form.phone ?? ""} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} />
            </div>
          </section>

          <section className="border border-[#CFC5B8] bg-[#FFFCF8] p-5 sm:p-6">
            <SectionTitle title="Shipping" icon={Truck} />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Address line 1" value={form.shippingAddress.line1} onChange={(v) => updateAddress("shippingAddress", "line1", v)} required />
              </div>
              <div className="sm:col-span-2">
                <Field label="Address line 2" value={form.shippingAddress.line2 ?? ""} onChange={(v) => updateAddress("shippingAddress", "line2", v)} />
              </div>
              <Field label="City" value={form.shippingAddress.city} onChange={(v) => updateAddress("shippingAddress", "city", v)} required />
              <Field label="State" value={form.shippingAddress.state ?? ""} onChange={(v) => updateAddress("shippingAddress", "state", v)} />
              <Field label="Postal code" value={form.shippingAddress.postalCode} onChange={(v) => updateAddress("shippingAddress", "postalCode", v)} required />
              <Field label="Country" value={form.shippingAddress.country} onChange={(v) => updateAddress("shippingAddress", "country", v)} required />
            </div>
          </section>

          <section className="border border-[#CFC5B8] bg-[#FFFCF8] p-5 sm:p-6">
            <SectionTitle title="Payment" icon={CreditCard} />
            <div className="mt-5 border border-[#CFC5B8] p-4">
              <p className="text-sm text-[#211F1D]">Secure payment processing is handled after order submission.</p>
              <p className="mt-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#6F685F]">
                <Lock className="h-4 w-4 text-[#8B0000]" />
                Encrypted checkout
              </p>
            </div>
            <label className="mt-4 flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6F685F]">Order notes</span>
              <textarea
                value={form.notes ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                rows={4}
                className="w-full rounded-sm border border-[#CFC5B8] bg-[#FFFCF8] px-3 py-3 text-sm text-[#211F1D] outline-none transition focus:border-[#8B0000]"
                placeholder="Delivery instructions or notes"
              />
            </label>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#8B0000] px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <section className="border border-[#CFC5B8] bg-[#FFFCF8] p-5 sm:p-6">
            <SectionTitle title="Order Summary" icon={MapPin} />
            <div className="mt-5 space-y-4">
              {items.map((item, index) => (
                <div key={`${item?.productId ?? "item"}-${item?.variantId ?? index}`} className="flex gap-4 border-b border-[#CFC5B8] pb-4 last:border-b-0 last:pb-0">
                  <div className="h-20 w-16 shrink-0 overflow-hidden border border-[#CFC5B8] bg-[#F5F1EC]">
                    <img
                      src={item?.image ?? "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80"}
                      alt={item?.name ?? "Product"}
                      crossOrigin="anonymous"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#211F1D]">{item?.name ?? "Product"}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#6F685F]">
                      Qty {item?.quantity ?? 0}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[#211F1D]">₹{((item?.price ?? 0) * (item?.quantity ?? 0)).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-2 border-t border-[#CFC5B8] pt-4 text-sm">
              <div className="flex items-center justify-between text-[#6F685F]"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
              <div className="flex items-center justify-between text-[#6F685F]"><span>Shipping</span><span>₹{shipping.toLocaleString("en-IN")}</span></div>
              <div className="flex items-center justify-between text-[#6F685F]"><span>Tax</span><span>₹{tax.toLocaleString("en-IN")}</span></div>
              <div className="flex items-center justify-between border-t border-[#CFC5B8] pt-3 text-base font-semibold text-[#211F1D]"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
            </div>
          </section>
          <div className="border border-[#CFC5B8] bg-[#FFFCF8] p-5 text-sm text-[#6F685F]">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#211F1D]">
              <CheckCircle2 className="h-4 w-4 text-[#8B0000]" />
              Secure delivery
            </p>
            <p className="mt-3 leading-6">Orders are processed with care and shipped in refined packaging.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default CheckoutPage;