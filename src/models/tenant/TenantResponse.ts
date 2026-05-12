import type { IAgentItem, AuthRole, ITenantItem } from './TenantInterface'

export interface ITenantListResponse {
    items: ITenantItem[]
}

export interface ISelectTenantResponse {
    tenant: ITenantItem
    message?: string
}

export interface ISelectRoleResponse {
    role: AuthRole
    message?: string
}

export interface IAgentListResponse {
    items: IAgentItem[]
    total?: number
    page?: number
    limit?: number
}

export interface ISelectAgentResponse {
    agent: IAgentItem
    message?: string
}
