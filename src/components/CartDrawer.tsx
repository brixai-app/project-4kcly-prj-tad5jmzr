import { useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

export function CartDrawer({ open = false, onOpenChange = () => {} }: { open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const navigate = useNavigate();
  const { items = [], updateQuantity, removeItem, subtotal = 0, currency = "₹" } = useCart() as any;
  const shipping = useMemo(() => (subtotal > 0 ? (subtotal >= 12000 ? 0 : 249) : 0), [subtotal]);
  const total = subtotal + shipping;

  const safeQty = (q: number) => Math.max(1, Math.min(10, Number.isFinite(q) ? q : 1));

  const handleCheckout = () => {
    if (!items?.length) {
      toast.error("Your cart is empty.");
      return;
    }
    onOpenChange(false);
    navigate("/checkout");
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <AnimatePresence>
          {open ? (
            <>
              <Dialog.Overlay asChild>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px]" />
              </Dialog.Overlay>
              <Dialog.Content asChild>
                <motion.aside
                  initial={{ x: 24, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 24, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                  className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-[#CFC5B8] bg-[#FFFCF8] text-[#211F1D] shadow-2xl outline-none"
                >
                  <div className="flex items-center justify-between border-b border-[#CFC5B8] px-5 py-4">
                    <div className="min-w-0">
                      <Dialog.Title className="font-['Bodoni_Moda'] text-2xl font-light tracking-tight">Shopping Bag</Dialog.Title>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#6F685F]">{items?.length ?? 0} item{(items?.length ?? 0) === 1 ? "" : "s"}</p>
                    </div>
                    <Dialog.Close asChild>
                      <button type="button" className="inline-flex h-10 w-10 items-center justify-center border border-[#CFC5B8] text-[#211F1D] transition hover:bg-[#8B0000] hover:text-white">
                        <X className="h-4 w-4" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-4">
                    {items?.length ? (
                      <div className="space-y-4">
                        {items.map((item: any) => (
                          <div key={`${item?.productId ?? "item"}-${item?.variantId ?? "default"}`} className="flex gap-4 border-b border-[#CFC5B8] pb-4">
                            <img
                              src={item?.image ?? "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85"}
                              alt={item?.name ?? "Cart item"}
                              crossOrigin="anonymous"
                              className="h-28 w-20 shrink-0 border border-[#CFC5B8] object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-[#211F1D]">{item?.name ?? "Product"}</p>
                                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#6F685F]">
                                    {item?.color ?? "Neutral"} {item?.size ? `· ${item.size}` : ""}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    removeItem?.(item?.productId, item?.variantId);
                                    toast.success("Removed from bag");
                                  }}
                                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-[#CFC5B8] text-[#6F685F] transition hover:border-[#8B0000] hover:text-[#8B0000]"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="mt-3 flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold">{currency}{Number(item?.price ?? 0).toLocaleString("en-IN")}</p>
                                <div className="flex items-center border border-[#CFC5B8]">
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity?.(item?.productId, safeQty((item?.quantity ?? 1) - 1), item?.variantId)}
                                    className="inline-flex h-9 w-9 items-center justify-center text-[#211F1D] transition hover:bg-[#F5F1EC]"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="min-w-9 px-2 text-center text-sm">{safeQty(item?.quantity ?? 1)}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity?.(item?.productId, safeQty((item?.quantity ?? 1) + 1), item?.variantId)}
                                    className="inline-flex h-9 w-9 items-center justify-center text-[#211F1D] transition hover:bg-[#F5F1EC]"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-full min-h-[40vh] flex-col items-center justify-center text-center">
                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center border border-[#CFC5B8] text-[#8B0000]">
                          <ShoppingBag className="h-7 w-7" />
                        </div>
                        <h3 className="font-['Bodoni_Moda'] text-3xl font-light tracking-tight">Your bag is empty</h3>
                        <p className="mt-2 max-w-xs text-sm leading-6 text-[#6F685F]">Discover the latest collection and add pieces to your cart.</p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[#CFC5B8] bg-[#FAF8F4] px-5 py-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[#6F685F]">Subtotal</span>
                        <span className="font-semibold">{currency}{subtotal.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6F685F]">Shipping</span>
                        <span className="font-semibold">{shipping === 0 && subtotal > 0 ? "Free" : `${currency}${shipping.toLocaleString("en-IN")}`}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-[#CFC5B8] pt-2">
                        <span className="text-xs uppercase tracking-[0.22em] text-[#6F685F]">Total</span>
                        <span className="text-base font-semibold">{currency}{total.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCheckout}
                      className={cn("mt-4 inline-flex w-full items-center justify-center gap-2 border border-[#8B0000] bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#650000]")}
                    >
                      Proceed to Checkout <ArrowRight className="h-4 w-4" />
                    </button>

                    <div className="mt-3 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-[#6F685F]">
                      <Check className="h-4 w-4 text-[#8B0000]" />
                      Secure checkout
                    </div>
                  </div>
                </motion.aside>
              </Dialog.Content>
            </>
          ) : null}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default CartDrawer;