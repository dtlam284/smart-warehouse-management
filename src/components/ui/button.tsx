import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { Spinner } from './spinner'
import { cn } from './utils'
import { buttonVariants } from './button-variants'
import type { VariantProps } from 'class-variance-authority'

//#region types
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'default' | 'icon'

export interface IButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean
    loading?: boolean
    icon?: React.ReactNode
}
//#endregion types

//#region helpers
function getReadableButtonSizeClass(size: ButtonSize | null | undefined): string {
    switch (size) {
        case 'sm':
            return 'min-h-11 px-4 text-base'

        case 'lg':
            return 'min-h-14 px-7 text-lg'

        case 'icon':
            return 'min-h-12 h-12 w-12 p-0 text-base'

        case 'default':
        case 'md':
        default:
            return 'min-h-12 px-5 text-base'
    }
}
//#endregion helpers

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
                className={cn(
                    buttonVariants({ variant, size, fullWidth }),
                    'gap-2 rounded-lg font-bold leading-6',
                    getReadableButtonSizeClass(size),
                    className,
                )}
                {...props}
            >
                {loading ? (
                    <Spinner size="sm" className="border-current border-t-transparent" />
                ) : (
                    icon
                )}
                {children}
            </Comp>
        )
    },
)

Button.displayName = 'Button'
//#endregion component

export { Button }
