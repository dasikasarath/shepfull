import { Link } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Package, Trash2, Pencil } from 'lucide-react'
import { getAdminProducts, deleteProduct, deleteAllProducts } from '../../api/products'
import type { ProductEntity } from '../../types'
import { useToast } from '../../context/ToastContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { formatCurrency, getProductImage } from '../../utils/format'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name')
  const { showToast } = useToast()

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAdminProducts()
      setProducts(data)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load products', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { loadProducts() }, [loadProducts])

  const sorted = useMemo(() => {
    const list = [...products]
    if (sortBy === 'name') list.sort((a, b) => (a.productName || '').localeCompare(b.productName || ''))
    if (sortBy === 'price') list.sort((a, b) => (b.productPrice ?? 0) - (a.productPrice ?? 0))
    if (sortBy === 'stock') list.sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0))
    return list
  }, [products, sortBy])

  const handleDelete = async (pid: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    setDeleting(pid)
    try {
      await deleteProduct(pid)
      showToast('Product deleted successfully', 'success')
      await loadProducts()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete product', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete ALL products? This cannot be undone.')) return
    try {
      const message = await deleteAllProducts()
      showToast(message, 'success')
      await loadProducts()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete products', 'error')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Products</h1>
          <p className="mt-1 text-slate-600">{products.length} products in catalog</p>
        </div>
        <div className="flex gap-3">
          {products.length > 0 && (
            <Button variant="danger" onClick={handleDeleteAll}>
              <Trash2 className="h-4 w-4" />
              Delete All
            </Button>
          )}
          <Link to="/admin/products/new">
            <Button>
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="name">Sort by name</option>
          <option value="price">Sort by price</option>
          <option value="stock">Sort by stock</option>
        </select>
      </Card>

      {loading ? (
        <LoadingSpinner fullPage label="Loading products..." />
      ) : sorted.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add your first product to get started."
          icon={<Package className="h-8 w-8" />}
          action={
            <Link to="/admin/products/new">
              <Button><Plus className="h-4 w-4" /> Add Product</Button>
            </Link>
          }
        />
      ) : (
        <Card padding={false} className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left font-medium text-slate-600">Product</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Category</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Price</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Stock</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((product) => (
                <tr key={product.productId} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getProductImage(product)}
                        alt={product.productName}
                        className="h-10 w-10 rounded-lg object-cover bg-slate-100"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg' }}
                      />
                      <div>
                        <p className="font-medium text-slate-900">{product.productName}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{product.productDes}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3">{formatCurrency(product.productPrice)}</td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/products/${product.productId}/edit`}>
                        <Button variant="secondary" size="sm">
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={deleting === product.productId}
                        onClick={() => handleDelete(product.productId)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
