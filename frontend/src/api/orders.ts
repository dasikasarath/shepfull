import { apiRequest, apiText } from './client'
import type { OrderItemList, OrderList, OrdersDto } from '../types'

export async function placeOrder(data: OrdersDto): Promise<string> {
  return apiText('/user/order', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getUserOrders(): Promise<OrderList[]> {
  return apiRequest<OrderList[]>('/user/seeorders')
}

export async function getUserOrderItems(): Promise<OrderItemList[]> {
  return apiRequest<OrderItemList[]>('/user/orderitems')
}

export async function cancelOrder(orderId: number): Promise<string> {
  return apiText(`/user/orders/${orderId}/cancel`, {
    method: 'PATCH',
  })
}

export async function getAdminOrders(): Promise<OrderList[]> {
  return apiRequest<OrderList[]>('/admin/orderslist')
}

export async function getAdminOrder(id: number): Promise<OrderList> {
  return apiRequest<OrderList>(`/admin/orders/${id}`)
}

export async function getAdminOrderItems(id: number): Promise<OrderItemList[]> {
  return apiRequest<OrderItemList[]>(`/admin/orders/${id}/items`)
}



