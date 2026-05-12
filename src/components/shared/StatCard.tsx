import * as React from 'react'
import { motion } from 'motion/react'
import { cn } from '@/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

//#region interfaces
export interface IStatCardProps {
    title: string
    value: string | number
    icon?: React.ReactNode
    trend?: {
        value: number
        label: string
    }
    className?: string
}
//#endregion interfaces

//#region stat card
export function StatCard({ title, value, icon, trend, className }: IStatCardProps) {
    //#region render
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className={cn('group overflow-hidden', className)}>
                {/*#region Header */}
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>

                    {icon ? (
                        <div className="text-slate-400 transition-colors group-hover:text-blue-500">
                            {icon}
                        </div>
                    ) : null}
                </CardHeader>
                {/*#endregion Header */}

                {/*#region Content */}
                <CardContent>
                    <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>

                    {trend ? (
                        <p
                            className={cn(
                                'mt-1 text-xs',
                                trend.value >= 0 ? 'text-emerald-600' : 'text-rose-600',
                            )}
                        >
                            {trend.value > 0 ? '+' : ''}
                            {trend.value}% {trend.label}
                        </p>
                    ) : null}
                </CardContent>
                {/*#endregion Content */}
            </Card>
        </motion.div>
    )
    //#endregion render
}
//#endregion stat card
