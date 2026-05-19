import { configureStore } from '@reduxjs/toolkit'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { packingService } from '../../../services/packing/packingService'
import { selectIsAllItemsHandled } from '../../../store/selectors/packingSelectors'
import packingReducer, {
    cancelPacking,
    clearActivePackingDetail,
    clearPackingError,
    completePacking,
    fetchPackingList,
    incrementSKU,
    loadPackageDetails,
    loadPackingStats,
    resetPackingFilters,
    setPackingFilters,
} from '../../../store/slices/packingSlice'
import type {
    IPackingDetail,
    IPackingRecord,
    IPackingStats,
} from '../../../models/packing/PackingInterface'

vi.mock('@/services/packing/packingService', () => ({
    packingService: {
        getPackageDetails: vi.fn(),
        completePacking: vi.fn(),
        cancelPacking: vi.fn(),
        getPackingList: vi.fn(),
        getPackingStats: vi.fn(),
    },
}))

//#region fixtures
const packageDetail: IPackingDetail = {
    Name: 'Kiện hàng test',
    Code: 'PKG001',
    PackageDetails: [
        {
            GroupServiceName: 'SKU A',
            ListingPropertyCode: 'SKU-A',
            Quantity: 2,
        },
        {
            GroupServiceName: 'SKU B',
            ListingPropertyCode: 'SKU-B',
            Quantity: 1,
        },
    ],
}

const packingRecord: IPackingRecord = {
    Id: 'packing-1',
    OrderCode: 'ORD001',
    DeliveryCode: 'DLV001',
    PackageCode: 'PKG001',
    PackerByName: 'Tester',
    PackingDate: '2026-05-18T08:00:00',
    ShippingUnitName: 'GHN',
    TotalRows: 1,
}

const packingStats = {
    TotalPacking: 5,
    TotalSalesOrder: 10,
} as IPackingStats
//#endregion fixtures

//#region helpers
function createPackingStore(preloadedPackingState?: Partial<ReturnType<typeof packingReducer>>) {
    const initialPackingState = packingReducer(undefined, { type: '@@INIT' })

    return configureStore({
        reducer: {
            packing: packingReducer,
        },
        preloadedState: {
            packing: {
                ...initialPackingState,
                ...preloadedPackingState,
            },
        },
    })
}
//#endregion helpers

describe('packingSlice', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('loadPackageDetails', () => {
        it('set activeDetail, reset scannedSKUs khi success', async () => {
            vi.mocked(packingService.getPackageDetails).mockResolvedValue(packageDetail)

            const store = createPackingStore({
                scannedSKUs: {
                    'SKU-A': 1,
                },
            })

            await store.dispatch(
                loadPackageDetails({
                    DeliveryCode: 'DLV001',
                    Type: 'DELIVERYCODE',
                }) as never,
            )

            const state = store.getState().packing

            expect(state.activeDetail).toEqual(packageDetail)
            expect(state.scannedSKUs).toEqual({})
            expect(state.error).toBeNull()
        })

        it('set error, không reset scannedSKUs khi failure', async () => {
            vi.mocked(packingService.getPackageDetails).mockRejectedValue(
                new Error('Không tìm thấy kiện'),
            )

            const store = createPackingStore({
                scannedSKUs: {
                    'SKU-A': 1,
                },
            })

            await store.dispatch(
                loadPackageDetails({
                    DeliveryCode: 'DLV404',
                    Type: 'DELIVERYCODE',
                }) as never,
            )

            const state = store.getState().packing

            expect(state.error).toBe('Không tìm thấy kiện')
            expect(state.scannedSKUs).toEqual({
                'SKU-A': 1,
            })
        })
    })

    describe('incrementSKU', () => {
        it('tăng count cho SKU đó', () => {
            const store = createPackingStore({
                activeDetail: packageDetail,
                scannedSKUs: {
                    'SKU-A': 1,
                },
            })

            store.dispatch(incrementSKU('SKU-A'))

            expect(store.getState().packing.scannedSKUs['SKU-A']).toBe(2)
        })

        it('tạo entry mới nếu SKU hợp lệ chưa có trong scannedSKUs', () => {
            const store = createPackingStore({
                activeDetail: packageDetail,
                scannedSKUs: {},
            })

            store.dispatch(incrementSKU('SKU-B'))

            expect(store.getState().packing.scannedSKUs['SKU-B']).toBe(1)
        })

        it('không tăng nếu SKU không thuộc activeDetail', () => {
            const store = createPackingStore({
                activeDetail: packageDetail,
                scannedSKUs: {},
            })

            store.dispatch(incrementSKU('SKU-X'))

            expect(store.getState().packing.scannedSKUs['SKU-X']).toBeUndefined()
        })

        it('không tăng vượt quá Quantity', () => {
            const store = createPackingStore({
                activeDetail: packageDetail,
                scannedSKUs: {
                    'SKU-B': 1,
                },
            })

            store.dispatch(incrementSKU('SKU-B'))

            expect(store.getState().packing.scannedSKUs['SKU-B']).toBe(1)
        })
    })

    describe('selectIsAllItemsHandled', () => {
        it('false khi activeDetail = null', () => {
            const store = createPackingStore({
                activeDetail: null,
                scannedSKUs: {},
            })

            expect(selectIsAllItemsHandled(store.getState() as never)).toBe(false)
        })

        it('false khi có SKU chưa đủ', () => {
            const store = createPackingStore({
                activeDetail: packageDetail,
                scannedSKUs: {
                    'SKU-A': 2,
                    'SKU-B': 0,
                },
            })

            expect(selectIsAllItemsHandled(store.getState() as never)).toBe(false)
        })

        it('true khi tất cả SKU đủ', () => {
            const store = createPackingStore({
                activeDetail: packageDetail,
                scannedSKUs: {
                    'SKU-A': 2,
                    'SKU-B': 1,
                },
            })

            expect(selectIsAllItemsHandled(store.getState() as never)).toBe(true)
        })
    })

    describe('completePacking', () => {
        it('clear activeDetail + scannedSKUs khi success', async () => {
            vi.mocked(packingService.completePacking).mockResolvedValue([packingRecord])

            const store = createPackingStore({
                activeDetail: packageDetail,
                scannedSKUs: {
                    'SKU-A': 2,
                    'SKU-B': 1,
                },
            })

            await store.dispatch(
                completePacking({
                    DeliveryCodes: ['DLV001'],
                    Type: 'DELIVERYCODE',
                }) as never,
            )

            const state = store.getState().packing

            expect(state.activeDetail).toBeNull()
            expect(state.scannedSKUs).toEqual({})
            expect(state.processedList[0]).toEqual(packingRecord)
            expect(state.error).toBeNull()
        })

        it('không clear khi failure do service reject', async () => {
            vi.mocked(packingService.completePacking).mockRejectedValue(
                new Error('Không thể hoàn thành'),
            )

            const store = createPackingStore({
                activeDetail: packageDetail,
                scannedSKUs: {
                    'SKU-A': 2,
                    'SKU-B': 1,
                },
            })

            await store.dispatch(
                completePacking({
                    DeliveryCodes: ['DLV001'],
                    Type: 'DELIVERYCODE',
                }) as never,
            )

            const state = store.getState().packing

            expect(state.activeDetail).toEqual(packageDetail)
            expect(state.scannedSKUs).toEqual({
                'SKU-A': 2,
                'SKU-B': 1,
            })
            expect(state.error).toBe('Không thể hoàn thành')
        })

        it('không gọi service và không clear khi chưa đủ SKU', async () => {
            const store = createPackingStore({
                activeDetail: packageDetail,
                scannedSKUs: {
                    'SKU-A': 1,
                    'SKU-B': 1,
                },
            })

            await store.dispatch(
                completePacking({
                    DeliveryCodes: ['DLV001'],
                    Type: 'DELIVERYCODE',
                }) as never,
            )

            expect(packingService.completePacking).not.toHaveBeenCalled()
            expect(store.getState().packing.activeDetail).toEqual(packageDetail)
            expect(store.getState().packing.scannedSKUs).toEqual({
                'SKU-A': 1,
                'SKU-B': 1,
            })
        })
    })

    describe('reducers', () => {
        it('clearPackingError clears error', () => {
            const store = createPackingStore({
                error: 'Old error',
            })

            store.dispatch(clearPackingError())

            expect(store.getState().packing.error).toBeNull()
        })

        it('clearActivePackingDetail clears active detail, scan payload and scanned SKUs', () => {
            const store = createPackingStore({
                activeDetail: packageDetail,
                activeScanPayload: {
                    DeliveryCode: 'DLV001',
                    Type: 'DELIVERYCODE',
                },
                scannedSKUs: {
                    'SKU-A': 1,
                },
                error: 'Old error',
            })

            store.dispatch(clearActivePackingDetail())

            const state = store.getState().packing

            expect(state.activeDetail).toBeNull()
            expect(state.activeScanPayload).toBeNull()
            expect(state.scannedSKUs).toEqual({})
            expect(state.error).toBeNull()
        })

        it('setPackingFilters merges filters', () => {
            const store = createPackingStore()

            store.dispatch(
                setPackingFilters({
                    PageIndex: 2,
                    PageSize: 20,
                    DeliveryCode: 'DLV001',
                }),
            )

            expect(store.getState().packing.filters).toMatchObject({
                PageIndex: 2,
                PageSize: 20,
                DeliveryCode: 'DLV001',
            })
        })

        it('resetPackingFilters resets filters', () => {
            const store = createPackingStore({
                filters: {
                    PageIndex: 3,
                    PageSize: 20,
                    DeliveryCode: 'DLV001',
                },
            })

            store.dispatch(resetPackingFilters())

            expect(store.getState().packing.filters).toMatchObject({
                PageIndex: 1,
                PageSize: 10,
            })
        })
    })

    describe('fetchPackingList', () => {
        it('stores list result on success', async () => {
            vi.mocked(packingService.getPackingList).mockResolvedValue({
                Data: [packingRecord],
                TotalRows: 1,
                PageIndex: 1,
                PageSize: 10,
            })

            const store = createPackingStore()

            await store.dispatch(
                fetchPackingList({
                    PageIndex: 1,
                    PageSize: 10,
                }) as never,
            )

            const state = store.getState().packing

            expect(state.processedList).toEqual([packingRecord])
            expect(state.totalRows).toBe(1)
            expect(state.filters).toMatchObject({
                PageIndex: 1,
                PageSize: 10,
            })
            expect(state.isFetchingList).toBe(false)
        })

        it('stores error on failure', async () => {
            vi.mocked(packingService.getPackingList).mockRejectedValue(
                new Error('Không thể tải danh sách'),
            )

            const store = createPackingStore()

            await store.dispatch(
                fetchPackingList({
                    PageIndex: 1,
                    PageSize: 10,
                }) as never,
            )

            const state = store.getState().packing

            expect(state.error).toBe('Không thể tải danh sách')
            expect(state.isFetchingList).toBe(false)
        })
    })

    describe('loadPackingStats', () => {
        it('stores stats on success', async () => {
            vi.mocked(packingService.getPackingStats).mockResolvedValue(packingStats)

            const store = createPackingStore()

            await store.dispatch(loadPackingStats({ Date: '2026-05-18' }) as never)

            const state = store.getState().packing

            expect(state.packingStats).toEqual(packingStats)
            expect(state.isLoadingStats).toBe(false)
        })

        it('stores error on failure', async () => {
            vi.mocked(packingService.getPackingStats).mockRejectedValue(
                new Error('Không thể tải thống kê'),
            )

            const store = createPackingStore()

            await store.dispatch(loadPackingStats({ Date: '2026-05-18' }) as never)

            const state = store.getState().packing

            expect(state.error).toBe('Không thể tải thống kê')
            expect(state.isLoadingStats).toBe(false)
        })
    })

    describe('cancelPacking', () => {
        it('removes processed record on success', async () => {
            vi.mocked(packingService.cancelPacking).mockResolvedValue(['DLV001'])

            const store = createPackingStore({
                activeDetail: packageDetail,
                activeScanPayload: {
                    DeliveryCode: 'DLV001',
                    Type: 'DELIVERYCODE',
                },
                scannedSKUs: {
                    'SKU-A': 1,
                },
                processedList: [packingRecord],
                totalRows: 1,
            })

            await store.dispatch(
                cancelPacking({
                    DeliveryCodes: ['DLV001'],
                    Type: 'DELIVERYCODE',
                }) as never,
            )

            const state = store.getState().packing

            expect(state.activeDetail).toEqual(packageDetail)
            expect(state.scannedSKUs).toEqual({
                'SKU-A': 1,
            })
            expect(state.processedList).toEqual([])
            expect(state.totalRows).toBe(0)
            expect(state.isRemoving).toBe(false)
            expect(state.error).toBeNull()
        })

        it('stores error on failure', async () => {
            vi.mocked(packingService.cancelPacking).mockRejectedValue(
                new Error('Không thể hủy đóng gói'),
            )

            const store = createPackingStore({
                activeDetail: packageDetail,
                scannedSKUs: {
                    'SKU-A': 1,
                },
            })

            await store.dispatch(
                cancelPacking({
                    DeliveryCodes: ['DLV001'],
                    Type: 'DELIVERYCODE',
                }) as never,
            )

            const state = store.getState().packing

            expect(state.activeDetail).toEqual(packageDetail)
            expect(state.scannedSKUs).toEqual({
                'SKU-A': 1,
            })
            expect(state.error).toBe('Không thể hủy đóng gói')
        })
    })
})
