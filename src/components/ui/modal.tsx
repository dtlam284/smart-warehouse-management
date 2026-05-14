import * as React from 'react'
import { X } from 'lucide-react'
import { Button } from './button'
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
    closeLabel = 'Đóng',
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
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <DialogTitle>{title}</DialogTitle>
                            {description ? <DialogDescription>{description}</DialogDescription> : null}
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            aria-label={closeLabel}
                            className="-mr-2 -mt-2"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="py-2">{children}</div>

                {footer ? <DialogFooter>{footer}</DialogFooter> : null}
            </DialogContent>
        </Dialog>
    )
}
//#endregion component
