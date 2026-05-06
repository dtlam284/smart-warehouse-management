import { API_ENDPOINTS } from '@/constants/api'
import { apiClient } from '@/services/core'
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

//#region tenant service
export const tenantService = {

  //#region tenant APIs
  listTenants(tenant?: ITenantItem): Promise<ITenantListResponse> {
    return apiClient.get<ITenantListResponse>(API_ENDPOINTS.tenant.list, {
      headers: {
        ClientId: tenant?.ClientId ?? '',
        ClientSecret: tenant?.ClientSecret ?? '',
      },
    })
  },

  selectTenant(payload: ISelectTenantRequest): Promise<ISelectTenantResponse> {
    return apiClient.get<ISelectTenantResponse>(API_ENDPOINTS.tenant.select, {
      query: {
        ...payload,
      },
    })
  },
  //#endregion tenant APIs

  //#region role APIs
  selectRole(payload: ISelectRoleRequest): Promise<ISelectRoleResponse> {
    return apiClient.get<ISelectRoleResponse>(API_ENDPOINTS.role.select, {
      query: {
        ...payload,
      },
    })
  },
  //#endregion role APIs

  //#region agent APIs
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
  //#endregion agent APIs
}
//endregion tenant service
