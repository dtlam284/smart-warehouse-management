import { describe, expect, it } from 'vitest'
import { buildScanPayload } from '../../../models/common/CommonInterface'

describe('buildScanPayload', () => {
    it('DELIVERYCODE → { DeliveryCode, Type }', () => {
        expect(buildScanPayload('DLV001', 'DELIVERYCODE')).toEqual({
            DeliveryCode: 'DLV001',
            Type: 'DELIVERYCODE',
        })
    })

    it('PACKAGECODE → { PackageCode, Type }', () => {
        expect(buildScanPayload('PKG001', 'PACKAGECODE')).toEqual({
            PackageCode: 'PKG001',
            Type: 'PACKAGECODE',
        })
    })

    it('ORDERCODEREF → { OrderCodeRef, Type }', () => {
        expect(buildScanPayload('REF001', 'ORDERCODEREF')).toEqual({
            OrderCodeRef: 'REF001',
            Type: 'ORDERCODEREF',
        })
    })

    it('ORDERCODE → { OrderCode, Type }', () => {
        expect(buildScanPayload('ORD001', 'ORDERCODE')).toEqual({
            OrderCode: 'ORD001',
            Type: 'ORDERCODE',
        })
    })
})
