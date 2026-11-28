import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, CreditCard, Lock, Mail, MapPin, Phone, ShoppingBag, Truck } from 'lucide-react';
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import type { CheckoutForm, CreateOrderPayload, OrderItem } from "@/types";

type FieldErrors = Partial<Record<keyof CheckoutForm | "cardNumber" | "expiry" | "cvv", string>>;

const initialForm: CheckoutForm = {
  fullName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  paymentMethod: "card",
};

function luhnCheck(value: string) {
  const digits = value.replace(/\s+/g, "");
  if (!/^\d{12,19}$/.test(digits)) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i] ?? "0");
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function validateExpiry(value: string) {
  const match = value.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = Number(match[1] ?? "0");
  const year = Number(`20${match[2] ?? "00"}`);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const expiry = new Date(year, month, 0, 23, 59, 59, 999);
  return expiry >= now;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart, subtotal } = useCart() as {
    items?: { productId: string; product?: { id?: string; name?: string; price?: number; image?: string }; quantity?: number; size?: string; color?: string }[];
    clearCart?: () => void;
    subtotal?: number;
  };
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const orderItems: OrderItem[] = useMemo(
    () =>
      (items ?? []).map((item) => ({
        productId: item?.productId ?? item?.product?.id ?? "",
        name: item?.product?.name ?? "Item",
        price: item?.product?.price ?? 0,
        quantity: item?.quantity ?? 1,
        size: item?.size,
        color: item?.color,
        image: item?.product?.image,
      })),
    [items]
  );

  const total = useMemo(() => (subtotal ?? 0) + ((subtotal ?? 0) > 0 ? 0 : 0), [subtotal]);

  const updateField = <K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const next: FieldErrors = {};
    (["fullName", "email", "phone", "addressLine1", "city", "state", "postalCode", "country"] as const).forEach((key) => {
      if (!String(form[key] ?? "").trim()) next[key] = "Required field";
    });
    if (form.paymentMethod === "card") {
      if (!luhnCheck(cardNumber)) next.cardNumber = "Enter a valid card number";
      if (!validateExpiry(expiry)) next.expiry = "Enter a valid expiry date";
      if (!/^\d{3,4}$/.test(cvv)) next.cvv = "Enter a valid CVV";
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email ?? "")) next.email = "Enter a valid email";
    if (!/^[0-9+\-\s()]{7,}$/.test(form.phone ?? "")) next.phone = "Enter a valid phone number";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submitOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      toast.error("Please correct the highlighted fields.");
      return;
    }
    if ((orderItems?.length ?? 0) === 0) {
      toast.error("Your cart is empty.");
      navigate("/shop");
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateOrderPayload = {
        email: form.email,
        items: orderItems,
        shippingAddress: form,
        paymentMethod: form.paymentMethod,
      };
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Order submission failed");
      clearCart?.();
      toast.success("Order placed successfully.");
      navigate("/dashboard");
    } catch {
      toast.error("Unable to place order right now.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-sm border border-stone-300 bg-white px-3 py-3 text-sm text-stone-900 outline-none transition focus:border-[#8B0000]";
  const labelClass = "text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600";

  return (
    <div className="bg-[#F9F7F6] px-4 py-8 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.35fr_0.85fr]">
        <form onSubmit={submitOrder} className="space-y-8">
          <section className="border border-stone-300 bg-white p-6">
            <div className="mb-5 flex items-center gap-3">
              <ShoppingBag className="h-5 w-5 text-[#8B0000]" />
              <h1 className="font-['Bodoni_Moda'] text-3xl font-light tracking-tight">Checkout</h1>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelClass}>Full name</label>
                <input className={inputClass} value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} />
                {errors.fullName ? <p className="mt-1 text-xs text-[#8B0000]">{errors.fullName}</p> : null}
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input className={inputClass} type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
                {errors.email ? <p className="mt-1 text-xs text-[#8B0000]">{errors.email}</p> : null}
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input className={inputClass} value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
                {errors.phone ? <p className="mt-1 text-xs text-[#8B0000]">{errors.phone}</p> : null}
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Address line 1</label>
                <input className={inputClass} value={form.addressLine1} onChange={(e) => updateField("addressLine1", e.target.value)} />
                {errors.addressLine1 ? <p className="mt-1 text-xs text-[#8B0000]">{errors.addressLine1}</p> : null}
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Address line 2</label>
                <input className={inputClass} value={form.addressLine2 ?? ""} onChange={(e) => updateField("addressLine2", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input className={inputClass} value={form.city} onChange={(e) => updateField("city", e.target.value)} />
                {errors.city ? <p className="mt-1 text-xs text-[#8B0000]">{errors.city}</p> : null}
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input className={inputClass} value={form.state} onChange={(e) => updateField("state", e.target.value)} />
                {errors.state ? <p className="mt-1 text-xs text-[#8B0000]">{errors.state}</p> : null}
              </div>
              <div>
                <label className={labelClass}>Postal code</label>
                <input className={inputClass} value={form.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} />
                {errors.postalCode ? <p className="mt-1 text-xs text-[#8B0000]">{errors.postalCode}</p> : null}
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <input className={inputClass} value={form.country} onChange={(e) => updateField("country", e.target.value)} />
                {errors.country ? <p className="mt-1 text-xs text-[#8B0000]">{errors.country}</p> : null}
              </div>
            </div>
          </section>

          <section className="border border-stone-300 bg-white p-6">
            <div className="mb-5 flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-[#8B0000]" />
              <h2 className="font-['Bodoni_Moda'] text-2xl font-light tracking-tight">Payment</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-3">
                <label className={labelClass}>Card number</label>
                <input className={inputClass} value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="1234 5678 9012 3456" />
                {errors.cardNumber ? <p className="mt-1 text-xs text-[#8B0000]">{errors.cardNumber}</p> : null}
              </div>
              <div>
                <label className={labelClass}>Expiry</label>
                <input className={inputClass} value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" />
                {errors.expiry ? <p className="mt-1 text-xs text-[#8B0000]">{errors.expiry}</p> : null}
              </div>
              <div>
                <label className={labelClass}>CVV</label>
                <input className={inputClass} value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="123" />
                {errors.cvv ? <p className="mt-1 text-xs text-[#8B0000]">{errors.cvv}</p> : null}
              </div>
              <div className="flex items-end">
                <label className="flex w-full items-center gap-3 border border-stone-300 px-3 py-3 text-sm">
                  <input type="radio" checked={form.paymentMethod === "cod"} onChange={() => updateField("paymentMethod", "cod")} />
                  Cash on delivery
                </label>
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 bg-[#8B0000] px-5 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#680000] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Lock className="h-4 w-4" />
            {submitting ? "Placing order" : "Place order"}
          </button>
        </form>

        <aside className="space-y-6">
          <section className="border border-stone-300 bg-white p-6">
            <h2 className="font-['Bodoni_Moda'] text-2xl font-light tracking-tight">Order summary</h2>
            <div className="mt-5 space-y-4">
              {(orderItems ?? []).map((item) => (
                <div key={`${item.productId}-${item.size ?? "na"}-${item.color ?? "na"}`} className="flex gap-4 border-b border-stone-200 pb-4 last:border-b-0 last:pb-0">
                  <img src={item.image ?? "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85"} alt={item.name} crossOrigin="anonymous" className="h-20 w-16 shrink-0 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{item.size ?? "One size"} · {item.color ?? "Default"}</p>
                    <p className="mt-1 text-sm font-semibold">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-2 border-t border-stone-300 pt-4 text-sm">
              <div className="flex items-center justify-between"><span>Subtotal</span><span>₹{(subtotal ?? 0).toLocaleString("en-IN")}</span></div>
              <div className="flex items-center justify-between"><span>Shipping</span><span>Complimentary</span></div>
              <div className="flex items-center justify-between border-t border-stone-300 pt-2 text-base font-semibold"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
            </div>
          </section>

          <section className="border border-stone-300 bg-white p-6">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-[#8B0000]" />
              <h3 className="font-['Bodoni_Moda'] text-2xl font-light tracking-tight">Delivery</h3>
            </div>
            <div className="mt-4 space-y-3 text-sm text-stone-700">
              <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-[#8B0000]" /> Verified shipping address required for dispatch.</p>
              <p className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 text-[#8B0000]" /> Order confirmation will be sent to your email.</p>
              <p className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 text-[#8B0000]" /> Support is available after checkout for delivery updates.</p>
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-stone-500">
              <CheckCircle2 className="h-4 w-4 text-[#8B0000]" />
              Secure checkout
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

// [auto-removed: duplicate declaration of CheckoutPage]
// export function CheckoutPage() {
//   return <CheckoutPage />;
// }

export default CheckoutPage;