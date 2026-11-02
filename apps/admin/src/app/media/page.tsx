"use client";

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Upload,
  Search,
  Trash2,
  Image as ImageIcon,
  Check,
  Loader2,
  Info,
  ExternalLink,
  Edit2,
  Copy,
  AlertTriangle,
  FolderOpen,
  Filter,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { fetchApi } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';

export default function MediaLibraryPage() {
  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [activeMedia, setActiveMedia] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [altTextValue, setAltTextValue] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: mediaItems = [], isLoading } = useQuery<any[]>({
    queryKey: ['media', search],
    queryFn: async () => {
      const res = await fetchApi(`/media?search=${encodeURIComponent(search)}&limit=100`);
      return res || [];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('images', file));
      return fetchApi('/media/upload', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: (newItems: any[]) => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      addToast(`${newItems.length} image(s) uploaded and optimized successfully`, 'success');
    },
    onError: (err: any) => addToast(err.message || 'Upload failed', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return fetchApi(`/media/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      setActiveMedia(updated);
      setIsRenameOpen(false);
      addToast('Image details updated', 'success');
    },
    onError: (err: any) => addToast(err.message || 'Update failed', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return fetchApi(`/media/${id}?force=true`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      if (activeMedia?.id === deleteConfirmId) setActiveMedia(null);
      setDeleteConfirmId(null);
      addToast('Image deleted successfully', 'success');
    },
    onError: (err: any) => addToast(err.message || 'Delete failed', 'error'),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return fetchApi('/media/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ mediaIds: ids }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      setSelectedItems([]);
      setIsBulkDeleteOpen(false);
      setActiveMedia(null);
      addToast('Selected images deleted', 'success');
    },
    onError: (err: any) => addToast(err.message || 'Bulk delete failed', 'error'),
  });

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadMutation.mutate(e.dataTransfer.files);
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((i) => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const getMediaUrl = (item: any) => {
    const raw = item.variants?.medium?.url || item.variants?.small?.url || item.path;
    if (raw.startsWith('http')) return raw;
    return `http://localhost:4000${raw}`;
  };

  const getOriginalUrl = (item: any) => {
    const raw = item.variants?.original?.url || item.path;
    if (raw.startsWith('http')) return raw;
    return `http://localhost:4000${raw}`;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Media Library</h1>
            <p className="text-sm text-slate-500 mt-1">
              Upload, organize, and manage your store images with automatic WebP compression.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedItems.length > 0 && (
              <button
                onClick={() => setIsBulkDeleteOpen(true)}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-red-200"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedItems.length})
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && uploadMutation.mutate(e.target.files)}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
            >
              {uploadMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Upload Images
            </button>
          </div>
        </div>

        {/* Toolbar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by file name or alt text..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end text-xs text-slate-500 font-medium">
            <span>
              {mediaItems.length} total image{mediaItems.length === 1 ? '' : 's'}
            </span>
            {mediaItems.length > 0 && (
              <button
                onClick={() => {
                  if (selectedItems.length === mediaItems.length) {
                    setSelectedItems([]);
                  } else {
                    setSelectedItems(mediaItems.map((m) => m.id));
                  }
                }}
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                {selectedItems.length === mediaItems.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
        </div>

        {/* Upload Dropzone + Gallery Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Gallery Area */}
          <div className={`${activeMedia ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-4`}>
            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3 transition-colors">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800">
                Drag and drop your images here, or <span className="text-indigo-600">browse</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports JPG, PNG, WebP up to 4MB. Automatically converted to responsive WebP variants.
              </p>
            </div>

            {/* Media Items Grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200/80">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <span className="text-xs text-slate-500 mt-2">Loading images...</span>
              </div>
            ) : mediaItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200/80 p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No media found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  {search ? 'No images match your search query.' : 'Start uploading images to build your catalog.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {mediaItems.map((item) => {
                  const isSelected = selectedItems.includes(item.id);
                  const isActive = activeMedia?.id === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveMedia(item)}
                      className={`group relative aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer bg-white transition-all shadow-xs ${
                        isActive
                          ? 'border-indigo-600 ring-4 ring-indigo-500/20'
                          : isSelected
                          ? 'border-indigo-500'
                          : 'border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={getMediaUrl(item)}
                        alt={item.altText || item.originalName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />

                      {/* Select Checkbox Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleSelect(item.id, e)}
                        className={`absolute top-2 left-2 w-6 h-6 rounded-lg flex items-center justify-center transition-all shadow-sm ${
                          isSelected
                            ? 'bg-indigo-600 text-white opacity-100'
                            : 'bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      {/* Usage Badge */}
                      {item.usageCount > 0 && (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-white">
                          {item.usageCount} {item.usageCount === 1 ? 'use' : 'uses'}
                        </span>
                      )}

                      {/* Info footer */}
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[11px] font-medium truncate">{item.originalName}</p>
                        <p className="text-[10px] text-slate-300">
                          {item.width}×{item.height} • {formatFileSize(item.fileSize)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Image Details Sidebar Drawer */}
          {activeMedia && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-5 shadow-xs h-fit sticky top-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Image Details</h3>
                <button
                  onClick={() => setActiveMedia(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Close
                </button>
              </div>

              {/* Preview */}
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
                <img
                  src={getOriginalUrl(activeMedia)}
                  alt={activeMedia.altText || activeMedia.originalName}
                  className="w-full h-full object-contain"
                />
                <a
                  href={getOriginalUrl(activeMedia)}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Open original in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Metadata List */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">File Name</span>
                  <span className="font-medium text-slate-800 truncate max-w-[160px]" title={activeMedia.originalName}>
                    {activeMedia.originalName}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Dimensions</span>
                  <span className="font-medium text-slate-800">
                    {activeMedia.width} × {activeMedia.height} px
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">File Size</span>
                  <span className="font-medium text-slate-800">{formatFileSize(activeMedia.fileSize)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Format</span>
                  <span className="font-medium text-slate-800 uppercase">{activeMedia.mimeType.replace('image/', '')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Alt Text</span>
                  <span className="font-medium text-slate-800 truncate max-w-[160px]">
                    {activeMedia.altText || 'None'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Catalog Usage</span>
                  <span className="font-medium text-indigo-600">
                    {activeMedia.usageCount || 0} product(s)/category(ies)
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    setRenameValue(activeMedia.originalName);
                    setAltTextValue(activeMedia.altText || '');
                    setIsRenameOpen(true);
                  }}
                  className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Details & Alt Text
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getOriginalUrl(activeMedia));
                    addToast('Direct image URL copied to clipboard', 'info');
                  }}
                  className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Image Link
                </button>

                <button
                  onClick={() => setDeleteConfirmId(activeMedia.id)}
                  className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Alt Text / Name Modal */}
      <Modal isOpen={isRenameOpen} onClose={() => setIsRenameOpen(false)} title="Edit Media Details" maxWidth="md">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">File Name</label>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Alt Text (Accessibility & SEO)</label>
            <input
              type="text"
              value={altTextValue}
              onChange={(e) => setAltTextValue(e.target.value)}
              placeholder="e.g. Red running shoes front view"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRenameOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() =>
                updateMutation.mutate({
                  id: activeMedia.id,
                  data: { filename: renameValue, altText: altTextValue },
                })
              }
              disabled={updateMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
        title="Delete Image"
        message="Are you sure you want to permanently delete this image from your Media Library? This action cannot be undone."
        isLoading={deleteMutation.isPending}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={() => bulkDeleteMutation.mutate(selectedItems)}
        title="Delete Selected Images"
        message={`Are you sure you want to permanently delete ${selectedItems.length} selected images? Any products referencing these images may lose their thumbnails.`}
        isLoading={bulkDeleteMutation.isPending}
      />
    </AdminLayout>
  );
}
