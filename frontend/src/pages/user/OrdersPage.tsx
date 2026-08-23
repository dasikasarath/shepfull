import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  Calendar,
  MapPin,
  Phone,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react'
import { getUserOrders, getUserOrderItems, cancelOrder } from '../../api/orders'
import { getAllProducts } from '../../api/products'
import type { OrderItemList, OrderList, ProductEntity } from '../../types'
import { useToast } from '../../context/ToastContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { formatCurrency, formatDate, getProductImage } from '../../utils/format'

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderList[]>([])
  const [orderItems, setOrderItems] = useState<OrderItemList[]>([])
  const [products, setProducts] = useState<ProductEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const { showToast } = useToast()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [ordersData, itemsData, productsData] = await Promise.allSettled([
        getUserOrders(),
        getUserOrderItems(),
        getAllProducts(),
      ])

      if (ordersData.status === 'fulfilled') {
        // Sort orders newest first
        const list = [...ordersData.value].sort((a, b) => {
          const dateA = new Date(a.orderedAt || 0).getTime()
          const dateB = new Date(b.orderedAt || 0).getTime()
          return dateB - dateA
        })
        setOrders(list)
      }
      if (itemsData.status === 'fulfilled') setOrderItems(itemsData.value)
      if (productsData.status === 'fulfilled') setProducts(productsData.value)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load orders', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const productMap = useMemo(() => {
    const map: Record<number, ProductEntity> = {}
    products.forEach((p) => {
      const pid = p.productId ?? (p as any).ProductId
      if (pid) map[pid] = p
    })
    return map
  }, [products])

  const itemsByOrderId = useMemo(() => {
    const map: Record<number, OrderItemList[]> = {}
    orderItems.forEach((item) => {
      const oid = Number(item.orderId)
      if (!map[oid]) map[oid] = []
      map[oid].push(item)
    })
    return map
  }, [orderItems])

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm(`Are you sure you want to cancel Order #${orderId}?`)) return
    setCancellingId(orderId)
    try {
      const message = await cancelOrder(orderId)
      showToast(message, 'success')
      await loadData()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to cancel order', 'error')
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) return <LoadingSpinner fullPage label="Loading your orders..." />

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase()
    if (s === 'delivered') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Delivered
        </span>
      )
    }
    if (s === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 border border-red-200">
          <XCircle className="h-3.5 w-3.5" />
          Cancelled
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
        <Clock className="h-3.5 w-3.5" />
        Order Placed
      </span>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track, view items, and manage your recent orders
          </p>
        </div>
        <Link to="/products">
          <Button variant="secondary" size="sm">
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders placed yet"
          description="Looks like you haven't bought anything yet. Explore our products and place your first order!"
          icon={<Package className="h-10 w-10 text-brand-600" />}
          action={
            <Link to="/products">
              <Button>Explore Products</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const items = itemsByOrderId[order.orderId] || []
            const isCancelled = order.status?.toLowerCase() === 'cancelled'
            const isDelivered = order.status?.toLowerCase() === 'delivered'
            const isCancellable = !isCancelled && !isDelivered

            return (
              <Card key={order.orderId} padding={false} className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                {/* Order Top Bar */}
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-slate-500 block font-medium">
                        Order Placed
                      </span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(order.orderedAt)}
                      </span>
                    </div>
                    <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                    <div>
                      <span className="text-xs uppercase tracking-wider text-slate-500 block font-medium">
                        Total Amount
                      </span>
                      <span className="font-bold text-slate-900 text-base mt-0.5 block">
                        {formatCurrency(order.totalPrice)}
                      </span>
                    </div>
                    <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                    <div>
                      <span className="text-xs uppercase tracking-wider text-slate-500 block font-medium">
                        Order #
                      </span>
                      <span className="font-mono font-medium text-slate-700 mt-0.5 block">
                        ORD-{order.orderId}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Tracking Progress Bar */}
                <div className="px-6 pt-5 pb-3 border-b border-slate-100 bg-white">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Order Confirmed</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${isCancelled ? 'text-red-500' : isDelivered ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {isCancelled ? (
                        <>
                          <XCircle className="h-4 w-4" />
                          <span>Order Cancelled</span>
                        </>
                      ) : (
                        <>
                          <Truck className="h-4 w-4" />
                          <span>{isDelivered ? 'Delivered' : `Estimated by ${formatDate(order.delivery)}`}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCancelled
                          ? 'w-full bg-red-400'
                          : isDelivered
                          ? 'w-full bg-emerald-500'
                          : 'w-1/2 bg-blue-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Items List Inside Order */}
                <div className="p-6 divide-y divide-slate-100">
                  {items.length === 0 ? (
                    <div className="py-4 text-center text-sm text-slate-500">
                      Order details confirmed. Total: {formatCurrency(order.totalPrice)}
                    </div>
                  ) : (
                    items.map((item) => {
                      const pid = Number(item.productId)
                      const product = productMap[pid]
                      const imgSrc = product ? getProductImage(product) : '/placeholder-product.svg'
                      const title = product?.productName || `Product #${item.productId}`
                      const category = product?.category || 'Item'

                      return (
                        <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <img
                              src={imgSrc}
                              alt={title}
                              className="h-20 w-20 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0 shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-product.svg'
                              }}
                            />
                            <div className="space-y-1">
                              <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                                {category}
                              </span>
                              <Link
                                to={`/products/${pid}`}
                                className="block font-semibold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1 text-base"
                              >
                                {title}
                              </Link>
                              <p className="text-sm text-slate-500">
                                Quantity: <strong className="text-slate-800">{item.quantity}</strong> × {formatCurrency(item.productPrice)}
                              </p>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0">
                            <span className="text-base font-bold text-slate-900">
                              {formatCurrency(item.subTotal)}
                            </span>
                            <Link to={`/products/${pid}`}>
                              <Button variant="secondary" size="sm" className="text-xs">
                                <span>View item</span>
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Delivery Info & Actions Footer */}
                <div className="bg-slate-50/70 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                    {order.shippingAdd && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-xs">{order.shippingAdd}</span>
                      </div>
                    )}
                    {order.mobile && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{order.mobile}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {isCancellable && (
                      <Button
                        variant="danger"
                        size="sm"
                        loading={cancellingId === order.orderId}
                        onClick={() => handleCancelOrder(order.orderId)}
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel Order
                      </Button>
                    )}
                    {isCancelled && (
                      <span className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                        This order has been cancelled
                      </span>
                    )}
                    {isDelivered && (
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        Package Delivered
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

