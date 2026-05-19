import { configureStore } from '@reduxjs/toolkit'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handoverService } from '../../../services/handover/handoverService'
import handoverReducer, {
    addHandoverRecord,
    clearHandoverError,
    fetchHandoverList,
    loadHandoverStats,
    removeHandoverRecord,
    resetHandoverFilters,
    setHandoverFilters,
} from '../../../store/slices/handoverSlice'
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

//#region fixtures
const oldRecord: IHandoverRecord = {
    Id: 'old-record',
    OrderCode: 'ORD001',
    DeliveryCode: 'DLV001',
    PackageCode: 'PKG001',
    HandoverByName: 'Old user',
    HandoverDate: '2026-05-18T08:00:00',
    DeliveryStatus: 7,
    ShippingUnitId: 'provider-1',
    ShippingUnitName: 'GHN',
    CustomerName: 'Old customer',
    TotalRows: 1,
}

const newRecord: IHandoverRecord = {
    Id: 'new-record',
    OrderCode: 'ORD001',
    DeliveryCode: 'DLV001',
    PackageCode: 'PKG001',
    HandoverByName: 'New user',
    HandoverDate: '2026-05-18T09:00:00',
    DeliveryStatus: 7,
    ShippingUnitId: 'provider-1',
    ShippingUnitName: 'GHN',
    CustomerName: 'New customer',
    TotalRows: 1,
}

const anotherRecord: IHandoverRecord = {
    Id: 'another-record',
    OrderCode: 'ORD002',
    DeliveryCode: 'DLV002',
    PackageCode: 'PKG002',
    HandoverByName: 'Tester',
    HandoverDate: '2026-05-18T10:00:00',
    DeliveryStatus: 7,
    ShippingUnitId: 'provider-1',
    ShippingUnitName: 'GHN',
    CustomerName: 'Customer 2',
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
//#endregion fixtures

//#region helpers
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
//#endregion helpers

describe('handoverSlice', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('addHandoverRecord', () => {
        it('prepend record mới', async () => {
            vi.mocked(handoverService.addHandoverRecord).mockResolvedValue([newRecord])

            const store = createHandoverStore({
                records: [anotherRecord],
                totalRows: 1,
            })

            await store.dispatch(
                addHandoverRecord({
                    ShippingUnitId: 'provider-1',
                    DeliveryCodes: ['DLV001'],
                    Type: 'DELIVERYCODE',
                }) as never,
            )

            const state = store.getState().handover

            expect(state.records[0]).toEqual(newRecord)
            expect(state.records[1]).toEqual(anotherRecord)
            expect(state.totalRows).toBe(2)
        })

        it('xóa record cũ có cùng DeliveryCode trước khi thêm', async () => {
            vi.mocked(handoverService.addHandoverRecord).mockResolvedValue([newRecord])

            const store = createHandoverStore({
                records: [oldRecord, anotherRecord],
                totalRows: 2,
            })

            await store.dispatch(
                addHandoverRecord({
                    ShippingUnitId: 'provider-1',
                    DeliveryCodes: ['DLV001'],
                    Type: 'DELIVERYCODE',
                }) as never,
            )

            const state = store.getState().handover

            expect(state.records).toEqual([newRecord, anotherRecord])
            expect(state.records).not.toContainEqual(oldRecord)
        })
    })

    describe('removeHandoverRecord', () => {
        it('xóa record theo DeliveryCode', async () => {
            vi.mocked(handoverService.removeHandoverRecord).mockResolvedValue(['DLV001'])

            const store = createHandoverStore({
                records: [oldRecord, anotherRecord],
                totalRows: 2,
            })

            await store.dispatch(
                removeHandoverRecord({
                    ShippingUnitId: 'provider-1',
                    DeliveryCodes: ['DLV001'],
                    Type: 'DELIVERYCODE',
                }) as never,
            )

            const state = store.getState().handover

            expect(state.records).toEqual([anotherRecord])
            expect(state.totalRows).toBe(1)
        })
    })

    describe('reducers', () => {
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
    })

    describe('fetchHandoverList', () => {
        it('stores list result on success', async () => {
            vi.mocked(handoverService.getHandoverList).mockResolvedValue({
                Data: [newRecord],
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

            const state = store.getState().handover

            expect(state.records).toEqual([newRecord])
            expect(state.totalRows).toBe(1)
            expect(state.isFetchingList).toBe(false)
        })

        it('stores error on failure', async () => {
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

            const state = store.getState().handover

            expect(state.error).toBe('Không thể tải danh sách bàn giao')
            expect(state.isFetchingList).toBe(false)
        })
    })

    describe('loadHandoverStats', () => {
        it('stores stats on success', async () => {
            vi.mocked(handoverService.getHandoverStats).mockResolvedValue(handoverStats)

            const store = createHandoverStore()

            await store.dispatch(loadHandoverStats({ Date: '2026-05-18' }) as never)

            const state = store.getState().handover

            expect(state.handoverStats).toEqual(handoverStats)
            expect(state.isLoadingStats).toBe(false)
        })

        it('stores error on failure', async () => {
            vi.mocked(handoverService.getHandoverStats).mockRejectedValue(
                new Error('Không thể tải thống kê bàn giao'),
            )

            const store = createHandoverStore()

            await store.dispatch(loadHandoverStats({ Date: '2026-05-18' }) as never)

            const state = store.getState().handover

            expect(state.error).toBe('Không thể tải thống kê bàn giao')
            expect(state.isLoadingStats).toBe(false)
        })
    })
})
