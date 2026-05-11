import type { ISODateString } from '../common';

export enum FunctionalPathEnum {
  MANAGER = 'manager',
  DISTRIBUTOR = 'distributor',
  AFFILIATE = 'affiliatesystem',
  POS = 'pos',
  COLLABORATOR = 'collaborator'
}

export type AuthRole = FunctionalPathEnum

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
  id: number | string
  name: string
  code?: string
  description?: string
  avatarUrl?: string
  workGroupId: number | string | null
  isActive?: boolean
  isAvailable?: boolean
}
