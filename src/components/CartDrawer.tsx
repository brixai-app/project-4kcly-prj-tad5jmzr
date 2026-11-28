import React, { useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

export interface CartDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CartDrawer({ open = false, onOpenChange = () => {} }: CartDrawerProps) {
  const navigate = useNavigate();
  const cart = useCart() as any;
  const items = (cart?.items ?? []) as any[];
  const updateItemQuantity = cart?.updateItemQuantity ?? cart?.updateQuantity ?? (() => {});
  const removeItem = cart?.removeItem ?? (() => {});
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + (item?.price ?? 0) * (item?.quantity ?? 0), 0), [items]);
  const shipping = subtotal > 0 ? (subtotal >= 12000 ? 0 : 249) : 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;
  const progress = Math.min(100, subtotal > 0 ? (subtotal / 12000) * 100 : 0);

  const handleCheckout = () => {
    onOpenChange(false);
    navigate("/checkout");
    toast.message("Proceeding to checkout");
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-[#CFC5B8] bg-[#FAF9F6] text-[#1C1C1C] shadow-2xl outline-none">
          <motion.div initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 24, opacity: 0 }} transition={{ duration: 0.25 }} className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-[#CFC5B8] px-5 py-4">
              <div className="min-w-0">
                <Dialog.Title className="font-['Playfair_Display'] text-2xl font-medium tracking-tight">Shopping Bag</Dialog.Title>
                <p className="mt-1 text-xs uppercase tracking-[0.24em] text-[#68625C]">{items.length} item{items.length === 1 ? "" : "s"}</p>
              </div>
              <Dialog.Close className="inline-flex h-10 w-10 items-center justify-center border border-[#CFC5B8] text-[#1C1C1C] transition-colors hover:bg-[#8B0000] hover:text-white">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="mb-4 rounded-sm border border-[#CFC5B8] bg-white px-4 py-3">
                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-[#68625C]">
                  <span>Shipping progress</span>
                  <span>{subtotal >= 12000 ? "Complimentary" : `₹${Math.max(0, 12000 - subtotal).toLocaleString()} away`}</span>
                </div>
                <div className="h-1.5 w-full bg-[#E7E0D7]">
                  <div className="h-full bg-[#8B0000]" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <AnimatePresence initial={false}>
                {items.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {items.map((item) => (
                      <motion.div key={item?.id ?? `${item?.productId ?? "item"}-${item?.size ?? ""}-${item?.color ?? ""}`} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }} className="flex gap-3 border border-[#CFC5B8] bg-white p-3">
                        <img src={item?.image ?? item?.product?.images?.[0]?.url ?? "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85"} alt={item?.name ?? "Cart item"} crossOrigin="anonymous" className="h-24 w-20 shrink-0 object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-[#1C1C1C]">{item?.name ?? "Untitled item"}</p>
                              <p className="mt-1 truncate text-xs uppercase tracking-[0.18em] text-[#68625C]">{[item?.size ? `Size ${item.size}` : null, item?.color ? `Color ${item.color}` : null].filter(Boolean).join(" · ") || "Selected options"}</p>
                            </div>
                            <button onClick={() => removeItem?.(item?.id)} className="inline-flex h-8 w-8 items-center justify-center border border-[#CFC5B8] text-[#68625C] transition-colors hover:border-[#8B0000] hover:text-[#8B0000]">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center border border-[#CFC5B8]">
                              <button onClick={() => updateItemQuantity?.(item?.id, Math.max(1, (item?.quantity ?? 1) - 1))} className="inline-flex h-8 w-8 items-center justify-center text-[#1C1C1C] transition-colors hover:bg-[#F5F1EB]">
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="min-w-8 px-2 text-center text-sm font-medium">{item?.quantity ?? 1}</span>
                              <button onClick={() => updateItemQuantity?.(item?.id, (item?.quantity ?? 1) + 1)} className="inline-flex h-8 w-8 items-center justify-center text-[#1C1C1C] transition-colors hover:bg-[#F5F1EB]">
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="text-sm font-semibold">₹{((item?.price ?? 0) * (item?.quantity ?? 1)).toLocaleString()}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full min-h-[320px] flex-col items-center justify-center border border-dashed border-[#CFC5B8] bg-white px-6 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center border border-[#CFC5B8] text-[#8B0000]">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <h3 className="font-['Playfair_Display'] text-2xl font-medium">Your bag is empty</h3>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-[#68625C]">Add pieces from the collection to build your edit.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="border-t border-[#CFC5B8] bg-[#FAF9F6] px-5 py-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-[#68625C]">Subtotal</span><span className="font-medium">₹{subtotal.toLocaleString()}</span></div>
                <div className="flex items-center justify-between"><span className="text-[#68625C]">Shipping</span><span className="font-medium">{shipping === 0 && subtotal > 0 ? "Free" : `₹${shipping.toLocaleString()}`}</span></div>
                <div className="flex items-center justify-between"><span className="text-[#68625C]">Tax</span><span className="font-medium">₹{tax.toLocaleString()}</span></div>
                <div className="flex items-center justify-between border-t border-[#CFC5B8] pt-2 text-base"><span className="font-medium">Total</span><span className="font-semibold">₹{total.toLocaleString()}</span></div>
              </div>

              <button onClick={handleCheckout} disabled={items.length === 0} className={cn("mt-4 inline-flex w-full items-center justify-center gap-2 border border-[#8B0000] bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-50")}>
                Checkout <ArrowRight className="h-4 w-4" />
              </button>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-[#68625C]">
                <Check className="h-3.5 w-3.5 text-[#8B0000]" /> Secure payment and order confirmation
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default CartDrawer;