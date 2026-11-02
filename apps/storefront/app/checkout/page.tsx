'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  CheckCircle2,
  Truck,
  CreditCard,
  Building2,
  Banknote,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/lib/cart';
import { useStore } from '@/app/providers';

const UPLOADS_URL = process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:4000';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { settings } = useStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'bank'>('cod');

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  const currencySymbol = settings?.currencySymbol || '$';
  const totalItemsCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const totalSubtotal = subtotal();
  const shippingCost = shippingMethod === 'express' ? 15.0 : totalSubtotal > 100 ? 0.0 : 9.99;
  const taxCost = Number((totalSubtotal * 0.05).toFixed(2));
  const finalTotal = totalSubtotal + shippingCost + taxCost;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlacingOrder(true);

    // Simulate order placement
    setTimeout(() => {
      const orderNumber = `NEX-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderSuccess({
        orderNumber,
        customerName: `${firstName} ${lastName}`,
        email,
        total: finalTotal,
        itemsCount: totalItemsCount,
        paymentMethod,
      });
      clearCart();
      setIsPlacingOrder(false);
    }, 1500);
  };

  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${UPLOADS_URL}${url}`;
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Header />
        <main className="flex-1 section-container py-16">
          <div className="max-w-xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 font-bold">
                Order Confirmed
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Thank you for your purchase!
              </h1>
              <p className="text-xs text-slate-500 mt-2">
                We have received your order and sent a receipt confirmation to{' '}
                <span className="font-semibold text-slate-700">{orderSuccess.email}</span>.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs text-slate-600 text-left">
              <div className="flex justify-between">
                <span>Order Reference:</span>
                <span className="font-mono font-bold text-slate-900">{orderSuccess.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-semibold text-slate-900">{orderSuccess.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="font-semibold text-slate-900 uppercase">{orderSuccess.paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm text-slate-900">
                <span>Total Paid:</span>
                <span style={{ color: 'var(--color-primary)' }}>
                  {currencySymbol}{orderSuccess.total.toFixed(2)}
                </span>
              </div>
            </div>

            <Link
              href="/"
              className="btn-primary w-full py-3 text-xs font-semibold inline-flex items-center justify-center gap-2"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Header />
        <main className="flex-1 section-container py-20 text-center space-y-4">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500">Please add items to your cart before proceeding to checkout.</p>
          <Link href="/products" className="btn-primary inline-block text-xs py-2 px-6">
            Browse Products
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50/50">
      <Header />

      <main className="flex-1 section-container py-10">
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-900">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/products" className="hover:text-slate-900">Cart</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-semibold">Secure Checkout</span>
        </nav>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Checkout Form Inputs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Details */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900">1. Customer Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900">2. Shipping Address</h2>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Shopping Avenue, Suite 4B"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State / Prov *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="NY"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="10001"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Delivery & Payment Selection */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900">3. Shipping & Payment</h2>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Delivery Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setShippingMethod('standard')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      shippingMethod === 'standard'
                        ? 'border-indigo-600 bg-indigo-50/50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                      <span>Standard (3-5 days)</span>
                      <span>{totalSubtotal > 100 ? 'FREE' : '$9.99'}</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShippingMethod('express')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      shippingMethod === 'express'
                        ? 'border-indigo-600 bg-indigo-50/50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                      <span>Express (1-2 days)</span>
                      <span>$15.00</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-700">Payment Option</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cod', label: 'Cash on Delivery', icon: Banknote },
                    { id: 'card', label: 'Credit Card', icon: CreditCard },
                    { id: 'bank', label: 'Bank Wire', icon: Building2 },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPaymentMethod(id as any)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                        paymentMethod === id
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px]">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs sticky top-24 space-y-6">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                Order Summary ({totalItemsCount} items)
              </h2>

              {/* Items Preview */}
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId || 'def'}`} className="py-3 flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                      {item.image && (
                        <img
                          src={getImageUrl(item.image)!}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {currencySymbol}{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="space-y-2 text-xs border-t border-slate-100 pt-4 text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{currencySymbol}{totalSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-slate-900">
                    {shippingCost === 0 ? 'FREE' : `${currencySymbol}${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (5%)</span>
                  <span className="font-semibold text-slate-900">{currencySymbol}{taxCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate-200 text-sm font-extrabold text-slate-900">
                  <span>Total Due</span>
                  <span style={{ color: 'var(--color-primary)' }}>
                    {currencySymbol}{finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPlacingOrder}
                className="btn-primary w-full py-3.5 text-xs font-bold shadow-xl flex items-center justify-center gap-2"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Order...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Place Order — {currencySymbol}{finalTotal.toFixed(2)}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
