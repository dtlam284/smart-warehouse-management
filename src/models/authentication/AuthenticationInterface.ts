import type { ISODateString } from '@/models/common'

export interface IUserProfile {
    id: string
    username: string
    email?: string
    phoneNumber?: string
    fullName?: string
    firstName?: string
    lastName?: string
    photo?: string
    avatarUrl?: string
    isActivated?: boolean
    createdAt?: ISODateString
    expiresAt?: ISODateString
}

export interface ISessionItem {
    id: string | number
    ip?: string
    ipAddress?: string
    userAgent?: string
    deviceInfo?: string
    isCurrent: boolean
    createdAt: ISODateString
    lastActiveAt?: ISODateString
}

export type UserProfile = IUserProfile
export type SessionItem = ISessionItem
