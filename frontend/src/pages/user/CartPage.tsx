import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { getCart, getCartItems, removeFromCart, incrementCart, decrementCart } from '../../api/cart'
import { getAllProducts } from '../../api/products'
import { placeOrder } from '../../api/orders'
import type { Cart, CartItem, ProductEntity } from '../../types'
import { useToast } from '../../context/ToastContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { formatCurrency } from '../../utils/format'

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [items, setItems] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Record<number, ProductEntity>>({})
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [ordering, setOrdering] = useState(false)
  const { showToast } = useToast()

  const loadCart = useCallback(async () => {
    setLoading(true)
    try {
      const [cartData, itemsData, allProducts] = await Promise.all([
        getCart(),
        getCartItems(),
        getAllProducts(),
      ])
      setCart(cartData)
      setItems(itemsData)
      const map: Record<number, ProductEntity> = {}
      allProducts.forEach((p) => { map[p.productId] = p })
      setProducts(map)
    } catch (err) {
      setCart(null)
      setItems([])
      if (!(err instanceof Error && err.message.includes('no cart'))) {
        showToast(err instanceof Error ? err.message : 'Failed to load cart', 'error')
      }
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { loadCart() }, [loadCart])

  const handleRemove = async (pid: number) => {
    setActionLoading(pid)
    try {
      const message = await removeFromCart(pid)
      showToast(message, 'success')
      await loadCart()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to remove item', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleIncrement = async (pid: number) => {
    setActionLoading(pid)
    try {
      const message = await incrementCart({ pid, quantity: 1 })
      showToast(message, 'success')
      await loadCart()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update quantity', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDecrement = async (pid: number) => {
    setActionLoading(pid)
    try {
      const message = await decrementCart({ pid, quantity: 1 })
      showToast(message, 'success')
      await loadCart()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update quantity', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handlePlaceOrder = async () => {
    if (items.length === 0) return
    setOrdering(true)
    try {
      const message = await placeOrder({
        orders: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      })
      showToast(message, 'success')
      await loadCart()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to place order', 'error')
    } finally {
      setOrdering(false)
    }
  }

  if (loading) return <LoadingSpinner fullPage label="Loading cart..." />

  if (!cart || items.length === 0) {
    return (
      <div className="animate-fade-in">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Shopping Cart</h1>
        <EmptyState
          title="Your cart is empty"
          description="Browse products and add items to your cart."
          icon={<ShoppingCart className="h-8 w-8" />}
          action={
            <Link to="/products">
              <Button>Browse products</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900">Shopping Cart</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = products[item.productId]
            return (
              <Card key={item.cartitemid}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {product?.productName ?? `Product #${item.productId}`}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleDecrement(item.productId)}
                      disabled={actionLoading === item.productId}
                      className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-50"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleIncrement(item.productId)}
                      disabled={actionLoading === item.productId}
                      className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-50"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatCurrency(item.subtotal)}</p>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.productId)}
                      disabled={actionLoading === item.productId}
                      className="mt-1 inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <Card className="h-fit">
          <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Items</span>
              <span>{items.length}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2 text-lg font-bold text-slate-900">
              <span>Total</span>
              <span>{formatCurrency(cart.totalPrice)}</span>
            </div>
          </div>
          <Button className="mt-6 w-full" loading={ordering} onClick={handlePlaceOrder}>
            Place Order
          </Button>
        </Card>
      </div>
    </div>
  )
}
