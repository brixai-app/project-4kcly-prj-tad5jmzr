import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, MapPin, Phone, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function Footer({ className = "" }: { className?: string }) {
  const [email, setEmail] = useState("");
  const year = useMemo(() => new Date().getFullYear(), []);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = email.trim();
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("You’re subscribed to NDDN Store updates.");
    setEmail("");
  };

  return (
    <footer className={cn("border-t border-[#CFC4BA] bg-[#F9F7F6] text-[#211E1D]", className)}>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-4">
          <p className="font-['Bodoni_Moda'] text-3xl leading-none tracking-tight">NDDN Store</p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#665F5B]">
            An editorial fashion destination shaped by quiet luxury, precise tailoring, and verified photography.
          </p>
          <div className="mt-6 flex flex-col gap-2 text-sm text-[#665F5B]">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="min-w-0 break-words">New Delhi, India</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              <a className="transition-colors hover:text-[#8B0000]" href="tel:+911234567890">
                +91 12345 67890
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              <a className="transition-colors hover:text-[#8B0000]" href="mailto:care@nddnstore.com">
                care@nddnstore.com
              </a>
            </div>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-[#665F5B]">Customer Care</h2>
            <ul className="mt-4 space-y-3 text-sm text-[#211E1D]">
              <li><Link className="transition-colors hover:text-[#8B0000]" to="/shop">Shop Collection</Link></li>
              <li><Link className="transition-colors hover:text-[#8B0000]" to="/checkout">Checkout</Link></li>
              <li><a className="transition-colors hover:text-[#8B0000]" href="#top">Shipping & Returns</a></li>
              <li><a className="transition-colors hover:text-[#8B0000]" href="#top">Size Guide</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-[#665F5B]">Information</h2>
            <ul className="mt-4 space-y-3 text-sm text-[#211E1D]">
              <li><a className="transition-colors hover:text-[#8B0000]" href="#top">About NDDN</a></li>
              <li><a className="transition-colors hover:text-[#8B0000]" href="#top">Privacy Policy</a></li>
              <li><a className="transition-colors hover:text-[#8B0000]" href="#top">Terms of Service</a></li>
              <li><a className="transition-colors hover:text-[#8B0000]" href="#top">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-[#665F5B]">Newsletter</h2>
          <p className="mt-4 text-sm leading-6 text-[#665F5B]">
            Receive collection notes, launch alerts, and private access to new drops.
          </p>
          <form onSubmit={submit} className="mt-5 flex gap-2">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="Email address"
              className="min-w-0 flex-1 border border-[#CFC4BA] bg-white px-3 py-3 text-sm text-[#211E1D] outline-none transition focus:border-[#8B0000]"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 border border-[#8B0000] bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white transition-colors hover:bg-[#680000]"
            >
              Join <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <div className="mt-6 flex items-center gap-4 text-[#665F5B]">
            <a className="transition-colors hover:text-[#8B0000]" href="https://instagram.com" target="_blank" rel="noreferrer">
              <Instagram className="h-5 w-5" />
            </a>
            <a className="transition-colors hover:text-[#8B0000]" href="https://twitter.com" target="_blank" rel="noreferrer">
              <Twitter className="h-5 w-5" />
            </a>
            <a className="transition-colors hover:text-[#8B0000]" href="https://linkedin.com" target="_blank" rel="noreferrer">
              <Linkedin className="h-5 w-5" />
            </a>
            <a className="transition-colors hover:text-[#8B0000]" href="https://youtube.com" target="_blank" rel="noreferrer">
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-[#CFC4BA]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs uppercase tracking-[0.22em] text-[#665F5B] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {year} NDDN Store</p>
          <p>Luxury fashion, editorially curated.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;