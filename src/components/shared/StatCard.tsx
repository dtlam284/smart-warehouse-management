import * as React from "react"
import { motion } from "motion/react"
import { cn } from "../../utils"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

export interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    value: number
    label: string
  }
  className?: string
}

export function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("overflow-hidden group", className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">
            {title}
          </CardTitle>
          {icon && <div className="text-slate-400 group-hover:text-blue-500 transition-colors">{icon}</div>}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>
          {trend && (
            <p className={cn("text-xs mt-1", trend.value >= 0 ? "text-emerald-600" : "text-rose-600")}>
              {trend.value > 0 ? "+" : ""}{trend.value}% {trend.label}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
