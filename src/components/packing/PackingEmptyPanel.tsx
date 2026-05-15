import { EmptyState } from '@/components/ui'

//#region component
export function PackingEmptyPanel() {
    return (
        <EmptyState
            icon="📦"
            title="Chưa có kiện nào đang xử lý"
            description="Quét mã kiện ở panel bên trái để bắt đầu đóng gói."
        />
    )
}
//#endregion component
