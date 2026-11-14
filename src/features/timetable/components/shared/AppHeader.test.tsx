import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { AppHeader } from './AppHeader'

describe('AppHeader', () => {
  it('[R6.14] Add event and Settings buttons have names and fire callbacks', async () => {
    const onAddEvent = vi.fn()
    const onOpenSettings = vi.fn()
    render(<AppHeader onAddEvent={onAddEvent} onOpenSettings={onOpenSettings} />)
    await userEvent.click(screen.getByRole('button', { name: 'Add event' }))
    await userEvent.click(screen.getByRole('button', { name: 'Settings' }))
    expect(onAddEvent).toHaveBeenCalledTimes(1)
    expect(onOpenSettings).toHaveBeenCalledTimes(1)
  })

  it('renders the user menu slot', () => {
    render(<AppHeader onAddEvent={vi.fn()} onOpenSettings={vi.fn()} userMenu={<i>menu</i>} />)
    expect(screen.getByText('menu')).toBeInTheDocument()
  })
})
