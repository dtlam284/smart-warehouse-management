import type { IPaginatedQuery, IPaginationQuery } from '@/models/common'

export interface IUserFilters extends IPaginatedQuery {
    role?: string | number
    status?: string | number
    roles?: Array<{ id: number }>
    filters?: {
        roles?: Array<{ id: number }>
    }
    filterOptions?: {
        roles?: Array<{ id: number }>
    }
    sort?: Array<{
        orderBy: string
        order: 'ASC' | 'DESC' | 'asc' | 'desc'
    }>
}

export interface ICreateUserRequest {
    email: string
    password: string
    firstName: string
    lastName: string
    role: { id: number }
    status?: { id: number }
}

export interface IUpdateUserRequest {
    email?: string
    password?: string
    firstName?: string
    lastName?: string
    role?: { id: number }
    status?: { id: number }
    photo?: string
}

export interface ICreatePermissionRequest {
    action: string
    description: string
}

export interface ILoginAuditFilters extends IPaginationQuery {
    email?: string
    userId?: string
    provider?: string
    status?: string
    success?: boolean
    startDate?: string
    endDate?: string
}
