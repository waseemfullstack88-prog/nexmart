export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  STORE_OWNER = 'STORE_OWNER',
  STAFF = 'STAFF',
}

export enum StoreStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export enum DiscountScope {
  PRODUCT = 'PRODUCT',
  CATEGORY = 'CATEGORY',
  ORDER = 'ORDER',
}

export enum ImageFit {
  CONTAIN = 'CONTAIN',
  COVER = 'COVER',
  AUTO = 'AUTO',
}

export enum MenuLocation {
  HEADER = 'HEADER',
  FOOTER = 'FOOTER',
}
