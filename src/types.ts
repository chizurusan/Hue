export interface Product {
  id: string;
  slug: string;
  name: string;
  category: 'dac-san' | 'thu-cong' | 'qua-tang-van-hoa' | 'van-phong-pham' | 'qua-tang-theo-dip';
  categoryName: string;
  shortDescription: string;
  fullDescription: string;
  story: string; // "Câu chuyện phía sau món quà"
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  tags: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  collectionId: string;
  materialsOrIngredients: string;
  careInstructions: string;
  suitability: 'ban-be' | 'gia-dinh' | 'dong-nghiep' | 'doanh-nghiep';
  easyToCarry: boolean; // Bộ lọc quà dễ mang đi khi du lịch
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string[]; // multi-paragraph editorial content
  quote?: string;
  author: string;
  readTime: string;
  publishDate: string;
  tag: string;
  image: string;
  relatedProductIds: string[];
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  bannerImage: string;
  slug: string;
  shortIntro: string;
  productIds: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
  notes: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  shippingMethod: string;
  wrapAsGift: boolean;
  giftMessage?: string;
  status: 'confirmed' | 'pending_payment' | 'packing' | 'shipping' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}
