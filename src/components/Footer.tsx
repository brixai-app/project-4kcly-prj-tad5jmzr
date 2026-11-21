import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, MapPin, Phone, Instagram, Facebook, Twitter, Youtube, Shield, Truck, CreditCard, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function Footer({ className = '' }: { className?: string } = {}) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const links = useMemo(
    () => ({
      shop: [
        { label: 'New Arrivals', to: '/shop' },
        { label: 'Dresses', to: '/shop?category=dresses' },
        { label: 'Outerwear', to: '/shop?category=outerwear' },
        { label: 'Accessories', to: '/shop?category=accessories' },
      ],
      care: [
        { label: 'Shipping & Delivery', to: '/shop' },
        { label: 'Returns & Exchanges', to: '/shop' },
        { label: 'Size Guide', to: '/shop' },
        { label: 'Contact Support', to: '/shop' },
      ],
      social: [
        { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
        { label: 'Facebook', href: 'https://facebook.com', icon: Facebook },
        { label: 'Twitter', href: 'https://twitter.com', icon: Twitter },
        { label: 'Youtube', href: 'https://youtube.com', icon: Youtube },
      ],
    }),
    [],
  );

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = email.trim();
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error('Enter a valid email address.');
      return;
    }
    setStatus('success');
    setEmail('');
    toast.success('You are on the list.');
  };

  return (
    <footer className={`border-t border-[#C9BFB1] bg-[#FFFCF7] text-[#2E2B28] ${className}`}>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-12 md:px-6 lg:px-8">
        <section className="md:col-span-4">
          <p className="font-serif text-3xl tracking-tight">NDDN Store</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-[#71695F]">
            An editorial boutique shaped by ivory light, deep-crimson accents, and precise tailoring. Curated drops, refined essentials, and a calm luxury experience.
          </p>
          <div className="mt-6 flex flex-col gap-3 text-sm text-[#71695F]">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#8B0000]" />
              <span className="min-w-0 truncate">Mumbai, India</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#8B0000]" />
              <span className="min-w-0 truncate">+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#8B0000]" />
              <span className="min-w-0 truncate">concierge@nddnstore.com</span>
            </div>
          </div>
        </section>

        <section className="md:col-span-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-[#71695F]">Shop</h2>
          <div className="mt-4 flex flex-col gap-2.5">
            {links.shop.map((item) => (
              <Link key={item.label} to={item.to} className="text-sm text-[#2E2B28] transition-colors hover:text-[#8B0000]">
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="md:col-span-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-[#71695F]">Customer Care</h2>
          <div className="mt-4 flex flex-col gap-2.5">
            {links.care.map((item) => (
              <Link key={item.label} to={item.to} className="text-sm text-[#2E2B28] transition-colors hover:text-[#8B0000]">
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="md:col-span-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-[#71695F]">Newsletter</h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-[#71695F]">
            Receive collection notes, private previews, and shipping updates. No noise, only the essentials.
          </p>
          <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 border border-[#C9BFB1] bg-white px-3 py-2">
              <Mail className="h-4 w-4 shrink-0 text-[#8B0000]" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="Email address"
                className="w-full bg-transparent text-sm text-[#2E2B28] outline-none placeholder:text-[#71695F]"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition-colors hover:bg-[#650000]"
            >
              Join the list
              <ArrowRight className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#71695F]">
              {status === 'success' ? <CheckCircle2 className="h-4 w-4 text-[#8B0000]" /> : <Shield className="h-4 w-4 text-[#8B0000]" />}
              <span>{status === 'success' ? 'Subscribed successfully' : 'Secure signup and privacy-first updates'}</span>
            </div>
          </form>
        </section>
      </div>

      <div className="border-t border-[#C9BFB1]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 text-xs uppercase tracking-[0.22em] text-[#71695F] md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} NDDN Store</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2">
              <Truck className="h-4 w-4 text-[#8B0000]" />
              Fast dispatch
            </span>
            <span className="inline-flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#8B0000]" />
              Secure checkout
            </span>
            <div className="flex items-center gap-3">
              {links.social.map((item) => {
                const Icon = item.icon;
                return (
                  <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#2E2B28] transition-colors hover:text-[#8B0000]">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;