import { useState, useEffect } from 'react'
import { AlertTriangle, ArrowRight, X, Sparkles } from 'lucide-react'
import { getProfile } from '../../api/user'
import type { ProfileDto } from '../../types'
import { useAuth } from '../../context/AuthContext'
import CompleteProfileModal from './CompleteProfileModal'

export default function ProfileCompletionBanner() {
  const { isAuthenticated, isAdmin } = useAuth()
  const [profile, setProfile] = useState<ProfileDto | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || isAdmin) return

    async function checkProfile() {
      try {
        const data = await getProfile()
        setProfile(data)
      } catch {
        // Ignore background fetch error
      }
    }
    checkProfile()
  }, [isAuthenticated, isAdmin])

  if (!isAuthenticated || isAdmin || dismissed || !profile) {
    return null
  }

  const missingFields: string[] = []
  if (!profile.mobile || !profile.mobile.trim()) missingFields.push('mobile number')
  if (!profile.shippingAdd || !profile.shippingAdd.trim()) missingFields.push('shipping address')
  if (!profile.pincode || !profile.pincode.trim()) missingFields.push('pincode')

  if (missingFields.length === 0) {
    return null
  }

  return (
    <>
      <div className="mb-6 animate-fade-in overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-amber-950">Complete your profile</h4>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-200/80 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                  <Sparkles className="h-3 w-3" /> OAuth Setup
                </span>
              </div>
              <p className="mt-0.5 text-xs text-amber-800">
                You haven&apos;t added your{' '}
                <span className="font-semibold text-amber-950">{missingFields.join(', ')}</span>.
                Complete these details to enable 1-click checkout and speedy delivery!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-700 active:scale-95"
            >
              Complete Now
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="rounded-lg p-1.5 text-amber-700 hover:bg-amber-200/60 transition"
              title="Dismiss for now"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <CompleteProfileModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialProfile={profile}
        onSuccess={(updated) => setProfile(updated)}
      />
    </>
  )
}
