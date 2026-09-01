import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, Leaf } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { GOOGLE_AUTH_URL } from '../api/auth'

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const { showToast } = useToast()

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const error = searchParams.get('error')

    if (error) {
      setStatus('error')
      setErrorMessage(decodeURIComponent(error))
      showToast(decodeURIComponent(error), 'error')
      return
    }

    refreshUser()
      .then((user) => {
        if (user) {
          setStatus('success')
          showToast(`Welcome back, ${user.name}!`, 'success')
          const timer = setTimeout(() => {
            navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard', { replace: true })
          }, 1000)
          return () => clearTimeout(timer)
        } else {
          setStatus('error')
          setErrorMessage('Could not establish a valid session from Google authentication')
        }
      })
      .catch((err) => {
        setStatus('error')
        const msg = err instanceof Error ? err.message : 'Failed to authenticate session'
        setErrorMessage(msg)
        showToast(msg, 'error')
      })
  }, [searchParams, refreshUser, navigate, showToast])

  const handleRetry = () => {
    window.location.href = GOOGLE_AUTH_URL
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-50 px-4">
      <div className="w-full max-w-md animate-fade-in text-center">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md">
              <Leaf className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Sheprenure</span>
          </Link>
        </div>

        <Card className="p-8 shadow-xl">
          {status === 'loading' && (
            <div className="flex flex-col items-center py-6">
              <div className="relative mb-6">
                <div className="h-16 w-16 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Leaf className="h-6 w-6 text-brand-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Authenticating with Google</h2>
              <p className="mt-2 text-sm text-slate-600">
                Please wait while we set up your secure session...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center py-6 animate-fade-in">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Authentication Successful!</h2>
              <p className="mt-2 text-sm text-slate-600">
                Redirecting you to your dashboard...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center py-4 animate-fade-in">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 shadow-sm">
                <AlertCircle className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Google Sign-in Failed</h2>
              <p className="mt-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3 w-full">
                {errorMessage || 'An unexpected error occurred during Google sign-in.'}
              </p>

              <div className="mt-6 flex w-full flex-col gap-3">
                <Button onClick={handleRetry} className="w-full flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again with Google
                </Button>
                <Link to="/login" className="w-full">
                  <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
