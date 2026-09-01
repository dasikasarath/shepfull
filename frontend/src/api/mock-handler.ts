/**
 * Mock API handler — intercepts API calls when the backend is unreachable.
 * Provides a fully functional offline experience using in-memory data.
 *
 * The mock handler matches the exact same endpoints, HTTP methods,
 * request formats, and response formats as the real Spring Boot backend.
 */

import type {
  UserEntity,
  ProductEntity,
  ProfileDto,
  UpdateProfileDto,
  PasswordDto,
  CartDto,
  OrdersDto,
  UpdateProductDto,
  IncredecreDto,
  VerifyotpDto,
  PasswordsetDto,
} from '../types'
import {
  mockUsers,
  mockProducts,
  mockCarts,
  mockCartItems,
  mockOrders,
  mockOrderItems,
  mockOtpStore,
  getNextProductId,
  getNextCartItemId,
  getNextUserId,
  getNextOrderId,
} from './mock-data'

let mockActiveUserId: number | null = 1 // Default to John Doe in mock mode if not logged out

// ── Helper: Get current user ─────────────────────────────────────
function getCurrentUser(): UserEntity | null {
  if (mockActiveUserId === null) return null
  return mockUsers.find((u) => u.userId === mockActiveUserId) ?? null
}

function getCurrentUserId(): number {
  const user = getCurrentUser()
  return user?.userId ?? -1
}

// Simulate network delay for realism
function delay(ms = 200): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// ── Route matching ───────────────────────────────────────────────
interface MockRoute {
  method: string
  pattern: RegExp
  handler: (match: RegExpMatchArray, body?: unknown, formData?: FormData) => Promise<unknown>
}

const routes: MockRoute[] = [
  // ── Auth ─────────────────────────────────────────
  {
    method: 'GET',
    pattern: /^\/auth\/me$/,
    handler: async () => {
      const user = getCurrentUser()
      if (!user) throw new Error('Unauthorized')
      return {
        id: user.userId ?? 1,
        name: user.name,
        email: user.email,
        role: (user.role as 'USER' | 'ADMIN') ?? 'USER',
      }
    },
  },
  {
    method: 'POST',
    pattern: /^\/user\/register\/send-otp$/,
    handler: async (_m, body) => {
      const { email } = body as { email: string }
      const existing = mockUsers.find((u) => u.email === email)
      if (existing) return 'Email is already registered. Please sign in or use another email.'
      const otp = '123456'
      mockOtpStore.set(`reg_${email}`, { otp, exp: Date.now() + 5 * 60 * 1000, verified: false })
      console.log(`[MOCK] Registration OTP for ${email}: ${otp}`)
      return 'Verification OTP sent to your email! (Demo code: 123456)'
    },
  },
  {
    method: 'POST',
    pattern: /^\/user\/register\/verify-otp$/,
    handler: async (_m, body) => {
      const { email, otp } = body as { email: string; otp: string }
      const entry = mockOtpStore.get(`reg_${email}`)
      if (!entry) return 'Please request an OTP first'
      if (entry.otp === otp && Date.now() < entry.exp) {
        entry.verified = true
        return 'Email verified successfully! You can now complete your registration.'
      }
      return 'Invalid verification OTP'
    },
  },
  {
    method: 'POST',
    pattern: /^\/user\/register$/,
    handler: async (_m, body) => {
      const data = body as UserEntity
      const existing = mockUsers.find((u) => u.name === data.name)
      if (existing) return 'use another user name'
      const newUser: UserEntity = {
        ...data,
        userId: getNextUserId(),
        role: 'USER',
        isVerified: true,
      }
      mockUsers.push(newUser)
      return `${newUser.name}  registered successfully! of ID  ${newUser.userId}`
    },
  },
  {
    method: 'POST',
    pattern: /^\/login$/,
    handler: async (_m, body) => {
      const { name, password } = body as { name: string; password: string }
      const user = mockUsers.find((u) => u.name === name)
      if (!user) throw new Error('Incorrect credentials!')
      if (user.password !== password) throw new Error('Incorrect password')
      mockActiveUserId = user.userId ?? 1
      return {
        id: user.userId ?? 1,
        name: user.name,
        email: user.email,
        role: (user.role as 'USER' | 'ADMIN') ?? 'USER',
      }
    },
  },
  {
    method: 'POST',
    pattern: /^\/logouts$/,
    handler: async () => {
      mockActiveUserId = null
      return 'Logged out successfully!'
    },
  },

  // ── Forgot Password ─────────────────────────────
  {
    method: 'POST',
    pattern: /^\/forgotpassword\/generateotp\/(.+)$/,
    handler: async (m) => {
      const name = decodeURIComponent(m[1])
      const user = mockUsers.find((u) => u.name === name)
      if (!user) return 'user not existed'
      const otp = String(100000 + Math.floor(Math.random() * 900000))
      mockOtpStore.set(name, { otp, exp: Date.now() + 3 * 60 * 1000, verified: false })
      console.log(`[MOCK] OTP for ${name}: ${otp}`)
      return 'message sent successfully!'
    },
  },
  {
    method: 'POST',
    pattern: /^\/forgotpassword\/verify$/,
    handler: async (_m, body) => {
      const { name, otp } = body as VerifyotpDto
      const entry = mockOtpStore.get(name)
      if (!entry) return 'get otp first'
      if (entry.otp === otp && Date.now() < entry.exp) {
        entry.verified = true
        return 'verification successfull now you can change the password'
      }
      return 'invalid otp'
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/forgotpassword\/passwordchange$/,
    handler: async (_m, body) => {
      const { name, password } = body as PasswordsetDto
      const entry = mockOtpStore.get(name)
      if (!entry) return 'verify first'
      if (!entry.verified || Date.now() >= entry.exp) return 'verification failed'
      const user = mockUsers.find((u) => u.name === name)
      if (user) {
        user.password = password
        mockOtpStore.delete(name)
        return 'password changed successfully'
      }
      return 'verification failed'
    },
  },

  // ── User Profile ────────────────────────────────
  {
    method: 'GET',
    pattern: /^\/user\/me$/,
    handler: async () => {
      const user = getCurrentUser()
      if (!user) throw new MockApiError('user not existed', 401)
      const profile: ProfileDto = {
        name: user.name,
        pincode: user.pincode ?? '',
        mobile: user.mobile ?? '',
        shippingAdd: user.shippingAdd ?? '',
        email: user.email,
      }
      return profile
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/updateprofile$/,
    handler: async (_m, body) => {
      const data = body as UpdateProfileDto
      const user = getCurrentUser()
      if (!user) throw new MockApiError('failed to change', 401)
      if (data.address && data.address.trim()) user.shippingAdd = data.address
      if (data.email && data.email.trim()) user.email = data.email
      if (data.pincode && data.pincode.trim()) user.pincode = data.pincode
      return 'updated successfully'
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/rechangepassword$/,
    handler: async (_m, body) => {
      const { currpass, password } = body as PasswordDto
      const user = getCurrentUser()
      if (!user) throw new MockApiError('failed to change', 401)
      if (user.password !== currpass) return 'failed to change'
      user.password = password
      return 'password changed successfully'
    },
  },

  // ── Products (User) ─────────────────────────────
  {
    method: 'GET',
    pattern: /^\/user\/getall$/,
    handler: async () => [...mockProducts],
  },
  {
    method: 'GET',
    pattern: /^\/user\/products\/(\d+)$/,
    handler: async (m) => {
      const pid = Number(m[1])
      const product = mockProducts.find((p) => p.productId === pid)
      if (!product) throw new MockApiError('unable to find', 404)
      return { ...product }
    },
  },
  {
    method: 'GET',
    pattern: /^\/user\/category\/(.+)$/,
    handler: async (m) => {
      const cateName = decodeURIComponent(m[1])
      return mockProducts.filter((p) => p.category === cateName)
    },
  },
  {
    method: 'GET',
    pattern: /^\/user\/search/,
    handler: async (m) => {
      const url = m.input
      const nameParam = new URL('http://x' + url).searchParams.get('name') ?? ''
      if (!nameParam.trim()) return [...mockProducts]
      return mockProducts.filter((p) =>
        p.productName.toLowerCase().includes(nameParam.toLowerCase()),
      )
    },
  },

  // ── Cart ────────────────────────────────────────
  {
    method: 'POST',
    pattern: /^\/user\/addtocart$/,
    handler: async (_m, body) => {
      const data = body as CartDto
      const userid = getCurrentUserId()
      if (userid === -1) throw new MockApiError('user doesnot exist', 401)

      let cart = mockCarts.get(userid)
      let items = mockCartItems.get(userid) ?? []

      if (!cart) {
        cart = { cartid: userid * 100, userid, totalPrice: 0 }
        mockCarts.set(userid, cart)
        mockCartItems.set(userid, items)
      }

      for (const item of data.items) {
        const product = mockProducts.find((p) => p.productId === item.productId)
        if (!product) throw new MockApiError('product doesnot exist', 400)
        if (product.stock < item.quantity) throw new MockApiError('unsufficient quantity', 400)

        const existing = items.find((ci) => ci.productId === item.productId)
        if (existing) {
          existing.quantity += item.quantity
          existing.subtotal += item.quantity * product.productPrice
        } else {
          items.push({
            cartitemid: getNextCartItemId(),
            productId: item.productId,
            userid,
            price: product.productPrice,
            quantity: item.quantity,
            subtotal: product.productPrice * item.quantity,
          })
        }
      }

      cart.totalPrice = items.reduce((sum, i) => sum + i.subtotal, 0)
      mockCartItems.set(userid, items)
      return 'successfully added!'
    },
  },
  {
    method: 'GET',
    pattern: /^\/user\/cartdb$/,
    handler: async () => {
      const userid = getCurrentUserId()
      const cart = mockCarts.get(userid)
      if (!cart) throw new MockApiError('no cart items there', 500)
      return { ...cart }
    },
  },
  {
    method: 'GET',
    pattern: /^\/user\/cartitemdb$/,
    handler: async () => {
      const userid = getCurrentUserId()
      const items = mockCartItems.get(userid)
      if (!items || items.length === 0) throw new MockApiError('no data available', 500)
      return [...items]
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/user\/remcart\/(\d+)$/,
    handler: async (m) => {
      const pid = Number(m[1])
      const userid = getCurrentUserId()
      const items = mockCartItems.get(userid) ?? []
      const idx = items.findIndex((i) => i.productId === pid)
      if (idx === -1) throw new MockApiError('unable to find product', 500)
      const removed = items.splice(idx, 1)[0]
      const cart = mockCarts.get(userid)
      if (cart) cart.totalPrice -= removed.subtotal
      return 'successfully removed from cart'
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/user\/incrementcart$/,
    handler: async (_m, body) => {
      const { pid, quantity } = body as IncredecreDto
      const userid = getCurrentUserId()
      const product = mockProducts.find((p) => p.productId === pid)
      if (!product) throw new MockApiError('product not found', 500)
      if (product.stock < quantity) return 'unable stock'

      const items = mockCartItems.get(userid) ?? []
      const item = items.find((i) => i.productId === pid)
      if (!item) throw new MockApiError('no previous cart found', 500)

      item.quantity += quantity
      item.subtotal += quantity * product.productPrice

      const cart = mockCarts.get(userid)
      if (cart) {
        cart.totalPrice += quantity * product.productPrice
      }
      return 'successfully incremented to cart'
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/user\/decrementcart$/,
    handler: async (_m, body) => {
      const { pid, quantity } = body as IncredecreDto
      if (quantity <= 0) return 'provide positive values only'
      const userid = getCurrentUserId()
      const product = mockProducts.find((p) => p.productId === pid)
      if (!product) throw new MockApiError('no product found', 500)

      let items = mockCartItems.get(userid) ?? []
      const itemIdx = items.findIndex((i) => i.productId === pid)
      if (itemIdx === -1) throw new MockApiError('no cart found', 500)

      const item = items[itemIdx]
      if (item.quantity <= quantity) {
        items.splice(itemIdx, 1)
      } else {
        item.quantity -= quantity
        item.subtotal = item.quantity * product.productPrice
      }

      const cart = mockCarts.get(userid)
      if (cart) {
        cart.totalPrice = items.reduce((sum, i) => sum + i.subtotal, 0)
      }
      mockCartItems.set(userid, items)
      return 'successfully decremented items from cart'
    },
  },

  // ── Orders (User) ──────────────────────────────
  {
    method: 'POST',
    pattern: /^\/user\/order$/,
    handler: async (_m, body) => {
      const data = body as OrdersDto
      const userid = getCurrentUserId()
      const user = getCurrentUser()
      if (!user) throw new MockApiError('user id doesnot exist', 401)

      const orderId = getNextOrderId()
      let totalAmount = 0

      for (const o of data.orders) {
        const product = mockProducts.find((p) => p.productId === o.productId)
        if (!product) return 'product doesnot exist'
        if (o.quantity > product.stock) return 'insufficient stock'

        const sub = product.productPrice * o.quantity
        totalAmount += sub
        product.stock -= o.quantity

        mockOrderItems.push({
          id: mockOrderItems.length + 1,
          orderId,
          userId: String(userid),
          productId: String(product.productId),
          subTotal: sub,
          quantity: o.quantity,
          productPrice: product.productPrice,
          orderedAt: new Date().toISOString(),
        })
      }

      mockOrders.push({
        orderId,
        userid,
        totalPrice: totalAmount,
        status: 'placed',
        mobile: user.mobile ?? '',
        shippingAdd: user.shippingAdd ?? '',
        delivery: new Date(Date.now() + 7 * 86400000).toISOString(),
        orderedAt: new Date().toISOString(),
      })

      // Clear cart
      mockCartItems.set(userid, [])
      const cart = mockCarts.get(userid)
      if (cart) cart.totalPrice = 0

      return 'order placed successfully'
    },
  },
  {
    method: 'GET',
    pattern: /^\/user\/seeorders$/,
    handler: async () => {
      const userid = getCurrentUserId()
      return mockOrders.filter((o) => o.userid === userid)
    },
  },
  {
    method: 'GET',
    pattern: /^\/user\/orderitems$/,
    handler: async () => {
      const userid = getCurrentUserId()
      return mockOrderItems.filter((i) => i.userId === String(userid))
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/user\/orders\/(\d+)\/cancel$/,
    handler: async (m) => {
      const orderId = Number(m[1])
      const userid = getCurrentUserId()
      const order = mockOrders.find((o) => o.orderId === orderId)
      if (!order) throw new MockApiError('Order not found', 404)
      if (order.userid !== userid) throw new MockApiError('Unauthorized', 403)
      if (order.status === 'cancelled') return 'Order is already cancelled'
      if (order.status === 'delivered') throw new MockApiError('Cannot cancel a delivered order', 400)

      order.status = 'cancelled'

      // Restore product stock
      const items = mockOrderItems.filter((i) => i.orderId === orderId)
      for (const item of items) {
        const prod = mockProducts.find((p) => p.productId === Number(item.productId))
        if (prod) prod.stock += item.quantity
      }

      return `Order #${orderId} cancelled successfully`
    },
  },


  // ── Admin: Products ─────────────────────────────
  {
    method: 'GET',
    pattern: /^\/admin\/products$/,
    handler: async () => [...mockProducts],
  },
  {
    method: 'GET',
    pattern: /^\/admin\/product\/(\d+)$/,
    handler: async (m) => {
      const pid = Number(m[1])
      const p = mockProducts.find((prod) => prod.productId === pid)
      if (!p) throw new MockApiError('unable to find product', 500)
      return { ...p }
    },
  },
  {
    method: 'POST',
    pattern: /^\/admin\/addproduct$/,
    handler: async (_m, _body, formData) => {
      let productData: Partial<ProductEntity> = {}
      if (formData) {
        const productBlob = formData.get('product')
        if (productBlob instanceof Blob) {
          productData = JSON.parse(await productBlob.text())
        }
        const file = formData.get('file')
        if (file instanceof File) {
          productData.secure_Url = URL.createObjectURL(file)
          productData.public_Url = 'mock_' + Date.now()
        }
      }
      const newProduct: ProductEntity = {
        productId: getNextProductId(),
        productName: productData.productName ?? 'Unnamed Product',
        productDes: productData.productDes ?? '',
        productPrice: productData.productPrice ?? 0,
        stock: productData.stock ?? 0,
        category: productData.category ?? 'Uncategorized',
        secure_Url: productData.secure_Url,
        public_Url: productData.public_Url,
      }
      mockProducts.push(newProduct)
      return { ...newProduct }
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/admin\/updateproduct$/,
    handler: async (_m, body) => {
      const data = body as UpdateProductDto
      const product = mockProducts.find((p) => p.productId === data.productId)
      if (!product) throw new MockApiError('product with that id not found', 500)
      if (data.productDes && data.productDes.trim()) product.productDes = data.productDes
      if (data.stock != null && data.stock >= 0) product.stock += data.stock
      if (data.productPrice != null && data.productPrice > 0) product.productPrice = data.productPrice
      return { ...data }
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/admin\/updateimage\/(\d+)$/,
    handler: async (m, _body, formData) => {
      const pid = Number(m[1])
      const product = mockProducts.find((p) => p.productId === pid)
      if (!product) throw new MockApiError('unable to find product', 500)
      if (formData) {
        const file = formData.get('file')
        if (file instanceof File) {
          product.secure_Url = URL.createObjectURL(file)
          product.public_Url = 'mock_' + Date.now()
        }
      }
      return 'successfully updated product picture'
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/admin\/delete\/(\d+)$/,
    handler: async (m) => {
      const pid = Number(m[1])
      const idx = mockProducts.findIndex((p) => p.productId === pid)
      if (idx === -1) throw new MockApiError('invalid product', 500)
      const [removed] = mockProducts.splice(idx, 1)
      return { ...removed }
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/admin\/deleteall$/,
    handler: async () => {
      mockProducts.length = 0
      return 'deleted successfully!'
    },
  },

  // ── Admin: Orders ──────────────────────────────
  {
    method: 'GET',
    pattern: /^\/admin\/orderslist$/,
    handler: async () => [...mockOrders],
  },
  {
    method: 'GET',
    pattern: /^\/admin\/orders\/(\d+)$/,
    handler: async (m) => {
      const id = Number(m[1])
      const order = mockOrders.find((o) => o.orderId === id)
      if (!order) throw new MockApiError('user with this id not found', 500)
      return { ...order }
    },
  },
  {
    method: 'GET',
    pattern: /^\/admin\/orders\/(\d+)\/items$/,
    handler: async (m) => {
      const id = Number(m[1])
      return mockOrderItems.filter((i) => i.orderId === id)
    },
  },


  // ── Admin: Users ───────────────────────────────
  {
    method: 'GET',
    pattern: /^\/admin\/showusers$/,
    handler: async () =>
      mockUsers.map((u) => ({ ...u })),
  },
]

// ── Mock error class ─────────────────────────────────────────────
class MockApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'MockApiError'
    this.status = status
  }
}

// ── Public API ───────────────────────────────────────────────────

export interface MockResponse {
  ok: boolean
  status: number
  data: unknown
  isJson: boolean
}

/**
 * Try to handle a request using mock data.
 * Returns null if no route matched (shouldn't happen for known endpoints).
 */
export async function handleMockRequest(
  path: string,
  method: string,
  body?: unknown,
  formData?: FormData,
): Promise<MockResponse | null> {
  const normalizedMethod = method.toUpperCase()
  // Strip query string for pattern matching, but keep it accessible
  const pathOnly = path.split('?')[0]

  for (const route of routes) {
    if (route.method !== normalizedMethod) continue
    // Match against full path (with query) for search, pathOnly for others
    const matchTarget = route.pattern.source.includes('search') ? path : pathOnly
    const match = matchTarget.match(route.pattern)
    if (!match) continue

    await delay()

    try {
      const result = await route.handler(match, body, formData)
      const isJson = typeof result === 'object'
      return { ok: true, status: 200, data: result, isJson }
    } catch (err) {
      if (err instanceof MockApiError) {
        return { ok: false, status: err.status, data: err.message, isJson: false }
      }
      return { ok: false, status: 500, data: 'Internal mock error', isJson: false }
    }
  }

  return null
}
