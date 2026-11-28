import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Instagram, Linkedin, Mail, Phone, Send, Twitter } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function Footer({ className = '' }: { className?: string }) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const links = useMemo(
    () => ({
      shop: [
        { label: 'New Arrivals', to: '/shop' },
        { label: 'Outerwear', to: '/shop?category=Outerwear' },
        { label: 'Tailoring', to: '/shop?category=Tailoring' },
        { label: 'Accessories', to: '/shop?category=Accessories' },
      ],
      care: [
        { label: 'Shipping & Delivery', to: '/shop' },
        { label: 'Returns & Exchanges', to: '/shop' },
        { label: 'Size Guide', to: '/shop' },
        { label: 'Contact Support', to: '/shop' },
      ],
      social: [
        { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
        { label: 'Twitter', href: 'https://twitter.com', icon: Twitter },
        { label: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
      ],
    }),
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value || !value.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      toast.success('You are on the list. Expect the next drop soon.');
      setEmail('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className={cn('border-t border-[#C9BEB4] bg-[#F1ECE7] text-[#2E2E2E]', className)}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div className="space-y-4">
            <p className="font-serif text-3xl tracking-tight">NDDN Store</p>
            <p className="max-w-md text-sm leading-7 text-[#6F665F]">
              A luxury fashion storefront shaped by warm paper tones, crimson accents, and editorial restraint.
              Curated collections, precise tailoring, and considered essentials for the modern wardrobe.
            </p>
            <div className="flex flex-col gap-2 text-sm text-[#6F665F]">
              <a className="inline-flex items-center gap-2 transition-colors hover:text-[#8B0000]" href="mailto:care@nddnstore.com">
                <Mail className="h-4 w-4" /> care@nddnstore.com
              </a>
              <a className="inline-flex items-center gap-2 transition-colors hover:text-[#8B0000]" href="tel:+911234567890">
                <Phone className="h-4 w-4" /> +91 12345 67890
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6F665F]">Shop</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {links.shop.map((item) => (
                <li key={item.label}>
                  <Link className="group inline-flex items-center gap-2 text-sm text-[#2E2E2E] transition-colors hover:text-[#8B0000]" to={item.to}>
                    <span className="min-w-0 truncate">{item.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6F665F]">Customer Care</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {links.care.map((item) => (
                <li key={item.label}>
                  <Link className="text-sm text-[#2E2E2E] transition-colors hover:text-[#8B0000]" to={item.to}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center gap-4">
              {links.social.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    className="inline-flex h-9 w-9 items-center justify-center border border-[#C9BEB4] text-[#2E2E2E] transition-colors hover:border-[#8B0000] hover:text-[#8B0000]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6F665F]">Newsletter</h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[#6F665F]">
              Receive collection notes, early access, and quiet updates from the studio.
            </p>
            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
              <label className="sr-only" htmlFor="footer-email">
                Email address
              </label>
              <div className="flex items-stretch gap-2">
                <input
                  id="footer-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="min-w-0 flex-1 border border-[#C9BEB4] bg-[#F9F7F6] px-4 py-3 text-sm text-[#2E2E2E] outline-none transition-colors placeholder:text-[#6F665F] focus:border-[#8B0000]"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 border border-[#8B0000] bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white transition-colors hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Send className="h-4 w-4" />
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[#C9BEB4] pt-6 text-xs uppercase tracking-[0.22em] text-[#6F665F] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NDDN Store. All rights reserved.</p>
          <p>Shipping across India · Secure checkout · Editorial service</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;