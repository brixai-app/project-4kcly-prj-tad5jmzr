import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Instagram, Twitter, Facebook, Youtube, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const links = useMemo(
    () => ({
      customerCare: [
        { label: 'Shipping & Delivery', to: '/shipping' },
        { label: 'Returns & Exchanges', to: '/returns' },
        { label: 'Size Guide', to: '/size-guide' },
        { label: 'Contact Support', to: '/contact' },
      ],
      story: [
        { label: 'About NDDN', to: '/about' },
        { label: 'Craft & Materials', to: '/craft' },
        { label: 'Journal', to: '/journal' },
        { label: 'Store Locator', to: '/stores' },
      ],
      social: [
        { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
        { label: 'Twitter', href: 'https://twitter.com', icon: Twitter },
        { label: 'Facebook', href: 'https://facebook.com', icon: Facebook },
        { label: 'YouTube', href: 'https://youtube.com', icon: Youtube },
      ],
    }),
    []
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = email.trim();
    if (!value || !/^\S+@\S+\.\S+$/.test(value)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setSubmitted(true);
    setEmail('');
    toast.success('You are on the list.');
  };

  return (
    <footer className={`border-t border-[#C9BDB2] bg-[#F9F7F6] text-[#2B2B2B] ${className}`}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <section className="space-y-5">
            <div className="space-y-3">
              <p className="font-['Playfair_Display'] text-3xl font-normal tracking-tight">NDDN Store</p>
              <p className="max-w-md text-sm leading-7 text-[#6E655F]">
                An editorial fashion destination shaped by warm neutrals, crimson accents, and considered silhouettes.
              </p>
            </div>
            <div className="space-y-3 text-sm text-[#6E655F]">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#B11226]" />
                <span className="min-w-0 break-words">Mumbai, India · Appointments and online orders worldwide</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-[#B11226]" />
                <a className="transition-colors hover:text-[#B11226]" href="tel:+910000000000">
                  +91 00000 00000
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-[#B11226]" />
                <a className="transition-colors hover:text-[#B11226]" href="mailto:care@nddnstore.com">
                  care@nddnstore.com
                </a>
              </div>
            </div>
          </section>

          <nav aria-label="Customer care" className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6E655F]">Customer Care</h2>
            <ul className="flex flex-col gap-2.5">
              {links.customerCare.map((item) => (
                <li key={item.label}>
                  <Link className="block text-sm text-[#2B2B2B] transition-colors hover:text-[#B11226]" to={item.to}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Brand story" className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6E655F]">Story</h2>
            <ul className="flex flex-col gap-2.5">
              {links.story.map((item) => (
                <li key={item.label}>
                  <Link className="block text-sm text-[#2B2B2B] transition-colors hover:text-[#B11226]" to={item.to}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6E655F]">Newsletter</h2>
            <p className="text-sm leading-7 text-[#6E655F]">
              Receive collection notes, early access, and shipping updates.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-center gap-2 border border-[#C9BDB2] bg-white px-3 py-2">
                <input
                  aria-label="Email address"
                  className="min-w-0 flex-1 bg-transparent text-sm text-[#2B2B2B] outline-none placeholder:text-[#6E655F]"
                  placeholder="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  className="inline-flex items-center gap-2 border border-[#B11226] bg-[#B11226] px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#8F0E1F]"
                  type="submit"
                >
                  Join <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              {submitted ? (
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#B11226]">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Subscription confirmed</span>
                </div>
              ) : null}
            </form>
            <div className="flex items-center gap-3 pt-2">
              {links.social.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    aria-label={item.label}
                    className="inline-flex h-9 w-9 items-center justify-center border border-[#C9BDB2] text-[#2B2B2B] transition-colors hover:border-[#B11226] hover:text-[#B11226]"
                    href={item.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </section>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[#C9BDB2] pt-5 text-xs uppercase tracking-[0.22em] text-[#6E655F] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NDDN Store</p>
          <p>Luxury fashion · Editorial commerce · Secure checkout</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;