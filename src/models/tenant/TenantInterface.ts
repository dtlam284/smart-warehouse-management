import type { ISODateString } from "../common";

export type AuthRole = 'tenant_admin' | 'agent'

export interface ITenantItem {
    id: string | number
    name: string
    logoUrl?: string
    planName?: string
    ClientId?: string
    ClientSecret?: string
    isActive?: boolean
    createdAt?: ISODateString
    expiresAt?: ISODateString
}

export interface IAgentItem {
  id: string | number
  name: string
  code?: string
  avatarUrl?: string
  isAvailable: boolean
  isActive?: boolean
}
