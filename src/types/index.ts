export type UserRole = "ADMIN" | "CUSTOMER";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  avatar?: string | null;
}

export interface StoreSettingData {
  id: string;
  storeName: string;
  tagLine: string;
  description: string;
  logoUrl?: string | null;
  email: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  socialMediaJson?: string | null;
  currency: string;
  maintenanceMode: boolean;
  bannerAnnouncement?: string | null;
  termsAndConditions?: string | null;
  privacyPolicy?: string | null;
  returnPolicy?: string | null;
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  displayOrder: number;
  _count?: {
    products: number;
  };
}

export interface ProductImageData {
  id: string;
  productId: string;
  url: string;
  alt?: string | null;
  isPrimary: boolean;
  order: number;
}

export interface ProductVariantData {
  id: string;
  productId: string;
  name: string;
  sku?: string | null;
  price?: number | null;
  stock: number;
  attributesJson?: string | null;
  imageUrl?: string | null;
}

export interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  price: number;
  discountPrice?: number | null;
  stock: number;
  sku?: string | null;
  weight: number;
  isPhysical: boolean;
  digitalDeliveryType?: string | null;
  digitalFileUrl?: string | null;
  digitalLicenseKey?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  categoryId: string;
  category?: CategoryData;
  images: ProductImageData[];
  variants?: ProductVariantData[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CartItemData {
  id: string;
  productId: string;
  variantId?: string | null;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice: number;
  quantity: number;
  stock: number;
  isPhysical: boolean;
  variantName?: string | null;
}

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "WAITING_CONFIRMATION"
  | "PAID"
  | "PROCESSING"
  | "READY_TO_SHIP"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderItemData {
  id: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
  isDigital: boolean;
  digitalAccessDelivered: boolean;
  digitalAccessCode?: string | null;
  product?: {
    slug: string;
    images?: { url: string }[];
  };
}

export interface PaymentData {
  id: string;
  orderId: string;
  paymentMethod: string;
  paymentChannel?: string | null;
  transactionId?: string | null;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";
  paymentProofUrl?: string | null;
  adminVerifiedBy?: string | null;
  adminVerifiedAt?: string | Date | null;
  adminVerificationNote?: string | null;
}

export interface ShipmentData {
  id: string;
  orderId: string;
  courierName: string;
  service?: string | null;
  trackingNumber?: string | null;
  status: "PENDING" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED";
  estimatedDays?: string | null;
  shippedAt?: string | Date | null;
  deliveredAt?: string | Date | null;
  notes?: string | null;
}

export interface OrderData {
  id: string;
  orderNumber: string;
  userId?: string | null;
  status: OrderStatus;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  grandTotal: number;
  notes?: string | null;
  shippingAddressJson?: string | null;
  recipientName: string;
  recipientPhone: string;
  cancelReason?: string | null;
  trackingNumber?: string | null;
  courierName?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  items: OrderItemData[];
  payments: PaymentData[];
  shipments: ShipmentData[];
}

export interface CouponData {
  id: string;
  code: string;
  description?: string | null;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minPurchase: number;
  maxDiscount?: number | null;
  quota: number;
  usedCount: number;
  isActive: boolean;
}

export interface ReviewData {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string | null;
  comment: string;
  mediaUrls?: string | null;
  createdAt: string | Date;
  user: {
    name: string;
    avatar?: string | null;
  };
}
