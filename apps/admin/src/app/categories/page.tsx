"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  Image as ImageIcon,
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Folder,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { fetchApi } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { MediaPickerModal, MediaItem } from '../../components/media/MediaPickerModal';

export default function CategoriesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: categoryTree = [], isLoading } = useQuery<any[]>({
    queryKey: ['categories-tree'],
    queryFn: async () => {
      const res = await fetchApi('/categories?tree=true&includeDisabled=true');
      return res || [];
    },
  });

  const { data: flatCategories = [] } = useQuery<any[]>({
    queryKey: ['categories-flat'],
    queryFn: async () => {
      const res = await fetchApi('/categories?includeDisabled=true');
      return res || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return fetchApi('/categories', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories-tree'] });
      queryClient.invalidateQueries({ queryKey: ['categories-flat'] });
      resetForm();
      setIsCreateOpen(false);
      addToast('Category created successfully', 'success');
    },
    onError: (err: any) => addToast(err.message || 'Creation failed', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return fetchApi(`/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories-tree'] });
      queryClient.invalidateQueries({ queryKey: ['categories-flat'] });
      resetForm();
      setEditingCategory(null);
      addToast('Category updated successfully', 'success');
    },
    onError: (err: any) => addToast(err.message || 'Update failed', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return fetchApi(`/categories/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories-tree'] });
      queryClient.invalidateQueries({ queryKey: ['categories-flat'] });
      setDeleteConfirmId(null);
      addToast('Category deleted successfully', 'success');
    },
    onError: (err: any) => addToast(err.message || 'Delete failed', 'error'),
  });

  const resetForm = () => {
    setName('');
    setSlug('');
    setDescription('');
    setParentId('');
    setSelectedImage(null);
    setIsEnabled(true);
    setMetaTitle('');
    setMetaDescription('');
  };

  const openCreate = (parentCatId?: string) => {
    resetForm();
    if (parentCatId) setParentId(parentCatId);
    setEditingCategory(null);
    setIsCreateOpen(true);
  };

  const openEdit = (cat: any) => {
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setParentId(cat.parentId || '');
    setSelectedImage(cat.image || null);
    setIsEnabled(cat.isEnabled ?? true);
    setMetaTitle(cat.seo?.metaTitle || '');
    setMetaDescription(cat.seo?.metaDescription || '');
    setEditingCategory(cat);
    setIsCreateOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return addToast('Category name is required', 'error');

    const payload: any = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || undefined,
      parentId: parentId || null,
      imageMediaId: selectedImage?.id || null,
      isEnabled,
      seo: {
        metaTitle: metaTitle.trim() || undefined,
        metaDescription: metaDescription.trim() || undefined,
      },
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderCategoryItem = (cat: any, depth = 0) => {
    const hasChildren = cat.children && cat.children.length > 0;
    const isExpanded = expandedNodes[cat.id] ?? true;

    return (
      <div key={cat.id} className="space-y-1">
        <div
          className={`flex items-center justify-between p-3.5 rounded-xl border bg-white hover:bg-slate-50 transition-colors ${
            !cat.isEnabled ? 'opacity-60 border-dashed border-slate-300' : 'border-slate-200/80 shadow-xs'
          }`}
          style={{ marginLeft: `${depth * 24}px` }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpand(cat.id)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <div className="w-6" />
            )}

            {/* Category Image thumbnail or icon */}
            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
              {cat.image ? (
                <img
                  src={
                    cat.image.variants?.thumbnail?.url
                      ? `http://localhost:4000${cat.image.variants.thumbnail.url}`
                      : `http://localhost:4000${cat.image.path}`
                  }
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Folder className="w-4 h-4 text-indigo-500" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 truncate">{cat.name}</span>
                {!cat.isEnabled && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                    Disabled
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate">/{cat.slug}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-semibold">
              {cat.productCount || 0} {(cat.productCount || 0) === 1 ? 'product' : 'products'}
            </span>

            <button
              onClick={() => openCreate(cat.id)}
              title="Add Subcategory"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              onClick={() => openEdit(cat)}
              title="Edit Category"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setDeleteConfirmId(cat.id)}
              title="Delete Category"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1 mt-1">
            {cat.children.map((child: any) => renderCategoryItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Categories</h1>
            <p className="text-sm text-slate-500 mt-1">
              Organize your products into structured hierarchical categories and subcategories.
            </p>
          </div>

          <button
            onClick={() => openCreate()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-sm w-fit"
          >
            <Plus className="w-4 h-4" />
            Add New Category
          </button>
        </div>

        {/* Category Hierarchy List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-indigo-600" />
              Category Hierarchy Tree
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {flatCategories.length} Total Categories
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
              <span className="text-xs">Loading categories...</span>
            </div>
          ) : categoryTree.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <FolderTree className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No categories created yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Create your first category to start organizing your store products.
              </p>
              <button
                onClick={() => openCreate()}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-xl hover:bg-indigo-700"
              >
                Create First Category
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {categoryTree.map((cat) => renderCategoryItem(cat))}
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Category Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          resetForm();
        }}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editingCategory) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
              }}
              placeholder="e.g. Men's Shoes"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              URL Slug <span className="text-slate-400 font-normal">(Auto-generated)</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="mens-shoes"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Category</label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
            >
              <option value="">None (Top-Level Category)</option>
              {flatCategories
                .filter((c) => !editingCategory || c.id !== editingCategory.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description for category banner..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
            />
          </div>

          {/* Category Image Preview & Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category Image</label>
            <div className="flex items-center gap-3">
              {selectedImage ? (
                <div className="relative w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 group">
                  <img
                    src={
                      selectedImage.variants?.thumbnail?.url
                        ? `http://localhost:4000${selectedImage.variants.thumbnail.url}`
                        : `http://localhost:4000${selectedImage.path}`
                    }
                    alt="Category"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-semibold transition-opacity"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                {selectedImage ? 'Change Image' : 'Choose from Media Library'}
              </button>
            </div>
          </div>

          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs font-semibold text-slate-800">Publish Category</p>
              <p className="text-[11px] text-slate-500">Visible to customers in storefront navigation</p>
            </div>
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
          </div>

          {/* SEO Details */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800">SEO Settings</h4>
            <div>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Meta Title (defaults to category name)"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <textarea
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Meta Description..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                resetForm();
              }}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              {editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(selected: MediaItem[]) => {
          if (selected.length > 0) setSelectedImage(selected[0]);
        }}
        multiple={false}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
        title="Delete Category"
        message="Are you sure you want to delete this category? Subcategories will be moved to the top level, and products in this category will become unassigned."
        isLoading={deleteMutation.isPending}
      />
    </AdminLayout>
  );
}
