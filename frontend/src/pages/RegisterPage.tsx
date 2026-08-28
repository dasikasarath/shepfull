import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Leaf, Mail, ShieldCheck, RefreshCw, X, CheckCircle2 } from 'lucide-react'
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
  const [otpModalOpen, setOtpModalOpen] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isEmailVerified, setIsEmailVerified] = useState(false)

  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const update = (field: string, value: string) => {
    if (field === 'email' && value !== form.email) {
      setIsEmailVerified(false)
    }
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = 'Username is required'
    if (!form.email.trim()) next.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Invalid email'
    if (!form.password || form.password.length < 4) next.password = 'Password must be at least 4 characters'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSendOtp = async () => {
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email first' }))
      return false
    }

    setOtpLoading(true)
    try {
      const msg = await authApi.sendRegistrationOtp(form.email.trim())
      if (msg.toLowerCase().includes('already registered')) {
        showToast(msg, 'error')
        setErrors((prev) => ({ ...prev, email: msg }))
        return false
      }
      showToast(msg, 'success')
      setResendCooldown(60)
      return true
    } catch (err) {
      const message = err instanceof ApiClientError || err instanceof Error ? err.message : 'Failed to send OTP'
      showToast(message, 'error')
      return false
    } finally {
      setOtpLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    if (!isEmailVerified) {
      // Trigger OTP sending and open OTP verification modal
      const sent = await handleSendOtp()
      if (sent) {
        setOtpModalOpen(true)
      }
      return
    }

    // Already verified -> complete registration directly
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

  const handleVerifyAndRegister = async () => {
    if (!otp || otp.trim().length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP code')
      return
    }
    setOtpError('')
    setOtpLoading(true)

    try {
      // 1. Verify the OTP
      const verifyMsg = await authApi.verifyRegistrationOtp(form.email.trim(), otp.trim())
      if (!verifyMsg.toLowerCase().includes('successfully')) {
        setOtpError(verifyMsg)
        return
      }

      setIsEmailVerified(true)
      showToast('Email verified successfully!', 'success')

      // 2. Complete registration
      const regMsg = await authApi.register(form)
      showToast(regMsg, 'success')
      setOtpModalOpen(false)
      navigate('/login')
    } catch (err) {
      const message = err instanceof ApiClientError || err instanceof Error ? err.message : 'Verification failed'
      setOtpError(message)
      showToast(message, 'error')
    } finally {
      setOtpLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-50 px-4 py-8">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md">
              <Leaf className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Sheprenure</span>
          </Link>
          <p className="mt-2 text-slate-600">Create your account</p>
        </div>

        <Card className="shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Username"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                error={errors.name}
                placeholder="Choose a username"
              />
              <div>
                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  error={errors.email}
                  placeholder="you@example.com"
                />
                {isEmailVerified && (
                  <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Email Verified</span>
                  </div>
                )}
              </div>
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

            <Button type="submit" className="w-full" loading={loading || otpLoading}>
              {isEmailVerified ? 'Create Account' : 'Verify Email & Create Account'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-500 font-medium tracking-wider">
                Or sign up with
              </span>
            </div>
          </div>

          <a
            href={authApi.GOOGLE_AUTH_URL}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 active:scale-[0.99]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign up with Google
          </a>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </Card>
      </div>

      {/* OTP Verification Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md animate-scale-up rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Verify Your Email</h3>
                  <p className="text-xs text-slate-500">Security Verification</p>
                </div>
              </div>
              <button
                onClick={() => setOtpModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-lg bg-brand-50/70 p-3.5 text-xs text-brand-900 flex items-start gap-2.5 border border-brand-100">
                <Mail className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                <span>
                  We have sent a 6-digit verification OTP code to{' '}
                  <strong className="font-semibold text-slate-900">{form.email}</strong>.
                  Please enter it below to confirm ownership.
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-center text-2xl font-mono tracking-widest text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                {otpError && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600">{otpError}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Didn&apos;t receive the code?</span>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={resendCooldown > 0 || otpLoading}
                  className="font-semibold text-brand-600 hover:text-brand-700 disabled:text-slate-400 flex items-center gap-1 transition"
                >
                  <RefreshCw className={`h-3 w-3 ${otpLoading ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>

              <div className="mt-6 flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOtpModalOpen(false)}
                  className="w-1/3"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleVerifyAndRegister}
                  loading={otpLoading}
                  className="w-2/3"
                >
                  Verify & Create
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
