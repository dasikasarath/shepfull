import { apiRequest, apiText } from './client'
import type { Cart, CartDto, CartItem, IncredecreDto } from '../types'

export async function addToCart(data: CartDto): Promise<string> {
  return apiText('/user/addtocart', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getCart(): Promise<Cart> {
  return apiRequest<Cart>('/user/cartdb')
}

export async function getCartItems(): Promise<CartItem[]> {
  return apiRequest<CartItem[]>('/user/cartitemdb')
}

export async function removeFromCart(pid: number): Promise<string> {
  return apiText(`/user/remcart/${pid}`, { method: 'DELETE' })
}

export async function incrementCart(data: IncredecreDto): Promise<string> {
  return apiText('/user/incrementcart', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function decrementCart(data: IncredecreDto): Promise<string> {
  return apiText('/user/decrementcart', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}
