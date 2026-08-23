import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Leaf } from 'lucide-react'
import * as authApi from '../api/auth'
import { useToast } from '../context/ToastContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import { ApiClientError } from '../api/client'

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    pincode: '',
    mobile: '',
    shippingAdd: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()
  const navigate = useNavigate()

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = 'Username is required'
    if (!form.email.trim()) next.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Invalid email'
    if (!form.password || form.password.length < 4) next.password = 'Password must be at least 4 characters'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const message = await authApi.register(form)
      showToast(message, 'success')
      navigate('/login')
    } catch (err) {
      const message = err instanceof ApiClientError || err instanceof Error
        ? err.message
        : 'Registration failed'
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-50 px-4 py-8">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Leaf className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Sheprenure</span>
          </Link>
          <p className="mt-2 text-slate-600">Create your account</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Username"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                error={errors.name}
                placeholder="Choose a username"
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                error={errors.email}
                placeholder="you@example.com"
              />
            </div>
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              error={errors.password}
              placeholder="Create a password"
            />
            <Input
              label="Mobile"
              value={form.mobile}
              onChange={(e) => update('mobile', e.target.value)}
              placeholder="Phone number"
            />
            <Input
              label="Pincode"
              value={form.pincode}
              onChange={(e) => update('pincode', e.target.value)}
              placeholder="Postal code"
            />
            <Input
              label="Shipping Address"
              value={form.shippingAdd}
              onChange={(e) => update('shippingAdd', e.target.value)}
              placeholder="Delivery address"
            />
            <Button type="submit" className="w-full" loading={loading}>
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
