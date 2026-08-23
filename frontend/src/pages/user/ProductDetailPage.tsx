import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft, ShoppingBag, ShoppingCart } from 'lucide-react'
import { getProduct } from '../../api/products'
import { addToCart } from '../../api/cart'
import { placeOrder } from '../../api/orders'
import type { ProductEntity } from '../../types'
import { useToast } from '../../context/ToastContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { formatCurrency, getProductImage } from '../../utils/format'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [product, setProduct] = useState<ProductEntity | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [ordering, setOrdering] = useState(false)

  useEffect(() => {
    async function load() {
      if (!id) return
      try {
        const data = await getProduct(Number(id))
        setProduct(data)
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Product not found', 'error')
        navigate('/products')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate, showToast])

  const handleAddToCart = async () => {
    if (!product) return
    const pid = product.productId ?? (product as any).ProductId
    if (!pid) {
      showToast('Invalid product ID', 'error')
      return
    }
    if (quantity < 1) {
      showToast('Quantity must be at least 1', 'error')
      return
    }
    if (quantity > product.stock) {
      showToast('Insufficient stock', 'error')
      return
    }

    setAdding(true)
    try {
      const message = await addToCart({
        items: [{ productId: pid, quantity }],
      })
      showToast(message, 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add to cart', 'error')
    } finally {
      setAdding(false)
    }
  }

  const handleBuyNow = async () => {
    if (!product) return
    const pid = product.productId ?? (product as any).ProductId
    if (!pid) {
      showToast('Invalid product ID', 'error')
      return
    }
    if (quantity < 1) {
      showToast('Quantity must be at least 1', 'error')
      return
    }
    if (quantity > product.stock) {
      showToast('Insufficient stock', 'error')
      return
    }

    setOrdering(true)
    try {
      const message = await placeOrder({
        orders: [{ productId: pid, quantity }],
      })
      showToast(message, 'success')
      navigate('/orders')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to place order', 'error')
    } finally {
      setOrdering(false)
    }
  }

  if (loading) return <LoadingSpinner fullPage label="Loading product..." />
  if (!product) return null

  return (
    <div className="animate-fade-in">
      <button
        type="button"
        onClick={() => navigate('/products')}
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </button>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card padding={false} className="overflow-hidden">
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
        </Card>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-brand-600">
              {product.category}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{product.productName}</h1>
            <p className="mt-4 text-2xl font-bold text-slate-900">
              {formatCurrency(product.productPrice)}
            </p>
            <p className={`mt-2 text-sm font-medium ${product.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
            </p>
          </div>

          <Card>
            <h2 className="font-semibold text-slate-900">Description</h2>
            <p className="mt-2 text-slate-600">{product.productDes || 'No description available.'}</p>
          </Card>

          {product.stock > 0 && (
            <Card>
              <div className="space-y-4">
                <div className="w-32">
                  <Input
                    label="Quantity"
                    type="number"
                    min={1}
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleAddToCart}
                    loading={adding}
                    variant="secondary"
                    className="flex-1"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to cart
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    loading={ordering}
                    className="flex-1"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Order Now
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

