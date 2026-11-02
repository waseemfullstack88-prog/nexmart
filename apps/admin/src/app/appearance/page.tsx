"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Palette, Save, Eye, RotateCcw } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { fetchApi } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

const FONT_OPTIONS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Nunito', 'Raleway', 'Playfair Display', 'Merriweather',
];

const BORDER_RADIUS_OPTIONS = [
  { label: 'Sharp', value: '0px' },
  { label: 'Slight', value: '4px' },
  { label: 'Rounded', value: '8px' },
  { label: 'More Rounded', value: '12px' },
  { label: 'Pill', value: '9999px' },
];

const HEADER_STYLES = ['default', 'minimal', 'centered', 'split'];
const FOOTER_STYLES = ['default', 'minimal', 'columns', 'dark'];
const CARD_STYLES = ['default', 'minimal', 'bordered', 'shadow'];

interface AppearanceState {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  fontFamily: string;
  borderRadius: string;
  headerStyle: string;
  footerStyle: string;
  productCardStyle: string;
  imageFit: 'CONTAIN' | 'COVER' | 'AUTO';
  customCss: string;
}

const DEFAULTS: AppearanceState = {
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  accentColor: '#f59e0b',
  bgColor: '#ffffff',
  textColor: '#1f2937',
  buttonColor: '#6366f1',
  buttonTextColor: '#ffffff',
  fontFamily: 'Inter',
  borderRadius: '8px',
  headerStyle: 'default',
  footerStyle: 'default',
  productCardStyle: 'default',
  imageFit: 'AUTO',
  customCss: '',
};

export default function AppearancePage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AppearanceState>(DEFAULTS);
  const [isDirty, setIsDirty] = useState(false);

  const { data: appearance, isLoading } = useQuery({
    queryKey: ['appearance'],
    queryFn: () => fetchApi('/appearance'),
  });

  useEffect(() => {
    if (appearance) {
      setForm({
        primaryColor: appearance.primaryColor || DEFAULTS.primaryColor,
        secondaryColor: appearance.secondaryColor || DEFAULTS.secondaryColor,
        accentColor: appearance.accentColor || DEFAULTS.accentColor,
        bgColor: appearance.bgColor || DEFAULTS.bgColor,
        textColor: appearance.textColor || DEFAULTS.textColor,
        buttonColor: appearance.buttonColor || DEFAULTS.buttonColor,
        buttonTextColor: appearance.buttonTextColor || DEFAULTS.buttonTextColor,
        fontFamily: appearance.fontFamily || DEFAULTS.fontFamily,
        borderRadius: appearance.borderRadius || DEFAULTS.borderRadius,
        headerStyle: appearance.headerStyle || DEFAULTS.headerStyle,
        footerStyle: appearance.footerStyle || DEFAULTS.footerStyle,
        productCardStyle: appearance.productCardStyle || DEFAULTS.productCardStyle,
        imageFit: appearance.imageFit || DEFAULTS.imageFit,
        customCss: appearance.customCss || '',
      });
      setIsDirty(false);
    }
  }, [appearance]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<AppearanceState>) =>
      fetchApi('/appearance', { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appearance'] });
      setIsDirty(false);
      addToast('Appearance updated! Changes are live on your storefront.', 'success');
    },
    onError: (err: any) => addToast(err.message || 'Update failed', 'error'),
  });

  const updateField = (key: keyof AppearanceState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const resetToDefaults = () => {
    setForm(DEFAULTS);
    setIsDirty(true);
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

  const ColorField = ({ label, fieldKey }: { label: string; fieldKey: keyof AppearanceState }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={form[fieldKey] as string}
            onChange={(e) => updateField(fieldKey, e.target.value)}
            className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
          />
        </div>
        <input
          type="text"
          value={form[fieldKey] as string}
          onChange={(e) => updateField(fieldKey, e.target.value)}
          className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Store Appearance</h1>
            <p className="text-sm text-slate-500 mt-1">
              Customize your brand colors, fonts, and UI style. Changes reflect live on your storefront.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={resetToDefaults}
              className="px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </a>
            <button
              type="submit"
              disabled={!isDirty || updateMutation.isPending}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save Changes
            </button>
          </div>
        </div>

        {/* Live Preview Swatch */}
        <div
          className="rounded-2xl border border-slate-200/80 p-6 shadow-xs overflow-hidden"
          style={{ backgroundColor: form.bgColor, color: form.textColor, fontFamily: form.fontFamily }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold" style={{ color: form.primaryColor }}>
              Your Store Preview
            </span>
            <button
              type="button"
              className="px-4 py-2 text-xs font-bold rounded-xl"
              style={{
                backgroundColor: form.buttonColor,
                color: form.buttonTextColor,
                borderRadius: form.borderRadius,
              }}
            >
              Add to Cart
            </button>
          </div>
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-1 overflow-hidden shadow-sm"
                style={{ borderRadius: form.borderRadius, border: `1px solid ${form.primaryColor}20` }}
              >
                <div
                  className="h-20 flex items-center justify-center text-2xl"
                  style={{ backgroundColor: form.primaryColor + '15' }}
                >
                  🛍️
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-semibold truncate" style={{ color: form.textColor }}>
                    Sample Product {i}
                  </p>
                  <p className="text-xs font-bold mt-1" style={{ color: form.primaryColor }}>
                    $29.99
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Brand Colors */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-600" />
              Brand Colors
            </h3>
            <ColorField label="Primary Color" fieldKey="primaryColor" />
            <ColorField label="Secondary Color" fieldKey="secondaryColor" />
            <ColorField label="Accent / Highlight Color" fieldKey="accentColor" />
            <ColorField label="Background Color" fieldKey="bgColor" />
            <ColorField label="Text Color" fieldKey="textColor" />
          </div>

          {/* Button & UI Colors */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900">Button & UI</h3>
            <ColorField label="Button Background" fieldKey="buttonColor" />
            <ColorField label="Button Text Color" fieldKey="buttonTextColor" />

            {/* Font Family */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Font Family</label>
              <select
                value={form.fontFamily}
                onChange={(e) => updateField('fontFamily', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <p className="mt-1.5 text-[11px] text-slate-400 font-medium" style={{ fontFamily: form.fontFamily }}>
                Preview: The quick brown fox jumps over the lazy dog.
              </p>
            </div>

            {/* Border Radius */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Card & Button Roundness</label>
              <div className="flex flex-wrap gap-2">
                {BORDER_RADIUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateField('borderRadius', opt.value)}
                    className={`px-3 py-1.5 text-xs font-semibold border transition-colors ${
                      form.borderRadius === opt.value
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                    style={{ borderRadius: opt.value }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Layout Styles */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900">Layout Styles</h3>

            {/* Header Style */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Header Style</label>
              <div className="grid grid-cols-2 gap-2">
                {HEADER_STYLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateField('headerStyle', s)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors capitalize ${
                      form.headerStyle === s
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Style */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Footer Style</label>
              <div className="grid grid-cols-2 gap-2">
                {FOOTER_STYLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateField('footerStyle', s)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors capitalize ${
                      form.footerStyle === s
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Card Style */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Product Card Style</label>
              <div className="grid grid-cols-2 gap-2">
                {CARD_STYLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateField('productCardStyle', s)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors capitalize ${
                      form.productCardStyle === s
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Fit */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Default Product Image Fit
              </label>
              <div className="flex gap-2">
                {(['AUTO', 'COVER', 'CONTAIN'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => updateField('imageFit', mode)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                      form.imageFit === mode
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Custom CSS */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Advanced: Custom CSS</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inject custom CSS into your storefront for deeper customization.
              </p>
            </div>
            <textarea
              rows={10}
              value={form.customCss}
              onChange={(e) => updateField('customCss', e.target.value)}
              placeholder={`/* Custom overrides */
.product-card {
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.btn-primary {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}`}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-slate-800 resize-none"
            />
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
