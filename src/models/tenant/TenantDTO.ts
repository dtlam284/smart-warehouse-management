import type { AuthRole } from './TenantInterface'

export interface ISelectTenantRequest {
  tenantId: string | number
  ClientId: string
  ClientSecret: string
}

export interface ISelectRoleRequest {
  role: AuthRole
}

export interface IAgentListRequest {
  page?: number
  limit?: number
  keyword?: string
}

export interface ISelectAgentRequest {
  workGroupId: string | number
}

export interface ISelectWorkgroupRequest {
  Type: 'ADMIN'
}
