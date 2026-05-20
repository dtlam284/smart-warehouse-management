import * as React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './dialog'

//#region types
export interface IModalProps {
    open: boolean
    onClose: () => void
    title: string
    description?: string
    children: React.ReactNode
    footer?: React.ReactNode
    closeLabel?: string
}
//#endregion types

//#region component
export function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
}: IModalProps) {
    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    onClose()
                }
            }}
        >
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <div className="space-y-1 pr-8">
                        <DialogTitle className="text-xl font-black text-slate-900">
                            {title}
                        </DialogTitle>

                        {description ? (
                            <DialogDescription className="text-base font-medium leading-6 text-slate-500">
                                {description}
                            </DialogDescription>
                        ) : null}
                    </div>
                </DialogHeader>

                <div className="py-2">{children}</div>

                {footer ? <DialogFooter>{footer}</DialogFooter> : null}
            </DialogContent>
        </Dialog>
    )
}
//#endregion component
