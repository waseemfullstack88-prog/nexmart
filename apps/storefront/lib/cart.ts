import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  slug: string;
  image?: string;
  price: number;
  comparePrice?: number;
  quantity: number;
  variant?: {
    name: string;
    options: Record<string, string>;
  };
}

interface CartStore {
  items: CartItem[];
  storeSlug: string;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, qty: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

const itemKey = (productId: string, variantId?: string) =>
  `${productId}::${variantId || 'default'}`;

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      storeSlug: '',

      addItem: (item) => {
        set((state) => {
          const key = itemKey(item.productId, item.variantId);
          const existing = state.items.find(
            (i) => itemKey(i.productId, i.variantId) === key
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                itemKey(i.productId, i.variantId) === key
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },

      removeItem: (productId, variantId) => {
        const key = itemKey(productId, variantId);
        set((state) => ({
          items: state.items.filter(
            (i) => itemKey(i.productId, i.variantId) !== key
          ),
        }));
      },

      updateQuantity: (productId, variantId, qty) => {
        const key = itemKey(productId, variantId);
        if (qty <= 0) {
          set((state) => ({
            items: state.items.filter(
              (i) => itemKey(i.productId, i.variantId) !== key
            ),
          }));
        } else {
          set((state) => ({
            items: state.items.map((i) =>
              itemKey(i.productId, i.variantId) === key ? { ...i, quantity: qty } : i
            ),
          }));
        }
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'nexmart-cart',
    }
  )
);
