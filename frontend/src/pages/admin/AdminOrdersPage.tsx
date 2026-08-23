import { useEffect, useMemo, useState } from 'react'
import { ClipboardList, Package } from 'lucide-react'
import { getAdminOrders, getAdminOrder, getAdminOrderItems } from '../../api/orders'
import { getAllProducts } from '../../api/products'
import type { OrderItemList, OrderList, ProductEntity } from '../../types'
import { useToast } from '../../context/ToastContext'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { formatCurrency, formatDate, getProductImage } from '../../utils/format'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderList[]>([])
  const [selectedOrder, setSelectedOrder] = useState<OrderList | null>(null)
  const [selectedItems, setSelectedItems] = useState<OrderItemList[]>([])
  const [products, setProducts] = useState<ProductEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    async function load() {
      try {
        const [ordersData, productsData] = await Promise.allSettled([
          getAdminOrders(),
          getAllProducts(),
        ])
        if (ordersData.status === 'fulfilled') {
          const list = [...ordersData.value].sort((a, b) => {
            const dateA = new Date(a.orderedAt || 0).getTime()
            const dateB = new Date(b.orderedAt || 0).getTime()
            return dateB - dateA
          })
          setOrders(list)
        }
        if (productsData.status === 'fulfilled') {
          setProducts(productsData.value)
        }
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to load orders', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [showToast])

  const productMap = useMemo(() => {
    const map: Record<number, ProductEntity> = {}
    products.forEach((p) => {
      const pid = p.productId ?? (p as any).ProductId
      if (pid) map[pid] = p
    })
    return map
  }, [products])

  const handleViewOrder = async (id: number) => {
    setDetailLoading(true)
    try {
      const [orderData, itemsData] = await Promise.allSettled([
        getAdminOrder(id),
        getAdminOrderItems(id),
      ])
      if (orderData.status === 'fulfilled') setSelectedOrder(orderData.value)
      if (itemsData.status === 'fulfilled') setSelectedItems(itemsData.value)
      else setSelectedItems([])
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load order details', 'error')
    } finally {
      setDetailLoading(false)
    }
  }

  if (loading) return <LoadingSpinner fullPage label="Loading orders..." />

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="mt-1 text-slate-600">{orders.length} total orders placed across the platform</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Orders placed by users will appear here."
          icon={<ClipboardList className="h-8 w-8" />}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card padding={false} className="lg:col-span-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Order ID</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">User ID</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Ordered At</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const isSelected = selectedOrder?.orderId === order.orderId
                  return (
                    <tr
                      key={order.orderId}
                      className={`border-b border-slate-100 transition-colors ${
                        isSelected ? 'bg-brand-50/60 font-medium' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900">#ORD-{order.orderId}</td>
                      <td className="px-4 py-3">User #{order.userid}</td>
                      <td className="px-4 py-3 font-semibold">{formatCurrency(order.totalPrice)}</td>
                      <td className="px-4 py-3 capitalize">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            order.status?.toLowerCase() === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700'
                              : order.status?.toLowerCase() === 'cancelled'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(order.orderedAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleViewOrder(order.orderId)}
                          className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                        >
                          {isSelected ? 'Viewing' : 'View'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>

          <Card className="h-fit">
            <h2 className="font-semibold text-slate-900 text-lg border-b border-slate-100 pb-3">Order Details</h2>
            {detailLoading ? (
              <div className="py-8">
                <LoadingSpinner label="Loading items..." />
              </div>
            ) : selectedOrder ? (
              <div className="mt-4 space-y-4 text-sm">
                <dl className="space-y-2.5">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Order ID</dt>
                    <dd className="font-semibold">#ORD-{selectedOrder.orderId}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Customer ID</dt>
                    <dd className="font-medium">User #{selectedOrder.userid}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Total Price</dt>
                    <dd className="font-bold text-slate-900">{formatCurrency(selectedOrder.totalPrice)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Status</dt>
                    <dd className="font-semibold capitalize">{selectedOrder.status}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Customer Mobile</dt>
                    <dd className="font-medium">{selectedOrder.mobile || '—'}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 pt-1">
                    <dt className="text-slate-500">Shipping Address</dt>
                    <dd className="font-medium text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {selectedOrder.shippingAdd || '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between pt-1">
                    <dt className="text-slate-500">Ordered Date</dt>
                    <dd className="text-slate-700">{formatDate(selectedOrder.orderedAt)}</dd>
                  </div>
                </dl>

                {/* Items in this order with pictures */}
                <div className="pt-3 border-t border-slate-100">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-500 mb-2">
                    Items in Order ({selectedItems.length})
                  </h3>
                  {selectedItems.length === 0 ? (
                    <p className="text-xs text-slate-400">No individual item details available.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {selectedItems.map((item) => {
                        const pid = Number(item.productId)
                        const prod = productMap[pid]
                        const img = prod ? getProductImage(prod) : '/placeholder-product.svg'
                        const name = prod?.productName || `Product #${item.productId}`

                        return (
                          <div key={item.id} className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <img
                              src={img}
                              alt={name}
                              className="h-12 w-12 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg' }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate">{name}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Qty: {item.quantity} × {formatCurrency(item.productPrice)}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-slate-900">
                              {formatCurrency(item.subTotal)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Select an order from the list to view full details and items
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

