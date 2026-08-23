import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Package, ClipboardList, Users, ArrowRight } from 'lucide-react'
import { getAdminProducts } from '../../api/products'
import { getAdminOrders } from '../../api/orders'
import { getAllUsers } from '../../api/admin'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0 })

  useEffect(() => {
    async function load() {
      try {
        const [products, orders, users] = await Promise.allSettled([
          getAdminProducts(),
          getAdminOrders(),
          getAllUsers(),
        ])
        setStats({
          products: products.status === 'fulfilled' ? products.value.length : 0,
          orders: orders.status === 'fulfilled' ? orders.value.length : 0,
          users: users.status === 'fulfilled' ? users.value.length : 0,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner fullPage label="Loading dashboard..." />

  const cards = [
    { label: 'Total Products', value: stats.products, icon: Package, to: '/admin/products', color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Orders', value: stats.orders, icon: ClipboardList, to: '/admin/orders', color: 'bg-purple-50 text-purple-600' },
    { label: 'Registered Users', value: stats.users, icon: Users, to: '/admin/users', color: 'bg-brand-50 text-brand-600' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-slate-600">Overview of your store</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, to, color }) => (
          <Link key={label} to={to}>
            <Card className="transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
                </div>
                <div className={`rounded-xl p-3 ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-brand-600">
                Manage <ArrowRight className="h-4 w-4" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
