"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Star,
  Layers,
  Sparkles,
  ArrowLeft,
  Loader2,
  Check,
  Tag,
  Boxes,
  DollarSign,
  Globe,
  Settings,
  X,
} from 'lucide-react';
import { fetchApi } from '../../services/api';
import { useToast } from '../ui/Toast';
import { MediaPickerModal, MediaItem } from '../media/MediaPickerModal';

interface ProductFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  title: string;
}

export function ProductForm({ initialData, onSubmit, isLoading = false, title }: ProductFormProps) {
  const router = useRouter();
  const { addToast } = useToast();

  // Basic Info
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);

  // Pricing & Inventory
  const [price, setPrice] = useState(initialData?.price !== undefined ? String(initialData.price) : '');
  const [compareAtPrice, setCompareAtPrice] = useState(
    initialData?.compareAtPrice !== undefined && initialData?.compareAtPrice !== null
      ? String(initialData.compareAtPrice)
      : ''
  );
  const [costPrice, setCostPrice] = useState(
    initialData?.costPrice !== undefined && initialData?.costPrice !== null ? String(initialData.costPrice) : ''
  );
  const [sku, setSku] = useState(initialData?.sku || '');
  const [barcode, setBarcode] = useState(initialData?.barcode || '');
  const [trackInventory, setTrackInventory] = useState(initialData?.trackInventory ?? true);
  const [stockQuantity, setStockQuantity] = useState(
    initialData?.stockQuantity !== undefined ? String(initialData.stockQuantity) : '10'
  );
  const [lowStockThreshold, setLowStockThreshold] = useState(
    initialData?.lowStockThreshold !== undefined ? String(initialData.lowStockThreshold) : '5'
  );

  // Status & Visibility
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false);
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
  const [imageFit, setImageFit] = useState<'CONTAIN' | 'COVER' | 'AUTO'>(initialData?.imageFit || 'AUTO');

  // Images
  const [images, setImages] = useState<any[]>(
    initialData?.images?.map((img: any) => ({
      mediaId: img.mediaId,
      media: img.media,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder,
    })) || []
  );
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'product' | { variantIndex: number }>('product');

  // Specifications
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>(() => {
    if (initialData?.specifications && typeof initialData.specifications === 'object') {
      return Object.entries(initialData.specifications).map(([key, value]) => ({
        key,
        value: String(value),
      }));
    }
    return [{ key: '', value: '' }];
  });

  // Variants State
  const [enableVariants, setEnableVariants] = useState(Boolean(initialData?.variants?.length));
  const [options, setOptions] = useState<Array<{ name: string; values: string[] }>>([
    { name: 'Color', values: ['Black', 'White'] },
  ]);
  const [variants, setVariants] = useState<any[]>(initialData?.variants || []);

  // SEO
  const [metaTitle, setMetaTitle] = useState(initialData?.seo?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialData?.seo?.metaDescription || '');

  // Fetch Categories for dropdown
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['categories-flat'],
    queryFn: async () => {
      const res = await fetchApi('/categories?includeDisabled=true');
      return res || [];
    },
  });

  // Generate variants when options change
  const generateVariants = () => {
    if (options.length === 0 || options.some((o) => o.values.length === 0)) return;

    const cartesian = (arrays: string[][]): string[][] => {
      return arrays.reduce(
        (acc, curr) => acc.flatMap((c) => curr.map((n) => [...c, n])),
        [[]] as string[][]
      );
    };

    const optionValues = options.map((o) => o.values);
    const combinations = cartesian(optionValues);

    const generated = combinations.map((combo, idx) => {
      const attributes: Record<string, string> = {};
      options.forEach((opt, oIdx) => {
        attributes[opt.name] = combo[oIdx];
      });

      const variantName = combo.join(' / ');
      const existing = variants.find((v) => v.name === variantName);

      return (
        existing || {
          name: variantName,
          attributes,
          sku: sku ? `${sku}-${combo.map((c) => c.substring(0, 3).toUpperCase()).join('-')}` : '',
          price: price ? parseFloat(price) : null,
          stockQuantity: 10,
          isAvailable: true,
          images: [],
          sortOrder: idx,
        }
      );
    });

    setVariants(generated);
    setEnableVariants(true);
    addToast(`Generated ${generated.length} variant combinations`, 'info');
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^,|,$/g, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddImage = (newMedia: MediaItem[]) => {
    if (mediaPickerTarget === 'product') {
      const formatted = newMedia.map((m, idx) => ({
        mediaId: m.id,
        media: m,
        isPrimary: images.length === 0 && idx === 0,
        sortOrder: images.length + idx,
      }));
      setImages([...images, ...formatted]);
    } else if (typeof mediaPickerTarget === 'object') {
      const vIdx = mediaPickerTarget.variantIndex;
      const updatedVariants = [...variants];
      const currentVImages = updatedVariants[vIdx].images || [];
      const newVImages = newMedia.map((m, iIdx) => ({
        mediaId: m.id,
        media: m,
        sortOrder: currentVImages.length + iIdx,
      }));
      updatedVariants[vIdx].images = [...currentVImages, ...newVImages];
      setVariants(updatedVariants);
    }
  };

  const setPrimaryImage = (index: number) => {
    setImages(
      images.map((img, idx) => ({
        ...img,
        isPrimary: idx === index,
      }))
    );
  };

  const removeImage = (index: number) => {
    const next = images.filter((_, idx) => idx !== index);
    if (images[index].isPrimary && next.length > 0) {
      next[0].isPrimary = true;
    }
    setImages(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return addToast('Product name is required', 'error');
    if (!price || parseFloat(price) < 0) return addToast('Valid price is required', 'error');

    // Build Specifications Map
    const specificationsObj: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim()) specificationsObj[s.key.trim()] = s.value.trim();
    });

    const payload: any = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      shortDescription: shortDescription.trim() || undefined,
      description: description.trim() || undefined,
      price: parseFloat(price),
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
      costPrice: costPrice ? parseFloat(costPrice) : null,
      sku: sku.trim() || undefined,
      barcode: barcode.trim() || undefined,
      trackInventory,
      stockQuantity: trackInventory ? parseInt(stockQuantity || '0', 10) : 0,
      lowStockThreshold: parseInt(lowStockThreshold || '5', 10),
      categoryId: categoryId || null,
      tags,
      specifications: Object.keys(specificationsObj).length > 0 ? specificationsObj : undefined,
      isPublished,
      isFeatured,
      imageFit,
      seo: {
        metaTitle: metaTitle.trim() || undefined,
        metaDescription: metaDescription.trim() || undefined,
      },
      images: images.map((img, idx) => ({
        mediaId: img.mediaId,
        isPrimary: img.isPrimary,
        sortOrder: idx,
      })),
      variants: enableVariants
        ? variants.map((v, idx) => ({
            name: v.name,
            attributes: v.attributes,
            sku: v.sku || undefined,
            price: v.price ? parseFloat(String(v.price)) : undefined,
            stockQuantity: parseInt(String(v.stockQuantity || 0), 10),
            isAvailable: v.isAvailable ?? true,
            sortOrder: idx,
            images: (v.images || []).map((vImg: any, iIdx: number) => ({
              mediaId: vImg.mediaId,
              sortOrder: iIdx,
            })),
          }))
        : [],
    };

    await onSubmit(payload);
  };

  const getMediaThumbnail = (img: any) => {
    const raw = img.media?.variants?.thumbnail?.url || img.media?.variants?.small?.url || img.media?.path;
    if (!raw) return '';
    if (raw.startsWith('http')) return raw;
    return `http://localhost:4000${raw}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Form Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 bg-slate-50/90 backdrop-blur-md py-4 z-20 border-b border-slate-200/80 -mt-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/products')}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
            <p className="text-xs text-slate-500">{isPublished ? 'Live on Storefront' : 'Draft / Unpublished'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/products')}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
          >
            Discard
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Title & Description */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">General Information</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!initialData) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                }}
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="wireless-headphones"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Short Summary</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="High-fidelity audio with 30-hour battery life."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Description</label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed product story, features, materials, and care instructions..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
              />
            </div>
          </div>

          {/* Card 2: Product Images Gallery */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  Product Images ({images.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  The first or starred image is used as the primary card image.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMediaPickerTarget('product');
                  setIsMediaPickerOpen(true);
                }}
                className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-indigo-200"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Images
              </button>
            </div>

            {images.length === 0 ? (
              <div
                onClick={() => {
                  setMediaPickerTarget('product');
                  setIsMediaPickerOpen(true);
                }}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/50 hover:bg-indigo-50/20 rounded-2xl p-8 text-center cursor-pointer transition-colors group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white text-indigo-600 flex items-center justify-center mx-auto mb-2 border border-slate-200 group-hover:border-indigo-300 shadow-xs">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-800">Add Product Media</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Select from library or upload new files</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`group relative aspect-square rounded-xl overflow-hidden border-2 bg-slate-100 transition-all ${
                      img.isPrimary ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200'
                    }`}
                  >
                    <img
                      src={getMediaThumbnail(img)}
                      alt="Product"
                      className="w-full h-full object-cover"
                    />

                    {/* Primary Badge */}
                    {img.isPrimary && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-indigo-600 text-[9px] font-bold text-white uppercase tracking-wider shadow-sm">
                        Primary
                      </span>
                    )}

                    {/* Actions Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                      {!img.isPrimary && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(idx)}
                          title="Set as Primary"
                          className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-lg transition-colors"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        title="Remove Image"
                        className="p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Image Fit Selector */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="font-medium text-slate-700">Image Container Fit Mode:</span>
              <div className="flex items-center gap-2">
                {(['AUTO', 'COVER', 'CONTAIN'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setImageFit(mode)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      imageFit === mode
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Product Variants & Attributes */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Product Variants (Color, Size, SKU)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure variant-specific pricing, stock, and photos.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEnableVariants(!enableVariants)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                  enableVariants
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {enableVariants ? 'Variants Enabled' : '+ Enable Variants'}
              </button>
            </div>

            {enableVariants && (
              <div className="space-y-5 pt-2">
                {/* Options Definition */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-800">1. Define Attributes</p>
                  {options.map((opt, oIdx) => (
                    <div key={oIdx} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={opt.name}
                        onChange={(e) => {
                          const next = [...options];
                          next[oIdx].name = e.target.value;
                          setOptions(next);
                        }}
                        placeholder="Option Name (e.g. Color)"
                        className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium"
                      />
                      <input
                        type="text"
                        value={opt.values.join(', ')}
                        onChange={(e) => {
                          const next = [...options];
                          next[oIdx].values = e.target.value
                            .split(',')
                            .map((v) => v.trim())
                            .filter(Boolean);
                          setOptions(next);
                        }}
                        placeholder="Values separated by comma (e.g. Red, Blue)"
                        className="sm:col-span-2 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setOptions([...options, { name: '', values: [] }])}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                    >
                      + Add Another Attribute
                    </button>
                    <button
                      type="button"
                      onClick={generateVariants}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Generate Combinations
                    </button>
                  </div>
                </div>

                {/* Variants Table */}
                {variants.length > 0 && (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                        <tr>
                          <th className="p-3">Variant</th>
                          <th className="p-3">SKU</th>
                          <th className="p-3">Price ($)</th>
                          <th className="p-3">Stock</th>
                          <th className="p-3">Photos</th>
                          <th className="p-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {variants.map((v, vIdx) => (
                          <tr key={vIdx} className="hover:bg-slate-50/60">
                            <td className="p-3 font-semibold text-slate-900">{v.name}</td>
                            <td className="p-3">
                              <input
                                type="text"
                                value={v.sku || ''}
                                onChange={(e) => {
                                  const next = [...variants];
                                  next[vIdx].sku = e.target.value;
                                  setVariants(next);
                                }}
                                className="w-28 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                step="0.01"
                                value={v.price !== null && v.price !== undefined ? v.price : ''}
                                placeholder={price || '0.00'}
                                onChange={(e) => {
                                  const next = [...variants];
                                  next[vIdx].price = e.target.value ? parseFloat(e.target.value) : null;
                                  setVariants(next);
                                }}
                                className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                value={v.stockQuantity ?? 0}
                                onChange={(e) => {
                                  const next = [...variants];
                                  next[vIdx].stockQuantity = parseInt(e.target.value || '0', 10);
                                  setVariants(next);
                                }}
                                className="w-16 px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                              />
                            </td>
                            <td className="p-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setMediaPickerTarget({ variantIndex: vIdx });
                                  setIsMediaPickerOpen(true);
                                }}
                                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                              >
                                {v.images?.length ? `${v.images.length} photo(s)` : '+ Add Photo'}
                              </button>
                            </td>
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={v.isAvailable ?? true}
                                onChange={(e) => {
                                  const next = [...variants];
                                  next[vIdx].isAvailable = e.target.checked;
                                  setVariants(next);
                                }}
                                className="w-4 h-4 text-indigo-600 rounded"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 4: Technical Specifications */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Technical Specifications</h3>
                <p className="text-xs text-slate-500 mt-0.5">Key-value table for storefront specs tab.</p>
              </div>

              <button
                type="button"
                onClick={() => setSpecs([...specs, { key: '', value: '' }])}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                + Add Spec
              </button>
            </div>

            <div className="space-y-2">
              {specs.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={s.key}
                    onChange={(e) => {
                      const next = [...specs];
                      next[idx].key = e.target.value;
                      setSpecs(next);
                    }}
                    placeholder="e.g. Battery Life"
                    className="w-1/3 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <input
                    type="text"
                    value={s.value}
                    onChange={(e) => {
                      const next = [...specs];
                      next[idx].value = e.target.value;
                      setSpecs(next);
                    }}
                    placeholder="e.g. 30 Hours"
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  {specs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSpecs(specs.filter((_, i) => i !== idx))}
                      className="p-1.5 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Pricing, Inventory, Organization, SEO */}
        <div className="space-y-6">
          {/* Card: Publishing Status */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Visibility & Status</h3>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-xs font-semibold text-slate-800">Publish to Store</p>
                <p className="text-[11px] text-slate-500">Live in catalog & search</p>
              </div>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-xs font-semibold text-slate-800">Featured Product</p>
                <p className="text-[11px] text-slate-500">Highlight on homepage</p>
              </div>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Card: Pricing */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-indigo-600" />
              Pricing
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selling Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="99.99"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Compare-at Price ($) <span className="text-slate-400 font-normal">(Strike-through)</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="149.99"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cost per item ($) <span className="text-slate-400 font-normal">(For profit margins)</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="40.00"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
              />
            </div>
          </div>

          {/* Card: Inventory */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-indigo-600" />
              Inventory & Tracking
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">SKU</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="WH-1000XM4"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Barcode</label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="ISBN, UPC..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-800">Track Stock Quantity</span>
              <input
                type="checkbox"
                checked={trackInventory}
                onChange={(e) => setTrackInventory(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </div>

            {trackInventory && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Low Alert At</label>
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card: Tags & Organization */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-600" />
              Tags
            </h3>

            <div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag and press Enter..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Card: SEO Settings */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              Search Engine Optimization
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Page Title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={name || 'Product Title'}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Meta Description</label>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Compelling snippet for Google search results..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleAddImage}
        multiple={true}
      />
    </form>
  );
}
