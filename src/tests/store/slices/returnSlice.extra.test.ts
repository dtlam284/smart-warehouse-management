import { configureStore } from '@reduxjs/toolkit'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import returnReducer, {
    clearActiveReturn,
    clearReturnError,
    clearReturnRecords,
    fetchReturnList,
    loadReturnDetail,
    loadReturnStats,
    removeReturnRecord,
    resetReturnFilters,
    setReturnFilters,
} from '../../../store/slices/returnSlice'
import { returnService } from '../../../services/return'
import type {
    IReturnDetail,
    IReturnProduct,
    IReturnRecord,
    IReturnStats,
} from '../../../models/return/ReturnInterface'

vi.mock('@/services/return', () => ({
    returnService: {
        getReturnDetail: vi.fn(),
        confirmReturn: vi.fn(),
        confirmReturnNoLayout: vi.fn(),
        removeReturnRecord: vi.fn(),
        getReturnList: vi.fn(),
        getReturnStats: vi.fn(),
    },
}))

const returnProduct: IReturnProduct = {
    GroupServiceId: 'product-1',
    GroupServiceCode: 'SKU-A',
    GroupServiceName: 'SKU A',
    Quantity: 2,
    DamagedQuantity: 0,
    TotalQuantity: 2,
}

const returnDetail: IReturnDetail = {
    OrderCode: 'ORD001',
    DeliveryCode: 'DLV001',
    OrderDate: '2026-05-18T08:00:00',
    DistributorName: 'Distributor',
    ShippingUnitId: 'provider-1',
    ShippingUnitName: 'GHN',
    CustomerName: 'Customer',
    ReturnType: 'PARTIAL_RETURN',
    ListItem: [returnProduct],
}

const returnRecord: IReturnRecord = {
    Id: 'return-1',
    OrderCode: 'ORD001',
    DeliveryCode: 'DLV001',
    PackageCode: 'PKG001',
    OrderDate: '2026-05-18T08:00:00',
    ReturnByName: 'Tester',
    ReturnDate: '2026-05-18T09:00:00',
    ShippingUnitId: 'provider-1',
    ShippingUnitName: 'GHN',
    CustomerName: 'Customer',
    DistributorName: 'Distributor',
    ReturnType: 'PARTIAL_RETURN',
    ListItem: [returnProduct],
    TotalRows: 1,
}

const returnStats: IReturnStats = {
    FromDate: '2026-05-18',
    ToDate: '2026-05-18',
    Statistics: [
        {
            Name: 'GHN',
            ShippingUnitId: 'provider-1',
            TotalReturn: 5,
        },
    ],
}

function createReturnStore(preloadedReturnState?: Partial<ReturnType<typeof returnReducer>>) {
    const initialReturnState = returnReducer(undefined, { type: '@@INIT' })

    return configureStore({
        reducer: {
            returnDelivery: returnReducer,
        },
        preloadedState: {
            returnDelivery: {
                ...initialReturnState,
                ...preloadedReturnState,
            },
        },
    })
}

describe('returnSlice extra coverage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('clearReturnError clears error', () => {
        const store = createReturnStore({
            error: 'Old error',
        })

        store.dispatch(clearReturnError())

        expect(store.getState().returnDelivery.error).toBeNull()
    })

    it('clearActiveReturn clears active return and error', () => {
        const store = createReturnStore({
            activeReturn: returnDetail,
            error: 'Old error',
        })

        store.dispatch(clearActiveReturn())

        expect(store.getState().returnDelivery.activeReturn).toBeNull()
        expect(store.getState().returnDelivery.error).toBeNull()
    })

    it('clearReturnRecords clears records and totalRows', () => {
        const store = createReturnStore({
            records: [returnRecord],
            totalRows: 1,
            error: 'Old error',
        })

        store.dispatch(clearReturnRecords())

        expect(store.getState().returnDelivery.records).toEqual([])
        expect(store.getState().returnDelivery.totalRows).toBe(0)
        expect(store.getState().returnDelivery.error).toBeNull()
    })

    it('setReturnFilters merges filters', () => {
        const store = createReturnStore()

        store.dispatch(
            setReturnFilters({
                PageIndex: 2,
                PageSize: 20,
                DeliveryCode: 'DLV001',
                OrderCode: 'ORD001',
                ShippingUnitId: 'provider-1',
            }),
        )

        expect(store.getState().returnDelivery.filters).toMatchObject({
            PageIndex: 2,
            PageSize: 20,
            DeliveryCode: 'DLV001',
            OrderCode: 'ORD001',
            ShippingUnitId: 'provider-1',
        })
    })

    it('resetReturnFilters resets filters', () => {
        const store = createReturnStore({
            filters: {
                PageIndex: 3,
                PageSize: 20,
                DeliveryCode: 'DLV001',
                OrderCode: 'ORD001',
                ShippingUnitId: 'provider-1',
            },
        })

        store.dispatch(resetReturnFilters())

        expect(store.getState().returnDelivery.filters).toMatchObject({
            PageIndex: 1,
            PageSize: 10,
        })
    })

    it('loadReturnDetail stores active return on success', async () => {
        vi.mocked(returnService.getReturnDetail).mockResolvedValue(returnDetail)

        const store = createReturnStore()

        await store.dispatch(
            loadReturnDetail({
                DeliveryCode: 'DLV001',
                Type: 'DELIVERYCODE',
                ShippingUnitId: 'provider-1',
            }) as never,
        )

        expect(store.getState().returnDelivery.activeReturn).toEqual(returnDetail)
        expect(store.getState().returnDelivery.isLoadingDetail).toBe(false)
    })

    it('loadReturnDetail rejects before service call if missing ShippingUnitId', async () => {
        const store = createReturnStore()

        await store.dispatch(
            loadReturnDetail({
                DeliveryCode: 'DLV001',
                Type: 'DELIVERYCODE',
                ShippingUnitId: '',
            }) as never,
        )

        expect(returnService.getReturnDetail).not.toHaveBeenCalled()
        expect(store.getState().returnDelivery.error).toBe(
            'Vui lòng chọn đơn vị vận chuyển trước khi nhận hoàn',
        )
    })

    it('loadReturnDetail stores error on failure', async () => {
        vi.mocked(returnService.getReturnDetail).mockRejectedValue(
            new Error('Không thể tải chi tiết hoàn'),
        )

        const store = createReturnStore()

        await store.dispatch(
            loadReturnDetail({
                DeliveryCode: 'DLV001',
                Type: 'DELIVERYCODE',
                ShippingUnitId: 'provider-1',
            }) as never,
        )

        expect(store.getState().returnDelivery.activeReturn).toBeNull()
        expect(store.getState().returnDelivery.error).toBe('Không thể tải chi tiết hoàn')
    })

    it('fetchReturnList stores list result on success', async () => {
        vi.mocked(returnService.getReturnList).mockResolvedValue({
            Data: [returnRecord],
            TotalRows: 1,
            PageIndex: 1,
            PageSize: 10,
        })

        const store = createReturnStore()

        await store.dispatch(
            fetchReturnList({
                PageIndex: 1,
                PageSize: 10,
                ShippingUnitId: 'provider-1',
            }) as never,
        )

        expect(store.getState().returnDelivery.records).toEqual([returnRecord])
        expect(store.getState().returnDelivery.totalRows).toBe(1)
        expect(store.getState().returnDelivery.isFetchingList).toBe(false)
    })

    it('fetchReturnList stores error on failure', async () => {
        vi.mocked(returnService.getReturnList).mockRejectedValue(
            new Error('Không thể tải danh sách hoàn'),
        )

        const store = createReturnStore()

        await store.dispatch(
            fetchReturnList({
                PageIndex: 1,
                PageSize: 10,
                ShippingUnitId: 'provider-1',
            }) as never,
        )

        expect(store.getState().returnDelivery.error).toBe('Không thể tải danh sách hoàn')
        expect(store.getState().returnDelivery.isFetchingList).toBe(false)
    })

    it('removeReturnRecord removes record on success', async () => {
        vi.mocked(returnService.removeReturnRecord).mockResolvedValue(['DLV001'])

        const store = createReturnStore({
            records: [returnRecord],
            totalRows: 1,
        })

        await store.dispatch(
            removeReturnRecord({
                DeliveryCodes: ['DLV001'],
                Type: 'DELIVERYCODE',
                ShippingUnitId: 'provider-1',
            }) as never,
        )

        expect(store.getState().returnDelivery.records).toEqual([])
        expect(store.getState().returnDelivery.totalRows).toBe(0)
    })

    it('removeReturnRecord rejects before service call if missing ShippingUnitId', async () => {
        const store = createReturnStore({
            records: [returnRecord],
            totalRows: 1,
        })

        await store.dispatch(
            removeReturnRecord({
                DeliveryCodes: ['DLV001'],
                Type: 'DELIVERYCODE',
                ShippingUnitId: '',
            }) as never,
        )

        expect(returnService.removeReturnRecord).not.toHaveBeenCalled()
        expect(store.getState().returnDelivery.records).toEqual([returnRecord])
        expect(store.getState().returnDelivery.error).toBe(
            'Vui lòng chọn đơn vị vận chuyển trước khi xóa hàng hoàn',
        )
    })

    it('removeReturnRecord stores error on failure', async () => {
        vi.mocked(returnService.removeReturnRecord).mockRejectedValue(
            new Error('Không thể xóa hoàn'),
        )

        const store = createReturnStore({
            records: [returnRecord],
            totalRows: 1,
        })

        await store.dispatch(
            removeReturnRecord({
                DeliveryCodes: ['DLV001'],
                Type: 'DELIVERYCODE',
                ShippingUnitId: 'provider-1',
            }) as never,
        )

        expect(store.getState().returnDelivery.records).toEqual([returnRecord])
        expect(store.getState().returnDelivery.error).toBe('Không thể xóa hoàn')
    })

    it('loadReturnStats stores stats on success', async () => {
        vi.mocked(returnService.getReturnStats).mockResolvedValue(returnStats)

        const store = createReturnStore()

        await store.dispatch(loadReturnStats({ Date: '2026-05-18' }) as never)

        expect(store.getState().returnDelivery.returnStats).toEqual(returnStats)
        expect(store.getState().returnDelivery.isLoadingStats).toBe(false)
    })

    it('loadReturnStats stores error on failure', async () => {
        vi.mocked(returnService.getReturnStats).mockRejectedValue(
            new Error('Không thể tải thống kê hoàn'),
        )

        const store = createReturnStore()

        await store.dispatch(loadReturnStats({ Date: '2026-05-18' }) as never)

        expect(store.getState().returnDelivery.error).toBe('Không thể tải thống kê hoàn')
        expect(store.getState().returnDelivery.isLoadingStats).toBe(false)
    })
})
