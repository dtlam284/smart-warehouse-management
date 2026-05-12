// src/tests/app.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

function Placeholder() {
    return <h1>Smart Warehouse Management</h1>
}

describe('app test setup', () => {
    it('renders a placeholder heading', () => {
        render(<Placeholder />)

        expect(
            screen.getByRole('heading', { name: /smart warehouse management/i }),
        ).toBeInTheDocument()
    })
})
