'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useStore } from '@/app/providers';

const UPLOADS_URL = process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:4000';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart();
  const { settings } = useStore();

  const currencySymbol = settings?.currencySymbol || '$';

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const total = subtotal();
  const count = totalItems();

  const getImageUrl = (url?: string) => {
    if (!url) return '/placeholder.png';
    if (url.startsWith('http')) return url;
    return `${UPLOADS_URL}${url}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col cart-panel">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              <h2 className="text-base font-bold text-slate-900">Your Cart</h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600 rounded-full">
                {count} {count === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-300">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Your cart is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mb-6">
                  Looks like you haven't added anything to your cart yet.
                </p>
                <button
                  onClick={onClose}
                  className="btn-primary text-xs py-2 px-5"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item.productId}-${item.variantId || 'def'}`} className="py-4 flex gap-4">
                  {/* Item Image */}
                  <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0 overflow-hidden relative">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 truncate">
                        {item.name}
                      </h4>
                      {item.variant && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {Object.entries(item.variant.options || {})
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                          {currencySymbol}{item.price.toFixed(2)}
                        </span>
                        {item.comparePrice && item.comparePrice > item.price && (
                          <span className="text-xs text-slate-400 line-through">
                            {currencySymbol}{item.comparePrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Selector & Remove */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                          className="p-1.5 hover:bg-slate-200 transition-colors text-slate-600"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                          className="p-1.5 hover:bg-slate-200 transition-colors text-slate-600"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="text-xs text-slate-400 hover:text-red-500 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Subtotal and Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">
                    {currencySymbol}{total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span className="font-medium text-slate-500">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200/60">
                  <span>Estimated Total</span>
                  <span style={{ color: 'var(--color-primary)' }}>
                    {currencySymbol}{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={onClose}
                className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-md"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
