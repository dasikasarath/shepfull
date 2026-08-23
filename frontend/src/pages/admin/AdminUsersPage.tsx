import { useEffect, useMemo, useState } from 'react'
import { Users } from 'lucide-react'
import { getAllUsers } from '../../api/admin'
import type { UserEntity } from '../../types'
import { useToast } from '../../context/ToastContext'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { showToast } = useToast()

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllUsers()
        setUsers(data)
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to load users', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [showToast])

  const filtered = useMemo(() => {
    if (!search.trim()) return users
    const q = search.toLowerCase()
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q),
    )
  }, [users, search])

  if (loading) return <LoadingSpinner fullPage label="Loading users..." />

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="mt-1 text-slate-600">{users.length} registered users</p>
      </div>

      <Card>
        <Input
          placeholder="Search by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="No users found"
          description={search ? 'Try a different search term.' : 'No users registered yet.'}
          icon={<Users className="h-8 w-8" />}
        />
      ) : (
        <Card padding={false} className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left font-medium text-slate-600">ID</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Username</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Email</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Mobile</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Role</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Pincode</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.userId} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">{user.userId}</td>
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.mobile || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">{user.pincode || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
