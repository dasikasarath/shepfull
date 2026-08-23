import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { getAdminProduct, updateProduct, updateProductImage } from '../../api/products'
import type { ProductEntity } from '../../types'
import { useToast } from '../../context/ToastContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { formatCurrency, getProductImage } from '../../utils/format'

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [product, setProduct] = useState<ProductEntity | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [form, setForm] = useState({
    productDes: '',
    stock: '',
    productPrice: '',
  })

  useEffect(() => {
    async function load() {
      if (!id) return
      try {
        const data = await getAdminProduct(Number(id))
        setProduct(data)
        const priceVal = data.productPrice ?? (data as any).ProductPrice ?? 0
        setForm({
          productDes: data.productDes ?? (data as any).ProductDes ?? '',
          stock: '',
          productPrice: priceVal ? priceVal.toString() : '0',
        })
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Product not found', 'error')
        navigate('/admin/products')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate, showToast])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    setSaving(true)
    try {
      const payload: {
        productId: number
        productDes?: string
        stock?: number
        productPrice?: number
      } = { productId: product.productId }

      if (form.productDes.trim()) payload.productDes = form.productDes.trim()
      if (form.stock) payload.stock = Number(form.stock)
      if (form.productPrice) payload.productPrice = Number(form.productPrice)

      await updateProduct(payload)
      showToast('Product updated successfully', 'success')
      const updated = await getAdminProduct(product.productId)
      setProduct(updated)
      setForm((f) => ({ ...f, stock: '' }))
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update product', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !product) return

    setImageLoading(true)
    try {
      const message = await updateProductImage(product.productId, file)
      showToast(message, 'success')
      const updated = await getAdminProduct(product.productId)
      setProduct(updated)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update image', 'error')
    } finally {
      setImageLoading(false)
    }
  }

  if (loading) return <LoadingSpinner fullPage label="Loading product..." />
  if (!product) return null

  return (
    <div className="animate-fade-in">
      <button
        type="button"
        onClick={() => navigate('/admin/products')}
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </button>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Edit Product</h1>
        <p className="mt-1 text-slate-600">{product.productName}</p>

        <Card className="mt-6">
          <div className="flex items-center gap-4">
            <img
              src={getProductImage(product)}
              alt={product.productName}
              className="h-20 w-20 rounded-xl object-cover bg-slate-100"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg' }}
            />
            <div>
              <p className="font-medium text-slate-900">{product.productName}</p>
              <p className="text-sm text-slate-500">{product.category} · {formatCurrency(product.productPrice)}</p>
              <p className="text-sm text-slate-500">Stock: {product.stock}</p>
            </div>
          </div>
        </Card>

        <Card className="mt-6">
          <h2 className="font-semibold text-slate-900">Update Details</h2>
          <p className="mt-1 text-xs text-slate-500">
            Stock field adds to existing stock. Leave empty to keep current stock.
          </p>
          <form onSubmit={handleUpdate} className="mt-4 space-y-4">
            <Textarea
              label="Description"
              value={form.productDes}
              onChange={(e) => setForm((f) => ({ ...f, productDes: e.target.value }))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Add Stock"
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                placeholder="Amount to add"
              />
              <Input
                label="Price (INR)"
                type="number"
                min={1}
                value={form.productPrice}
                onChange={(e) => setForm((f) => ({ ...f, productPrice: e.target.value }))}
              />
            </div>
            <Button type="submit" loading={saving}>Save Changes</Button>
          </form>
        </Card>

        <Card className="mt-6">
          <h2 className="font-semibold text-slate-900">Update Image</h2>
          <div className="mt-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpdate}
              disabled={imageLoading}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-50"
            />
          </div>
        </Card>
      </div>
    </div>
  )
}
