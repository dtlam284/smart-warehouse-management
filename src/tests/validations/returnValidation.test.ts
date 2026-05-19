import { describe, expect, it } from 'vitest'
import { 
    getDefaultQuantities, 
    validateReturnQuantity 
} from '../../validations/returnValidation'

describe('validateReturnQuantity', () => {
    describe('FULL_RETURN', () => {
        it('valid khi goodQty = total, damagedQty = 0', () => {
            expect(validateReturnQuantity('FULL_RETURN', 5, 0, 5)).toEqual({
                valid: true,
            })
        })

        it('invalid khi goodQty < total', () => {
            expect(validateReturnQuantity('FULL_RETURN', 4, 0, 5).valid).toBe(false)
        })

        it('invalid khi damagedQty > 0', () => {
            expect(validateReturnQuantity('FULL_RETURN', 5, 1, 5).valid).toBe(false)
        })
    })

    describe('DEFECTIVE_RETURN', () => {
        it('valid khi goodQty = 0, damagedQty = total', () => {
            expect(validateReturnQuantity('DEFECTIVE_RETURN', 0, 5, 5)).toEqual({
                valid: true,
            })
        })

        it('invalid khi goodQty > 0', () => {
            expect(validateReturnQuantity('DEFECTIVE_RETURN', 1, 4, 5).valid).toBe(false)
        })
    })

    describe('PARTIAL_RETURN', () => {
        it('valid khi goodQty + damagedQty <= total và > 0', () => {
            expect(validateReturnQuantity('PARTIAL_RETURN', 2, 1, 5)).toEqual({
                valid: true,
            })
        })

        it('invalid khi tổng = 0', () => {
            expect(validateReturnQuantity('PARTIAL_RETURN', 0, 0, 5).valid).toBe(false)
        })

        it('invalid khi tổng > total', () => {
            expect(validateReturnQuantity('PARTIAL_RETURN', 4, 2, 5).valid).toBe(false)
        })

        it('invalid khi có giá trị âm', () => {
            expect(validateReturnQuantity('PARTIAL_RETURN', -1, 1, 5).valid).toBe(false)
            expect(validateReturnQuantity('PARTIAL_RETURN', 1, -1, 5).valid).toBe(false)
        })
    })
})

describe('getDefaultQuantities', () => {
    it('returns full-return defaults', () => {
        expect(getDefaultQuantities('FULL_RETURN', 5)).toEqual({
            goodQty: 5,
            damagedQty: 0,
        })
    })

    it('returns defective-return defaults', () => {
        expect(getDefaultQuantities('DEFECTIVE_RETURN', 5)).toEqual({
            goodQty: 0,
            damagedQty: 5,
        })
    })

    it('returns partial-return defaults', () => {
        expect(getDefaultQuantities('PARTIAL_RETURN', 5)).toEqual({
            goodQty: 0,
            damagedQty: 0,
        })
    })
})
