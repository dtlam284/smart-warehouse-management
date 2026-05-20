import * as React from 'react'
import { Button, Spinner } from '@/components/ui'
import { cn } from '@/components/ui/utils'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    selectHandoverFilters,
    selectHandoverRecords,
    selectHandoverTotalRows,
    selectIsFetchingHandoverList,
    selectIsRemovingHandover,
    selectIsUpdatingHandover,
} from '@/store/selectors/handoverSelectors'
import {
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

    const currentPage = filters.PageIndex ?? 1
    const pageSize = filters.PageSize ?? 10
    const totalPages = getTotalPages(totalRows, pageSize)
    const isBusy = isFetching || isUpdating || isRemoving

    const isFirstPage = currentPage <= 1
    const isLastPage = currentPage >= totalPages

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
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">
                    Danh sách bàn giao
                </h2>

                <span className="rounded-full bg-green-50 px-4 py-1.5 text-sm font-black text-green-700">
                    {totalRows} đơn / kiện
                </span>
            </div>

            {isBusy ? (
                <div className="flex items-center justify-center gap-3 py-10 text-base font-semibold text-slate-500">
                    <Spinner size="sm" />
                    {isRemoving
                        ? 'Đang xóa record bàn giao...'
                        : isUpdating
                          ? 'Đang xử lý bàn giao...'
                          : 'Đang tải danh sách bàn giao...'}
                </div>
            ) : null}

            {!isBusy && records.length === 0 ? (
                <p className="py-10 text-center text-base font-semibold text-slate-500">
                    Chưa có đơn / kiện nào được bàn giao
                </p>
            ) : null}

            {!isBusy && records.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-slate-200">
                    <table className="w-full text-left text-base">
                        <thead className="bg-slate-50 text-sm uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="px-4 py-3 font-black">STT</th>
                                <th className="px-4 py-3 font-black">Mã kiện</th>
                                <th className="px-4 py-3 font-black">Mã đơn</th>
                                <th className="px-4 py-3 font-black">Khách hàng</th>
                                <th className="px-4 py-3 font-black">Nhân viên</th>
                                <th className="px-4 py-3 font-black">Thời gian</th>
                                <th className="px-4 py-3 font-black">Đơn vị vận chuyển</th>
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
                                        <td className="px-4 py-3 font-semibold text-slate-500">
                                            {(currentPage - 1) * pageSize + index + 1}
                                        </td>

                                        <td className="px-4 py-3">
                                            <span className="font-mono text-sm font-black text-blue-700">
                                                {record.DeliveryCode}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 font-semibold text-slate-700">
                                            {record.OrderCode}
                                        </td>

                                        <td className="px-4 py-3 font-semibold text-slate-700">
                                            {record.CustomerName ?? '-'}
                                        </td>

                                        <td className="px-4 py-3 font-semibold text-slate-700">
                                            {record.HandoverByName}
                                        </td>

                                        <td className="px-4 py-3 font-semibold text-slate-600">
                                            {formatDateTime(record.HandoverDate)}
                                        </td>

                                        <td className="px-4 py-3">
                                            <span className="rounded-full bg-green-50 px-3 py-1.5 text-sm font-black text-green-700">
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
                <p className="text-sm font-semibold text-slate-500">
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
