'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Share2, Globe, ExternalLink, MessageCircle } from 'lucide-react';
import { useStore } from '@/app/providers';

const UPLOADS_URL = process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:4000';

const SOCIAL_ICONS: Record<string, React.FC<{ className?: string }>> = {
  facebook: MessageCircle,
  instagram: Share2,
  twitter: Share2,
  youtube: Globe,
};

export function Footer() {
  const { settings, appearance } = useStore();
  const footerStyle = appearance?.footerStyle || 'default';
  const social = settings?.socialLinks || {};
  const storeName = settings?.storeName || 'My Store';
  const logoUrl = settings?.logoUrl ? `${UPLOADS_URL}${settings.logoUrl}` : null;

  const socialLinks = Object.entries(social).filter(([, v]) => Boolean(v));

  const isDark = footerStyle === 'dark';

  return (
    <footer
      className={`mt-16 border-t ${isDark ? 'text-white' : 'text-slate-600'}`}
      style={{
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        borderColor: isDark ? '#1e293b' : '#e2e8f0',
      }}
      role="contentinfo"
    >
      <div className="section-container py-12">
        {footerStyle === 'minimal' ? (
          /* Minimal footer */
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
              {settings?.copyrightText || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
            </span>
            <div className="flex items-center gap-4">
              {socialLinks.map(([platform, url]) => {
                const Icon = SOCIAL_ICONS[platform] || ExternalLink;
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`${storeName} on ${platform}`}
                    className={`hover:opacity-70 transition-opacity ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>
        ) : (
          /* Default / columns footer */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="md:col-span-1 space-y-4">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={storeName}
                  width={120}
                  height={40}
                  className={`h-9 w-auto object-contain ${isDark ? 'brightness-0 invert' : ''}`}
                />
              ) : (
                <span
                  className="text-xl font-bold"
                  style={{ color: isDark ? 'white' : 'var(--color-primary)' }}
                >
                  {storeName}
                </span>
              )}
              {settings?.description && (
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {settings.description.slice(0, 120)}...
                </p>
              )}
              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-3 pt-1">
                  {socialLinks.map(([platform, url]) => {
                    const Icon = SOCIAL_ICONS[platform] || ExternalLink;
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={`${platform}`}
                        className={`p-2 rounded-xl transition-colors ${
                          isDark
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Shop Links */}
            <div>
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                Shop
              </h4>
              <ul className="space-y-2.5">
                {['All Products', 'New Arrivals', 'Best Sellers', 'On Sale'].map((item) => (
                  <li key={item}>
                    <Link
                      href="/products"
                      className={`text-sm hover:underline transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Info Links */}
            <div>
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                Information
              </h4>
              <ul className="space-y-2.5">
                {['About Us', 'Contact', 'Privacy Policy', 'Terms of Service', 'Shipping Policy'].map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className={`text-sm hover:underline transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                Contact
              </h4>
              <ul className="space-y-2.5 text-sm">
                {settings?.email && (
                  <li>
                    <a
                      href={`mailto:${settings.email}`}
                      className={`hover:underline ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                    >
                      {settings.email}
                    </a>
                  </li>
                )}
                {settings?.phone && (
                  <li>
                    <a
                      href={`tel:${settings.phone}`}
                      className={`hover:underline ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                    >
                      {settings.phone}
                    </a>
                  </li>
                )}
                {settings?.address?.city && (
                  <li className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                    {[settings.address.city, settings.address.country].filter(Boolean).join(', ')}
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Bottom bar */}
        {footerStyle !== 'minimal' && (
          <div className={`mt-10 pt-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} flex flex-col sm:flex-row items-center justify-between gap-3`}>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {settings?.copyrightText || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
            </p>
            <p className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>
              Powered by NexMart
            </p>
          </div>
        )}
      </div>
    </footer>
  );
}
