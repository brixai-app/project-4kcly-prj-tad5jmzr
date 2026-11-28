import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

export type CartDrawerProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function CartDrawer({ open = false, onOpenChange = () => {} }: CartDrawerProps) {
  const navigate = useNavigate();
  const cart = useCart() as any;
  const items = cart?.items ?? [];
  const updateQuantity = cart?.updateQuantity ?? (() => {});
  const removeItem = cart?.removeItem ?? (() => {});
  const subtotal = cart?.subtotal ?? items.reduce((sum: number, item: any) => sum + (item?.product?.price ?? 0) * (item?.quantity ?? 0), 0);
  const shippingThreshold = 15000;
  const shipping = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 350;
  const total = subtotal + shipping;
  const remaining = Math.max(shippingThreshold - subtotal, 0);
  const progress = Math.min((subtotal / shippingThreshold) * 100, 100);

  const handleCheckout = () => {
    if (!items.length) {
      toast.info("Your cart is empty.");
      return;
    }
    onOpenChange(false);
    navigate("/checkout");
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed right-0 top-0 z-50 h-full w-full max-w-[440px] border-l border-[#CFC4BA] bg-[#F9F7F6] text-[#211E1D] shadow-2xl outline-none">
          <motion.div
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="flex h-full flex-col"
          >
            <div className="flex items-center justify-between border-b border-[#CFC4BA] px-5 py-4">
              <div className="min-w-0">
                <Dialog.Title className="font-['Bodoni_Moda'] text-2xl font-light tracking-tight">Shopping Bag</Dialog.Title>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#665F5B]">{items.length} item{items.length === 1 ? "" : "s"}</p>
              </div>
              <Dialog.Close className="inline-flex h-10 w-10 items-center justify-center border border-[#CFC4BA] text-[#211E1D] transition-colors hover:bg-[#EFE9E3]">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <AnimatePresence initial={false}>
                {items.length ? (
                  <div className="space-y-4">
                    {items.map((item: any) => {
                      const product = item?.product ?? {};
                      const lineTotal = (product?.price ?? 0) * (item?.quantity ?? 0);
                      const canDecrease = (item?.quantity ?? 0) > 1;
                      const canIncrease = product?.inStock ?? true;
                      return (
                        <motion.div
                          key={`${item?.productId ?? product?.id ?? "item"}-${item?.size ?? ""}-${item?.color ?? ""}`}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex gap-3 border border-[#CFC4BA] bg-white p-3"
                        >
                          <img
                            src={product?.image ?? "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80"}
                            alt={product?.name ?? "Product image"}
                            crossOrigin="anonymous"
                            className="h-28 w-20 shrink-0 object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#211E1D]">{product?.name ?? "Untitled item"}</p>
                                <p className="mt-1 truncate text-xs uppercase tracking-[0.18em] text-[#665F5B]">{product?.category?.name ?? "Collection"}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeItem?.(item?.productId, item?.size, item?.color)}
                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-[#CFC4BA] text-[#665F5B] transition-colors hover:bg-[#EFE9E3] hover:text-[#211E1D]"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-[#665F5B]">
                              {item?.size ? <span className="border border-[#CFC4BA] px-2 py-1">Size {item.size}</span> : null}
                              {item?.color ? <span className="border border-[#CFC4BA] px-2 py-1">Color {item.color}</span> : null}
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-3">
                              <div className="flex items-center border border-[#CFC4BA]">
                                <button
                                  type="button"
                                  disabled={!canDecrease}
                                  onClick={() => updateQuantity?.(item?.productId, Math.max((item?.quantity ?? 1) - 1, 1), item?.size, item?.color)}
                                  className={cn("inline-flex h-9 w-9 items-center justify-center transition-colors", !canDecrease ? "cursor-not-allowed opacity-40" : "hover:bg-[#EFE9E3]")}
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="min-w-10 px-3 text-center text-sm font-medium">{item?.quantity ?? 1}</span>
                                <button
                                  type="button"
                                  disabled={!canIncrease}
                                  onClick={() => updateQuantity?.(item?.productId, (item?.quantity ?? 1) + 1, item?.size, item?.color)}
                                  className={cn("inline-flex h-9 w-9 items-center justify-center transition-colors", !canIncrease ? "cursor-not-allowed opacity-40" : "hover:bg-[#EFE9E3]")}
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                              <p className="text-sm font-semibold">₹{lineTotal.toLocaleString("en-IN")}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center border border-[#CFC4BA] bg-white">
                      <ShoppingBag className="h-6 w-6 text-[#665F5B]" />
                    </div>
                    <p className="mt-4 font-['Bodoni_Moda'] text-2xl font-light">Your bag is empty</p>
                    <p className="mt-2 max-w-xs text-sm text-[#665F5B]">Discover the latest collection and add pieces to your cart.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="border-t border-[#CFC4BA] bg-[#EFE9E3] px-5 py-4">
              <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[#665F5B]">
                <span>Free shipping progress</span>
                <span>{remaining > 0 ? `₹${remaining.toLocaleString("en-IN")} to go` : "Unlocked"}</span>
              </div>
              <div className="h-1 w-full overflow-hidden bg-white">
                <div className="h-full bg-[#8B0000]" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#665F5B]">Subtotal</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#665F5B]">Shipping</span>
                  <span className="font-semibold">{shipping === 0 ? "Free" : `₹${shipping.toLocaleString("en-IN")}`}</span>
                </div>
                <div className="flex items-center justify-between border-t border-[#CFC4BA] pt-2 text-base">
                  <span className="font-medium">Total</span>
                  <span className="font-semibold">₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#680000]"
              >
                Proceed to checkout <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default CartDrawer;