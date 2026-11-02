export interface StoreAppearance {
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
  customCss?: string;
}

export interface StoreSettings {
  storeName: string;
  description?: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  faviconUrl?: string;
  currency: string;
  currencySymbol: string;
  language: string;
  timezone: string;
  copyrightText?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  sku?: string;
  inventory: number;
  options: Record<string, string>;
  images?: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  images: string[];
  variants: ProductVariant[];
  categoryId?: string;
  category?: { id: string; name: string; slug: string };
  tags: string[];
  isFeatured: boolean;
  inventory: number;
  status: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  productCount?: number;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  description?: string;
  logoUrl?: string;
  templateId?: string;
}
