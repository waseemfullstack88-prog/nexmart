"use client";

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Search, Check, Image as ImageIcon, Loader2, Plus } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { fetchApi } from '../../services/api';
import { useToast } from '../ui/Toast';

export interface MediaItem {
  id: string;
  originalName: string;
  filename: string;
  path: string;
  fileSize: number;
  width: number;
  height: number;
  altText?: string;
  variants?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
    original?: { url: string };
  };
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selected: MediaItem[]) => void;
  multiple?: boolean;
  selectedIds?: string[];
  title?: string;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  selectedIds = [],
  title = 'Select Media',
}: MediaPickerModalProps) {
  const [selected, setSelected] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: mediaItems = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ['media', search],
    queryFn: async () => {
      const res = await fetchApi(`/media?search=${encodeURIComponent(search)}&limit=50`);
      return res || [];
    },
    enabled: isOpen,
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('images', file);
      });
      return fetchApi('/media/upload', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: (newItems: MediaItem[]) => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      addToast(`${newItems.length} image(s) uploaded successfully`, 'success');
      if (!multiple && newItems.length > 0) {
        onSelect([newItems[0]]);
        onClose();
      } else {
        setSelected((prev) => [...prev, ...newItems]);
      }
    },
    onError: (err: any) => {
      addToast(err.message || 'Upload failed', 'error');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadMutation.mutate(e.target.files);
    }
  };

  const toggleSelect = (item: MediaItem) => {
    if (multiple) {
      if (selected.some((s) => s.id === item.id)) {
        setSelected(selected.filter((s) => s.id !== item.id));
      } else {
        setSelected([...selected, item]);
      }
    } else {
      setSelected([item]);
    }
  };

  const handleConfirm = () => {
    onSelect(selected);
    onClose();
  };

  const getThumbnailUrl = (item: MediaItem) => {
    const rawUrl = item.variants?.thumbnail?.url || item.variants?.small?.url || item.path;
    if (rawUrl.startsWith('http')) return rawUrl;
    return `http://localhost:4000${rawUrl}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="4xl">
      <div className="flex flex-col gap-4">
        {/* Controls Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search images..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              ref={fileInputRef}
              type="file"
              multiple={multiple}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
            >
              {uploadMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              Upload New
            </button>
          </div>
        </div>

        {/* Media Grid */}
        <div className="min-h-[300px] max-h-[420px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <span className="text-xs">Loading media library...</span>
            </div>
          ) : mediaItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-800">No images found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Upload your first image to add it to your product catalog.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Upload Image
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {mediaItems.map((item) => {
                const isSelected = selected.some((s) => s.id === item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelect(item)}
                    className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all bg-slate-100 ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/30'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={getThumbnailUrl(item)}
                      alt={item.altText || item.originalName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />

                    {/* Selection Indicator */}
                    <div
                      className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white transition-all shadow-sm ${
                        isSelected
                          ? 'bg-indigo-600 scale-100'
                          : 'bg-black/40 opacity-0 group-hover:opacity-100 scale-90'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>

                    {/* File info overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] font-medium truncate">{item.originalName}</p>
                      <p className="text-[9px] text-slate-300">
                        {item.width}×{item.height} px
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-medium">
            {selected.length} {selected.length === 1 ? 'item' : 'items'} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selected.length === 0}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-40 shadow-sm"
            >
              Choose Selected
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
