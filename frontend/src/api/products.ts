import { apiRequest } from './client'
import type { ProductEntity, UpdateProductDto } from '../types'

export async function getAllProducts(): Promise<ProductEntity[]> {
  return apiRequest<ProductEntity[]>('/user/getall')
}

export async function getProduct(pid: number): Promise<ProductEntity> {
  return apiRequest<ProductEntity>(`/user/products/${pid}`)
}

export async function getProductsByCategory(cateName: string): Promise<ProductEntity[]> {
  return apiRequest<ProductEntity[]>(`/user/category/${encodeURIComponent(cateName)}`)
}

export async function searchProducts(name: string): Promise<ProductEntity[]> {
  return apiRequest<ProductEntity[]>(`/user/search?name=${encodeURIComponent(name)}`)
}

export async function getAdminProducts(): Promise<ProductEntity[]> {
  return apiRequest<ProductEntity[]>('/admin/products')
}

export async function getAdminProduct(pid: number): Promise<ProductEntity> {
  return apiRequest<ProductEntity>(`/admin/product/${pid}`)
}

export async function addProduct(product: Omit<ProductEntity, 'productId'>, file: File): Promise<ProductEntity> {
  const formData = new FormData()
  formData.append('product', new Blob([JSON.stringify(product)], { type: 'application/json' }))
  formData.append('file', file)
  return apiRequest<ProductEntity>('/admin/addproduct', {
    method: 'POST',
    body: formData,
  })
}

export async function updateProduct(data: UpdateProductDto): Promise<UpdateProductDto> {
  return apiRequest<UpdateProductDto>('/admin/updateproduct', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function updateProductImage(pid: number, file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  return apiRequest<string>(`/admin/updateimage/${pid}`, {
    method: 'PATCH',
    body: formData,
  })
}

export async function deleteProduct(pid: number): Promise<ProductEntity> {
  return apiRequest<ProductEntity>(`/admin/delete/${pid}`, { method: 'DELETE' })
}

export async function deleteAllProducts(): Promise<string> {
  return apiRequest<string>('/admin/deleteall', { method: 'DELETE' })
}
