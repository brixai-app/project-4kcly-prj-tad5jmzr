import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Github, Instagram, Linkedin, Mail, Twitter, Circle as Icon } from 'lucide-react';
import { toast } from 'sonner';

export function Footer() {
  const [email, setEmail] = useState('');
  const year = useMemo(() => new Date().getFullYear(), []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = email.trim();
    if (!value || !/^\S+@\S+\.\S+$/.test(value)) {
      toast.error('Enter a valid email address.');
      return;
    }
    toast.success('You are on the list.');
    setEmail('');
  };

  const linkClass =
    'block min-w-0 truncate text-sm text-[#6E655E] transition-colors hover:text-[#8B0000]';
  const headingClass =
    'font-["Playfair_Display",sans-serif] text-sm uppercase tracking-[0.22em] text-[#2E2E2E]';

  return (
    <footer className="border-t border-[#C9BDB2] bg-[#F9F7F6] text-[#2E2E2E]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr_0.9fr_0.9fr_1.2fr] lg:px-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="font-['Playfair_Display',sans-serif] text-2xl tracking-tight">NDDN Store</p>
            <p className="max-w-md text-sm leading-6 text-[#6E655E]">
              A luxury fashion boutique shaped by fine-paper neutrals, deep-crimson accents, and editorial
              silhouettes curated for the modern wardrobe.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
              { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
              { href: 'https://github.com', icon: Github, label: 'Github' },
              { href: 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
            ].map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="inline-flex h-10 w-10 items-center justify-center border border-[#C9BDB2] text-[#2E2E2E] transition-colors hover:border-[#8B0000] hover:text-[#8B0000]"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className={headingClass}>Customer Care</h2>
          <nav className="flex flex-col gap-2.5">
            <Link className={linkClass} to="/shop">
              Shop Latest
            </Link>
            <Link className={linkClass} to="/cart">
              Cart
            </Link>
            <Link className={linkClass} to="/checkout">
              Checkout
            </Link>
            <a className={linkClass} href="mailto:care@nddnstore.com">
              care@nddnstore.com
            </a>
          </nav>
        </div>

        <div className="space-y-4">
          <h2 className={headingClass}>Shipping</h2>
          <nav className="flex flex-col gap-2.5">
            <a className={linkClass} href="#">
              Delivery & Returns
            </a>
            <a className={linkClass} href="#">
              Order Tracking
            </a>
            <a className={linkClass} href="#">
              Size Guide
            </a>
            <a className={linkClass} href="#">
              Store Pickup
            </a>
          </nav>
        </div>

        <div className="space-y-4">
          <h2 className={headingClass}>Newsletter</h2>
          <p className="text-sm leading-6 text-[#6E655E]">
            Receive collection notes, early access, and private edits from the atelier.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="sr-only" htmlFor="footer-email">
              Email address
            </label>
            <div className="flex items-stretch border border-[#C9BDB2] bg-white">
              <Mail className="ml-3 mt-3 h-4 w-4 shrink-0 text-[#6E655E]" />
              <input
                id="footer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-[#2E2E2E] outline-none placeholder:text-[#6E655E]"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 border-l border-[#C9BDB2] bg-[#8B0000] px-4 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#650000]"
              >
                Join <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="border-t border-[#C9BDB2]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-xs uppercase tracking-[0.2em] text-[#6E655E] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {year} NDDN Store</p>
          <p>Fine-paper canvas. Deep-crimson actions. Editorial commerce.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;