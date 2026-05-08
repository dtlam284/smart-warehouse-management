import type { ID, ISODateString, IRoleRef, IStatusRef } from '@/models/common'

export interface IAdminUser {
  id: ID
  email: string
  firstName: string
  lastName: string
  role: IRoleRef
  status: IStatusRef
  photo?: string
  createdAt?: ISODateString
  updatedAt?: ISODateString
}

export interface IPermissionItem {
  id: number | string
  action: string
  description: string
}

export interface ILoginAuditItem {
  id: string
  userId?: string
  email?: string
  provider?: string
  success?: boolean
  status?: 'success' | 'failed' | string
  ip?: string
  ipAddress?: string
  userAgent?: string
  deviceInfo?: string
  failureReason?: string
  createdAt: ISODateString
}

export interface ILoginAuditStats {
  totalAttempts: number
  successCount: number
  failedCount: number
  uniqueUsers: number
}
