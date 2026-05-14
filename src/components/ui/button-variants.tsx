import { cva } from 'class-variance-authority'

//#region variants
export const buttonVariants = cva(
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60',
    {
        variants: {
            variant: {
                primary: 'bg-blue-600 text-white hover:bg-blue-700',
                secondary:
                    'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900',
                danger: 'bg-red-600 text-white hover:bg-red-700',
                ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',

                default: 'bg-blue-600 text-white hover:bg-blue-700',
                destructive: 'bg-red-600 text-white hover:bg-red-700',
                outline:
                    'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900',
                link: 'h-auto p-0 text-blue-600 underline-offset-4 hover:underline',
            },
            size: {
                sm: 'h-10 px-3 text-sm',
                md: 'h-11 px-4 text-sm',
                lg: 'h-12 px-5 text-base',
                icon: 'h-11 w-11',
                default: 'h-11 px-4 text-sm',
            },
            fullWidth: {
                true: 'w-full',
                false: '',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
            fullWidth: false,
        },
    },
)
//#endregion variants
