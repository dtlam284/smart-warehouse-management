import React from 'react'
import { setCurrentLanguage } from '../i18n/runtime'
import type { AppLanguage } from '../i18n/translate'
import { translateLiteral, translateText } from '../i18n/translate'

type I18nContextValue = {
    language: AppLanguage
    setLanguage: (language: AppLanguage) => void
    t: (
        key: string,
        params?: Record<string, string | number | boolean | null | undefined>,
    ) => string
}

const I18N_STORAGE_KEY = 'app-language'
const DEFAULT_LANGUAGE: AppLanguage = 'vi'
const LOCALIZABLE_ATTRIBUTES = ['title', 'placeholder', 'aria-label'] as const
const AUTO_LABEL_ATTR = 'data-auto-field-label-id'
const AUTO_LABEL_GENERATED_ATTR = 'data-auto-generated-label'
const AUTO_LABEL_CLASS_NAME = 'cms-field-label'
const AUTO_LABEL_TEXT_CLASS_NAME = 'cms-field-label-text'
const AUTO_CONTROL_ID_ATTR = 'data-auto-control-id'

const I18nContext = React.createContext<I18nContextValue | undefined>(undefined)

const originalTextByNode = new WeakMap<Text, string>()

const shouldSkipElement = (element: Element | null): boolean => {
    if (!element) {
        return true
    }

    const tagName = element.tagName
    if (
        tagName === 'SCRIPT' ||
        tagName === 'STYLE' ||
        tagName === 'NOSCRIPT' ||
        tagName === 'CODE' ||
        tagName === 'PRE' ||
        tagName === 'TEXTAREA'
    ) {
        return true
    }

    if (
        element.closest(
            '[data-i18n-skip="true"], [contenteditable="true"], .ProseMirror, .ql-editor',
        )
    ) {
        return true
    }

    return false
}

const shouldLocalizeText = (value: string): boolean => {
    const raw = value.trim()
    if (!raw) {
        return false
    }

    if (/^https?:\/\//i.test(raw)) {
        return false
    }

    if (/^[\d\s.,:/()[\]+-]+$/.test(raw)) {
        return false
    }

    // Avoid auto-localizing long body content.
    if (raw.length > 140) {
        return false
    }

    return true
}

const localizeTextNode = (node: Text, language: AppLanguage): void => {
    const parent = node.parentElement
    if (shouldSkipElement(parent)) {
        return
    }

    const current = node.textContent ?? ''
    const source = originalTextByNode.get(node) ?? current
    if (!originalTextByNode.has(node)) {
        originalTextByNode.set(node, source)
    }

    if (!shouldLocalizeText(source)) {
        return
    }

    const next = translateLiteral(source, language)
    if (current !== next) {
        node.textContent = next
    }
}

const toOriginalAttrKey = (attributeName: string): string => {
    const normalized = attributeName.replace(/[^a-z0-9]/gi, '').toLowerCase()
    return `data-i18n-orig-${normalized}`
}

const localizeAttributes = (element: Element, language: AppLanguage): void => {
    if (shouldSkipElement(element)) {
        return
    }

    LOCALIZABLE_ATTRIBUTES.forEach((attributeName) => {
        const current = element.getAttribute(attributeName)
        if (!current || !shouldLocalizeText(current)) {
            return
        }

        const originalKey = toOriginalAttrKey(attributeName)
        const original = element.getAttribute(originalKey) ?? current
        if (!element.hasAttribute(originalKey)) {
            element.setAttribute(originalKey, original)
        }

        const next = translateLiteral(original, language)
        if (current !== next) {
            element.setAttribute(attributeName, next)
        }
    })
}

const isElementInputControl = (
    element: Element,
): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement => {
    const tagName = element.tagName
    return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT'
}

const isSupportedInputType = (
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
): boolean => {
    if (element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
        return true
    }

    const inputType = (element.type || 'text').toLowerCase()
    return ![
        'hidden',
        'checkbox',
        'radio',
        'button',
        'submit',
        'reset',
        'image',
        'file',
        'range',
        'color',
    ].includes(inputType)
}

const findNonGeneratedLabel = (
    control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
): HTMLLabelElement | null => {
    const wrappedLabel = control.closest('label')
    if (
        wrappedLabel instanceof HTMLLabelElement &&
        wrappedLabel.getAttribute(AUTO_LABEL_GENERATED_ATTR) !== 'true'
    ) {
        return wrappedLabel
    }

    if (control.id) {
        const matching = document.querySelector(`label[for="${CSS.escape(control.id)}"]`)
        if (
            matching instanceof HTMLLabelElement &&
            matching.getAttribute(AUTO_LABEL_GENERATED_ATTR) !== 'true'
        ) {
            return matching
        }
    }

    return null
}

const applyExplicitLabelStyle = (
    control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    label: HTMLLabelElement,
): void => {
    if (label.contains(control)) {
        const directTextElement = Array.from(label.children).find((child) => {
            if (!(child instanceof HTMLElement)) {
                return false
            }

            if (child === control) {
                return false
            }

            if (child.contains(control)) {
                return false
            }

            return child.textContent?.trim().length
        })

        if (directTextElement instanceof HTMLElement) {
            directTextElement.classList.add(AUTO_LABEL_TEXT_CLASS_NAME)
            return
        }
    }

    label.classList.add(AUTO_LABEL_CLASS_NAME)
}

const normalizeFieldLabelText = (value: string): string => {
    return value
        .replace(/\*+/g, '')
        .replace(/\.\.\.+/g, '')
        .replace(/[_-]+/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim()
}

const deriveFieldLabel = (
    control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    language: AppLanguage,
): string => {
    const candidates = [
        control.getAttribute('title'),
        control.getAttribute('aria-label'),
        control.getAttribute('placeholder'),
        control.getAttribute('name'),
        control.getAttribute('id'),
    ]

    const raw = candidates
        .map((item) => (typeof item === 'string' ? normalizeFieldLabelText(item) : ''))
        .find((item) => item.length > 0)

    const fallback = raw || 'Field'
    return translateLiteral(fallback, language)
}

const ensureControlId = (
    control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
): string => {
    if (control.id) {
        return control.id
    }

    const existingGeneratedId = control.getAttribute(AUTO_CONTROL_ID_ATTR)
    if (existingGeneratedId) {
        control.id = existingGeneratedId
        return existingGeneratedId
    }

    const generatedId = `cms-auto-field-${Math.random().toString(36).slice(2, 10)}`
    control.setAttribute(AUTO_CONTROL_ID_ATTR, generatedId)
    control.id = generatedId
    return generatedId
}

const removeGeneratedLabel = (
    control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
): void => {
    const generatedLabelId = control.getAttribute(AUTO_LABEL_ATTR)
    if (!generatedLabelId) {
        return
    }

    const generatedLabel = document.getElementById(generatedLabelId)
    if (generatedLabel?.getAttribute(AUTO_LABEL_GENERATED_ATTR) === 'true') {
        generatedLabel.remove()
    }
}

const ensureFieldLabel = (
    control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    language: AppLanguage,
): void => {
    if (!isSupportedInputType(control)) {
        return
    }

    if (control.getAttribute('data-skip-auto-label') === 'true') {
        return
    }

    if (control.closest('[contenteditable="true"], .ProseMirror, .ql-editor')) {
        return
    }

    const parent = control.parentElement
    if (!parent || shouldSkipElement(parent)) {
        return
    }

    const explicitLabel = findNonGeneratedLabel(control)
    if (explicitLabel) {
        applyExplicitLabelStyle(control, explicitLabel)
        removeGeneratedLabel(control)
        return
    }

    const labelText = deriveFieldLabel(control, language)
    const controlId = ensureControlId(control)

    const existingLabelId = control.getAttribute(AUTO_LABEL_ATTR)
    let labelElement: HTMLLabelElement | null = existingLabelId
        ? (document.getElementById(existingLabelId) as HTMLLabelElement | null)
        : null

    if (!labelElement || labelElement.getAttribute(AUTO_LABEL_GENERATED_ATTR) !== 'true') {
        labelElement = document.createElement('label')
        const labelId = `cms-auto-label-${Math.random().toString(36).slice(2, 10)}`
        labelElement.id = labelId
        labelElement.setAttribute(AUTO_LABEL_GENERATED_ATTR, 'true')
        labelElement.className = AUTO_LABEL_CLASS_NAME
        control.setAttribute(AUTO_LABEL_ATTR, labelId)
    }

    labelElement.htmlFor = controlId
    labelElement.textContent = labelText

    if (labelElement.parentElement !== parent) {
        parent.insertBefore(labelElement, control)
        return
    }

    if (labelElement.nextSibling !== control) {
        parent.insertBefore(labelElement, control)
    }
}

const ensureFieldLabelsInSubtree = (root: Node, language: AppLanguage): void => {
    const applyForControl = (node: Node) => {
        if (!(node instanceof Element)) {
            return
        }

        if (isElementInputControl(node)) {
            ensureFieldLabel(node, language)
        }

        node.querySelectorAll('input, textarea, select').forEach((control) => {
            if (isElementInputControl(control)) {
                ensureFieldLabel(control, language)
            }
        })
    }

    if (root.nodeType === Node.ELEMENT_NODE) {
        applyForControl(root)
    }

    if (root.nodeType === Node.TEXT_NODE && root.parentElement) {
        applyForControl(root.parentElement)
    }
}

const localizeSubtree = (root: Node, language: AppLanguage): void => {
    if (root.nodeType === Node.TEXT_NODE) {
        localizeTextNode(root as Text, language)
        ensureFieldLabelsInSubtree(root, language)
        return
    }

    if (root.nodeType !== Node.ELEMENT_NODE) {
        return
    }

    const rootElement = root as Element
    localizeAttributes(rootElement, language)

    const walker = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT)
    let current = walker.nextNode()
    while (current) {
        localizeTextNode(current as Text, language)
        current = walker.nextNode()
    }

    rootElement.querySelectorAll('[title], [placeholder], [aria-label]').forEach((element) => {
        localizeAttributes(element, language)
    })

    // ensureFieldLabelsInSubtree(rootElement, language);
}

const readStoredLanguage = (): AppLanguage => {
    if (typeof window === 'undefined') {
        return DEFAULT_LANGUAGE
    }

    const stored = window.localStorage.getItem(I18N_STORAGE_KEY)
    return stored === 'en' || stored === 'vi' ? stored : DEFAULT_LANGUAGE
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = React.useState<AppLanguage>(readStoredLanguage)
    const applyingRef = React.useRef(false)

    const setLanguage = React.useCallback((nextLanguage: AppLanguage) => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(I18N_STORAGE_KEY, nextLanguage)
        }
        setLanguageState(nextLanguage)
    }, [])

    const t = React.useCallback(
        (key: string, params?: Record<string, string | number | boolean | null | undefined>) =>
            translateText(key, language, params),
        [language],
    )

    React.useEffect(() => {
        setCurrentLanguage(language)
        document.documentElement.setAttribute('lang', language === 'vi' ? 'vi' : 'en')
    }, [language])

    React.useEffect(() => {
        const root = document.getElementById('root')
        if (!root) {
            return
        }

        const safelyApply = (target: Node) => {
            applyingRef.current = true
            try {
                localizeSubtree(target, language)
            } finally {
                applyingRef.current = false
            }
        }

        safelyApply(root)

        const observer = new MutationObserver((mutations) => {
            if (applyingRef.current) {
                return
            }

            mutations.forEach((mutation) => {
                if (mutation.type === 'characterData') {
                    safelyApply(mutation.target)
                    return
                }

                if (mutation.type === 'attributes') {
                    safelyApply(mutation.target)
                    return
                }

                mutation.addedNodes.forEach((node) => safelyApply(node))
            })
        })

        observer.observe(root, {
            subtree: true,
            childList: true,
            characterData: true,
            attributes: true,
            attributeFilter: [...LOCALIZABLE_ATTRIBUTES],
        })

        return () => observer.disconnect()
    }, [language])

    const value = React.useMemo<I18nContextValue>(
        () => ({
            language,
            setLanguage,
            t,
        }),
        [language, setLanguage, t],
    )

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = (): I18nContextValue => {
    const context = React.useContext(I18nContext)
    if (!context) {
        throw new Error('useI18n must be used within I18nProvider')
    }

    return context
}
