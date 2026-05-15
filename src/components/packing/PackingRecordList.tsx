import { Button, ErrorMessage, Spinner } from '@/components/ui'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    selectIsFetchingPackingList,
    selectPackingError,
    selectPackingFilters,
    selectPackingProcessedList,
    selectPackingTotalRows,
} from '@/store/selectors/packingSelectors'
import { fetchPackingList, setPackingFilters } from '@/store/slices/packingSlice'
import type { IPackingFilters } from '@/models/packing/PackingInterface'


//#region helpers
function formatDateTime(value: string): string {
    if (!value) {
        return '-'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    return date.toLocaleString('vi-VN')
}

function getTotalPages(totalRows: number, pageSize: number): number {
    return Math.max(1, Math.ceil(totalRows / pageSize))
}
//#endregion helpers

//#region component
export function PackingRecordList() {
    const dispatch = useAppDispatch()

    const records = useAppSelector(selectPackingProcessedList)
    const totalRows = useAppSelector(selectPackingTotalRows)
    const filters = useAppSelector(selectPackingFilters)
    const isFetching = useAppSelector(selectIsFetchingPackingList)
    const error = useAppSelector(selectPackingError)

    const currentPage = filters.PageIndex + 1
    const totalPages = getTotalPages(totalRows, filters.PageSize)

    const handlePageChange = (nextPageIndex: number) => {
        const nextFilters: IPackingFilters = {
            ...filters,
            PageIndex: nextPageIndex,
        }

        dispatch(setPackingFilters(nextFilters))
        void dispatch(fetchPackingList(nextFilters))
    }

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Kiện đã đóng gói hôm nay
                </h2>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    {totalRows} kiện
                </span>
            </div>

            <ErrorMessage message={error} />

            {isFetching ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
                    <Spinner size="sm" />
                    Đang tải danh sách kiện đã đóng...
                </div>
            ) : null}

            {!isFetching && records.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                    Chưa có kiện nào được đóng gói hôm nay
                </p>
            ) : null}

            {!isFetching && records.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-slate-200">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="px-3 py-2 font-bold">STT</th>
                                <th className="px-3 py-2 font-bold">Mã kiện</th>
                                <th className="px-3 py-2 font-bold">Mã đơn</th>
                                <th className="px-3 py-2 font-bold">Nhân viên</th>
                                <th className="px-3 py-2 font-bold">Thời gian</th>
                                <th className="px-3 py-2 font-bold">Đơn vị vận chuyển</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-200">
                            {records.map((record, index) => (
                                <tr key={record.Id || record.DeliveryCode} className="bg-white">
                                    <td className="px-3 py-2 text-slate-500">
                                        {filters.PageIndex * filters.PageSize + index + 1}
                                    </td>

                                    <td className="px-3 py-2">
                                        <span className="font-mono text-xs font-semibold text-blue-700">
                                            {record.DeliveryCode}
                                        </span>
                                    </td>

                                    <td className="px-3 py-2 text-slate-600">{record.OrderCode}</td>

                                    <td className="px-3 py-2 text-slate-600">
                                        {record.PackerByName}
                                    </td>

                                    <td className="px-3 py-2 text-slate-500">
                                        {formatDateTime(record.PackingDate)}
                                    </td>

                                    <td className="px-3 py-2">
                                        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                                            {record.ShippingUnitName || '-'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}

            <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                    Trang {currentPage} / {totalPages}
                </p>

                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        disabled={filters.PageIndex <= 0 || isFetching}
                        onClick={() => handlePageChange(filters.PageIndex - 1)}
                    >
                        Trước
                    </Button>

                    <Button
                        variant="secondary"
                        size="sm"
                        disabled={currentPage >= totalPages || isFetching}
                        onClick={() => handlePageChange(filters.PageIndex + 1)}
                    >
                        Sau
                    </Button>
                </div>
            </div>
        </section>
    )
}
//#endregion component
