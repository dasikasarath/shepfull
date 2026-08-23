import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { addProduct } from '../../api/products'
import { useToast } from '../../context/ToastContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Card from '../../components/ui/Card'

export default function AddProductPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    productName: '',
    productDes: '',
    productPrice: '',
    stock: '',
    category: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.productName.trim()) next.productName = 'Product name is required'
    if (!form.productDes.trim()) next.productDes = 'Description is required'
    if (!form.productPrice || Number(form.productPrice) <= 0) next.productPrice = 'Valid price is required'
    if (!form.stock || Number(form.stock) < 0) next.stock = 'Valid stock is required'
    if (!form.category.trim()) next.category = 'Category is required'
    if (!file) next.file = 'Product image is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !file) return

    setLoading(true)
    try {
      await addProduct(
        {
          productName: form.productName.trim(),
          productDes: form.productDes.trim(),
          productPrice: Number(form.productPrice),
          stock: Number(form.stock),
          category: form.category.trim(),
        },
        file,
      )
      showToast('Product added successfully', 'success')
      navigate('/admin/products')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add product', 'error')
    } finally {
      setLoading(false)
    }
  }

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
        <h1 className="text-2xl font-bold text-slate-900">Add Product</h1>
        <p className="mt-1 text-slate-600">Create a new product in the catalog</p>

        <Card className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Product Name"
              value={form.productName}
              onChange={(e) => update('productName', e.target.value)}
              error={errors.productName}
            />
            <Textarea
              label="Description"
              value={form.productDes}
              onChange={(e) => update('productDes', e.target.value)}
              error={errors.productDes}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Price (INR)"
                type="number"
                min={1}
                value={form.productPrice}
                onChange={(e) => update('productPrice', e.target.value)}
                error={errors.productPrice}
              />
              <Input
                label="Stock"
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => update('stock', e.target.value)}
                error={errors.stock}
              />
            </div>
            <Input
              label="Category"
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              error={errors.category}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              {errors.file && <p className="text-xs text-red-600">{errors.file}</p>}
            </div>
            <Button type="submit" loading={loading}>Add Product</Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
