import * as React from 'react'
import { Button, Spinner } from '@/components/ui'
import { cn } from '@/components/ui/utils'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    selectHandoverError,
    selectHandoverFilters,
    selectHandoverRecords,
    selectHandoverTotalRows,
    selectIsFetchingHandoverList,
    selectIsRemovingHandover,
    selectIsUpdatingHandover,
} from '@/store/selectors/handoverSelectors'
import {
    clearHandoverError,
    fetchHandoverList,
    setHandoverFilters,
} from '@/store/slices/handoverSlice'
import type { IHandoverFilters } from '@/models/handover/HandoverInterface'

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
export function HandoverRecordList() {
    const dispatch = useAppDispatch()

    const records = useAppSelector(selectHandoverRecords)
    const totalRows = useAppSelector(selectHandoverTotalRows)
    const filters = useAppSelector(selectHandoverFilters)
    const isFetching = useAppSelector(selectIsFetchingHandoverList)
    const isUpdating = useAppSelector(selectIsUpdatingHandover)
    const isRemoving = useAppSelector(selectIsRemovingHandover)
    const error = useAppSelector(selectHandoverError)

    const currentPage = filters.PageIndex ?? 1
    const pageSize = filters.PageSize ?? 10
    const totalPages = getTotalPages(totalRows, pageSize)
    const isBusy = isFetching || isUpdating || isRemoving

    const isFirstPage = currentPage <= 1
    const isLastPage = currentPage >= totalPages

    React.useEffect(() => {
        if (!error) {
            return
        }

        const timeoutId = window.setTimeout(() => {
            dispatch(clearHandoverError())
        }, 7000)

        return () => window.clearTimeout(timeoutId)
    }, [dispatch, error])

    const handlePageChange = (nextPageIndex: number) => {
        const nextFilters: IHandoverFilters = {
            ...filters,
            PageIndex: nextPageIndex,
            PageSize: pageSize,
        }

        dispatch(setHandoverFilters(nextFilters))
        void dispatch(fetchHandoverList(nextFilters))
    }

    const handlePreviousPage = () => {
        if (isFirstPage) {
            return
        }

        handlePageChange(Math.max(1, currentPage - 1))
    }

    const handleNextPage = () => {
        if (isLastPage) {
            return
        }

        handlePageChange(currentPage + 1)
    }

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Danh sách bàn giao
                    </h2>
                </div>

                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                    {totalRows} đơn / kiện
                </span>
            </div>

            {/* <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                💡 Quét mã mới sẽ thêm record lên đầu danh sách. Quét mã đã có sẽ được dedup rồi đưa record mới lên đầu.
            </div> */}

            {isBusy ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
                    <Spinner size="sm" />
                    {isRemoving
                        ? 'Đang xóa record bàn giao...'
                        : isUpdating
                          ? 'Đang xử lý bàn giao...'
                          : 'Đang tải danh sách bàn giao...'}
                </div>
            ) : null}

            {!isBusy && records.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                    Chưa có đơn / kiện nào được bàn giao
                </p>
            ) : null}

            {!isBusy && records.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-slate-200">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="px-3 py-2 font-bold">STT</th>
                                <th className="px-3 py-2 font-bold">Mã kiện</th>
                                <th className="px-3 py-2 font-bold">Mã đơn</th>
                                <th className="px-3 py-2 font-bold">Khách hàng</th>
                                <th className="px-3 py-2 font-bold">Nhân viên</th>
                                <th className="px-3 py-2 font-bold">Thời gian</th>
                                <th className="px-3 py-2 font-bold">Đơn vị vận chuyển</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-200">
                            {records.map((record, index) => {
                                const isFirstRowOnFirstPage = currentPage === 1 && index === 0

                                return (
                                    <tr
                                        key={record.Id || record.DeliveryCode}
                                        className={cn(
                                            'bg-white transition-colors',
                                            isFirstRowOnFirstPage && 'animate-pulse bg-green-50',
                                        )}
                                    >
                                        <td className="px-3 py-2 text-slate-500">
                                            {(currentPage - 1) * pageSize + index + 1}
                                        </td>

                                        <td className="px-3 py-2">
                                            <span className="font-mono text-xs font-semibold text-blue-700">
                                                {record.DeliveryCode}
                                            </span>
                                        </td>

                                        <td className="px-3 py-2 text-slate-600">
                                            {record.OrderCode}
                                        </td>

                                        <td className="px-3 py-2 text-slate-600">
                                            {record.CustomerName ?? '-'}
                                        </td>

                                        <td className="px-3 py-2 text-slate-600">
                                            {record.HandoverByName}
                                        </td>

                                        <td className="px-3 py-2 text-slate-500">
                                            {formatDateTime(record.HandoverDate)}
                                        </td>

                                        <td className="px-3 py-2">
                                            <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
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
                        disabled={isFirstPage || isBusy}
                        onClick={handlePreviousPage}
                    >
                        Trước
                    </Button>

                    <Button
                        variant="secondary"
                        size="sm"
                        disabled={isLastPage || isBusy}
                        onClick={handleNextPage}
                    >
                        Sau
                    </Button>
                </div>
            </div>
        </section>
    )
}
//#endregion component
