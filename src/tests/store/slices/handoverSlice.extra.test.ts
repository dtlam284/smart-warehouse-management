import { configureStore } from '@reduxjs/toolkit'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import handoverReducer, {
    clearHandoverError,
    fetchHandoverList,
    loadHandoverStats,
    resetHandoverFilters,
    setHandoverFilters,
} from '../../../store/slices/handoverSlice'
import { handoverService } from '../../../services/handover/handoverService'
import type {
    IHandoverRecord,
    IHandoverStats,
} from '../../../models/handover/HandoverInterface'

vi.mock('@/services/handover/handoverService', () => ({
    handoverService: {
        addHandoverRecord: vi.fn(),
        removeHandoverRecord: vi.fn(),
        getHandoverList: vi.fn(),
        getHandoverStats: vi.fn(),
    },
}))

const handoverRecord: IHandoverRecord = {
    Id: 'handover-1',
    OrderCode: 'ORD001',
    DeliveryCode: 'DLV001',
    PackageCode: 'PKG001',
    HandoverByName: 'Tester',
    HandoverDate: '2026-05-18T08:00:00',
    DeliveryStatus: 7,
    ShippingUnitId: 'provider-1',
    ShippingUnitName: 'GHN',
    CustomerName: 'Customer',
    TotalRows: 1,
}

const handoverStats: IHandoverStats = {
    FromDate: '2026-05-18',
    ToDate: '2026-05-18',
    Statistics: [
        {
            Name: 'GHN',
            ShippingUnitId: 'provider-1',
            TotalHandover: 5,
            TotalSalesOrder: 10,
        },
    ],
}

function createHandoverStore(preloadedHandoverState?: Partial<ReturnType<typeof handoverReducer>>) {
    const initialHandoverState = handoverReducer(undefined, { type: '@@INIT' })

    return configureStore({
        reducer: {
            handover: handoverReducer,
        },
        preloadedState: {
            handover: {
                ...initialHandoverState,
                ...preloadedHandoverState,
            },
        },
    })
}

describe('handoverSlice extra coverage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('clearHandoverError clears error', () => {
        const store = createHandoverStore({
            error: 'Old error',
        })

        store.dispatch(clearHandoverError())

        expect(store.getState().handover.error).toBeNull()
    })

    it('setHandoverFilters merges filters', () => {
        const store = createHandoverStore()

        store.dispatch(
            setHandoverFilters({
                PageIndex: 2,
                PageSize: 20,
                DeliveryCode: 'DLV001',
                ShippingUnitId: 'provider-1',
            }),
        )

        expect(store.getState().handover.filters).toMatchObject({
            PageIndex: 2,
            PageSize: 20,
            DeliveryCode: 'DLV001',
            ShippingUnitId: 'provider-1',
        })
    })

    it('resetHandoverFilters resets filters', () => {
        const store = createHandoverStore({
            filters: {
                PageIndex: 3,
                PageSize: 20,
                DeliveryCode: 'DLV001',
                ShippingUnitId: 'provider-1',
            },
        })

        store.dispatch(resetHandoverFilters())

        expect(store.getState().handover.filters).toMatchObject({
            PageIndex: 1,
            PageSize: 10,
        })
    })

    it('fetchHandoverList stores list result on success', async () => {
        vi.mocked(handoverService.getHandoverList).mockResolvedValue({
            Data: [handoverRecord],
            TotalRows: 1,
            PageIndex: 1,
            PageSize: 10,
        })

        const store = createHandoverStore()

        await store.dispatch(
            fetchHandoverList({
                PageIndex: 1,
                PageSize: 10,
                ShippingUnitId: 'provider-1',
            }) as never,
        )

        expect(store.getState().handover.records).toEqual([handoverRecord])
        expect(store.getState().handover.totalRows).toBe(1)
        expect(store.getState().handover.isFetchingList).toBe(false)
    })

    it('fetchHandoverList stores error on failure', async () => {
        vi.mocked(handoverService.getHandoverList).mockRejectedValue(
            new Error('Không thể tải danh sách bàn giao'),
        )

        const store = createHandoverStore()

        await store.dispatch(
            fetchHandoverList({
                PageIndex: 1,
                PageSize: 10,
                ShippingUnitId: 'provider-1',
            }) as never,
        )

        expect(store.getState().handover.error).toBe('Không thể tải danh sách bàn giao')
        expect(store.getState().handover.isFetchingList).toBe(false)
    })

    it('loadHandoverStats stores stats on success', async () => {
        vi.mocked(handoverService.getHandoverStats).mockResolvedValue(handoverStats)

        const store = createHandoverStore()

        await store.dispatch(loadHandoverStats({ Date: '2026-05-18' }) as never)

        expect(store.getState().handover.handoverStats).toEqual(handoverStats)
        expect(store.getState().handover.isLoadingStats).toBe(false)
    })

    it('loadHandoverStats stores error on failure', async () => {
        vi.mocked(handoverService.getHandoverStats).mockRejectedValue(
            new Error('Không thể tải thống kê bàn giao'),
        )

        const store = createHandoverStore()

        await store.dispatch(loadHandoverStats({ Date: '2026-05-18' }) as never)

        expect(store.getState().handover.error).toBe('Không thể tải thống kê bàn giao')
        expect(store.getState().handover.isLoadingStats).toBe(false)
    })
})
