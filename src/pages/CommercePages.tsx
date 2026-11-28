import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CartPageContent } from '@/components/CartDrawer';
import { CheckoutForm, OrderSummary, DashboardPanel } from '@/components/AccountSections';
import { cn } from '@/lib/utils';

export function CartPage({ className = '' }: { className?: string }) {
  return (
    <section className={cn('mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8', className)}>
      <div className="mb-6 flex items-end justify-between gap-4 border-b border-[#C9BEB4] pb-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6F665F]">Cart</p>
          <h1 className="font-['Playfair_Display'] text-4xl font-light tracking-tight text-[#2E2E2E] sm:text-5xl">Your selection</h1>
        </div>
        <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#8B0000]">
          Continue shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <CartPageContent className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]" />
    </section>
  );
}

export function CheckoutPage({ className = '' }: { className?: string }) {
  return (
    <section className={cn('mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8', className)}>
      <div className="mb-6 border-b border-[#C9BEB4] pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6F665F]">Checkout</p>
        <h1 className="font-['Playfair_Display'] text-4xl font-light tracking-tight text-[#2E2E2E] sm:text-5xl">Finalize your order</h1>
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        <CheckoutForm />
        <OrderSummary compact />
      </div>
    </section>
  );
}

export function DashboardPage({ className = '' }: { className?: string }) {
  return (
    <section className={cn('mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8', className)}>
      <div className="mb-6 border-b border-[#C9BEB4] pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6F665F]">Account</p>
        <h1 className="font-['Playfair_Display'] text-4xl font-light tracking-tight text-[#2E2E2E] sm:text-5xl">Dashboard</h1>
      </div>
      <DashboardPanel />
    </section>
  );
}

export default CartPage;