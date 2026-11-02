'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import { useStore } from '@/app/providers';
import { useCart } from '@/lib/cart';
import { Category } from '@/lib/types';
import { CartDrawer } from './CartDrawer';

const UPLOADS_URL = process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:4000';

interface HeaderProps {
  categories?: Category[];
}

export function Header({ categories = [] }: HeaderProps) {
  const { settings, appearance } = useStore();
  const totalItems = useCart((s) => s.totalItems());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const logoUrl = settings?.logoUrl
    ? `${UPLOADS_URL}${settings.logoUrl}`
    : null;

  const storeName = settings?.storeName || 'My Store';
  const headerStyle = appearance?.headerStyle || 'default';

  const bgClass = isScrolled
    ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/60'
    : 'bg-white border-b border-slate-100';

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${bgClass}`}
        role="banner"
      >
        <div className="section-container">
          <div
            className={`flex items-center gap-4 py-3 ${
              headerStyle === 'centered' ? 'flex-col' : 'flex-row'
            }`}
          >
            {/* Logo / Brand */}
            <Link
              href="/"
              className="flex items-center gap-2.5 flex-shrink-0"
              aria-label={`${storeName} - Home`}
            >
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={storeName}
                  width={120}
                  height={40}
                  className="h-9 w-auto object-contain"
                />
              ) : (
                <span
                  className="text-xl font-bold tracking-tight"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {storeName}
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center" role="navigation">
              <Link
                href="/"
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Home
              </Link>

              {/* Categories Dropdown */}
              {categories.length > 0 && (
                <div className="relative group">
                  <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors">
                    Categories
                    <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform" />
                  </button>
                  <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-2 min-w-[200px]">
                      {categories.slice(0, 8).map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.slug}`}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                          {cat.image && (
                            <Image
                              src={`${UPLOADS_URL}${cat.image}`}
                              alt={cat.name}
                              width={20}
                              height={20}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                          )}
                          {cat.name}
                        </Link>
                      ))}
                      <Link
                        href="/products"
                        className="flex items-center gap-2 px-3 py-2 mt-1 text-xs font-semibold border-t border-slate-100 pt-2"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        View All Products →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <Link
                href="/products"
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
              >
                All Products
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Search (desktop) */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
                  }
                }}
                className="hidden md:flex items-center relative"
                role="search"
              >
                <Search className="w-4 h-4 absolute left-3 text-slate-400" />
                <input
                  type="search"
                  id="header-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  aria-label="Search products"
                  className="pl-9 pr-4 py-2 text-sm bg-slate-100 border-transparent rounded-xl focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-offset-0 focus:outline-none w-48 focus:w-64 transition-all"
                />
              </form>

              {/* Cart Button */}
              <button
                id="cart-btn"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                aria-label={`Shopping cart (${totalItems} items)`}
              >
                <ShoppingBag className="w-5 h-5 text-slate-700" />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 text-[10px] font-bold text-white rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-primary)', minWidth: '18px', minHeight: '18px', fontSize: '10px' }}
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 text-slate-700" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-700" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-3 border-t border-slate-100 slide-in">
              {/* Mobile Search */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
                    setIsMenuOpen(false);
                  }
                }}
                className="flex items-center relative mb-3"
              >
                <Search className="w-4 h-4 absolute left-3 text-slate-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 rounded-xl border-transparent focus:outline-none"
                />
              </form>

              <nav className="space-y-1">
                {[
                  { label: 'Home', href: '/' },
                  { label: 'All Products', href: '/products' },
                  ...categories.slice(0, 5).map((c) => ({
                    label: c.name,
                    href: `/category/${c.slug}`,
                  })),
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
