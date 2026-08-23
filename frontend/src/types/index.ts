export interface UserEntity {
  userId?: number
  name: string
  email: string
  password: string
  pincode?: string
  mobile?: string
  shippingAdd?: string
  role?: string
}

export interface UserDto {
  name: string
  password: string
}

export interface ProfileDto {
  name: string
  pincode: string
  mobile: string
  shippingAdd: string
  email: string
}

export interface UpdateProfileDto {
  address?: string
  pincode?: string
  email?: string
}

export interface PasswordDto {
  currpass: string
  password: string
}

export interface ProductEntity {
  productId: number
  productName: string
  productDes: string
  productPrice: number
  stock: number
  category: string
  public_Url?: string
  secure_Url?: string
}

export interface UpdateProductDto {
  productId: number
  productDes?: string
  stock?: number
  productPrice?: number
}

export interface CartItemDto {
  productId: number
  quantity: number
}

export interface CartDto {
  items: CartItemDto[]
}

export interface Cart {
  cartid: number
  userid: number
  totalPrice: number
}

export interface CartItem {
  cartitemid: number
  productId: number
  userid: number
  price: number
  quantity: number
  subtotal: number
}

export interface ProductsDto {
  productId: number
  quantity: number
}

export interface OrdersDto {
  orders: ProductsDto[]
}

export interface OrderList {
  orderId: number
  userid: number
  totalPrice: number
  status: string
  mobile: string
  shippingAdd: string
  delivery: string
  orderedAt: string
}

export interface OrderItemList {
  id: number
  orderId: number
  userId: string
  productId: string
  subTotal: number
  quantity: number
  productPrice: number
  orderedAt: string
}

export interface VerifyotpDto {
  otp: string
  name: string
}

export interface PasswordsetDto {
  name: string
  password: string
}

export interface IncredecreDto {
  pid: number
  quantity: number
}

export interface AuthUser {
  name: string
  role: 'USER' | 'ADMIN'
  id: number
}

export interface ApiError {
  message: string
  status?: number
}
