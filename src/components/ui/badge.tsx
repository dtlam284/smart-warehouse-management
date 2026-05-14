import * as React from 'react'
import { cn } from './utils'
import { badgeVariants } from './badge-variants'
import type { VariantProps } from 'class-variance-authority'


//#region types
export type BadgeVariant = 'success' | 'warning' | 'error' | 'neutral' | 'info'

export interface IBadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}
//#endregion types

//#region component
function Badge({ className, variant = 'neutral', ...props }: IBadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
//#endregion component

export { Badge }
