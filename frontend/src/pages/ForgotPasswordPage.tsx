import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Leaf } from 'lucide-react'
import * as authApi from '../api/auth'
import { useToast } from '../context/ToastContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'

type Step = 'username' | 'otp' | 'password'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('username')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const handleGenerateOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      showToast('Username is required', 'error')
      return
    }
    setLoading(true)
    try {
      const message = await authApi.generateOtp(name.trim())
      showToast(message, message.includes('success') ? 'success' : 'error')
      if (message.includes('success')) setStep('otp')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to send OTP', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp.trim()) {
      showToast('OTP is required', 'error')
      return
    }
    setLoading(true)
    try {
      const message = await authApi.verifyOtp({ name: name.trim(), otp: otp.trim() })
      showToast(message, message.includes('success') ? 'success' : 'error')
      if (message.includes('success')) setStep('password')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Verification failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) {
      showToast('Password is required', 'error')
      return
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }
    setLoading(true)
    try {
      const message = await authApi.resetPassword({ name: name.trim(), password })
      showToast(message, message.includes('success') ? 'success' : 'error')
      if (message.includes('success')) {
        navigate('/login')
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Password reset failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-50 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Leaf className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Sheprenure</span>
          </Link>
          <p className="mt-2 text-slate-600">Reset your password</p>
        </div>

        <Card>
          <div className="mb-6 flex gap-2">
            {(['username', 'otp', 'password'] as Step[]).map((s, i) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full ${
                  step === s || (['otp', 'password'].includes(step) && s === 'username') || (step === 'password' && s === 'otp')
                    ? 'bg-brand-600'
                    : 'bg-slate-200'
                }`}
                title={`Step ${i + 1}`}
              />
            ))}
          </div>

          {step === 'username' && (
            <form onSubmit={handleGenerateOtp} className="space-y-4">
              <Input
                label="Username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your username"
              />
              <Button type="submit" className="w-full" loading={loading}>
                Send OTP
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-slate-600">
                Enter the OTP sent to your registered email for <strong>{name}</strong>
              </p>
              <Input
                label="OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                maxLength={6}
              />
              <Button type="submit" className="w-full" loading={loading}>
                Verify OTP
              </Button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
              <Button type="submit" className="w-full" loading={loading}>
                Reset Password
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-600">
            <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
              Back to sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
