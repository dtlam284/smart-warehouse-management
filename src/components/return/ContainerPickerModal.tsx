import * as React from 'react'
import { Button, Modal, NumberInput } from '@/components/ui'
import { ScannerInput } from '@/components/scanner/ScannerInput'

//#region types
export interface IReturnContainerValue {
    ContainerId: number
    ContainerCode: string
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
    const [containerId, setContainerId] = React.useState(0)

    const canConfirm = containerCode.trim().length > 0 && containerId > 0 && !loading

    const handleContainerScan = (code: string) => {
        setContainerCode(code.trim().toUpperCase())
    }

    const handleConfirm = () => {
        if (!canConfirm) {
            return
        }

        onConfirm({
            ContainerId: containerId,
            ContainerCode: containerCode.trim().toUpperCase(),
        })
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Quét đơn vị chứa"
            description="Kho đang vận hành có layout, cần quét container trước khi xác nhận hàng hoàn."
            footer={
                <div className="flex w-full justify-end gap-2">
                    <Button variant="secondary" disabled={loading} onClick={onClose}>
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
                        disabled={loading}
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

                <NumberInput
                    label="Container ID"
                    value={containerId}
                    min={0}
                    disabled={loading}
                    helperText="Tạm thời nhập ContainerId thủ công. Sau này có thể thay bằng API lookup container."
                    onChange={setContainerId}
                />
            </div>
        </Modal>
    )
}
//#endregion component
