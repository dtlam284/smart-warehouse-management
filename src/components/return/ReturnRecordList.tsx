import { Badge, Button, ErrorMessage, Spinner } from '@/components/ui'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    selectIsConfirmingReturn,
    selectIsFetchingReturnList,
    selectIsRemovingReturn,
    selectReturnError,
    selectReturnFilters,
    selectReturnRecords,
    selectReturnTotalRows,
} from '@/store/selectors/returnSelectors'
import { 
    fetchReturnList, 
    setReturnFilters 
} from '@/store/slices/returnSlice'
import { cn } from '@/components/ui/utils'
import type { IReturnFilters, ReturnType } from '@/models/return/ReturnInterface'

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

function getReturnTypeLabel(type: ReturnType): string {
    switch (type) {
        case 'FULL_RETURN':
            return 'Full'

        case 'DEFECTIVE_RETURN':
            return 'Defective'

        case 'PARTIAL_RETURN':
            return 'Partial'
    }
}

function getReturnTypeVariant(type: ReturnType): 'success' | 'warning' | 'error' {
    switch (type) {
        case 'FULL_RETURN':
            return 'success'

        case 'DEFECTIVE_RETURN':
            return 'error'

        case 'PARTIAL_RETURN':
            return 'warning'
    }
}
//#endregion helpers

//#region component
export function ReturnRecordList() {
    const dispatch = useAppDispatch()

    const records = useAppSelector(selectReturnRecords)
    const totalRows = useAppSelector(selectReturnTotalRows)
    const filters = useAppSelector(selectReturnFilters)
    const isFetching = useAppSelector(selectIsFetchingReturnList)
    const isConfirming = useAppSelector(selectIsConfirmingReturn)
    const isRemoving = useAppSelector(selectIsRemovingReturn)
    const error = useAppSelector(selectReturnError)

    const currentPage = filters.PageIndex + 1
    const totalPages = getTotalPages(totalRows, filters.PageSize)
    const isBusy = isFetching || isConfirming || isRemoving

    const handlePageChange = (nextPageIndex: number) => {
        const nextFilters: IReturnFilters = {
            ...filters,
            PageIndex: nextPageIndex,
        }

        dispatch(setReturnFilters(nextFilters))
        void dispatch(fetchReturnList(nextFilters))
    }

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Đơn hoàn đã xác nhận hôm nay
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Record mới nhất được đưa lên đầu danh sách sau khi xác nhận thành công.
                    </p>
                </div>

                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                    {totalRows} đơn
                </span>
            </div>

            <ErrorMessage message={error} />

            {isBusy ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
                    <Spinner size="sm" />
                    {isRemoving
                        ? 'Đang xóa đơn hoàn...'
                        : isConfirming
                          ? 'Đang xác nhận đơn hoàn...'
                          : 'Đang tải danh sách đơn hoàn...'}
                </div>
            ) : null}

            {!isBusy && records.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                    Chưa có đơn hoàn nào được xác nhận
                </p>
            ) : null}

            {!isBusy && records.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-slate-200">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="px-3 py-2 font-bold">STT</th>
                                <th className="px-3 py-2 font-bold">Mã đơn</th>
                                <th className="px-3 py-2 font-bold">Mã kiện</th>
                                <th className="px-3 py-2 font-bold">Loại hoàn</th>
                                <th className="px-3 py-2 font-bold">Nhân viên</th>
                                <th className="px-3 py-2 font-bold">Thời gian</th>
                                <th className="px-3 py-2 font-bold">Đơn vị</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-200">
                            {records.map((record, index) => {
                                const isFirstRowOnFirstPage = filters.PageIndex === 0 && index === 0

                                return (
                                    <tr
                                        key={record.Id || record.DeliveryCode}
                                        className={cn(
                                            'bg-white transition-colors',
                                            isFirstRowOnFirstPage && 'animate-pulse bg-purple-50',
                                        )}
                                    >
                                        <td className="px-3 py-2 text-slate-500">
                                            {filters.PageIndex * filters.PageSize + index + 1}
                                        </td>

                                        <td className="px-3 py-2 text-slate-600">
                                            {record.OrderCode}
                                        </td>

                                        <td className="px-3 py-2">
                                            <span className="font-mono text-xs font-semibold text-purple-700">
                                                {record.DeliveryCode}
                                            </span>
                                        </td>

                                        <td className="px-3 py-2">
                                            <Badge variant={getReturnTypeVariant(record.ReturnType)}>
                                                {getReturnTypeLabel(record.ReturnType)}
                                            </Badge>
                                        </td>

                                        <td className="px-3 py-2 text-slate-600">
                                            {record.ReturnByName}
                                        </td>

                                        <td className="px-3 py-2 text-slate-500">
                                            {formatDateTime(record.ReturnDate)}
                                        </td>

                                        <td className="px-3 py-2">
                                            <span className="rounded-full bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-700">
                                                {record.ShippingUnitName || '-'}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
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
                        disabled={filters.PageIndex <= 0 || isBusy}
                        onClick={() => handlePageChange(filters.PageIndex - 1)}
                    >
                        Trước
                    </Button>

                    <Button
                        variant="secondary"
                        size="sm"
                        disabled={currentPage >= totalPages || isBusy}
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
