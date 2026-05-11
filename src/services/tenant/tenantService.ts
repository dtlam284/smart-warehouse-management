import { API_ENDPOINTS } from '@/constants/api'
import { FunctionalPathEnum } from '@/models/authentication'
import { apiClient } from '@/services/core'
import { persistAuthTokensFromResponse } from '../core/authTokenPersistence'
import type {
    AuthRole,
    IAgentItem,
    IAgentListRequest,
    IAgentListResponse,
    ISelectAgentRequest,
    ISelectAgentResponse,
    ISelectRoleRequest,
    ISelectRoleResponse,
    ISelectTenantRequest,
    ISelectTenantResponse,
    ISelectWorkgroupRequest,
    ITenantItem,
    ITenantListResponse,
} from '@/models'

//#region backend DTOs
interface IBackendTenantItem {
    Id?: number
    Name?: string | null
    Description?: string | null
    Descriptions?: string | null
    Url?: string | null
    Code?: string | null
    Logo?: string | null
    ClientId?: string | null
    ClientSecret?: string | null
    CreationTime?: string | null
    CreatorUserId?: number | null
    Type?: number | null
    Active?: boolean | null
    IsMultiToken?: boolean | null
    Config?: unknown
}

interface IBackendAgentItem {
    Id?: number | string
    Name?: string | null
    Code?: string | null
    Description?: string | null
    Descriptions?: string | null
    Logo?: string | null
    Avatar?: string | null
    ImageUrl?: string | null
    WorkgroupId?: number | string | null
    WorkGroupId?: number | string | null
    ClientId?: string | null
    ClientSecret?: string | null
    Active?: boolean | null
    IsActive?: boolean | null
    IsAvailable?: boolean | null
    CreationTime?: string | null
    CreatorUserId?: number | null
    Type?: number | string | null
    Config?: unknown
}

interface IBackendAgentListRequest {
    Filter: unknown[]
    Keyword: string
    CreatedBy: number
    PageSize: number
    PageIndex: number
    FieldName: string
    Orderby: string
    Function: string
}

type BackendRecord = Record<string, unknown>
//#endregion backend DTOs

//#region helpers
const toRecord = (value: unknown): BackendRecord => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as BackendRecord
    }

    return {}
}

const createTenantHeaders = (tenant?: ITenantItem): HeadersInit => {
    const headers: HeadersInit = {}

    if (tenant?.ClientId && tenant?.ClientSecret) {
        headers.ClientId = tenant.ClientId
        headers.ClientSecret = tenant.ClientSecret
    }

    return headers
}
//#endregion helpers

//#region mappers
const FUNCTION_CODE_BY_ROLE: Record<string, string> = {
    [FunctionalPathEnum.MANAGER]: 'MANAGER',
    [FunctionalPathEnum.DISTRIBUTOR]: 'DISTRIBUTOR',
    [FunctionalPathEnum.AFFILIATE]: 'AFFILIATESYSTEM',
    [FunctionalPathEnum.POS]: 'POS',
    [FunctionalPathEnum.COLLABORATOR]: 'COLLABORATOR',
}

const toFunctionCode = (role: string): string => {
    return FUNCTION_CODE_BY_ROLE[role] ?? role.toUpperCase()
}

const toTenantItem = (tenant: IBackendTenantItem): ITenantItem => {
    return {
        id: tenant.Id ?? 0,
        name: tenant.Name?.trim() || 'Unnamed tenant',
        description: tenant.Description ?? tenant.Descriptions ?? '',
        url: tenant.Url ?? '',
        code: tenant.Code ?? '',
        logoUrl: tenant.Logo ?? '',
        ClientId: tenant.ClientId ?? '',
        ClientSecret: tenant.ClientSecret ?? '',
        creationTime: tenant.CreationTime ?? '',
        creatorUserId: tenant.CreatorUserId ?? null,
        type: tenant.Type ?? null,
        isActive: tenant.Active ?? false,
        isMultiToken: tenant.IsMultiToken ?? false,
        config: tenant.Config ?? null,
    } as ITenantItem
}

const toTenantListResponse = (
    response: IBackendTenantItem[] | ITenantListResponse | unknown,
): ITenantListResponse => {
    if (Array.isArray(response)) {
        return {
            items: response.map(toTenantItem),
        } as ITenantListResponse
    }

    const responseRecord = toRecord(response)
    const data = responseRecord.Data ?? responseRecord.data
    const dataRecord = toRecord(data)

    const rawItems = Array.isArray(data)
        ? data
        : Array.isArray(dataRecord.Items)
            ? dataRecord.Items
            : Array.isArray(dataRecord.items)
                ? dataRecord.items
                : Array.isArray(responseRecord.items)
                    ? responseRecord.items
                    : []

    return {
        ...(responseRecord as Partial<ITenantListResponse>),
        items: rawItems.map((tenant) =>
            toTenantItem(tenant as IBackendTenantItem),
        ),
    } as ITenantListResponse
}

const toAgentItem = (agent: IBackendAgentItem): IAgentItem => {
    const workGroupId = agent.WorkgroupId ?? agent.WorkGroupId ?? null

    return {
        id: agent.Id ?? workGroupId ?? agent.Code ?? '',
        name: agent.Name?.trim() || agent.Code?.trim() || 'Unnamed agent',
        code: agent.Code ?? '',
        description: agent.Description ?? agent.Descriptions ?? '',
        avatarUrl: agent.Logo ?? agent.Avatar ?? agent.ImageUrl ?? '',
        workGroupId,
        isActive: agent.Active ?? agent.IsActive ?? true,
        isAvailable: agent.IsAvailable ?? agent.Active ?? agent.IsActive ?? true,
    } as IAgentItem
}

const toAgentListResponse = (
    response: IBackendAgentItem[] | IAgentListResponse | unknown,
): IAgentListResponse => {
    if (Array.isArray(response)) {
        return {
            items: response.map(toAgentItem),
            total: response.length,
            page: 1,
            limit: response.length,
        } as IAgentListResponse
    }

    const responseRecord = toRecord(response)
    const data = responseRecord.Data ?? responseRecord.data
    const dataRecord = toRecord(data)

    const rawItems = Array.isArray(data)
        ? data
        : Array.isArray(dataRecord.Result)
            ? dataRecord.Result
            : Array.isArray(dataRecord.result)
                ? dataRecord.result
                : Array.isArray(dataRecord.Items)
                    ? dataRecord.Items
                    : Array.isArray(dataRecord.items)
                        ? dataRecord.items
                        : Array.isArray(dataRecord.Data)
                            ? dataRecord.Data
                            : Array.isArray(dataRecord.data)
                                ? dataRecord.data
                                : Array.isArray(responseRecord.Result)
                                    ? responseRecord.Result
                                    : Array.isArray(responseRecord.result)
                                        ? responseRecord.result
                                        : Array.isArray(responseRecord.items)
                                            ? responseRecord.items
                                            : []

    const total =
        typeof dataRecord.Total === 'number'
            ? dataRecord.Total
            : typeof dataRecord.total === 'number'
                ? dataRecord.total
                : typeof dataRecord.TotalCount === 'number'
                    ? dataRecord.TotalCount
                    : typeof dataRecord.totalCount === 'number'
                        ? dataRecord.totalCount
                        : typeof responseRecord.total === 'number'
                            ? responseRecord.total
                            : rawItems.length

    const page =
        typeof dataRecord.PageIndex === 'number'
            ? dataRecord.PageIndex
            : typeof dataRecord.pageIndex === 'number'
                ? dataRecord.pageIndex
                : 1

    const limit =
        typeof dataRecord.PageSize === 'number'
            ? dataRecord.PageSize
            : typeof dataRecord.pageSize === 'number'
                ? dataRecord.pageSize
                : rawItems.length

    return {
        items: rawItems.map((agent) =>
            toAgentItem(agent as IBackendAgentItem),
        ),
        total,
        page,
        limit,
    } as IAgentListResponse
}

const toAgentListApiRequest = (
    payload: IAgentListRequest = {},
    role?: AuthRole | null,
): IBackendAgentListRequest => {
    return {
        Filter: [],
        Keyword: payload.keyword ?? '',
        CreatedBy: 0,
        PageSize: payload.limit ?? 10,
        PageIndex: payload.page ?? 1,
        FieldName: 'CreatedDate',
        Orderby: 'desc',
        Function: role ? toFunctionCode(role) : '',
    }
}
//#endregion mappers

//#region tenant service
export const tenantService = {
    async listTenants(tenant?: ITenantItem): Promise<ITenantListResponse> {
        const response = await apiClient.get<
            IBackendTenantItem[] | ITenantListResponse | unknown
        >(API_ENDPOINTS.tenant.list, {
            headers: createTenantHeaders(tenant),
        })

        return toTenantListResponse(response)
    },

    async selectTenant(
        payload: ISelectTenantRequest,
    ): Promise<ISelectTenantResponse> {
        const response = await apiClient.get<ISelectTenantResponse>(
            API_ENDPOINTS.tenant.select,
            {
                headers: {
                    ClientId: payload.ClientId,
                    ClientSecret: payload.ClientSecret,
                },
            },
        )

        persistAuthTokensFromResponse(response)

        return response
    },

    async selectRole(
        payload: ISelectRoleRequest,
        tenant?: ITenantItem,
    ): Promise<ISelectRoleResponse> {
        const response = await apiClient.get<ISelectRoleResponse>(
            API_ENDPOINTS.role.select,
            {
                headers: createTenantHeaders(tenant),
                query: {
                    functionCode: toFunctionCode(payload.role),
                },
            },
        )

        persistAuthTokensFromResponse(response)

        return response
    },

    async listAgents(
        payload: IAgentListRequest = {},
        tenant?: ITenantItem,
        role?: AuthRole | null,
    ): Promise<IAgentListResponse> {
        const response = await apiClient.post<unknown>(
            API_ENDPOINTS.agent.list,
            toAgentListApiRequest(payload, role),
            {
                headers: createTenantHeaders(tenant),
            },
        )

        return toAgentListResponse(response)
    },

    async selectAgent(
        payload: ISelectAgentRequest,
        tenant?: ITenantItem,
    ): Promise<ISelectAgentResponse> {
        const workgroupPayload: ISelectWorkgroupRequest = {
            Type: 'ADMIN',
        }

        if (!payload.workGroupId) {
            throw new Error('Selected agent is missing WorkGroupId')
        }

        const response = await apiClient.get<ISelectAgentResponse>(
            API_ENDPOINTS.agent.selectWorkgroup(workgroupPayload.Type),
            {
                headers: createTenantHeaders(tenant),
                query: {
                    WorkGroupId: payload.workGroupId,
                },
            },
        )

        persistAuthTokensFromResponse(response)

        return response
    }
}
//#endregion tenant service
