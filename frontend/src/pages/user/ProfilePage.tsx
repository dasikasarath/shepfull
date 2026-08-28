import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, ShieldCheck, MapPin, Phone, Mail, User } from 'lucide-react'
import { getProfile, updateProfile, changePassword } from '../../api/user'
import type { ProfileDto } from '../../types'
import { useToast } from '../../context/ToastContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function ProfilePage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [profile, setProfile] = useState<ProfileDto | null>(null)
  const [profileForm, setProfileForm] = useState({
    address: '',
    pincode: '',
    email: '',
    mobile: '',
  })
  const [passwordForm, setPasswordForm] = useState({ currpass: '', password: '', confirm: '' })

  useEffect(() => {
    async function load() {
      try {
        const data = await getProfile()
        setProfile(data)
        setProfileForm({
          address: data.shippingAdd ?? '',
          pincode: data.pincode ?? '',
          email: data.email ?? '',
          mobile: data.mobile ?? '',
        })
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to load profile', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [showToast])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    try {
      const message = await updateProfile({
        address: profileForm.address,
        pincode: profileForm.pincode,
        email: profileForm.email,
        mobile: profileForm.mobile,
      })
      showToast(message, 'success')
      const data = await getProfile()
      setProfile(data)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update profile', 'error')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.password !== passwordForm.confirm) {
      showToast('Passwords do not match', 'error')
      return
    }
    setPasswordLoading(true)
    try {
      const message = await changePassword({
        currpass: passwordForm.currpass,
        password: passwordForm.password,
      })
      showToast(message, message.includes('success') ? 'success' : 'error')
      if (message.includes('success')) {
        setPasswordForm({ currpass: '', password: '', confirm: '' })
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to change password', 'error')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (loading) return <LoadingSpinner fullPage label="Loading profile..." />

  // Profile completion status
  const fields = [
    { label: 'Username', value: profile?.name, icon: User },
    { label: 'Email', value: profile?.email, icon: Mail },
    { label: 'Mobile Number', value: profile?.mobile, icon: Phone },
    { label: 'Shipping Address', value: profile?.shippingAdd, icon: MapPin },
    { label: 'Pincode', value: profile?.pincode, icon: MapPin },
  ]
  const completedCount = fields.filter((f) => !!f.value && f.value.trim().length > 0).length
  const completionPercentage = Math.round((completedCount / fields.length) * 100)

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile & Settings</h1>
        <p className="mt-1 text-slate-600">Manage your account information, contact details, and security.</p>
      </div>

      {/* Profile Completeness Card */}
      <Card className="overflow-hidden border-brand-100 bg-gradient-to-br from-brand-50/50 via-white to-slate-50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Profile Completion Status</h2>
              <p className="text-xs text-slate-500">
                {completionPercentage === 100
                  ? 'All details complete! Your account is ready for seamless ordering.'
                  : 'Complete missing fields for instant delivery and order updates.'}
              </p>
            </div>
          </div>
          <div className="text-right sm:self-center">
            <span className="text-2xl font-extrabold text-brand-600">{completionPercentage}%</span>
            <span className="ml-1 text-xs text-slate-500">completed</span>
          </div>
        </div>

        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              completionPercentage === 100
                ? 'bg-emerald-500'
                : completionPercentage >= 60
                ? 'bg-brand-500'
                : 'bg-amber-500'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5 pt-3 border-t border-slate-100">
          {fields.map((f) => {
            const hasVal = !!f.value && f.value.trim().length > 0
            const Icon = f.icon
            return (
              <div
                key={f.label}
                className={`flex items-center gap-2 rounded-lg p-2 text-xs font-medium ${
                  hasVal ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                }`}
              >
                <div className="flex items-center gap-1 shrink-0">
                  <Icon className="h-3.5 w-3.5 opacity-70" />
                  {hasVal ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                  )}
                </div>
                <div className="truncate">
                  <span className="block truncate">{f.label}</span>
                  <span className="text-[10px] text-slate-500">
                    {hasVal ? 'Provided' : 'Missing'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Account Info Card */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Account Overview</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-slate-500">Username</dt>
            <dd className="mt-1 font-semibold text-slate-900">{profile?.name || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Email Address</dt>
            <dd className="mt-1 font-semibold text-slate-900">{profile?.email || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Mobile Number</dt>
            <dd className="mt-1 font-semibold text-slate-900">{profile?.mobile || '—'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-slate-500">Shipping Address</dt>
            <dd className="mt-1 font-semibold text-slate-900">{profile?.shippingAdd || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Pincode</dt>
            <dd className="mt-1 font-semibold text-slate-900">{profile?.pincode || '—'}</dd>
          </div>
        </dl>
      </Card>

      {/* Update Profile Card */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Update Profile Details</h2>
        <p className="mt-0.5 text-xs text-slate-500">Ensure your address and phone number are up to date for deliveries.</p>
        <form onSubmit={handleUpdateProfile} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Email"
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
            />
            <Input
              label="Mobile Number"
              type="text"
              value={profileForm.mobile}
              placeholder="e.g. +91 9876543210"
              onChange={(e) => setProfileForm((p) => ({ ...p, mobile: e.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Input
                label="Shipping Address"
                value={profileForm.address}
                placeholder="House no., Street, Area, City"
                onChange={(e) => setProfileForm((p) => ({ ...p, address: e.target.value }))}
              />
            </div>
            <div>
              <Input
                label="Pincode"
                value={profileForm.pincode}
                placeholder="e.g. 520001"
                onChange={(e) => setProfileForm((p) => ({ ...p, pincode: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" loading={profileLoading}>Save Profile Details</Button>
          </div>
        </form>
      </Card>

      {/* Change Password Card */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Security & Password</h2>
        <p className="mt-0.5 text-xs text-slate-500">Update your account password</p>
        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={passwordForm.currpass}
            onChange={(e) => setPasswordForm((p) => ({ ...p, currpass: e.target.value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="New Password"
              type="password"
              value={passwordForm.password}
              onChange={(e) => setPasswordForm((p) => ({ ...p, password: e.target.value }))}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" loading={passwordLoading}>Change Password</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
