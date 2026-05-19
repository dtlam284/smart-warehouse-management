import * as React from 'react'
import { Button, ErrorMessage, Spinner } from '@/components/ui'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    selectActiveReturn,
    selectActiveReturnScanPayload,
    selectIsConfirmingReturn,
    selectIsLoadingReturnDetail,
    selectReturnError,
    selectReturnFilters,
} from '@/store/selectors/returnSelectors'
import { selectWarehouseHasLayout } from '@/store/selectors/warehouseSelectors'
import {
    clearActiveReturn,
    clearReturnError,
    confirmReturn,
    confirmReturnNoLayout,
    fetchReturnList,
    loadReturnStats,
} from '@/store/slices/returnSlice'
import { showNotification } from '@/store/slices/notificationSlice'
import { getDefaultQuantities, validateReturnQuantity } from '@/validations/returnValidation'
import { ContainerPickerModal, type IReturnContainerValue } from './ContainerPickerModal'
import { ReturnEmptyPanel } from './ReturnEmptyPanel'
import { ReturnItemRow } from './ReturnItemRow'
import { ReturnTypeSelector } from './ReturnTypeSelector'
import type { IConfirmReturnRequest, IGetReturnDetailRequest } from '@/models/return/ReturnDTO'
import type { IReturnDetail, IReturnProduct, ReturnType } from '@/models/return/ReturnInterface'

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
    error: string | null
}
//#endregion types

//#region helpers
function getItemKey(item: IReturnProduct): string {
    return item.GroupServiceId || item.GroupServiceCode
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
//#endregion helpers

//#region form
function ReturnForm({
    activeReturn,
    activeScanPayload,
    hasLayout,
    isConfirming,
    error,
}: IReturnFormProps) {
    const dispatch = useAppDispatch()
    const returnFilters = useAppSelector(selectReturnFilters)

    const [returnType, setReturnType] = React.useState<ReturnType | null>(null)
    const [quantities, setQuantities] = React.useState<ReturnQuantityMap>(() =>
        buildInitialQuantities(activeReturn),
    )
    const [validationErrors, setValidationErrors] = React.useState<ReturnValidationMap>({})
    const [formError, setFormError] = React.useState<string | null>('Vui lòng chọn loại hoàn trả')
    const [containerModalOpen, setContainerModalOpen] = React.useState(false)
    const [pendingRequest, setPendingRequest] = React.useState<IConfirmReturnRequest | null>(null)

    const refreshReturnOverview = React.useCallback(() => {
        void dispatch(
            fetchReturnList({
                PageIndex: 1,
                PageSize: returnFilters.PageSize ?? 10,
                ShippingUnitId: activeReturn.ShippingUnitId || undefined,
            }),
        )

        void dispatch(loadReturnStats({}))
    }, [activeReturn.ShippingUnitId, dispatch, returnFilters.PageSize])

    const handleReturnSuccess = React.useCallback(() => {
        setContainerModalOpen(false)
        setPendingRequest(null)
        setValidationErrors({})
        setFormError(null)

        dispatch(
            showNotification({
                type: 'success',
                message: `Xác nhận hoàn ${activeReturn.OrderCode || activeReturn.DeliveryCode} thành công`,
            }),
        )

        refreshReturnOverview()
    }, [activeReturn.DeliveryCode, activeReturn.OrderCode, dispatch, refreshReturnOverview])

    const handleReturnFailure = React.useCallback(
        (errorValue: unknown) => {
            dispatch(
                showNotification({
                    type: 'error',
                    message: getErrorMessage(errorValue, 'Không thể xác nhận hàng hoàn'),
                }),
            )
        },
        [dispatch],
    )

    const handleReturnTypeChange = (nextType: ReturnType) => {
        setReturnType(nextType)
        setQuantities(applyReturnTypeQuantities(activeReturn, nextType))
        setValidationErrors({})
        setFormError(null)
    }

    const updateItemQuantity = (
        item: IReturnProduct,
        field: keyof IReturnQuantityDraft,
        value: number,
    ) => {
        const key = getItemKey(item)

        setQuantities((current) => ({
            ...current,
            [key]: {
                ...(current[key] ?? { goodQty: 0, damagedQty: 0 }),
                [field]: value,
            },
        }))

        setValidationErrors((current) => {
            if (!current[key]) {
                return current
            }

            const nextErrors = { ...current }
            delete nextErrors[key]

            return nextErrors
        })

        if (formError) {
            setFormError(null)
        }
    }

    const handleSubmit = () => {
        const validation = validateReturnForm(activeReturn, returnType, quantities)

        setValidationErrors(validation.errors)
        setFormError(validation.formError)

        if (!validation.valid || !returnType) {
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
            .then(handleReturnSuccess)
            .catch(handleReturnFailure)
    }

    const handleContainerConfirm = (container: IReturnContainerValue) => {
        if (!pendingRequest) {
            return
        }

        void dispatch(
            confirmReturn({
                ...pendingRequest,
                ContainerId: container.ContainerId,
                ContainerCode: container.ContainerCode,
                Container: container.Container,
            }),
        )
            .unwrap()
            .then(handleReturnSuccess)
            .catch(handleReturnFailure)
    }

    return (
        <>
            <div className="space-y-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="grid gap-2 text-sm md:grid-cols-2 xl:grid-cols-4">
                        <div>
                            <div className="text-xs font-semibold uppercase text-slate-400">
                                Mã đơn
                            </div>
                            <div className="font-mono font-semibold text-blue-700">
                                {activeReturn.OrderCode || '-'}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs font-semibold uppercase text-slate-400">
                                Mã kiện
                            </div>
                            <div className="font-mono font-semibold text-purple-700">
                                {activeReturn.DeliveryCode || '-'}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs font-semibold uppercase text-slate-400">
                                Khách hàng
                            </div>
                            <div className="font-semibold text-slate-700">
                                {activeReturn.CustomerName || '-'}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs font-semibold uppercase text-slate-400">
                                Đơn vị VC
                            </div>
                            <div className="font-semibold text-slate-700">
                                {activeReturn.ShippingUnitName || '-'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Loại hoàn trả
                    </h3>

                    <ReturnTypeSelector value={returnType} onChange={handleReturnTypeChange} />
                </div>

                <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Số lượng từng SKU
                    </h3>

                    <div className="space-y-2">
                        {activeReturn.ListItem.map((item) => {
                            const key = getItemKey(item)
                            const quantity = quantities[key] ?? {
                                goodQty: 0,
                                damagedQty: 0,
                            }

                            return (
                                <ReturnItemRow
                                    key={key}
                                    item={item}
                                    goodQty={quantity.goodQty}
                                    damagedQty={quantity.damagedQty}
                                    error={validationErrors[key]}
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

                <ErrorMessage message={formError || error} />

                <div className="flex gap-2">
                    <Button
                        className="w-full"
                        loading={isConfirming}
                        disabled={isConfirming}
                        onClick={handleSubmit}
                    >
                        ✓ Xác nhận hoàn trả
                    </Button>

                    <Button
                        variant="secondary"
                        disabled={isConfirming}
                        onClick={() => dispatch(clearActiveReturn())}
                    >
                        Bỏ qua
                    </Button>
                </div>

                <p className="text-center text-xs text-slate-400">
                    {hasLayout
                        ? 'Kho có layout: cần quét đơn vị chứa trước khi xác nhận.'
                        : 'Kho không có layout: xác nhận trực tiếp, không cần container.'}
                </p>
            </div>

            <ContainerPickerModal
                open={containerModalOpen}
                loading={isConfirming}
                onClose={() => {
                    if (!isConfirming) {
                        setContainerModalOpen(false)
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
    const dispatch = useAppDispatch()

    const activeReturn = useAppSelector(selectActiveReturn)
    const activeScanPayload = useAppSelector(selectActiveReturnScanPayload)
    const isLoadingDetail = useAppSelector(selectIsLoadingReturnDetail)
    const isConfirming = useAppSelector(selectIsConfirmingReturn)
    const error = useAppSelector(selectReturnError)
    const hasLayout = useAppSelector(selectWarehouseHasLayout)

    React.useEffect(() => {
        if (!error) {
            return
        }

        const timeoutId = window.setTimeout(() => {
            dispatch(clearReturnError())
        }, 3500)

        return () => window.clearTimeout(timeoutId)
    }, [dispatch, error])

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Đơn / Kiện hoàn trả
                </h2>

                <span className="rounded bg-purple-50 px-2 py-1 font-mono text-xs font-semibold text-purple-700">
                    RETURN
                </span>
            </div>

            {isLoadingDetail ? (
                <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
                    <Spinner size="sm" />
                    Đang tải thông tin đơn hoàn...
                </div>
            ) : null}

            {!isLoadingDetail && !activeReturn ? <ReturnEmptyPanel /> : null}

            {!isLoadingDetail && activeReturn ? (
                <ReturnForm
                    key={`${activeScanPayload?.Type ?? 'RETURN'}-${
                        activeScanPayload?.DeliveryCode ??
                        activeScanPayload?.OrderCode ??
                        activeScanPayload?.OrderCodeRef ??
                        activeScanPayload?.PackageCode ??
                        activeReturn.OrderCode
                    }`}
                    activeReturn={activeReturn}
                    activeScanPayload={activeScanPayload}
                    hasLayout={hasLayout}
                    isConfirming={isConfirming}
                    error={error}
                />
            ) : null}
        </section>
    )
}
//#endregion component
