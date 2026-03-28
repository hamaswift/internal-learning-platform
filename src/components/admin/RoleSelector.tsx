'use client'

import { useTransition } from 'react'
import { changeUserRole } from '@/app/actions/admin'

type Props = {
  userId: string
  currentRole: string
  isSelf: boolean
}

const ROLES = [
  { value: 'learner', label: '受講者' },
  { value: 'instructor', label: '講師' },
  { value: 'admin', label: '管理者' },
]

export function RoleSelector({ userId, currentRole, isSelf }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleChange = (newRole: string) => {
    if (newRole === currentRole) return
    startTransition(async () => {
      await changeUserRole(userId, newRole)
    })
  }

  return (
    <select
      defaultValue={currentRole}
      disabled={isSelf || isPending}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {ROLES.map((role) => (
        <option key={role.value} value={role.value}>
          {role.label}
        </option>
      ))}
    </select>
  )
}
