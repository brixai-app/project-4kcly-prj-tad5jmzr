import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Instagram, Linkedin, Mail, Phone, Twitter } from 'lucide-react';
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");
  const year = useMemo(() => new Date().getFullYear(), []);
  const links = {
    care: [
      { label: "Shipping & Delivery", to: "/shop" },
      { label: "Returns & Exchanges", to: "/shop" },
      { label: "Size Guide", to: "/shop" },
      { label: "Contact Support", to: "/shop" },
    ],
    social: [
      { label: "Instagram", href: "https://instagram.com", icon: Instagram },
      { label: "Twitter", href: "https://twitter.com", icon: Twitter },
      { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
    ],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value || !/^\S+@\S+\.\S+$/.test(value)) {
      toast.error("Enter a valid email address.");
      return;
    }
    toast.success("You’re on the list. Expect the next drop soon.");
    setEmail("");
  };

  return (
    <footer className="border-t border-[#CFC5B8] bg-[#FFFCF8] text-[#211F1D]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-12 md:px-6 lg:px-8">
        <div className="md:col-span-5">
          <p className="font-['Bodoni_Moda'] text-3xl font-light tracking-tight">NDDN Store</p>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#6F685F]">
            An editorial fashion destination shaped by quiet luxury, precise tailoring, and a deep-crimson point of view.
          </p>
          <div className="mt-6 flex flex-col gap-2 text-sm text-[#6F685F]">
            <a className="inline-flex items-center gap-2 transition-colors hover:text-[#8B0000]" href="mailto:care@nddnstore.com">
              <Mail className="h-4 w-4" /> care@nddnstore.com
            </a>
            <a className="inline-flex items-center gap-2 transition-colors hover:text-[#8B0000]" href="tel:+910000000000">
              <Phone className="h-4 w-4" /> +91 00000 00000
            </a>
          </div>
        </div>

        <div className="md:col-span-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6F685F]">Customer Care</h2>
          <nav className="mt-4 flex flex-col gap-2.5">
            {links.care.map((item) => (
              <Link key={item.label} to={item.to} className="min-w-0 truncate text-sm text-[#211F1D] transition-colors hover:text-[#8B0000]">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="md:col-span-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6F685F]">Social</h2>
          <div className="mt-4 flex flex-col gap-2.5">
            {links.social.map((item) => {
              const Icon = item.icon;
              return (
                <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-[#211F1D] transition-colors hover:text-[#8B0000]">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6F685F]">Newsletter</h2>
          <p className="mt-4 text-sm leading-6 text-[#6F685F]">Receive collection notes, early access, and private release announcements.</p>
          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email address"
              className="min-w-0 flex-1 border border-[#CFC5B8] bg-[#FFFCF8] px-3 py-2 text-sm text-[#211F1D] outline-none transition-colors placeholder:text-[#6F685F] focus:border-[#8B0000]"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 border border-[#8B0000] bg-[#8B0000] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white transition-colors hover:bg-[#650000]"
            >
              Join <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-[#CFC5B8]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-xs uppercase tracking-[0.22em] text-[#6F685F] md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
          <p>© {year} NDDN Store</p>
          <p>Ivory canvas. Crimson accent. Editorial precision.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;