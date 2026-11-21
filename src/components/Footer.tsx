import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import { toast } from 'sonner';

export interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  const [email, setEmail] = useState('');
  const year = useMemo(() => new Date().getFullYear(), []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = email.trim();
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success('You are on the list.');
    setEmail('');
  };

  const linkClass = 'text-xs uppercase tracking-[0.22em] text-[#716A63] transition-colors hover:text-[#2B2B2B]';
  const socialClass = 'inline-flex h-9 w-9 items-center justify-center border border-[#CFC6BA] text-[#2B2B2B] transition-colors hover:bg-[#8B0000] hover:text-white';

  return (
    <footer className={`border-t border-[#CFC6BA] bg-[#FFFDF9] ${className}`}>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <p className="font-['Playfair_Display'] text-2xl font-light tracking-tight text-[#2B2B2B]">NDDN Store</p>
          <p className="max-w-md text-sm leading-6 text-[#716A63]">
            Warm ivory canvases, sharp tailoring, and deep-crimson accents for a quieter kind of luxury.
          </p>
          <p className="text-xs uppercase tracking-[0.22em] text-[#716A63]">© {year} NDDN Store</p>
        </div>

        <nav aria-label="Customer care" className="space-y-4">
          <h2 className="text-xs uppercase tracking-[0.22em] text-[#2B2B2B]">Customer Care</h2>
          <div className="flex flex-col gap-2.5">
            <Link className={linkClass} to="/shop">Shop</Link>
            <Link className={linkClass} to="/checkout">Checkout</Link>
            <Link className={linkClass} to="/dashboard">Orders & Account</Link>
            <a className={linkClass} href="mailto:care@nddnstore.com">care@nddnstore.com</a>
          </div>
        </nav>

        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-[0.22em] text-[#2B2B2B]">Shipping & Social</h2>
          <div className="flex flex-col gap-2.5">
            <Link className={linkClass} to="/shop?filter=shipping">Shipping Information</Link>
            <Link className={linkClass} to="/shop?filter=returns">Returns & Exchanges</Link>
            <div className="flex flex-wrap gap-2">
              <a className={socialClass} href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={16} /></a>
              <a className={socialClass} href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><Twitter size={16} /></a>
              <a className={socialClass} href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={16} /></a>
              <a className={socialClass} href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><Youtube size={16} /></a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#CFC6BA]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <p className="max-w-xl text-sm leading-6 text-[#716A63]">
            A refined wardrobe built for considered dressing, delivered with precision and care.
          </p>
          <form onSubmit={handleSubmit} className="flex w-full max-w-md items-stretch gap-2">
            <label className="sr-only" htmlFor="footer-email">Email address</label>
            <input
              id="footer-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email for collection notes"
              className="min-w-0 flex-1 border border-[#CFC6BA] bg-[#FFFDF9] px-4 py-3 text-sm text-[#2B2B2B] outline-none placeholder:text-[#716A63] focus:border-[#8B0000]"
            />
            <button type="submit" className="inline-flex items-center gap-2 border border-[#8B0000] bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#650000]">
              Join <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
}

export default Footer;