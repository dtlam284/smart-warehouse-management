import type { ReturnType } from '@/models/return/ReturnInterface'

//#region types
export interface IValidationResult {
    valid: boolean
    error?: string
}

export interface IReturnQuantities {
    goodQty: number
    damagedQty: number
}
//#endregion types

//#region validators
export function validateReturnQuantity(
    type: ReturnType,
    goodQty: number,
    damagedQty: number,
    total: number,
): IValidationResult {
    if (goodQty < 0 || damagedQty < 0) {
        return {
            valid: false,
            error: 'Số lượng không được âm',
        }
    }

    switch (type) {
        case 'FULL_RETURN':
            if (goodQty !== total || damagedQty !== 0) {
                return {
                    valid: false,
                    error: 'Hoàn toàn bộ phải có đủ số lượng đạt bằng tổng',
                }
            }

            return {
                valid: true,
            }

        case 'DEFECTIVE_RETURN':
            if (goodQty !== 0 || damagedQty !== total) {
                return {
                    valid: false,
                    error: 'Hoàn lỗi phải có đủ số lượng lỗi bằng tổng',
                }
            }

            return {
                valid: true,
            }

        case 'PARTIAL_RETURN':
            if (goodQty + damagedQty > total) {
                return {
                    valid: false,
                    error: 'Tổng số lượng không được vượt quá tổng đơn',
                }
            }

            if (goodQty + damagedQty === 0) {
                return {
                    valid: false,
                    error: 'Phải nhập ít nhất một số lượng',
                }
            }

            return {
                valid: true,
            }
    }
}
//#endregion validators

//#region helpers
export function getDefaultQuantities(type: ReturnType, total: number): IReturnQuantities {
    switch (type) {
        case 'FULL_RETURN':
            return {
                goodQty: total,
                damagedQty: 0,
            }

        case 'DEFECTIVE_RETURN':
            return {
                goodQty: 0,
                damagedQty: total,
            }

        case 'PARTIAL_RETURN':
            return {
                goodQty: 0,
                damagedQty: 0,
            }
    }
}
//#endregion helpers
