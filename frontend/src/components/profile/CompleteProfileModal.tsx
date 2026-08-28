import { useState, useEffect } from 'react'
import { X, MapPin, Phone, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { updateProfile, getProfile } from '../../api/user'
import type { ProfileDto } from '../../types'
import { useToast } from '../../context/ToastContext'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface CompleteProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (updated: ProfileDto) => void
  initialProfile?: ProfileDto | null
}

export default function CompleteProfileModal({
  isOpen,
  onClose,
  onSuccess,
  initialProfile,
}: CompleteProfileModalProps) {
  const { showToast } = useToast()
  const [form, setForm] = useState({
    mobile: '',
    address: '',
    pincode: '',
    email: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialProfile) {
      setForm({
        mobile: initialProfile.mobile ?? '',
        address: initialProfile.shippingAdd ?? '',
        pincode: initialProfile.pincode ?? '',
        email: initialProfile.email ?? '',
      })
    }
  }, [initialProfile])

  if (!isOpen) return null

  const missingCount = [
    !form.mobile.trim(),
    !form.address.trim(),
    !form.pincode.trim(),
  ].filter(Boolean).length

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.mobile.trim()) next.mobile = 'Mobile number is required'
    if (!form.address.trim()) next.address = 'Shipping address is required'
    if (!form.pincode.trim()) next.pincode = 'Pincode is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const msg = await updateProfile({
        mobile: form.mobile.trim(),
        address: form.address.trim(),
        pincode: form.pincode.trim(),
        email: form.email.trim(),
      })
      showToast(msg, 'success')
      const updated = await getProfile()
      onSuccess?.(updated)
      onClose()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg animate-scale-up rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Complete Your Profile</h3>
              <p className="text-xs text-slate-500">
                {missingCount > 0
                  ? `${missingCount} missing item(s) needed for delivery & ordering`
                  : 'All required details provided'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-lg bg-amber-50/70 border border-amber-200 p-3 text-xs text-amber-900 flex items-start gap-2.5">
          <Mail className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Google OAuth only provides your name and email. Please add your contact number and delivery address to enable checkout and order tracking!
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <Input
              label="Mobile Number"
              value={form.mobile}
              onChange={(e) => setForm((prev) => ({ ...prev, mobile: e.target.value }))}
              error={errors.mobile}
              placeholder="e.g. +91 9876543210"
            />
            {form.mobile.trim() ? (
              <span className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle2 className="h-3 w-3" /> Mobile provided
              </span>
            ) : (
              <span className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                <Phone className="h-3 w-3" /> Required for order status & SMS updates
              </span>
            )}
          </div>

          <div>
            <Input
              label="Shipping Address"
              value={form.address}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              error={errors.address}
              placeholder="House/Street, Landmark, City, State"
            />
            {form.address.trim() ? (
              <span className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle2 className="h-3 w-3" /> Address provided
              </span>
            ) : (
              <span className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                <MapPin className="h-3 w-3" /> Required for package delivery
              </span>
            )}
          </div>

          <div>
            <Input
              label="Pincode / Postal Code"
              value={form.pincode}
              onChange={(e) => setForm((prev) => ({ ...prev, pincode: e.target.value }))}
              error={errors.pincode}
              placeholder="e.g. 520001"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Later
            </Button>
            <Button type="submit" loading={loading}>
              Save & Complete Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
