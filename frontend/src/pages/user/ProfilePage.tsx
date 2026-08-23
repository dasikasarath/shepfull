import { useEffect, useState } from 'react'
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
  const [profileForm, setProfileForm] = useState({ address: '', pincode: '', email: '' })
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

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="mt-1 text-slate-600">Manage your account settings</p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Account Info</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Username</dt>
            <dd className="font-medium text-slate-900">{profile?.name}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Mobile</dt>
            <dd className="font-medium text-slate-900">{profile?.mobile || '—'}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Update Profile</h2>
        <form onSubmit={handleUpdateProfile} className="mt-4 space-y-4">
          <Input
            label="Email"
            type="email"
            value={profileForm.email}
            onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
          />
          <Input
            label="Shipping Address"
            value={profileForm.address}
            onChange={(e) => setProfileForm((p) => ({ ...p, address: e.target.value }))}
          />
          <Input
            label="Pincode"
            value={profileForm.pincode}
            onChange={(e) => setProfileForm((p) => ({ ...p, pincode: e.target.value }))}
          />
          <Button type="submit" loading={profileLoading}>Save changes</Button>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Change Password</h2>
        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={passwordForm.currpass}
            onChange={(e) => setPasswordForm((p) => ({ ...p, currpass: e.target.value }))}
          />
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
          <Button type="submit" loading={passwordLoading}>Change password</Button>
        </form>
      </Card>
    </div>
  )
}
