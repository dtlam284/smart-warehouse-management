import { EmptyState } from '@/components/ui'

//#region component
export function ReturnEmptyPanel() {
    return (
        <EmptyState
            icon="↩️"
            title="Chưa có đơn hoàn nào đang xử lý"
            // description="Quét mã đơn hoàn ở panel bên trái để bắt đầu."
        />
    )
}
//#endregion component
