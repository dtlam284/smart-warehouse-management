import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { Spinner } from './spinner'
import { cn } from './utils'
import { buttonVariants } from './button-variants'
import type { VariantProps } from 'class-variance-authority'

//#region types
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface IButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean
    loading?: boolean
    icon?: React.ReactNode
}
//#endregion types

//#region component
const Button = React.forwardRef<HTMLButtonElement, IButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            fullWidth,
            asChild = false,
            loading = false,
            icon,
            disabled,
            children,
            type = 'button',
            ...props
        },
        ref,
    ) => {
        const Comp = asChild ? Slot : 'button'
        const isDisabled = disabled || loading

        return (
            <Comp
                ref={ref}
                type={asChild ? undefined : type}
                aria-busy={loading || undefined}
                disabled={isDisabled}
                className={cn(buttonVariants({ variant, size, fullWidth, className }))}
                {...props}
            >
                {loading ? <Spinner size="sm" className="border-current border-t-transparent" /> : icon}
                {children}
            </Comp>
        )
    },
)

Button.displayName = 'Button'
//#endregion component

export { Button }
