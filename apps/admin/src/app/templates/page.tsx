"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, CheckCircle2, Sparkles, Eye, Monitor, Smartphone, Tablet } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { fetchApi } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

const TEMPLATE_PREVIEWS: Record<string, { gradient: string; accent: string; description: string; features: string[] }> = {
  modern: {
    gradient: 'from-slate-900 via-indigo-950 to-slate-900',
    accent: '#6366f1',
    description: 'A sleek, contemporary design with clean typography, generous white space, and smooth animations. Perfect for premium, tech-forward brands.',
    features: ['Glassmorphism accents', 'Animated hero slider', 'Quick-view modals', 'Mega menu navigation', 'Countdown timers'],
  },
  fashion: {
    gradient: 'from-rose-950 via-pink-900 to-rose-950',
    accent: '#fb7185',
    description: 'Elegant and editorial — designed for fashion, beauty, and lifestyle brands that want to make a bold visual statement.',
    features: ['Editorial grid layouts', 'Full-bleed hero images', 'Look-book collections', 'Outfit builder', 'Style quiz integration'],
  },
  electronics: {
    gradient: 'from-cyan-950 via-sky-900 to-cyan-950',
    accent: '#22d3ee',
    description: 'Feature-rich and data-dense, perfect for electronics, gadgets, and tech products with spec comparisons and detailed product pages.',
    features: ['Spec comparison tables', 'Multi-image zoom gallery', 'Bundle builder', 'Tech spec highlights', 'Review aggregation'],
  },
};

export default function TemplatesPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const { data: templates = [], isLoading: loadingTemplates } = useQuery<any[]>({
    queryKey: ['templates'],
    queryFn: () => fetchApi('/templates'),
  });

  const { data: storeTemplate, isLoading: loadingActive } = useQuery<any>({
    queryKey: ['store-template'],
    queryFn: () => fetchApi('/templates/active'),
  });

  const switchMutation = useMutation({
    mutationFn: (templateId: string) =>
      fetchApi('/templates/switch', { method: 'POST', body: JSON.stringify({ templateId }) }),
    onSuccess: (_, templateId) => {
      queryClient.invalidateQueries({ queryKey: ['store-template'] });
      const name = templates.find((t: any) => t.id === templateId)?.name || templateId;
      addToast(`Template switched to "${name}"! Changes are live.`, 'success');
    },
    onError: (err: any) => addToast(err.message || 'Failed to switch template', 'error'),
  });

  const activeId = storeTemplate?.templateId || 'modern';

  if (loadingTemplates || loadingActive) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            Store Templates
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Choose a storefront template that fits your brand. Switching templates preserves all your products, settings, and appearance customizations.
          </p>
        </div>

        {/* Active Template Banner */}
        {activeId && (
          <div className="flex items-center gap-3 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-2xl">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span className="text-xs font-semibold text-indigo-700">
              Currently active:{' '}
              <span className="capitalize">{activeId}</span> template
            </span>
          </div>
        )}

        {/* Preview Device Selector */}
        <div className="flex items-center gap-2 justify-end">
          <span className="text-xs text-slate-500 font-medium mr-1">Preview as:</span>
          {([
            { id: 'desktop', Icon: Monitor },
            { id: 'tablet', Icon: Tablet },
            { id: 'mobile', Icon: Smartphone },
          ] as const).map(({ id, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPreviewDevice(id)}
              className={`p-2 rounded-xl border transition-colors ${
                previewDevice === id
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        {/* Template Cards */}
        <div className="grid grid-cols-1 gap-6">
          {(templates.length > 0 ? templates : ['modern', 'fashion', 'electronics'].map((id) => ({ id, name: id, description: TEMPLATE_PREVIEWS[id]?.description }))).map((tpl: any) => {
            const id = tpl.id || tpl;
            const meta = TEMPLATE_PREVIEWS[id] || TEMPLATE_PREVIEWS['modern'];
            const isActive = id === activeId;
            const isSwitching = switchMutation.isPending && switchMutation.variables === id;

            return (
              <div
                key={id}
                className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
                  isActive
                    ? 'border-indigo-500 shadow-lg shadow-indigo-100'
                    : 'border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Active Badge */}
                {isActive && (
                  <div className="absolute top-3 right-3 z-10 px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-3 h-3" />
                    ACTIVE
                  </div>
                )}

                {/* Template Visual Preview */}
                <div className={`h-48 bg-gradient-to-br ${meta.gradient} relative overflow-hidden`}>
                  {/* Simulated storefront wireframe */}
                  <div className={`absolute inset-4 ${
                    previewDevice === 'mobile' ? 'mx-auto w-1/3' :
                    previewDevice === 'tablet' ? 'mx-auto w-2/3' : ''
                  } bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden`}>
                    {/* Nav bar */}
                    <div className="h-8 border-b border-white/10 flex items-center px-3 gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: meta.accent }} />
                      <div className="h-1.5 w-16 bg-white/20 rounded-full" />
                      <div className="ml-auto flex gap-1.5">
                        {[1, 2, 3].map((i) => <div key={i} className="h-1.5 w-8 bg-white/10 rounded-full" />)}
                      </div>
                    </div>
                    {/* Hero section */}
                    <div className="h-20 m-2 rounded-lg flex items-center justify-center" style={{ backgroundColor: meta.accent + '20', border: `1px solid ${meta.accent}30` }}>
                      <div className="text-center space-y-1">
                        <div className="h-2 w-24 mx-auto rounded-full" style={{ backgroundColor: meta.accent }} />
                        <div className="h-1.5 w-16 mx-auto bg-white/20 rounded-full" />
                        <div className="h-5 w-14 mx-auto rounded-full" style={{ backgroundColor: meta.accent }} />
                      </div>
                    </div>
                    {/* Product grid */}
                    <div className="grid grid-cols-3 gap-1.5 px-2 pb-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-md overflow-hidden" style={{ backgroundColor: meta.accent + '15', border: `1px solid ${meta.accent}20` }}>
                          <div className="h-8" style={{ backgroundColor: meta.accent + '25' }} />
                          <div className="p-1 space-y-0.5">
                            <div className="h-1 bg-white/30 rounded-full" />
                            <div className="h-1 w-2/3 rounded-full" style={{ backgroundColor: meta.accent + '80' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Template name watermark */}
                  <div className="absolute bottom-3 left-4 text-white/30 text-xs font-bold uppercase tracking-widest capitalize">
                    {id} Template
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-5 bg-white flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 capitalize">{id}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{meta.description}</p>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1.5">
                      {meta.features.map((f) => (
                        <span
                          key={f}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-full"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 sm:w-32 shrink-0 items-start sm:items-stretch">
                    <a
                      href={`http://localhost:3000?template_preview=${id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 sm:flex-none px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </a>
                    {isActive ? (
                      <button
                        type="button"
                        disabled
                        className="flex-1 sm:flex-none px-3 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-1.5 opacity-80 cursor-default"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => switchMutation.mutate(id)}
                        disabled={isSwitching}
                        className="flex-1 sm:flex-none px-3 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
                      >
                        {isSwitching ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        Apply
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
