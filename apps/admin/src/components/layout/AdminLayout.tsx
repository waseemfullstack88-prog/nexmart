"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Image as ImageIcon,
  ShoppingCart,
  Users,
  Palette,
  LayoutTemplate,
  Home,
  FileText,
  Menu as MenuIcon,
  Tag,
  Boxes,
  Settings,
  Globe,
  LogOut,
  ChevronRight,
  Store,
  ExternalLink,
  X,
  Search,
  Bell,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth';
import { ToastContainer } from '../ui/Toast';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Categories', href: '/categories', icon: FolderTree },
  { name: 'Media Library', href: '/media', icon: ImageIcon },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Inventory', href: '/inventory', icon: Boxes },
  { name: 'Discounts', href: '/discounts', icon: Tag },
  { name: 'Appearance', href: '/appearance', icon: Palette },
  { name: 'Templates', href: '/templates', icon: LayoutTemplate },
  { name: 'Homepage Builder', href: '/homepage', icon: Home },
  { name: 'Pages', href: '/pages', icon: FileText },
  { name: 'Navigation', href: '/menus', icon: MenuIcon },
  { name: 'SEO Settings', href: '/seo', icon: Globe },
  { name: 'Store Settings', href: '/settings', icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <span className="text-sm font-medium text-slate-400">Loading NexMart Admin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20">
              N
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">NexMart</span>
              <span className="block text-[11px] font-medium text-indigo-400 -mt-1">Seller Studio</span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Store Profile Card */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/20">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.firstName ? `${user.firstName}'s Store` : 'My Store'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">Online & Live</p>
              </div>
            </div>
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              title="Visit Storefront"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {navigation.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                <span className="flex-1 truncate">{item.name}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {user?.firstName?.[0] || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between gap-4 shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <div className="relative hidden sm:block w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, orders..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-indigo-600" />
              View Storefront
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Store
              </span>
            </div>
          </div>
        </header>

        {/* Page Content Scroll Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/60">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Global Toasts */}
      <ToastContainer />
    </div>
  );
}
