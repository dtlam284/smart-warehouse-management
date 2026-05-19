import { describe, expect, it } from 'vitest'
import {
    selectIsFetchingPackingList,
    selectIsLoadingPackageDetails,
    selectIsRemovingPacking,
    selectIsSKUInActiveDetail,
    selectIsUpdatingPacking,
    selectPackingActiveDetail,
    selectPackingActiveScanPayload,
    selectPackingError,
    selectPackingFilters,
    selectPackingProcessedList,
    selectPackingScannedSKUs,
    selectPackingState,
    selectPackingStats,
    selectPackingTotalRows,
    selectRequiredCountBySKU,
    selectScannedCountBySKU,
    selectScannedProgress,
    selectSKUStatus,
} from '../../../store/selectors/packingSelectors'
import packingReducer from '../../../store/slices/packingSlice'
import type { RootState } from '../../../store/store'

type PackingState = ReturnType<typeof packingReducer>

const activeDetail: NonNullable<PackingState['activeDetail']> = {
    Name: 'Kiện test',
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
            Quantity: 3,
        },
    ],
}

const packingState: PackingState = {
    ...packingReducer(undefined, { type: '@@INIT' }),
    activeDetail,
    activeScanPayload: {
        DeliveryCode: 'DLV001',
        Type: 'DELIVERYCODE',
    },
    scannedSKUs: {
        'SKU-A': 2,
        'SKU-B': 1,
    },
    processedList: [
        {
            Id: 'record-1',
            OrderCode: 'ORD001',
            DeliveryCode: 'DLV001',
            PackageCode: 'PKG001',
            PackerByName: 'Tester',
            PackingDate: '2026-05-18T08:00:00',
            ShippingUnitName: 'GHN',
            TotalRows: 1,
        },
    ],
    totalRows: 1,
    filters: {
        PageIndex: 1,
        PageSize: 10,
    },
    packingStats: {
        TotalPacking: 5,
        TotalSalesOrder: 10,
    } as PackingState['packingStats'],
    isLoadingDetail: true,
    isFetchingList: true,
    isLoadingStats: false,
    isUpdating: true,
    isRemoving: true,
    error: 'Packing error',
}

function createState(nextPackingState: PackingState = packingState): RootState {
    return {
        packing: nextPackingState,
    } as unknown as RootState
}

describe('packingSelectors', () => {
    it('selects base packing state values', () => {
        const state = createState()

        expect(selectPackingState(state)).toBe(packingState)
        expect(selectPackingActiveDetail(state)).toEqual(activeDetail)
        expect(selectPackingActiveScanPayload(state)).toEqual({
            DeliveryCode: 'DLV001',
            Type: 'DELIVERYCODE',
        })
        expect(selectPackingScannedSKUs(state)).toEqual({
            'SKU-A': 2,
            'SKU-B': 1,
        })
        expect(selectPackingProcessedList(state)).toHaveLength(1)
        expect(selectPackingTotalRows(state)).toBe(1)
        expect(selectPackingFilters(state)).toEqual({
            PageIndex: 1,
            PageSize: 10,
        })
        expect(selectPackingStats(state)).toEqual({
            TotalPacking: 5,
            TotalSalesOrder: 10,
        })
    })

    it('selects loading and error states', () => {
        const state = createState()

        expect(selectIsLoadingPackageDetails(state)).toBe(true)
        expect(selectIsFetchingPackingList(state)).toBe(true)
        expect(selectIsUpdatingPacking(state)).toBe(true)
        expect(selectIsRemovingPacking(state)).toBe(true)
        expect(selectPackingError(state)).toBe('Packing error')
    })

    it('returns empty processed list when processedList is undefined', () => {
        const state = {
            packing: {
                ...packingState,
                processedList: undefined,
            },
        } as unknown as RootState

        expect(selectPackingProcessedList(state)).toEqual([])
    })

    it('calculates scanned progress with capped scanned quantity', () => {
        const state = createState({
            ...packingState,
            scannedSKUs: {
                'SKU-A': 10,
                'SKU-B': 1,
            },
        })

        expect(selectScannedProgress(state)).toEqual({
            scanned: 3,
            total: 5,
        })
    })

    it('returns zero scanned progress when activeDetail is null', () => {
        const state = createState({
            ...packingState,
            activeDetail: null,
            scannedSKUs: {},
        })

        expect(selectScannedProgress(state)).toEqual({
            scanned: 0,
            total: 0,
        })
    })

    it('returns SKU statuses', () => {
        const state = createState()

        expect(selectSKUStatus('SKU-A')(state)).toBe('complete')
        expect(selectSKUStatus('SKU-B')(state)).toBe('partial')
        expect(selectSKUStatus('SKU-X')(state)).toBe('pending')

        const pendingState = createState({
            ...packingState,
            scannedSKUs: {},
        })

        expect(selectSKUStatus('SKU-A')(pendingState)).toBe('pending')
    })

    it('returns pending SKU status when activeDetail is null', () => {
        const state = createState({
            ...packingState,
            activeDetail: null,
        })

        expect(selectSKUStatus('SKU-A')(state)).toBe('pending')
    })

    it('selects scanned and required counts by SKU', () => {
        const state = createState()

        expect(selectScannedCountBySKU('SKU-A')(state)).toBe(2)
        expect(selectScannedCountBySKU('SKU-X')(state)).toBe(0)

        expect(selectRequiredCountBySKU('SKU-A')(state)).toBe(2)
        expect(selectRequiredCountBySKU('SKU-X')(state)).toBe(0)
    })

    it('returns required count 0 when activeDetail is null', () => {
        const state = createState({
            ...packingState,
            activeDetail: null,
        })

        expect(selectRequiredCountBySKU('SKU-A')(state)).toBe(0)
    })

    it('checks whether SKU belongs to active detail', () => {
        const state = createState()

        expect(selectIsSKUInActiveDetail('SKU-A')(state)).toBe(true)
        expect(selectIsSKUInActiveDetail('SKU-X')(state)).toBe(false)
    })

    it('returns false for SKU existence when activeDetail is null', () => {
        const state = createState({
            ...packingState,
            activeDetail: null,
        })

        expect(selectIsSKUInActiveDetail('SKU-A')(state)).toBe(false)
    })

    it('selects active detail as nullable value', () => {
        const state = createState()

        expect(selectPackingActiveDetail(state)).toEqual(activeDetail)

        const nullState = createState({
            ...packingState,
            activeDetail: null,
        })

        expect(selectPackingActiveDetail(nullState)).toBeNull()
    })
})
