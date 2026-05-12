import React from 'react'
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Link2,
    Quote,
    RemoveFormatting,
    Heading2,
    Pilcrow,
} from 'lucide-react'
import { cn } from '../../utils'
import { useI18n } from '../../contexts/I18nContext'

type WysiwygEditorProps = {
    value: string
    onChange: (nextValue: string) => void
    placeholder?: string
    minHeightClassName?: string
    disabled?: boolean
    className?: string
}

const toPlainText = (html: string): string => {
    if (!html.trim()) {
        return ''
    }

    if (typeof window === 'undefined') {
        return html
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
    }

    const container = document.createElement('div')
    container.innerHTML = html
    return (container.textContent || '').replace(/\u00A0/g, ' ').trim()
}

export function WysiwygEditor({
    value,
    onChange,
    placeholder = 'Write content...',
    minHeightClassName = 'min-h-[220px]',
    disabled = false,
    className,
}: WysiwygEditorProps) {
    const { t } = useI18n()
    const editorRef = React.useRef<HTMLDivElement | null>(null)

    React.useEffect(() => {
        const editor = editorRef.current
        if (!editor) {
            return
        }

        if (editor.innerHTML !== value) {
            editor.innerHTML = value || ''
        }
    }, [value])

    const emitValue = React.useCallback(() => {
        const editor = editorRef.current
        if (!editor) {
            return
        }
        onChange(editor.innerHTML)
    }, [onChange])

    const executeCommand = React.useCallback(
        (command: string, commandValue?: string) => {
            if (disabled) {
                return
            }

            const editor = editorRef.current
            if (!editor) {
                return
            }

            editor.focus()
            document.execCommand(command, false, commandValue)
            emitValue()
        },
        [disabled, emitValue],
    )

    const hasContent = toPlainText(value).length > 0

    const toolbarButtonClassName =
        'inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'

    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2">
                <button
                    type="button"
                    className={toolbarButtonClassName}
                    disabled={disabled}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => executeCommand('formatBlock', 'H2')}
                    title={t('Heading')}
                >
                    <Heading2 className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    className={toolbarButtonClassName}
                    disabled={disabled}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => executeCommand('formatBlock', 'P')}
                    title={t('Paragraph')}
                >
                    <Pilcrow className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    className={toolbarButtonClassName}
                    disabled={disabled}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => executeCommand('bold')}
                    title={t('Bold')}
                >
                    <Bold className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    className={toolbarButtonClassName}
                    disabled={disabled}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => executeCommand('italic')}
                    title={t('Italic')}
                >
                    <Italic className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    className={toolbarButtonClassName}
                    disabled={disabled}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => executeCommand('underline')}
                    title={t('Underline')}
                >
                    <Underline className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    className={toolbarButtonClassName}
                    disabled={disabled}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => executeCommand('insertUnorderedList')}
                    title={t('Bullet list')}
                >
                    <List className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    className={toolbarButtonClassName}
                    disabled={disabled}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => executeCommand('insertOrderedList')}
                    title={t('Numbered list')}
                >
                    <ListOrdered className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    className={toolbarButtonClassName}
                    disabled={disabled}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => executeCommand('formatBlock', 'BLOCKQUOTE')}
                    title={t('Quote')}
                >
                    <Quote className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    className={toolbarButtonClassName}
                    disabled={disabled}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                        const url = window.prompt(t('Enter URL'), 'https://')
                        if (!url) {
                            return
                        }

                        executeCommand('createLink', url.trim())
                    }}
                    title={t('Insert link')}
                >
                    <Link2 className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    className={toolbarButtonClassName}
                    disabled={disabled}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => executeCommand('removeFormat')}
                    title={t('Clear formatting')}
                >
                    <RemoveFormatting className="h-4 w-4" />
                </button>
            </div>

            <div className="relative">
                {!hasContent ? (
                    <div className="pointer-events-none absolute left-3 top-3 text-sm text-slate-400">
                        {t(placeholder)}
                    </div>
                ) : null}

                <div
                    ref={editorRef}
                    contentEditable={!disabled}
                    suppressContentEditableWarning
                    onInput={emitValue}
                    className={cn(
                        'w-full rounded-md border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
                        minHeightClassName,
                        disabled ? 'cursor-not-allowed bg-slate-100 text-slate-500' : '',
                    )}
                />
            </div>
        </div>
    )
}
