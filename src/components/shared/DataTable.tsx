import * as React from 'react'
import { motion } from 'motion/react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/components/ui/utils'
import { useI18n } from '@/contexts/I18nContext'

//#region types
export interface Column<T> {
    key: string
    header: string
    render: (item: T) => React.ReactNode
    width?: string
    tooltip?: string
}

export interface DataTableFilterOption {
    label: string
    value: string
}

export interface DataTableFilterField {
    key: string
    label: string
    value?: string | number | boolean | null
    type?: 'text' | 'number' | 'date' | 'select'
    placeholder?: string
    options?: DataTableFilterOption[]
}

export interface DataTableProps<T> {
    data: T[]
    columns: Column<T>[]
    keyExtractor: (item: T) => string
    isLoading?: boolean
    actions?: React.ReactNode
    onRowClick?: (item: T) => void
    mobileRenderCard?: (item: T) => React.ReactNode
    prioritizeMeaningfulColumns?: boolean

    searchValue?: string
    defaultSearchValue?: string
    searchPlaceholder?: string
    onSearchChange?: (value: string) => void

    filters?: DataTableFilterField[]
    onFilterChange?: (key: string, value: string | null) => void
    onClearFilters?: () => void
    filterDialogTitle?: string
    filterDialogDescription?: string

    page?: number
    limit?: number
    total?: number
    pageSizeOptions?: number[]
    isServerPagination?: boolean
    onPageChange?: (page: number) => void
    onPageSizeChange?: (pageSize: number) => void
}
//#endregion types

//#region helpers
const hasFilterValue = (value: DataTableFilterField['value']): boolean => {
    if (value === null || value === undefined) {
        return false
    }

    if (typeof value === 'string') {
        return value.trim().length > 0
    }

    if (typeof value === 'number') {
        return Number.isFinite(value)
    }

    if (typeof value === 'boolean') {
        return value
    }

    return false
}

const toFilterInputValue = (value: DataTableFilterField['value']): string => {
    if (value === null || value === undefined) {
        return ''
    }

    return String(value)
}

const normalizeFilterChangeValue = (value: string): string | null => {
    const normalized = value.trim()

    return normalized ? value : null
}

const formatFilterValue = (
    filter: DataTableFilterField,
    t: (
        key: string,
        params?: Record<string, string | number | boolean | null | undefined>,
    ) => string,
): string => {
    const value = toFilterInputValue(filter.value)

    if (!value) {
        return t('Any')
    }

    if (filter.type === 'select') {
        const option = filter.options?.find((item) => item.value === value)

        return option ? t(option.label) : value
    }

    return value
}

const getColumnPriority = <T,>(column: Column<T>): number => {
    const key = `${column.key} ${column.header}`.toLowerCase()

    if (/(action|actions|operation|ops|tools)/.test(key)) {
        return 90
    }

    if (/(\bid\b|_id|^id$)/.test(key) && !/(name|title|email|label|slug)/.test(key)) {
        return 70
    }

    if (/(name|title|email|username|label|slug|code)/.test(key)) {
        return 0
    }

    if (/(status|state)/.test(key)) {
        return 20
    }

    if (/(created|updated|date|time)/.test(key)) {
        return 30
    }

    return 40
}

const clampPage = (page: number, totalPages: number): number => {
    return Math.min(Math.max(1, page), totalPages)
}
//#endregion helpers

//#region component
export function DataTable<T>({
    data,
    columns,
    keyExtractor,
    isLoading = false,
    actions,
    onRowClick,
    mobileRenderCard,
    prioritizeMeaningfulColumns = true,

    searchValue,
    defaultSearchValue = '',
    searchPlaceholder,
    onSearchChange,

    filters = [],
    onFilterChange,
    onClearFilters,
    filterDialogTitle,
    filterDialogDescription,

    page = 1,
    limit = 50,
    total,
    pageSizeOptions = [10, 20, 50, 100],
    isServerPagination = false,
    onPageChange,
    onPageSizeChange,
}: DataTableProps<T>) {
    const { t } = useI18n()

    const [internalSearch, setInternalSearch] = React.useState(defaultSearchValue)
    const [localPage, setLocalPage] = React.useState(1)
    const [localLimit, setLocalLimit] = React.useState(Math.max(1, limit || 50))
    const [isFilterDialogOpen, setIsFilterDialogOpen] = React.useState(false)

    const search = searchValue ?? internalSearch
    const selectedLimit = isServerPagination ? Math.max(1, limit || 50) : localLimit

    const activeFilters = React.useMemo(() => {
        return filters.filter((filter) => hasFilterValue(filter.value))
    }, [filters])

    const availableFilters = React.useMemo(() => {
        return filters
    }, [filters])

    const hasSearch = Boolean(onSearchChange || searchValue !== undefined || defaultSearchValue)
    const hasToolbar = hasSearch || availableFilters.length > 0 || Boolean(actions)

    const filteredData = React.useMemo(() => {
        if (isServerPagination || onSearchChange || !search.trim()) {
            return data
        }

        const normalizedSearch = search.trim().toLowerCase()

        return data.filter((item) => {
            return JSON.stringify(item).toLowerCase().includes(normalizedSearch)
        })
    }, [data, isServerPagination, onSearchChange, search])

    const totalItems = isServerPagination ? (total ?? data.length) : filteredData.length
    const totalPages = Math.max(1, Math.ceil(totalItems / selectedLimit))
    const boundedPage = clampPage(isServerPagination ? page : localPage, totalPages)

    const start = totalItems === 0 ? 0 : (boundedPage - 1) * selectedLimit + 1
    const end = Math.min(boundedPage * selectedLimit, totalItems)

    const hasPreviousPage = boundedPage > 1
    const hasNextPage = boundedPage < totalPages

    const searchPlaceholderText = t(searchPlaceholder || 'Search...')
    const filterDialogTitleText = t(filterDialogTitle || 'More Filters')
    const filterDialogDescriptionText = t(
        filterDialogDescription || 'Refine the table results using the filters below.',
    )

    const tableRows = isServerPagination
        ? data
        : filteredData.slice((boundedPage - 1) * selectedLimit, boundedPage * selectedLimit)

    const visiblePages = React.useMemo(() => {
        const maxVisible = 7

        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, index) => index + 1)
        }

        const half = Math.floor(maxVisible / 2)
        let startPage = Math.max(1, boundedPage - half)
        const endPage = Math.min(totalPages, startPage + maxVisible - 1)

        startPage = Math.max(1, endPage - maxVisible + 1)

        return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index)
    }, [boundedPage, totalPages])

    const orderedColumns = React.useMemo(() => {
        if (!prioritizeMeaningfulColumns) {
            return columns
        }

        return columns
            .map((column, index) => ({
                column,
                index,
                priority: getColumnPriority(column),
            }))
            .sort((a, b) => a.priority - b.priority || a.index - b.index)
            .map((item) => item.column)
    }, [columns, prioritizeMeaningfulColumns])

    const clearAllFilters = () => {
        onClearFilters?.()

        if (!onFilterChange) {
            return
        }

        availableFilters.forEach((filter) => {
            if (hasFilterValue(filter.value)) {
                onFilterChange(filter.key, null)
            }
        })
    }

    const goToPage = (nextPage: number) => {
        const safeNextPage = clampPage(nextPage, totalPages)

        if (isServerPagination) {
            onPageChange?.(safeNextPage)
            return
        }

        setLocalPage(safeNextPage)
    }

    return (
        <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            {hasToolbar ? (
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="flex min-w-[220px] flex-1 flex-wrap items-center gap-2">
                        {hasSearch ? (
                            <div className="relative w-full sm:w-auto sm:min-w-[260px]">
                                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                <input
                                    type="text"
                                    value={search}
                                    aria-label={searchPlaceholderText}
                                    onChange={(event) => {
                                        const nextValue = event.target.value

                                        if (onSearchChange) {
                                            onSearchChange(nextValue)
                                            return
                                        }

                                        setInternalSearch(nextValue)
                                    }}
                                    placeholder={searchPlaceholderText}
                                    className="h-8 w-full rounded-md border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                            </div>
                        ) : null}

                        {activeFilters.map((filter) => (
                            <button
                                key={filter.key}
                                type="button"
                                className="inline-flex h-8 items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                                onClick={() => onFilterChange?.(filter.key, null)}
                            >
                                <span>
                                    {t(filter.label)}: {formatFilterValue(filter, t)}
                                </span>
                                <X className="h-3.5 w-3.5" />
                            </button>
                        ))}
                    </div>

                    <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
                        {availableFilters.length > 0 ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={() => setIsFilterDialogOpen(true)}
                            >
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                                {t('More Filters')}
                            </Button>
                        ) : null}

                        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
                    </div>
                </div>
            ) : null}

            <div className="cms-scrollbar relative min-h-[400px] flex-1 overflow-auto">
                {mobileRenderCard ? (
                    <div className="space-y-3 p-3 md:hidden">
                        {tableRows.map((item, index) => (
                            <motion.div
                                key={keyExtractor(item)}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => onRowClick?.(item)}
                            >
                                {mobileRenderCard(item)}
                            </motion.div>
                        ))}
                    </div>
                ) : null}

                <div className={mobileRenderCard ? 'hidden md:block' : undefined}>
                    <table className="w-full whitespace-nowrap text-left text-sm text-slate-700 dark:text-slate-300">
                        <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-sm dark:bg-slate-900/80">
                            <tr>
                                {orderedColumns.map((column) => (
                                    <th
                                        key={column.key}
                                        className={cn(
                                            'border-b border-slate-200 px-4 py-3 font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300',
                                            column.width,
                                        )}
                                    >
                                        {column.tooltip ? (
                                            <Tooltip>
                                                <TooltipTrigger className="cursor-help underline decoration-slate-300 decoration-dashed underline-offset-4 focus:outline-none">
                                                    {t(column.header)}
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{column.tooltip}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : (
                                            t(column.header)
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {tableRows.map((item, index) => (
                                <motion.tr
                                    key={keyExtractor(item)}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2, delay: index * 0.03 }}
                                    onClick={() => onRowClick?.(item)}
                                    className={cn(
                                        'group transition-colors',
                                        onRowClick
                                            ? 'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-900/50'
                                            : '',
                                    )}
                                >
                                    {orderedColumns.map((column) => (
                                        <td
                                            key={`${keyExtractor(item)}-${column.key}`}
                                            className="px-4 py-3"
                                        >
                                            {column.render(item)}
                                        </td>
                                    ))}
                                </motion.tr>
                            ))}

                            {tableRows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={orderedColumns.length}
                                        className="px-4 py-10 text-center text-slate-500 dark:text-slate-400"
                                    >
                                        {isLoading ? t('Loading...') : t('No results found.')}
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 sm:text-sm">
                <div>
                    {t('Showing')} {start} {t('to')} {end} {t('of')} {totalItems}{' '}
                    {t('results')}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-1.5">
                        <span className="text-xs text-slate-500">{t('Rows')}</span>
                        <select
                            className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                            value={selectedLimit}
                            disabled={isServerPagination && !onPageSizeChange}
                            onChange={(event) => {
                                const nextSize = Math.max(
                                    1,
                                    Number(event.target.value) || selectedLimit,
                                )

                                if (isServerPagination) {
                                    onPageSizeChange?.(nextSize)
                                    onPageChange?.(1)
                                    return
                                }

                                setLocalLimit(nextSize)
                                setLocalPage(1)
                            }}
                        >
                            {Array.from(
                                new Set([
                                    ...pageSizeOptions.filter((size) => size > 0),
                                    selectedLimit,
                                ]),
                            ).map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </label>

                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!hasPreviousPage || (isServerPagination && !onPageChange)}
                        onClick={() => goToPage(boundedPage - 1)}
                    >
                        {t('Previous')}
                    </Button>

                    {visiblePages.map((pageNumber) => (
                        <Button
                            key={pageNumber}
                            variant={pageNumber === boundedPage ? 'default' : 'outline'}
                            size="sm"
                            disabled={isServerPagination && !onPageChange}
                            onClick={() => goToPage(pageNumber)}
                        >
                            {pageNumber}
                        </Button>
                    ))}

                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!hasNextPage || (isServerPagination && !onPageChange)}
                        onClick={() => goToPage(boundedPage + 1)}
                    >
                        {t('Next')}
                    </Button>
                </div>
            </div>

            <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{filterDialogTitleText}</DialogTitle>
                        <DialogDescription>{filterDialogDescriptionText}</DialogDescription>
                    </DialogHeader>

                    <div className="grid max-h-[60vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                        {availableFilters.map((filter) => {
                            const filterType = filter.type ?? 'text'
                            const value = toFilterInputValue(filter.value)

                            return (
                                <label key={filter.key} className="space-y-1">
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                        {t(filter.label)}
                                    </span>

                                    {filterType === 'select' ? (
                                        <select
                                            value={value}
                                            onChange={(event) =>
                                                onFilterChange?.(
                                                    filter.key,
                                                    normalizeFilterChangeValue(event.target.value),
                                                )
                                            }
                                            className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                                        >
                                            <option value="">
                                                {t(filter.placeholder || 'All')}
                                            </option>

                                            {(filter.options ?? []).map((option) => (
                                                <option
                                                    key={`${filter.key}-${option.value}`}
                                                    value={option.value}
                                                >
                                                    {t(option.label)}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type={filterType}
                                            value={value}
                                            onChange={(event) =>
                                                onFilterChange?.(
                                                    filter.key,
                                                    normalizeFilterChangeValue(event.target.value),
                                                )
                                            }
                                            placeholder={
                                                filter.placeholder
                                                    ? t(filter.placeholder)
                                                    : t('Filter by {label}', {
                                                          label: t(filter.label).toLowerCase(),
                                                      })
                                            }
                                            className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    )}
                                </label>
                            )
                        })}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={clearAllFilters}>
                            {t('Reset Filters')}
                        </Button>
                        <Button onClick={() => setIsFilterDialogOpen(false)}>{t('Done')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
//#endregion component
