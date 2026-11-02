"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Store,
  Globe,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Share2,
  Image as ImageIcon,
  Loader2,
  Save,
  Building2,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { fetchApi } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { MediaPickerModal, MediaItem } from '../../components/media/MediaPickerModal';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ur', name: 'Urdu' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'es', name: 'Spanish' },
];

const TIMEZONES = [
  'UTC', 'Asia/Karachi', 'Asia/Dubai', 'Asia/Riyadh',
  'America/New_York', 'America/Los_Angeles', 'Europe/London',
  'Europe/Paris', 'Asia/Kolkata', 'Australia/Sydney',
];

export default function StoreSettingsPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');
  const [copyrightText, setCopyrightText] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');

  // Address
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Social
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [youtube, setYoutube] = useState('');
  const [tiktok, setTiktok] = useState('');

  // Business
  const [taxNumber, setTaxNumber] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Image Settings
  const [imgQuality, setImgQuality] = useState(80);
  const [imgFormat, setImgFormat] = useState<'webp' | 'jpeg' | 'png' | 'auto'>('webp');

  // Media Picker
  const [isLogoPickerOpen, setIsLogoPickerOpen] = useState(false);
  const [isFaviconPickerOpen, setIsFaviconPickerOpen] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['store-settings'],
    queryFn: () => fetchApi('/settings'),
  });

  useEffect(() => {
    if (!settings) return;
    setStoreName(settings.storeName || '');
    setDescription(settings.description || '');
    setEmail(settings.email || '');
    setPhone(settings.phone || '');
    setCurrency(settings.currency || 'USD');
    setCurrencySymbol(settings.currencySymbol || '$');
    setLanguage(settings.language || 'en');
    setTimezone(settings.timezone || 'UTC');
    setCopyrightText(settings.copyrightText || '');
    setLogoUrl(settings.logoUrl || '');
    setFaviconUrl(settings.faviconUrl || '');
    if (settings.address) {
      setStreet(settings.address.street || '');
      setCity(settings.address.city || '');
      setState(settings.address.state || '');
      setCountry(settings.address.country || '');
      setPostalCode(settings.address.postalCode || '');
    }
    if (settings.socialLinks) {
      setFacebook(settings.socialLinks.facebook || '');
      setInstagram(settings.socialLinks.instagram || '');
      setTwitter(settings.socialLinks.twitter || '');
      setYoutube(settings.socialLinks.youtube || '');
      setTiktok(settings.socialLinks.tiktok || '');
    }
    if (settings.businessInfo) {
      setTaxNumber(settings.businessInfo.taxNumber || '');
      setCompanyName(settings.businessInfo.companyName || '');
    }
    if (settings.imageSettings) {
      setImgQuality(settings.imageSettings.quality || 80);
      setImgFormat(settings.imageSettings.format || 'webp');
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      fetchApi('/settings', { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      addToast('Store settings saved successfully!', 'success');
    },
    onError: (err: any) => addToast(err.message || 'Failed to save settings', 'error'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      storeName: storeName.trim(),
      description: description.trim(),
      email: email.trim(),
      phone: phone.trim(),
      currency,
      currencySymbol,
      language,
      timezone,
      copyrightText: copyrightText.trim(),
      logoUrl: logoUrl || null,
      faviconUrl: faviconUrl || null,
      address: { street, city, state, country, postalCode },
      socialLinks: { facebook, instagram, twitter, youtube, tiktok },
      businessInfo: { taxNumber, companyName },
      imageSettings: { quality: imgQuality, format: imgFormat },
    });
  };

  const handleCurrencyChange = (code: string) => {
    setCurrency(code);
    const found = CURRENCIES.find((c) => c.code === code);
    if (found) setCurrencySymbol(found.symbol);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  const getMediaUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:4000${url}`;
  };

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Store Settings</h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure your store identity, branding, currency, and business details.
            </p>
          </div>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50 w-fit"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save All Settings
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Information */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-indigo-600" />
              General Information
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="My Awesome Store"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Store Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your store..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="store@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 890"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Copyright Footer Text</label>
              <input
                type="text"
                value={copyrightText}
                onChange={(e) => setCopyrightText(e.target.value)}
                placeholder="© 2025 My Store. All rights reserved."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Branding (Logo & Favicon) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-600" />
              Branding Assets
            </h3>

            {/* Logo */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Store Logo</label>
              <div className="flex items-center gap-3">
                <div className="w-20 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                  {logoUrl ? (
                    <img src={getMediaUrl(logoUrl)} alt="Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-xs text-slate-400 text-center">No Logo</span>
                  )}
                </div>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setIsLogoPickerOpen(true)}
                    className="block px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                  >
                    Choose from Library
                  </button>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="block text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Favicon */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Favicon</label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                  {faviconUrl ? (
                    <img src={getMediaUrl(faviconUrl)} alt="Favicon" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-400">None</span>
                  )}
                </div>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setIsFaviconPickerOpen(true)}
                    className="block px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                  >
                    Choose Favicon
                  </button>
                  {faviconUrl && (
                    <button
                      type="button"
                      onClick={() => setFaviconUrl('')}
                      className="block text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Currency & Region */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-800">Currency & Region</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Physical Address */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              Business Address
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="123 Main St"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Karachi"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State / Province</label>
                <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="Sindh"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Pakistan"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code</label>
                <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="74000"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-600" />
              Social Media Links
            </h3>
            {[
              { key: 'facebook', label: 'Facebook', val: facebook, setter: setFacebook, placeholder: 'https://facebook.com/mystore' },
              { key: 'instagram', label: 'Instagram', val: instagram, setter: setInstagram, placeholder: 'https://instagram.com/mystore' },
              { key: 'twitter', label: 'X (Twitter)', val: twitter, setter: setTwitter, placeholder: 'https://x.com/mystore' },
              { key: 'youtube', label: 'YouTube', val: youtube, setter: setYoutube, placeholder: 'https://youtube.com/@mystore' },
              { key: 'tiktok', label: 'TikTok', val: tiktok, setter: setTiktok, placeholder: 'https://tiktok.com/@mystore' },
            ].map(({ label, val, setter, placeholder }) => (
              <div key={label}>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
                <input
                  type="url"
                  value={val}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            ))}
          </div>

          {/* Business Info */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Business & Tax Information
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Legal Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="My Company LLC"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tax / VAT Number</label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="VAT-12345678"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Image Processing Settings */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-600" />
              Image Processing Engine
            </h3>
            <p className="text-xs text-slate-500">
              Controls how the Sharp engine processes uploaded images. Changes apply to future uploads only.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Output Format
              </label>
              <div className="flex gap-2">
                {(['webp', 'jpeg', 'png', 'auto'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setImgFormat(f)}
                    className={`flex-1 py-2 text-xs font-semibold uppercase rounded-xl border transition-colors ${
                      imgFormat === f
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Compression Quality: <span className="text-indigo-600">{imgQuality}%</span>
              </label>
              <input
                type="range"
                min={30}
                max={100}
                step={5}
                value={imgQuality}
                onChange={(e) => setImgQuality(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Smaller Files (30%)</span>
                <span>Best Quality (100%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Media Picker Modals */}
        <MediaPickerModal
          isOpen={isLogoPickerOpen}
          onClose={() => setIsLogoPickerOpen(false)}
          onSelect={(items: MediaItem[]) => {
            if (items[0]) setLogoUrl(items[0].path);
          }}
          title="Select Store Logo"
        />
        <MediaPickerModal
          isOpen={isFaviconPickerOpen}
          onClose={() => setIsFaviconPickerOpen(false)}
          onSelect={(items: MediaItem[]) => {
            if (items[0]) setFaviconUrl(items[0].path);
          }}
          title="Select Favicon"
        />
      </form>
    </AdminLayout>
  );
}
