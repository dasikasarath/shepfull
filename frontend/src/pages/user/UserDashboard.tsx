import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Package, ShoppingCart, ClipboardList, ArrowRight } from 'lucide-react'
import { getProfile } from '../../api/user'
import { getAllProducts } from '../../api/products'
import { getCart } from '../../api/cart'
import { getUserOrders } from '../../api/orders'
import { useAuth } from '../../context/AuthContext'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { formatCurrency } from '../../utils/format'

export default function UserDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    products: 0,
    cartTotal: 0,
    orders: 0,
    email: '',
  })

  useEffect(() => {
    async function load() {
      try {
        const [profile, products, cart, orders] = await Promise.allSettled([
          getProfile(),
          getAllProducts(),
          getCart(),
          getUserOrders(),
        ])

        setStats({
          products: products.status === 'fulfilled' ? products.value.length : 0,
          cartTotal: cart.status === 'fulfilled' ? cart.value.totalPrice : 0,
          orders: orders.status === 'fulfilled' ? orders.value.length : 0,
          email: profile.status === 'fulfilled' ? profile.value.email : '',
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner fullPage label="Loading dashboard..." />

  const cards = [
    {
      label: 'Available Products',
      value: stats.products.toString(),
      icon: Package,
      to: '/products',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Cart Total',
      value: formatCurrency(stats.cartTotal),
      icon: ShoppingCart,
      to: '/cart',
      color: 'bg-brand-50 text-brand-600',
    },
    {
      label: 'Your Orders',
      value: stats.orders.toString(),
      icon: ClipboardList,
      to: '/orders',
      color: 'bg-purple-50 text-purple-600',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}!</h1>
        <p className="mt-1 text-slate-600">
          {stats.email ? `Signed in as ${stats.email}` : 'Manage your shopping from your dashboard.'}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, to, color }) => (
          <Link key={label} to={to}>
            <Card className="transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
                </div>
                <div className={`rounded-xl p-3 ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-brand-600">
                View <ArrowRight className="h-4 w-4" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/products" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Browse products
          </Link>
          <Link to="/cart" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            View cart
          </Link>
          <Link to="/profile" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Edit profile
          </Link>
        </div>
      </Card>
    </div>
  )
}
