import { configureStore } from '@reduxjs/toolkit'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { returnService } from '../../../services/return'
import returnReducer, {
    clearActiveReturn,
    clearReturnError,
    clearReturnRecords,
    confirmReturn,
    confirmReturnNoLayout,
    fetchReturnList,
    loadReturnDetail,
    loadReturnStats,
    removeReturnRecord,
    resetReturnFilters,
    setReturnFilters,
} from '../../../store/slices/returnSlice'
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

//#region fixtures
const returnProductA: IReturnProduct = {
    GroupServiceId: 'group-service-1',
    GroupServiceCode: 'SKU-A',
    GroupServiceName: 'SKU A',
    Quantity: 0,
    DamagedQuantity: 0,
    TotalQuantity: 2,
}

const returnProductB: IReturnProduct = {
    GroupServiceId: 'group-service-2',
    GroupServiceCode: 'SKU-B',
    GroupServiceName: 'SKU B',
    Quantity: 0,
    DamagedQuantity: 0,
    TotalQuantity: 1,
}

const returnedProductA: IReturnProduct = {
    GroupServiceId: 'group-service-1',
    GroupServiceCode: 'SKU-A',
    GroupServiceName: 'SKU A',
    Quantity: 1,
    DamagedQuantity: 1,
    TotalQuantity: 2,
}

const returnedProductB: IReturnProduct = {
    GroupServiceId: 'group-service-2',
    GroupServiceCode: 'SKU-B',
    GroupServiceName: 'SKU B',
    Quantity: 1,
    DamagedQuantity: 0,
    TotalQuantity: 1,
}

const returnedProductC: IReturnProduct = {
    GroupServiceId: 'group-service-3',
    GroupServiceCode: 'SKU-C',
    GroupServiceName: 'SKU C',
    Quantity: 1,
    DamagedQuantity: 0,
    TotalQuantity: 1,
}

const returnDetail: IReturnDetail = {
    OrderCode: 'ORD001',
    DeliveryCode: 'DLV001',
    OrderDate: '2026-05-18T07:00:00',
    DistributorName: 'Distributor 1',
    CustomerName: 'Customer 1',
    CustomerId: 'customer-1',
    ShippingUnitId: 'provider-1',
    ShippingUnitName: 'GHN',
    ReturnType: 'PARTIAL_RETURN',
    ListItem: [returnProductA, returnProductB],
}

const returnRecord: IReturnRecord = {
    Id: 'return-1',
    OrderCode: 'ORD001',
    DeliveryCode: 'DLV001',
    PackageCode: 'PKG001',
    OrderDate: '2026-05-18T07:00:00',
    CustomerName: 'Customer 1',
    DistributorName: 'Distributor 1',
    ReturnByName: 'Tester',
    ReturnDate: '2026-05-18T08:00:00',
    ReturnType: 'PARTIAL_RETURN',
    ShippingUnitId: 'provider-1',
    ShippingUnitName: 'GHN',
    ListItem: [returnedProductA, returnedProductB],
    TotalRows: 1,
}

const anotherReturnRecord: IReturnRecord = {
    Id: 'return-2',
    OrderCode: 'ORD002',
    DeliveryCode: 'DLV002',
    PackageCode: 'PKG002',
    OrderDate: '2026-05-18T08:00:00',
    CustomerName: 'Customer 2',
    DistributorName: 'Distributor 2',
    ReturnByName: 'Tester',
    ReturnDate: '2026-05-18T09:00:00',
    ReturnType: 'FULL_RETURN',
    ShippingUnitId: 'provider-1',
    ShippingUnitName: 'GHN',
    ListItem: [returnedProductC],
    TotalRows: 1,
}

const returnStats: IReturnStats = {
    FromDate: '2026-05-18T00:00:00',
    ToDate: '2026-05-18T23:59:59',
    Statistics: [
        {
            ShippingUnitId: 'provider-1',
            Name: 'GHN',
            TotalReturn: 2,
        },
        {
            ShippingUnitId: 'provider-2',
            Name: 'J&T',
            TotalReturn: 1,
        },
    ],
}
//#endregion fixtures

//#region helpers
type ReturnState = ReturnType<typeof returnReducer>

function createReturnStore(preloadedReturnState?: Partial<ReturnState>) {
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
//#endregion helpers

describe('returnSlice', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('confirmReturn', () => {
        it('clear activeReturn khi success', async () => {
            vi.mocked(returnService.confirmReturn).mockResolvedValue([returnRecord])

            const store = createReturnStore({
                activeReturn: returnDetail,
            })

            await store.dispatch(
                confirmReturn({
                    DeliveryCode: 'DLV001',
                    ShippingUnitId: 'provider-1',
                    Type: 'DELIVERYCODE',
                    ContainerId: 1435,
                    ContainerCode: 'PALLET1435',
                    ReturnType: 'PARTIAL_RETURN',
                    ListItems: [
                        {
                            GroupServiceId: 'group-service-1',
                            Quantity: 1,
                            DamagedQuantity: 1,
                        },
                    ],
                }) as never,
            )

            const state = store.getState().returnDelivery

            expect(state.activeReturn).toBeNull()
            expect(state.records[0]).toEqual(returnRecord)
            expect(state.error).toBeNull()
        })

        it('prepend record mới vào records khi success', async () => {
            vi.mocked(returnService.confirmReturn).mockResolvedValue([returnRecord])

            const store = createReturnStore({
                records: [anotherReturnRecord],
                totalRows: 1,
                activeReturn: returnDetail,
            })

            await store.dispatch(
                confirmReturn({
                    DeliveryCode: 'DLV001',
                    ShippingUnitId: 'provider-1',
                    Type: 'DELIVERYCODE',
                    ContainerId: 1435,
                    ContainerCode: 'PALLET1435',
                    ReturnType: 'PARTIAL_RETURN',
                    ListItems: [
                        {
                            GroupServiceId: 'group-service-1',
                            Quantity: 1,
                            DamagedQuantity: 1,
                        },
                    ],
                }) as never,
            )

            const state = store.getState().returnDelivery

            expect(state.records).toEqual([returnRecord, anotherReturnRecord])
            expect(state.totalRows).toBe(2)
        })

        it('không clear activeReturn khi failure', async () => {
            vi.mocked(returnService.confirmReturn).mockRejectedValue(
                new Error('Không thể xác nhận hàng hoàn'),
            )

            const store = createReturnStore({
                activeReturn: returnDetail,
            })

            await store.dispatch(
                confirmReturn({
                    DeliveryCode: 'DLV001',
                    ShippingUnitId: 'provider-1',
                    Type: 'DELIVERYCODE',
                    ContainerId: 1435,
                    ContainerCode: 'PALLET1435',
                    ReturnType: 'PARTIAL_RETURN',
                    ListItems: [
                        {
                            GroupServiceId: 'group-service-1',
                            Quantity: 1,
                            DamagedQuantity: 1,
                        },
                    ],
                }) as never,
            )

            const state = store.getState().returnDelivery

            expect(state.activeReturn).toEqual(returnDetail)
            expect(state.error).toBe('Không thể xác nhận hàng hoàn')
        })

        it('reject trước khi gọi service nếu thiếu container', async () => {
            const store = createReturnStore({
                activeReturn: returnDetail,
            })

            await store.dispatch(
                confirmReturn({
                    DeliveryCode: 'DLV001',
                    ShippingUnitId: 'provider-1',
                    Type: 'DELIVERYCODE',
                    ReturnType: 'PARTIAL_RETURN',
                    ListItems: [
                        {
                            GroupServiceId: 'group-service-1',
                            Quantity: 1,
                            DamagedQuantity: 1,
                        },
                    ],
                }) as never,
            )

            const state = store.getState().returnDelivery

            expect(returnService.confirmReturn).not.toHaveBeenCalled()
            expect(state.activeReturn).toEqual(returnDetail)
            expect(state.error).toBe('Vui lòng quét đơn vị chứa trước khi xác nhận hoàn')
        })

        it('rejects before service call if non-waybill confirm is missing ShippingUnitId', async () => {
            const store = createReturnStore({
                activeReturn: returnDetail,
            })

            await store.dispatch(
                confirmReturn({
                    OrderCode: 'ORD001',
                    ShippingUnitId: '',
                    Type: 'ORDERCODE',
                    ContainerId: 1435,
                    ContainerCode: 'PALLET1435',
                    ReturnType: 'PARTIAL_RETURN',
                    ListItems: [
                        {
                            GroupServiceId: 'group-service-1',
                            Quantity: 1,
                            DamagedQuantity: 1,
                        },
                    ],
                }) as never,
            )

            const state = store.getState().returnDelivery

            expect(returnService.confirmReturn).not.toHaveBeenCalled()
            expect(state.activeReturn).toEqual(returnDetail)
            expect(state.error).toBe(
                'Mã này cần chọn đơn vị vận chuyển trước khi xác nhận hoàn. Mã vận đơn sẽ tự xác định đơn vị vận chuyển.',
            )
        })
    })

    describe('confirmReturnNoLayout', () => {
        it('clear activeReturn và prepend record khi success', async () => {
            vi.mocked(returnService.confirmReturnNoLayout).mockResolvedValue([returnRecord])

            const store = createReturnStore({
                activeReturn: returnDetail,
                records: [anotherReturnRecord],
                totalRows: 1,
            })

            await store.dispatch(
                confirmReturnNoLayout({
                    DeliveryCode: 'DLV001',
                    ShippingUnitId: '',
                    Type: 'DELIVERYCODE',
                    ReturnType: 'PARTIAL_RETURN',
                    ListItems: [
                        {
                            GroupServiceId: 'group-service-1',
                            Quantity: 1,
                            DamagedQuantity: 1,
                        },
                    ],
                }) as never,
            )

            const state = store.getState().returnDelivery

            expect(returnService.confirmReturnNoLayout).toHaveBeenCalled()
            expect(state.activeReturn).toBeNull()
            expect(state.records).toEqual([returnRecord, anotherReturnRecord])
            expect(state.totalRows).toBe(2)
            expect(state.error).toBeNull()
        })

        it('rejects before service call if non-waybill no-layout confirm is missing ShippingUnitId', async () => {
            const store = createReturnStore({
                activeReturn: returnDetail,
            })

            await store.dispatch(
                confirmReturnNoLayout({
                    OrderCode: 'ORD001',
                    ShippingUnitId: '',
                    Type: 'ORDERCODE',
                    ReturnType: 'PARTIAL_RETURN',
                    ListItems: [
                        {
                            GroupServiceId: 'group-service-1',
                            Quantity: 1,
                            DamagedQuantity: 1,
                        },
                    ],
                }) as never,
            )

            const state = store.getState().returnDelivery

            expect(returnService.confirmReturnNoLayout).not.toHaveBeenCalled()
            expect(state.activeReturn).toEqual(returnDetail)
            expect(state.error).toBe(
                'Mã này cần chọn đơn vị vận chuyển trước khi xác nhận hoàn. Mã vận đơn sẽ tự xác định đơn vị vận chuyển.',
            )
        })
    })

    describe('reducers', () => {
        it('clearReturnError clears error', () => {
            const store = createReturnStore({
                error: 'Old error',
            })

            store.dispatch(clearReturnError())

            expect(store.getState().returnDelivery.error).toBeNull()
        })

        it('clearActiveReturn clears active return, active scan payload and error', () => {
            const store = createReturnStore({
                activeReturn: returnDetail,
                activeScanPayload: {
                    DeliveryCode: 'DLV001',
                    ShippingUnitId: '',
                    Type: 'DELIVERYCODE',
                },
                error: 'Old error',
            })

            store.dispatch(clearActiveReturn())

            expect(store.getState().returnDelivery.activeReturn).toBeNull()
            expect(store.getState().returnDelivery.activeScanPayload).toBeNull()
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
                    OrderCode: 'ORD001',
                }),
            )

            expect(store.getState().returnDelivery.filters).toMatchObject({
                PageIndex: 2,
                PageSize: 20,
                OrderCode: 'ORD001',
            })
        })

        it('resetReturnFilters resets filters', () => {
            const store = createReturnStore({
                filters: {
                    PageIndex: 3,
                    PageSize: 20,
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
    })

    describe('loadReturnDetail', () => {
        it('stores active return on success', async () => {
            vi.mocked(returnService.getReturnDetail).mockResolvedValue(returnDetail)

            const store = createReturnStore()

            await store.dispatch(
                loadReturnDetail({
                    OrderCode: 'ORD001',
                    ShippingUnitId: 'provider-1',
                    Type: 'ORDERCODE',
                }) as never,
            )

            const state = store.getState().returnDelivery

            expect(returnService.getReturnDetail).toHaveBeenCalledWith({
                OrderCode: 'ORD001',
                ShippingUnitId: 'provider-1',
                Type: 'ORDERCODE',
            })
            expect(state.activeReturn).toEqual(returnDetail)
            expect(state.activeScanPayload).toEqual({
                OrderCode: 'ORD001',
                ShippingUnitId: 'provider-1',
                Type: 'ORDERCODE',
            })
            expect(state.error).toBeNull()
        })

        it('allows DELIVERYCODE without ShippingUnitId because carrier is resolved by waybill', async () => {
            vi.mocked(returnService.getReturnDetail).mockResolvedValue(returnDetail)

            const store = createReturnStore()

            await store.dispatch(
                loadReturnDetail({
                    DeliveryCode: 'DLV001',
                    ShippingUnitId: '',
                    Type: 'DELIVERYCODE',
                }) as never,
            )

            const state = store.getState().returnDelivery

            expect(returnService.getReturnDetail).toHaveBeenCalledWith({
                DeliveryCode: 'DLV001',
                ShippingUnitId: '',
                Type: 'DELIVERYCODE',
            })
            expect(state.activeReturn).toEqual(returnDetail)
            expect(state.activeScanPayload).toEqual({
                DeliveryCode: 'DLV001',
                ShippingUnitId: '',
                Type: 'DELIVERYCODE',
            })
            expect(state.error).toBeNull()
        })

        it('rejects before service call if non-waybill scan is missing ShippingUnitId', async () => {
            const store = createReturnStore()

            await store.dispatch(
                loadReturnDetail({
                    OrderCode: 'ORD001',
                    ShippingUnitId: '',
                    Type: 'ORDERCODE',
                }) as never,
            )

            const state = store.getState().returnDelivery

            expect(returnService.getReturnDetail).not.toHaveBeenCalled()
            expect(state.error).toBe(
                'Mã này cần chọn đơn vị vận chuyển trước khi nhận hoàn. Mã vận đơn sẽ tự xác định đơn vị vận chuyển.',
            )
        })

        it('stores error on failure', async () => {
            vi.mocked(returnService.getReturnDetail).mockRejectedValue(
                new Error('Không thể tải chi tiết hàng hoàn'),
            )

            const store = createReturnStore({
                activeReturn: returnDetail,
            })

            await store.dispatch(
                loadReturnDetail({
                    OrderCode: 'ORD404',
                    ShippingUnitId: 'provider-1',
                    Type: 'ORDERCODE',
                }) as never,
            )

            const state = store.getState().returnDelivery

            expect(state.activeReturn).toEqual(returnDetail)
            expect(state.error).toBe('Không thể tải chi tiết hàng hoàn')
        })
    })

    describe('fetchReturnList', () => {
        it('stores list result on success', async () => {
            vi.mocked(returnService.getReturnList).mockResolvedValue({
                Data: [returnRecord, anotherReturnRecord],
                TotalRows: 2,
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

            const state = store.getState().returnDelivery

            expect(state.records).toEqual([returnRecord, anotherReturnRecord])
            expect(state.totalRows).toBe(2)
            expect(state.filters).toMatchObject({
                PageIndex: 1,
                PageSize: 10,
            })
            expect(state.isFetchingList).toBe(false)
            expect(state.error).toBeNull()
        })

        it('stores error on failure', async () => {
            vi.mocked(returnService.getReturnList).mockRejectedValue(
                new Error('Không thể tải danh sách hàng hoàn'),
            )

            const store = createReturnStore()

            await store.dispatch(
                fetchReturnList({
                    PageIndex: 1,
                    PageSize: 10,
                }) as never,
            )

            const state = store.getState().returnDelivery

            expect(state.error).toBe('Không thể tải danh sách hàng hoàn')
            expect(state.isFetchingList).toBe(false)
        })
    })

    describe('removeReturnRecord', () => {
        it('removes record on success', async () => {
            vi.mocked(returnService.removeReturnRecord).mockResolvedValue(['DLV001'])

            const store = createReturnStore({
                records: [returnRecord, anotherReturnRecord],
                totalRows: 2,
            })

            await store.dispatch(
                removeReturnRecord({
                    DeliveryCodes: ['DLV001'],
                    ShippingUnitId: '',
                    Type: 'DELIVERYCODE',
                }) as never,
            )

            const state = store.getState().returnDelivery

            expect(returnService.removeReturnRecord).toHaveBeenCalledWith({
                DeliveryCodes: ['DLV001'],
                ShippingUnitId: '',
                Type: 'DELIVERYCODE',
            })
            expect(state.records).toEqual([anotherReturnRecord])
            expect(state.totalRows).toBe(1)
            expect(state.error).toBeNull()
        })

        it('allows DELIVERYCODE remove without ShippingUnitId because carrier is resolved by waybill', async () => {
            vi.mocked(returnService.removeReturnRecord).mockResolvedValue(['DLV001'])

            const store = createReturnStore({
                records: [returnRecord],
                totalRows: 1,
            })

            await store.dispatch(
                removeReturnRecord({
                    DeliveryCodes: ['DLV001'],
                    ShippingUnitId: '',
                    Type: 'DELIVERYCODE',
                }) as never,
            )

            const state = store.getState().returnDelivery

            expect(returnService.removeReturnRecord).toHaveBeenCalledWith({
                DeliveryCodes: ['DLV001'],
                ShippingUnitId: '',
                Type: 'DELIVERYCODE',
            })
            expect(state.records).toEqual([])
            expect(state.totalRows).toBe(0)
            expect(state.error).toBeNull()
        })

        it('rejects before service call if non-waybill remove is missing ShippingUnitId', async () => {
            const store = createReturnStore({
                records: [returnRecord],
                totalRows: 1,
            })

            await store.dispatch(
                removeReturnRecord({
                    OrderCode: 'ORD001',
                    ShippingUnitId: '',
                    Type: 'ORDERCODE',
                }) as never,
            )

            const state = store.getState().returnDelivery

            expect(returnService.removeReturnRecord).not.toHaveBeenCalled()
            expect(state.records).toEqual([returnRecord])
            expect(state.error).toBe(
                'Mã này cần chọn đơn vị vận chuyển trước khi xóa hàng hoàn. Mã vận đơn sẽ tự xác định đơn vị vận chuyển.',
            )
        })

        it('stores error on failure', async () => {
            vi.mocked(returnService.removeReturnRecord).mockRejectedValue(
                new Error('Không thể xóa record hàng hoàn'),
            )

            const store = createReturnStore({
                records: [returnRecord],
                totalRows: 1,
            })

            await store.dispatch(
                removeReturnRecord({
                    DeliveryCodes: ['DLV001'],
                    ShippingUnitId: '',
                    Type: 'DELIVERYCODE',
                }) as never,
            )

            const state = store.getState().returnDelivery

            expect(state.records).toEqual([returnRecord])
            expect(state.totalRows).toBe(1)
            expect(state.error).toBe('Không thể xóa record hàng hoàn')
        })
    })

    describe('loadReturnStats', () => {
        it('stores stats on success', async () => {
            vi.mocked(returnService.getReturnStats).mockResolvedValue(returnStats)

            const store = createReturnStore()

            await store.dispatch(loadReturnStats({ Date: '2026-05-18' }) as never)

            const state = store.getState().returnDelivery

            expect(returnService.getReturnStats).toHaveBeenCalledWith({
                Date: '2026-05-18',
            })
            expect(state.returnStats).toEqual(returnStats)
            expect(state.isLoadingStats).toBe(false)
            expect(state.error).toBeNull()
        })

        it('stores error on failure', async () => {
            vi.mocked(returnService.getReturnStats).mockRejectedValue(
                new Error('Không thể tải thống kê hàng hoàn'),
            )

            const store = createReturnStore()

            await store.dispatch(loadReturnStats({ Date: '2026-05-18' }) as never)

            const state = store.getState().returnDelivery

            expect(state.error).toBe('Không thể tải thống kê hàng hoàn')
            expect(state.isLoadingStats).toBe(false)
        })
    })
})
