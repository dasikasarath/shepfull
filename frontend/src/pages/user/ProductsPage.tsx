import { Link } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Package, ShoppingCart } from 'lucide-react'
import { getAllProducts, getProductsByCategory, searchProducts } from '../../api/products'
import { addToCart } from '../../api/cart'
import type { ProductEntity } from '../../types'
import { useToast } from '../../context/ToastContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { formatCurrency, getProductImage } from '../../utils/format'

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name')
  const [addingId, setAddingId] = useState<number | null>(null)
  const { showToast } = useToast()

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      let data: ProductEntity[]
      if (search.trim()) {
        data = await searchProducts(search.trim())
      } else if (category) {
        data = await getProductsByCategory(category)
      } else {
        data = await getAllProducts()
      }
      setProducts(data)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load products', 'error')
    } finally {
      setLoading(false)
    }
  }, [search, category, showToast])

  useEffect(() => {
    const timer = setTimeout(loadProducts, search ? 400 : 0)
    return () => clearTimeout(timer)
  }, [loadProducts, search])

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean))
    return Array.from(cats).sort()
  }, [products])

  const sorted = useMemo(() => {
    const list = [...products]
    if (sortBy === 'name') list.sort((a, b) => (a.productName || '').localeCompare(b.productName || ''))
    if (sortBy === 'price-asc') list.sort((a, b) => (a.productPrice ?? 0) - (b.productPrice ?? 0))
    if (sortBy === 'price-desc') list.sort((a, b) => (b.productPrice ?? 0) - (a.productPrice ?? 0))
    return list
  }, [products, sortBy])

  const handleQuickAdd = async (e: React.MouseEvent, product: ProductEntity) => {
    e.preventDefault()
    e.stopPropagation()
    const pid = product.productId ?? (product as any).ProductId
    if (!pid) return

    setAddingId(pid)
    try {
      const message = await addToCart({
        items: [{ productId: pid, quantity: 1 }],
      })
      showToast(message, 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add to cart', 'error')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Products</h1>
        <p className="mt-1 text-slate-600">Browse and search our catalog</p>
      </div>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="name">Sort by name</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <LoadingSpinner fullPage label="Loading products..." />
      ) : sorted.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try adjusting your search or category filter."
          icon={<Package className="h-8 w-8" />}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((product) => {
            const pid = product.productId ?? (product as any).ProductId
            return (
              <div key={pid} className="flex flex-col">
                <Link to={`/products/${pid}`} className="flex-1">
                  <Card padding={false} className="overflow-hidden transition-shadow hover:shadow-md h-full flex flex-col">
                    <div className="aspect-square bg-slate-100">
                      <img
                        src={getProductImage(product)}
                        alt={product.productName}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-product.svg'
                        }}
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
                          {product.category}
                        </p>
                        <h3 className="mt-1 font-semibold text-slate-900 line-clamp-1">
                          {product.productName}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 line-clamp-2">{product.productDes}</p>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-slate-900">
                            {formatCurrency(product.productPrice)}
                          </span>
                          <span className={`text-xs font-medium ${product.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                          </span>
                        </div>
                        {product.stock > 0 && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-full"
                            loading={addingId === pid}
                            onClick={(e) => handleQuickAdd(e, product)}
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            Add to cart
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

