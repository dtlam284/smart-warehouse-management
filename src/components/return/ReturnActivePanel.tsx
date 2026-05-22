import * as React from 'react'
import { Button, Spinner } from '@/components/ui'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    selectActiveReturn,
    selectActiveReturnScanPayload,
    selectIsConfirmingReturn,
    selectIsLoadingReturnDetail,
} from '@/store/selectors/returnSelectors'
import { selectWarehouseHasLayout } from '@/store/selectors/warehouseSelectors'
import {
    clearActiveReturn,
    confirmReturn,
    confirmReturnNoLayout,
} from '@/store/slices/returnSlice'
import { showNotification } from '@/store/slices/notificationSlice'
import { getDefaultQuantities, validateReturnQuantity } from '@/validations/returnValidation'
import { ContainerPickerModal, IReturnContainerValue } from './ContainerPickerModal'
import { ReturnEmptyPanel } from './ReturnEmptyPanel'
import { ReturnTypeSelector } from './ReturnTypeSelector'
import type {
    IConfirmReturnRequest,
    IGetReturnDetailRequest,
} from '@/models/return/ReturnDTO'
import type {
    IReturnDetail,
    IReturnProduct,
    ReturnType,
} from '@/models/return/ReturnInterface'

//#region types
interface IReturnQuantityDraft {
    goodQty: number
    damagedQty: number
}

type ReturnQuantityMap = Record<string, IReturnQuantityDraft>
type ReturnValidationMap = Record<string, string>

interface IReturnFormProps {
    activeReturn: IReturnDetail
    activeScanPayload: IGetReturnDetailRequest | null
    hasLayout: boolean
    isConfirming: boolean
}

type QuantityField = keyof IReturnQuantityDraft
//#endregion types

//#region helpers
function getItemKey(item: IReturnProduct): string {
    return item.GroupServiceId || item.GroupServiceCode
}

function toSafeQuantity(value: number): number {
    if (!Number.isFinite(value)) {
        return 0
    }

    return Math.max(0, Math.trunc(value))
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'string' && error.trim().length > 0) {
        return error
    }

    if (error instanceof Error && error.message.trim().length > 0) {
        return error.message
    }

    return fallback
}

function isOrderAlreadyProcessedMessage(message: string): boolean {
    const normalizedMessage = message.trim().toLowerCase()

    return (
        normalizedMessage.includes('đơn hàng đã xử lý') ||
        normalizedMessage.includes('không thể thay đổi') ||
        normalizedMessage.includes('order has been processed') ||
        normalizedMessage.includes('cannot be changed')
    )
}

function buildInitialQuantities(activeReturn: IReturnDetail): ReturnQuantityMap {
    return activeReturn.ListItem.reduce<ReturnQuantityMap>((result, item) => {
        result[getItemKey(item)] = {
            goodQty: 0,
            damagedQty: 0,
        }

        return result
    }, {})
}

function applyReturnTypeQuantities(
    activeReturn: IReturnDetail,
    type: ReturnType,
): ReturnQuantityMap {
    return activeReturn.ListItem.reduce<ReturnQuantityMap>((result, item) => {
        result[getItemKey(item)] = getDefaultQuantities(type, item.TotalQuantity)

        return result
    }, {})
}

function getFallbackScanPayload(activeReturn: IReturnDetail): IGetReturnDetailRequest {
    if (activeReturn.DeliveryCode?.trim()) {
        return {
            DeliveryCode: activeReturn.DeliveryCode,
            Type: 'DELIVERYCODE',
            ShippingUnitId: activeReturn.ShippingUnitId,
        }
    }

    return {
        OrderCode: activeReturn.OrderCode,
        Type: 'ORDERCODE',
        ShippingUnitId: activeReturn.ShippingUnitId,
    }
}

function buildReturnRequest(
    activeReturn: IReturnDetail,
    activeScanPayload: IGetReturnDetailRequest | null,
    returnType: ReturnType,
    quantities: ReturnQuantityMap,
): IConfirmReturnRequest {
    const scanPayload = activeScanPayload ?? getFallbackScanPayload(activeReturn)

    return {
        DeliveryCode: scanPayload.DeliveryCode,
        OrderCode: scanPayload.OrderCode,
        OrderCodeRef: scanPayload.OrderCodeRef,
        PackageCode: scanPayload.PackageCode,
        Type: scanPayload.Type,
        ShippingUnitId: scanPayload.ShippingUnitId || activeReturn.ShippingUnitId,
        ReturnType: returnType,
        ListItems: activeReturn.ListItem.map((item) => {
            const quantity = quantities[getItemKey(item)] ?? {
                goodQty: 0,
                damagedQty: 0,
            }

            return {
                GroupServiceId: item.GroupServiceId,
                Quantity: quantity.goodQty,
                DamagedQuantity: quantity.damagedQty,
            }
        }),
    }
}

function validateReturnForm(
    activeReturn: IReturnDetail,
    returnType: ReturnType | null,
    quantities: ReturnQuantityMap,
): {
    valid: boolean
    errors: ReturnValidationMap
    formError: string | null
} {
    if (!returnType) {
        return {
            valid: false,
            errors: {},
            formError: 'Vui lòng chọn loại hoàn trả',
        }
    }

    const errors: ReturnValidationMap = {}

    for (const item of activeReturn.ListItem) {
        const key = getItemKey(item)
        const quantity = quantities[key] ?? {
            goodQty: 0,
            damagedQty: 0,
        }

        const totalHandled = quantity.goodQty + quantity.damagedQty

        if (totalHandled !== item.TotalQuantity) {
            errors[key] = `${item.GroupServiceName}: Tổng số lượng đạt và lỗi phải bằng ${item.TotalQuantity}`
            continue
        }

        const result = validateReturnQuantity(
            returnType,
            quantity.goodQty,
            quantity.damagedQty,
            item.TotalQuantity,
        )

        if (!result.valid) {
            errors[key] = `${item.GroupServiceName}: ${result.error}`
        }
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
        formError: null,
    }
}

function shouldLockQuantityByReturnType(returnType: ReturnType | null): boolean {
    return returnType === 'FULL_RETURN' || returnType === 'DEFECTIVE_RETURN'
}
//#endregion helpers

//#region quantity controls
function QuantityStepper({
    label,
    value,
    disabled,
    canDecrease,
    canIncrease,
    onChange,
}: {
    label: string
    value: number
    disabled: boolean
    canDecrease: boolean
    canIncrease: boolean
    onChange: (value: number) => void
}) {
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(toSafeQuantity(Number(event.target.value)))
    }

    return (
        <div className="space-y-2">
            <div className="text-sm font-black text-slate-800">{label}</div>

            <div className="grid min-w-[150px] grid-cols-[44px_1fr_44px] overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
                <button
                    type="button"
                    disabled={disabled || !canDecrease}
                    onClick={() => onChange(value - 1)}
                    className="flex h-12 items-center justify-center border-r border-slate-200 text-xl font-black text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                >
                    −
                </button>

                <input
                    type="number"
                    min={0}
                    value={value}
                    disabled={disabled}
                    onChange={handleInputChange}
                    className="h-12 min-w-0 border-0 bg-white text-center text-xl font-black text-slate-900 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                />

                <button
                    type="button"
                    disabled={disabled || !canIncrease}
                    onClick={() => onChange(value + 1)}
                    className="flex h-12 items-center justify-center border-l border-slate-200 text-xl font-black text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                >
                    +
                </button>
            </div>
        </div>
    )
}

function ReturnQuantityRow({
    item,
    returnType,
    goodQty,
    damagedQty,
    disabled,
    onGoodQtyChange,
    onDamagedQtyChange,
}: {
    item: IReturnProduct
    returnType: ReturnType | null
    goodQty: number
    damagedQty: number
    disabled: boolean
    onGoodQtyChange: (value: number) => void
    onDamagedQtyChange: (value: number) => void
}) {
    const total = item.TotalQuantity
    const totalHandled = goodQty + damagedQty
    const isLockedByType = shouldLockQuantityByReturnType(returnType)
    const isControlDisabled = disabled || isLockedByType || !returnType

    const canIncreaseGood = goodQty + damagedQty < total
    const canIncreaseDamaged = goodQty + damagedQty < total

    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(280px,1fr)_520px] xl:items-start">
                <div className="min-w-0 space-y-2">
                    <div className="text-lg font-black leading-6 text-slate-900">
                        {item.GroupServiceName}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm font-bold text-blue-700">
                        <span>{item.GroupServiceCode}</span>
                        <span className="text-slate-400">·</span>
                        <span>
                            Đã xử lý: {totalHandled}/{total}
                        </span>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-2">
                        <div className="text-sm font-black text-slate-800">Tổng</div>

                        <div className="flex h-12 min-w-[150px] items-center rounded-xl border border-slate-300 bg-white px-4 shadow-sm">
                            <span className="text-xl font-black text-slate-900">{total}</span>
                        </div>
                    </div>

                    <QuantityStepper
                        label="Đạt"
                        value={goodQty}
                        disabled={isControlDisabled}
                        canDecrease={goodQty > 0}
                        canIncrease={canIncreaseGood}
                        onChange={onGoodQtyChange}
                    />

                    <QuantityStepper
                        label="Lỗi"
                        value={damagedQty}
                        disabled={isControlDisabled}
                        canDecrease={damagedQty > 0}
                        canIncrease={canIncreaseDamaged}
                        onChange={onDamagedQtyChange}
                    />
                </div>
            </div>
        </div>
    )
}
//#endregion quantity controls

//#region form
function ReturnForm({
    activeReturn,
    activeScanPayload,
    hasLayout,
    isConfirming,
}: IReturnFormProps) {
    const dispatch = useAppDispatch()

    const [returnType, setReturnType] = React.useState<ReturnType | null>(null)
    const [quantities, setQuantities] = React.useState<ReturnQuantityMap>(() =>
        buildInitialQuantities(activeReturn),
    )
    const [containerModalOpen, setContainerModalOpen] = React.useState(false)
    const [pendingRequest, setPendingRequest] = React.useState<IConfirmReturnRequest | null>(null)

    const notifyWarning = React.useCallback(
        (message: string) => {
            dispatch(
                showNotification({
                    type: 'warning',
                    message,
                }),
            )
        },
        [dispatch],
    )

    const notifyError = React.useCallback(
        (message: string) => {
            dispatch(
                showNotification({
                    type: 'error',
                    message,
                }),
            )
        },
        [dispatch],
    )

    const notifySuccess = React.useCallback(
        (message: string) => {
            dispatch(
                showNotification({
                    type: 'success',
                    message,
                }),
            )
        },
        [dispatch],
    )

    const handleReturnTypeChange = (nextType: ReturnType) => {
        setReturnType(nextType)
        setQuantities(applyReturnTypeQuantities(activeReturn, nextType))
    }

    const updateItemQuantity = (
        item: IReturnProduct,
        field: QuantityField,
        value: number,
    ) => {
        const key = getItemKey(item)

        setQuantities((current) => {
            const currentQuantity = current[key] ?? {
                goodQty: 0,
                damagedQty: 0,
            }

            const nextValue = toSafeQuantity(value)
            const otherField: QuantityField = field === 'goodQty' ? 'damagedQty' : 'goodQty'
            const otherValue = currentQuantity[otherField]
            const maxAllowedValue = Math.max(0, item.TotalQuantity - otherValue)
            const guardedValue = Math.min(nextValue, maxAllowedValue)

            return {
                ...current,
                [key]: {
                    ...currentQuantity,
                    [field]: guardedValue,
                },
            }
        })
    }

    const handleSubmit = () => {
        const validation = validateReturnForm(activeReturn, returnType, quantities)

        if (!validation.valid || !returnType) {
            const firstItemError = Object.values(validation.errors)[0]
            const message = validation.formError || firstItemError || 'Thông tin hoàn trả chưa hợp lệ'

            notifyWarning(message)
            return
        }

        const request = buildReturnRequest(
            activeReturn,
            activeScanPayload,
            returnType,
            quantities,
        )

        if (hasLayout) {
            setPendingRequest(request)
            setContainerModalOpen(true)
            return
        }

        void dispatch(confirmReturnNoLayout(request))
            .unwrap()
            .then(() => {
                notifySuccess('Xác nhận hoàn trả thành công')
                dispatch(clearActiveReturn())
            })
            .catch((error) => {
                notifyError(getErrorMessage(error, 'Không thể xác nhận hoàn trả'))
            })
    }

    const handleContainerConfirm = async (container: IReturnContainerValue) => {
        if (!pendingRequest) {
            notifyError('Không tìm thấy yêu cầu hoàn trả đang chờ xử lý')
            return
        }

        try {
            await dispatch(
                confirmReturn({
                    ...pendingRequest,
                    ContainerId: container.ContainerId,
                    ContainerCode: container.ContainerCode,
                    WarehouseItemId: container.WarehouseItemId,
                    WareHouseItemId: container.WareHouseItemId,
                    Container: container.Container,
                }),
            ).unwrap()

            notifySuccess('Xác nhận hoàn trả thành công')
            setContainerModalOpen(false)
            setPendingRequest(null)
            dispatch(clearActiveReturn())
        } catch (error) {
            const message = getErrorMessage(error, 'Không thể xác nhận hoàn trả')

            notifyError(message)

            if (isOrderAlreadyProcessedMessage(message)) {
                setContainerModalOpen(false)
                setPendingRequest(null)
            }
        }
    }

    return (
        <>
            <div className="space-y-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <div className="grid gap-4 text-base md:grid-cols-2 xl:grid-cols-4">
                        <div>
                            <div className="text-sm font-black uppercase text-slate-400">
                                Mã đơn
                            </div>
                            <div className="font-mono text-base font-black text-blue-700">
                                {activeReturn.OrderCode || '-'}
                            </div>
                        </div>

                        <div>
                            <div className="text-sm font-black uppercase text-slate-400">
                                Mã kiện
                            </div>
                            <div className="font-mono text-base font-black text-purple-700">
                                {activeReturn.DeliveryCode || '-'}
                            </div>
                        </div>

                        <div>
                            <div className="text-sm font-black uppercase text-slate-400">
                                Khách hàng
                            </div>
                            <div className="text-base font-black text-slate-700">
                                {activeReturn.CustomerName || '-'}
                            </div>
                        </div>

                        <div>
                            <div className="text-sm font-black uppercase text-slate-400">
                                Đơn vị VC
                            </div>
                            <div className="text-base font-black text-slate-700">
                                {activeReturn.ShippingUnitName || '-'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
                        Loại hoàn trả
                    </h3>

                    <ReturnTypeSelector value={returnType} onChange={handleReturnTypeChange} />
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
                        Số lượng
                    </h3>

                    <div className="space-y-3">
                        {activeReturn.ListItem.map((item) => {
                            const key = getItemKey(item)
                            const quantity = quantities[key] ?? {
                                goodQty: 0,
                                damagedQty: 0,
                            }

                            return (
                                <ReturnQuantityRow
                                    key={key}
                                    item={item}
                                    returnType={returnType}
                                    goodQty={quantity.goodQty}
                                    damagedQty={quantity.damagedQty}
                                    disabled={isConfirming}
                                    onGoodQtyChange={(value) =>
                                        updateItemQuantity(item, 'goodQty', value)
                                    }
                                    onDamagedQtyChange={(value) =>
                                        updateItemQuantity(item, 'damagedQty', value)
                                    }
                                />
                            )
                        })}
                    </div>
                </div>

                <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_140px]">
                    <Button
                        className="min-w-0"
                        loading={isConfirming}
                        disabled={isConfirming}
                        onClick={handleSubmit}
                    >
                        Xác nhận hoàn trả
                    </Button>

                    <Button
                        className="min-w-0"
                        variant="secondary"
                        disabled={isConfirming}
                        onClick={() => dispatch(clearActiveReturn())}
                    >
                        Bỏ qua
                    </Button>
                </div>
            </div>

            <ContainerPickerModal
                open={containerModalOpen}
                loading={isConfirming}
                onClose={() => {
                    if (!isConfirming) {
                        setContainerModalOpen(false)
                        setPendingRequest(null)
                    }
                }}
                onConfirm={handleContainerConfirm}
            />
        </>
    )
}
//#endregion form

//#region component
export function ReturnActivePanel() {
    const activeReturn = useAppSelector(selectActiveReturn)
    const activeScanPayload = useAppSelector(selectActiveReturnScanPayload)
    const isLoading = useAppSelector(selectIsLoadingReturnDetail)
    const isConfirming = useAppSelector(selectIsConfirmingReturn)
    const hasLayout = useAppSelector(selectWarehouseHasLayout)

    if (isLoading) {
        return (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex min-h-[220px] items-center justify-center">
                    <Spinner />
                </div>
            </section>
        )
    }

    if (!activeReturn) {
        return <ReturnEmptyPanel />
    }

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">
                    Đơn hàng hoàn trả
                </h2>

                <span className="rounded-md bg-purple-50 px-3 py-1 text-xs font-black uppercase text-purple-700">
                    HOÀN TRẢ
                </span>
            </div>

            <ReturnForm
                activeReturn={activeReturn}
                activeScanPayload={activeScanPayload}
                hasLayout={hasLayout}
                isConfirming={isConfirming}
            />
        </section>
    )
}
//#endregion component
