import * as React from 'react'
import { Button, ErrorMessage, Modal, Spinner } from '@/components/ui'
import { ScannerInput } from '@/components/scanner/ScannerInput'
import { warehouseService } from '@/services/warehouse/warehouseService'
import type { IWarehouseContainer } from '@/models/warehouse/WarehouseInterface'

//#region types
export interface IReturnContainerValue {
    ContainerId: number
    ContainerCode: string
    Container: IWarehouseContainer
}

interface IContainerPickerModalProps {
    open: boolean
    loading?: boolean
    onClose: () => void
    onConfirm: (container: IReturnContainerValue) => void
}
//#endregion types

//#region component
export function ContainerPickerModal({
    open,
    loading = false,
    onClose,
    onConfirm,
}: IContainerPickerModalProps) {
    const [containerCode, setContainerCode] = React.useState('')
    const [container, setContainer] = React.useState<IWarehouseContainer | null>(null)
    const [isLookingUp, setIsLookingUp] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const isBusy = loading || isLookingUp
    const canConfirm = Boolean(container && container.Id > 0 && container.Code.trim()) && !isBusy

    const resetState = () => {
        setContainerCode('')
        setContainer(null)
        setError(null)
        setIsLookingUp(false)
    }

    const lookupContainer = async (code: string) => {
        const normalizedCode = code.trim().toUpperCase()

        if (!normalizedCode) {
            setError('Vui lòng quét barcode container')
            return
        }

        setContainerCode(normalizedCode)
        setContainer(null)
        setError(null)
        setIsLookingUp(true)

        try {
            const nextContainer = await warehouseService.getContainerByCode(normalizedCode)

            setContainer(nextContainer)
            setContainerCode(nextContainer.Code || normalizedCode)
        } catch (lookupError) {
            const message =
                lookupError instanceof Error && lookupError.message.trim().length > 0
                    ? lookupError.message
                    : 'Không tìm thấy thông tin thùng chứa'

            setError(message)
        } finally {
            setIsLookingUp(false)
        }
    }

    const handleContainerScan = (code: string) => {
        void lookupContainer(code)
    }

    const handleConfirm = () => {
        if (!canConfirm || !container) {
            return
        }

        onConfirm({
            ContainerId: container.Id,
            ContainerCode: container.Code,
            Container: container,
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
                <div className="flex w-full justify-end gap-2">
                    <Button variant="secondary" disabled={isBusy} onClick={handleClose}>
                        Hủy
                    </Button>

                    <Button loading={loading} disabled={!canConfirm} onClick={handleConfirm}>
                        Xác nhận
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Barcode container
                    </label>

                    <ScannerInput
                        autoFocus
                        disabled={isBusy}
                        placeholder="Quét barcode container..."
                        onScan={handleContainerScan}
                    />

                    {containerCode ? (
                        <p className="mt-2 text-xs text-slate-500">
                            Đã quét:{' '}
                            <span className="font-mono font-semibold text-purple-700">
                                {containerCode}
                            </span>
                        </p>
                    ) : null}
                </div>

                {isLookingUp ? (
                    <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                        <Spinner size="sm" />
                        Đang kiểm tra thông tin đơn vị chứa...
                    </div>
                ) : null}

                {container ? (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
                        <div className="mb-2 font-semibold text-emerald-700">
                            Đã tìm thấy đơn vị chứa
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                            <div>
                                <div className="text-xs font-semibold uppercase text-emerald-500">
                                    Mã
                                </div>
                                <div className="font-mono font-semibold text-emerald-900">
                                    {container.Code}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold uppercase text-emerald-500">
                                    ID
                                </div>
                                <div className="font-semibold text-emerald-900">
                                    {container.Id}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold uppercase text-emerald-500">
                                    Phân loại
                                </div>
                                <div className="font-semibold text-emerald-900">
                                    {container.Type || '-'}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold uppercase text-emerald-500">
                                    Trạng thái
                                </div>
                                <div className="font-semibold text-emerald-900">
                                    {container.Status || '-'}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}

                <ErrorMessage message={error} />
            </div>
        </Modal>    
    )
    //#endregion render
}
//#endregion component
