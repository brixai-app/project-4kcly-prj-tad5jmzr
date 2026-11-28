import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, MapPin, Phone, Send, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function Footer({ className = "" }: { className?: string }) {
  const [email, setEmail] = useState("");
  const year = useMemo(() => new Date().getFullYear(), []);
  const links = [
    { label: "Customer Care", to: "/shop" },
    { label: "Shipping & Returns", to: "/shop" },
    { label: "Size Guide", to: "/shop" },
    { label: "Privacy Policy", to: "/shop" },
  ];
  const socials = [
    { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
    { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
    { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
    { icon: Youtube, label: "YouTube", href: "https://youtube.com" },
  ];
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Enter a valid email address.");
    toast.success("Subscribed to NDDN Store updates.");
    setEmail("");
  };
  return (
    <footer className={cn("border-t border-[#CFC5B8] bg-[#FAF9F6] text-[#1C1C1C]", className)}>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-12 md:px-6">
        <div className="md:col-span-5">
          <p className="font-['Playfair_Display'] text-3xl font-light tracking-tight">NDDN Store</p>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#68625C]">
            A luxury fashion storefront shaped by editorial restraint, tactile materials, and a disciplined crimson accent.
          </p>
          <div className="mt-6 space-y-3 text-sm text-[#68625C]">
            <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-[#8B0000]" /><span>New Delhi, India</span></div>
            <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-[#8B0000]" /><a className="hover:text-[#8B0000]" href="tel:+911234567890">+91 12345 67890</a></div>
            <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-[#8B0000]" /><a className="hover:text-[#8B0000]" href="mailto:care@nddnstore.com">care@nddnstore.com</a></div>
          </div>
        </div>
        <div className="md:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#68625C]">Customer Care</p>
          <nav className="mt-4 flex flex-col gap-2.5">
            {links.map((link) => (
              <Link key={link.label} to={link.to} className="min-w-0 truncate text-sm text-[#1C1C1C] transition-colors hover:text-[#8B0000]">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="md:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#68625C]">Newsletter</p>
          <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
            <label className="text-sm text-[#68625C]" htmlFor="footer-email">Receive collection notes and private drops.</label>
            <div className="flex items-center gap-2 border border-[#CFC5B8] bg-white px-3 py-2">
              <input id="footer-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email address" className="min-w-0 flex-1 bg-transparent text-sm text-[#1C1C1C] outline-none placeholder:text-[#68625C]" />
              <button type="submit" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#8B0000] transition-colors hover:text-[#650000]">
                <Send className="h-4 w-4" /> Join
              </button>
            </div>
          </form>
          <div className="mt-6 flex flex-wrap gap-3">
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} className="inline-flex h-10 w-10 items-center justify-center border border-[#CFC5B8] text-[#1C1C1C] transition-colors hover:border-[#8B0000] hover:text-[#8B0000]">
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
      <div className="border-t border-[#CFC5B8]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-xs uppercase tracking-[0.22em] text-[#68625C] md:flex-row md:items-center md:justify-between md:px-6">
          <p>© {year} NDDN Store</p>
          <a href="#top" className="inline-flex items-center gap-2 text-[#1C1C1C] transition-colors hover:text-[#8B0000]">
            Back to top <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;