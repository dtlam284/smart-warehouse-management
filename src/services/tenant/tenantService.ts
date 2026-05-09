import { API_ENDPOINTS } from '@/constants/api'
import { apiClient } from '@/services/core'
import { FunctionalPathEnum } from '@/models'
import type {
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

//#region backend requests
interface IBackendTenantItem {
  Id?: number
  Name?: string | null
  Description?: string | null
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
//#endregion backend requests

//#region helpers
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
//#endregion mappers

//#region reponses
const toTenantItem = (tenant: IBackendTenantItem): ITenantItem => {
    return {
        id: tenant.Id ?? 0,
        name: tenant.Name?.trim() || 'Unnamed tenant',
        description: tenant.Description ?? '',
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
    response: IBackendTenantItem[] | ITenantListResponse,
): ITenantListResponse => {
    if (Array.isArray(response)) {
        return {
            items: response.map(toTenantItem),
        } as ITenantListResponse
    }

    return {
        ...response,
        items: response.items?.map((tenant) =>
            toTenantItem(tenant as unknown as IBackendTenantItem),
        ) ?? [],
    }
}
//#endregion responses

//#region tenant services
export const tenantService = {
    async listTenants(tenant?: ITenantItem): Promise<ITenantListResponse> {
        const response = await apiClient.get<IBackendTenantItem[] | ITenantListResponse>(
            API_ENDPOINTS.tenant.list,
            {
                headers: createTenantHeaders(tenant),
            },
        )

        return toTenantListResponse(response)
    },

    selectTenant(payload: ISelectTenantRequest): Promise<ISelectTenantResponse> {
        return apiClient.get<ISelectTenantResponse>(API_ENDPOINTS.tenant.select, {
            headers: {
                ClientId: payload.ClientId,
                ClientSecret: payload.ClientSecret,
            },
        })
    },

    selectRole(
        payload: ISelectRoleRequest,
        tenant?: ITenantItem,
    ): Promise<ISelectRoleResponse> {
        return apiClient.get<ISelectRoleResponse>(API_ENDPOINTS.role.select, {
            headers: createTenantHeaders(tenant),
            query: {
                functionCode: toFunctionCode(payload.role),
            },
        })
    },

    listAgents(payload: IAgentListRequest = {}): Promise<IAgentListResponse> {
        return apiClient.get<IAgentListResponse>(API_ENDPOINTS.agent.list, {
            query: {
                ...payload,
            },
        })
    },

    selectAgent(payload: ISelectAgentRequest): Promise<ISelectAgentResponse> {
        const workgroupPayload: ISelectWorkgroupRequest = { Type: 'ADMIN' }

        return apiClient.get<ISelectAgentResponse>(
            API_ENDPOINTS.agent.selectWorkgroup(workgroupPayload.Type),
            {
                query: {
                    ...payload,
                },
            },
        )
    },
}
//endregion tenant services
