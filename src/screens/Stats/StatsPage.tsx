import * as React from 'react'
import { BarChart3 } from 'lucide-react'
import { HandoverStatsSection } from '@/components/stats/HandoverStatsSection'
import { PackingStatsSection } from '@/components/stats/PackingStatsSection'
import { ReturnStatsSection } from '@/components/stats/ReturnStatsSection'
import { Input } from '@/components/ui'
import { useAppDispatch } from '@/store'
import { loadHandoverStats } from '@/store/slices/handoverSlice'
import { loadPackingStats } from '@/store/slices/packingSlice'
import { loadReturnStats } from '@/store/slices/returnSlice'

//#region helpers
function getTodayInputValue(): string {
    const date = new Date()
    const timezoneOffset = date.getTimezoneOffset() * 60_000
    const localDate = new Date(date.getTime() - timezoneOffset)

    return localDate.toISOString().slice(0, 10)
}
//#endregion helpers

//#region component
export function StatsPage() {
    const dispatch = useAppDispatch()

    const [selectedDate, setSelectedDate] = React.useState(getTodayInputValue)

    React.useEffect(() => {
        const request = {
            Date: selectedDate,
        }

        void dispatch(loadPackingStats(request))
        void dispatch(loadHandoverStats(request))
        void dispatch(loadReturnStats(request))
    }, [dispatch, selectedDate])

    //#region render
    return (
        <div className="min-h-screen bg-slate-100 p-5 text-slate-900">
            <div className="mx-auto max-w-7xl space-y-5">
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                                <BarChart3 className="h-5 w-5" />
                            </div>

                            <div>
                                <h1 className="text-2xl font-black text-slate-900">
                                    Thống kê tổng quan
                                </h1>
                                {/* <p className="mt-1 text-sm text-slate-500">
                                    Theo dõi đóng gói, bàn giao và nhận hoàn theo ngày.
                                </p> */}
                            </div>
                        </div>

                        <div className="w-full lg:w-[220px]">
                            <Input
                                type="date"
                                label="Ngày thống kê"
                                value={selectedDate}
                                onChange={(event) => setSelectedDate(event.target.value)}
                            />
                        </div>
                    </div>
                </section>

                <PackingStatsSection />
                <HandoverStatsSection />
                <ReturnStatsSection />
            </div>
        </div>
    )
    //#endregion render
}
//#endregion component
