import * as React from 'react'
import { Button, Modal, Spinner } from '@/components/ui'
import { ScannerInput } from '@/components/scanner/ScannerInput'
import { warehouseService } from '@/services/warehouse/warehouseService'
import { useAppDispatch } from '@/store'
import { showNotification } from '@/store/slices/notificationSlice'
import type { IWarehouseContainer } from '@/models/warehouse/WarehouseInterface'

//#region types
export interface IReturnContainerValue {
    ContainerId: number
    ContainerCode: string
    WarehouseItemId: string
    WareHouseItemId: string
    Container: IWarehouseContainer
}

interface IContainerPickerModalProps {
    open: boolean
    loading?: boolean
    onClose: () => void
    onConfirm: (container: IReturnContainerValue) => void
}
//#endregion types

//#region helpers
function getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'string' && error.trim().length > 0) {
        return error
    }

    if (error instanceof Error && error.message.trim().length > 0) {
        return error.message
    }

    return fallback
}

function getWarehouseItemId(container: IWarehouseContainer): string {
    return container.WarehouseItemId?.trim() || container.WareHouseItemId?.trim() || ''
}

function normalizeContainerForReturn(container: IWarehouseContainer): IWarehouseContainer {
    const warehouseItemId = getWarehouseItemId(container)

    return {
        ...container,
        WarehouseItemId: warehouseItemId || null,
        WareHouseItemId: warehouseItemId || null,
        WarehouseItemLayoutId:
            container.WarehouseItemLayoutId ?? container.WareHouseItemLayoutId ?? null,
        WareHouseItemLayoutId:
            container.WareHouseItemLayoutId ?? container.WarehouseItemLayoutId ?? null,
        WarehouseItemLayoutCode:
            container.WarehouseItemLayoutCode ?? container.WareHouseItemLayoutCode ?? null,
        WareHouseItemLayoutCode:
            container.WareHouseItemLayoutCode ?? container.WarehouseItemLayoutCode ?? null,
        WarehouseItemLayoutPath:
            container.WarehouseItemLayoutPath ?? container.WareHouseItemLayoutPath ?? null,
        WareHouseItemLayoutPath:
            container.WareHouseItemLayoutPath ?? container.WarehouseItemLayoutPath ?? null,
    }
}
//#endregion helpers

//#region component
export function ContainerPickerModal({
    open,
    loading = false,
    onClose,
    onConfirm,
}: IContainerPickerModalProps) {
    const dispatch = useAppDispatch()

    const [containerCode, setContainerCode] = React.useState('')
    const [container, setContainer] = React.useState<IWarehouseContainer | null>(null)
    const [isLookingUp, setIsLookingUp] = React.useState(false)

    const warehouseItemId = container ? getWarehouseItemId(container) : ''
    const isBusy = loading || isLookingUp
    const canConfirm = Boolean(container && container.Id > 0 && warehouseItemId) && !isBusy

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

    const resetState = React.useCallback(() => {
        setContainerCode('')
        setContainer(null)
        setIsLookingUp(false)
    }, [])

    React.useEffect(() => {
        if (open) {
            return
        }

        resetState()
    }, [open, resetState])

    const lookupContainer = async (code: string) => {
        const normalizedCode = code.trim().toUpperCase()

        if (!normalizedCode) {
            notifyWarning('Vui lòng quét barcode container')
            return
        }

        setContainerCode(normalizedCode)
        setContainer(null)
        setIsLookingUp(true)

        try {
            const nextContainer = await warehouseService.getContainerByCode(normalizedCode)
            const normalizedContainer = normalizeContainerForReturn(nextContainer)
            const nextWarehouseItemId = getWarehouseItemId(normalizedContainer)

            if (!nextWarehouseItemId) {
                notifyError('Container không có WareHouseItemId, không thể xác nhận hàng hoàn')
                return
            }

            setContainer(normalizedContainer)
            setContainerCode(normalizedContainer.Code || normalizedCode)
        } catch (lookupError) {
            notifyError(getErrorMessage(lookupError, 'Không tìm thấy thông tin thùng chứa'))
        } finally {
            setIsLookingUp(false)
        }
    }

    const handleContainerScan = (code: string) => {
        void lookupContainer(code)
    }

    const handleConfirm = () => {
        if (!canConfirm || !container) {
            notifyWarning('Vui lòng quét đơn vị chứa hợp lệ trước khi xác nhận')
            return
        }

        const normalizedContainer = normalizeContainerForReturn(container)
        const normalizedWarehouseItemId = getWarehouseItemId(normalizedContainer)

        onConfirm({
            ContainerId: normalizedContainer.Id,
            ContainerCode: normalizedContainer.Code,
            WarehouseItemId: normalizedWarehouseItemId,
            WareHouseItemId: normalizedWarehouseItemId,
            Container: normalizedContainer,
        })
    }

    const handleClose = () => {
        if (isBusy) {
            return
        }

        resetState()
        onClose()
    }

    //#region render
    return (
        <Modal
            open={open}
            onClose={handleClose}
            title="Quét đơn vị chứa"
            description="Kho đang vận hành có layout, cần quét container trước khi xác nhận hàng hoàn."
            footer={
                <div className="grid w-full gap-3 sm:grid-cols-[1fr_150px]">
                    <Button
                        className="min-w-0"
                        variant="secondary"
                        disabled={isBusy}
                        onClick={handleClose}
                    >
                        Hủy
                    </Button>

                    <Button
                        className="min-w-0"
                        loading={loading}
                        disabled={!canConfirm}
                        onClick={handleConfirm}
                    >
                        Xác nhận
                    </Button>
                </div>
            }
        >
            <div className="space-y-5">
                <div>
                    <label className="mb-2 block text-base font-black text-slate-700">
                        Barcode container
                    </label>

                    <ScannerInput
                        autoFocus
                        disabled={isBusy}
                        placeholder="Quét barcode container..."
                        onScan={handleContainerScan}
                    />

                    {containerCode ? (
                        <p className="mt-2 text-base font-semibold text-slate-500">
                            Đã quét:{' '}
                            <span className="font-mono font-black text-purple-700">
                                {containerCode}
                            </span>
                        </p>
                    ) : null}
                </div>

                {isLookingUp ? (
                    <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-base font-bold text-blue-700">
                        <Spinner size="sm" />
                        Đang kiểm tra thông tin đơn vị chứa...
                    </div>
                ) : null}

                {container ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-base">
                        <div className="mb-3 font-black text-emerald-700">
                            Đã tìm thấy đơn vị chứa
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <div className="text-sm font-black uppercase text-emerald-500">
                                    Mã
                                </div>
                                <div className="font-mono font-black text-emerald-900">
                                    {container.Code}
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-black uppercase text-emerald-500">
                                    ID
                                </div>
                                <div className="font-black text-emerald-900">
                                    {container.Id}
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-black uppercase text-emerald-500">
                                    WareHouseItemId
                                </div>
                                <div className="break-all font-mono text-sm font-black text-emerald-900">
                                    {getWarehouseItemId(container) || '-'}
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-black uppercase text-emerald-500">
                                    Trạng thái
                                </div>
                                <div className="font-black text-emerald-900">
                                    {container.Status || '-'}
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-black uppercase text-emerald-500">
                                    Phân loại
                                </div>
                                <div className="font-black text-emerald-900">
                                    {container.Type || '-'}
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-black uppercase text-emerald-500">
                                    Usage
                                </div>
                                <div className="font-black text-emerald-900">
                                    {container.Usage || '-'}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </Modal>
    )
    //#endregion render
}
//#endregion component
