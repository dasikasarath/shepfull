/**
 * Mock data for offline/demo mode.
 * Used when the Spring Boot backend is not running.
 */

import type {
  UserEntity,
  ProductEntity,
  Cart,
  CartItem,
  OrderList,
  OrderItemList,
} from '../types'

// ── Users ────────────────────────────────────────────────────────
export const mockUsers: UserEntity[] = [
  {
    userId: 1,
    name: 'admin',
    email: 'admin@sheprenure.com',
    password: 'admin123',
    pincode: '500001',
    mobile: '9876543210',
    shippingAdd: '123 Admin Street, Hyderabad',
    role: 'ADMIN',
  },
  {
    userId: 2,
    name: 'john',
    email: 'john@example.com',
    password: 'john1234',
    pincode: '500032',
    mobile: '9123456789',
    shippingAdd: '45 MG Road, Bengaluru',
    role: 'USER',
  },
  {
    userId: 3,
    name: 'priya',
    email: 'priya@example.com',
    password: 'priya123',
    pincode: '110001',
    mobile: '9988776655',
    shippingAdd: '12 Connaught Place, New Delhi',
    role: 'USER',
  },
]

// ── Products ─────────────────────────────────────────────────────
export const mockProducts: ProductEntity[] = [
  {
    productId: 1,
    productName: 'Wireless Bluetooth Headphones',
    productDes: 'Premium over-ear wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio. Features soft memory-foam cushions for all-day comfort.',
    productPrice: 2499,
    stock: 45,
    category: 'Electronics',
    secure_Url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
    public_Url: 'headphones_001',
  },
  {
    productId: 2,
    productName: 'Organic Green Tea — 100 Bags',
    productDes: 'Hand-picked organic green tea leaves from the Nilgiri hills. Rich in antioxidants with a smooth, delicate flavor. Individually wrapped for freshness.',
    productPrice: 399,
    stock: 120,
    category: 'Beverages',
    secure_Url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=600&fit=crop',
    public_Url: 'tea_001',
  },
  {
    productId: 3,
    productName: 'Running Shoes — Ultralight',
    productDes: 'Breathable mesh upper with responsive cushioning sole. Perfect for daily runs and gym workouts. Available in multiple sizes.',
    productPrice: 3299,
    stock: 30,
    category: 'Footwear',
    secure_Url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
    public_Url: 'shoes_001',
  },
  {
    productId: 4,
    productName: 'Stainless Steel Water Bottle',
    productDes: 'Double-wall vacuum insulated 750ml bottle. Keeps drinks cold for 24 hours or hot for 12 hours. BPA-free and leak-proof.',
    productPrice: 599,
    stock: 80,
    category: 'Kitchen',
    secure_Url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop',
    public_Url: 'bottle_001',
  },
  {
    productId: 5,
    productName: 'Cotton Casual T-Shirt',
    productDes: '100% premium ring-spun cotton. Pre-shrunk fabric with a relaxed fit. Minimal design suitable for everyday wear.',
    productPrice: 799,
    stock: 200,
    category: 'Clothing',
    secure_Url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
    public_Url: 'tshirt_001',
  },
  {
    productId: 6,
    productName: 'Bamboo Desk Organizer',
    productDes: 'Eco-friendly bamboo organizer with 5 compartments. Keeps your desk tidy with space for pens, phone, cards, and accessories.',
    productPrice: 1299,
    stock: 55,
    category: 'Home & Office',
    secure_Url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=600&fit=crop',
    public_Url: 'organizer_001',
  },
  {
    productId: 7,
    productName: 'Smart Fitness Band',
    productDes: 'Track heart rate, steps, sleep, and SpO2 levels. Water-resistant with a 14-day battery. Compatible with Android and iOS.',
    productPrice: 1899,
    stock: 70,
    category: 'Electronics',
    secure_Url: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&h=600&fit=crop',
    public_Url: 'band_001',
  },
  {
    productId: 8,
    productName: 'Handmade Leather Wallet',
    productDes: 'Genuine leather bi-fold wallet with RFID protection. Features 6 card slots, 2 bill compartments, and a coin pocket.',
    productPrice: 1499,
    stock: 40,
    category: 'Accessories',
    secure_Url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop',
    public_Url: 'wallet_001',
  },
  {
    productId: 9,
    productName: 'Ceramic Coffee Mug Set (4 pcs)',
    productDes: 'Elegant set of 4 ceramic mugs in earthy tones. Microwave and dishwasher safe. 350ml capacity each.',
    productPrice: 899,
    stock: 60,
    category: 'Kitchen',
    secure_Url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop',
    public_Url: 'mugs_001',
  },
  {
    productId: 10,
    productName: 'Yoga Mat — Anti-Slip',
    productDes: 'Extra thick 6mm yoga mat with anti-slip texture. Lightweight and easy to carry with included strap. Eco-friendly TPE material.',
    productPrice: 1199,
    stock: 90,
    category: 'Fitness',
    secure_Url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop',
    public_Url: 'yogamat_001',
  },
  {
    productId: 11,
    productName: 'Portable Bluetooth Speaker',
    productDes: 'Compact speaker with powerful 10W output and deep bass. IP67 waterproof rating. Up to 12 hours playtime on a single charge.',
    productPrice: 1799,
    stock: 35,
    category: 'Electronics',
    secure_Url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop',
    public_Url: 'speaker_001',
  },
  {
    productId: 12,
    productName: 'Sunflower Seed Butter',
    productDes: 'Stone-ground organic sunflower seed butter. Creamy texture, no added sugar, no palm oil. Perfect for toast, smoothies, and baking.',
    productPrice: 349,
    stock: 0,
    category: 'Food',
    secure_Url: 'https://images.unsplash.com/photo-1612187209234-f0e0eaebb6ae?w=600&h=600&fit=crop',
    public_Url: 'butter_001',
  },
]

// ── Carts (per user) ─────────────────────────────────────────────
export const mockCarts: Map<number, Cart> = new Map()
export const mockCartItems: Map<number, CartItem[]> = new Map()

// Pre-populate cart for user 2 (john)
mockCarts.set(2, { cartid: 1, userid: 2, totalPrice: 5798 })
mockCartItems.set(2, [
  { cartitemid: 1, productId: 1, userid: 2, price: 2499, quantity: 1, subtotal: 2499 },
  { cartitemid: 2, productId: 3, userid: 2, price: 3299, quantity: 1, subtotal: 3299 },
])

// ── Orders ───────────────────────────────────────────────────────
let nextOrderId = 3
export function getNextOrderId() { return nextOrderId++ }

export const mockOrders: OrderList[] = [
  {
    orderId: 1,
    userid: 2,
    totalPrice: 3098,
    status: 'placed',
    mobile: '9123456789',
    shippingAdd: '45 MG Road, Bengaluru',
    delivery: new Date(Date.now() + 7 * 86400000).toISOString(),
    orderedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    orderId: 2,
    userid: 3,
    totalPrice: 1499,
    status: 'placed',
    mobile: '9988776655',
    shippingAdd: '12 Connaught Place, New Delhi',
    delivery: new Date(Date.now() + 5 * 86400000).toISOString(),
    orderedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
]

export const mockOrderItems: OrderItemList[] = [
  {
    id: 1,
    orderId: 1,
    userId: '2',
    productId: '4',
    subTotal: 599,
    quantity: 1,
    productPrice: 599,
    orderedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 2,
    orderId: 1,
    userId: '2',
    productId: '2',
    subTotal: 2499,
    quantity: 1,
    productPrice: 2499,
    orderedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 3,
    orderId: 2,
    userId: '3',
    productId: '8',
    subTotal: 1499,
    quantity: 1,
    productPrice: 1499,
    orderedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
]

// ── Forgot Password OTP store ────────────────────────────────────
export const mockOtpStore: Map<string, { otp: string; exp: number; verified: boolean }> = new Map()

// ── Helper: Generate a fake JWT ──────────────────────────────────
export function createMockJwt(user: UserEntity): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      sub: user.name,
      id: user.userId,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  )
  const sig = btoa('mock-signature-' + user.userId)
  return `${header}.${payload}.${sig}`
}

// ── Auto-increment helpers ───────────────────────────────────────
let nextProductId = 13
export function getNextProductId() { return nextProductId++ }

let nextCartItemId = 10
export function getNextCartItemId() { return nextCartItemId++ }

let nextUserId = 4
export function getNextUserId() { return nextUserId++ }
