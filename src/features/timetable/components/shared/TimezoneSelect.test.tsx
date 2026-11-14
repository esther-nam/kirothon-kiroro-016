import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { TimezoneSelect } from './TimezoneSelect'

describe('TimezoneSelect', () => {
  it('[R7.16] shows the zone name', () => {
    render(<TimezoneSelect value="Asia/Seoul" onChange={vi.fn()} />)
    expect(screen.getByRole('combobox')).toHaveValue('Asia/Seoul')
  })

  it('search filters zones and click selects', async () => {
    const onChange = vi.fn()
    render(<TimezoneSelect value="Asia/Seoul" onChange={onChange} />)
    await userEvent.clear(screen.getByRole('combobox'))
    await userEvent.type(screen.getByRole('combobox'), 'new york')
    const options = screen.getAllByRole('option')
    expect(options.map((o) => o.textContent)).toContain('America/New_York')
    expect(options.every((o) => /new_york/i.test(o.textContent ?? ''))).toBe(true)
    await userEvent.click(screen.getByRole('option', { name: 'America/New_York' }))
    expect(onChange).toHaveBeenCalledWith('America/New_York')
  })

  it('[R13.8] an invalid typed value cannot be submitted', async () => {
    const onChange = vi.fn()
    render(<TimezoneSelect value="Asia/Seoul" onChange={onChange} />)
    const input = screen.getByRole('combobox')
    await userEvent.clear(input)
    await userEvent.type(input, 'Mars/Base{Enter}')
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByText('No matching timezone')).toBeInTheDocument()
    await userEvent.tab()
    expect(onChange).not.toHaveBeenCalled()
    expect(input).toHaveValue('Asia/Seoul')
  })

  it('keyboard selection with arrows and Enter', async () => {
    const onChange = vi.fn()
    render(<TimezoneSelect value="UTC" onChange={onChange} />)
    const input = screen.getByRole('combobox')
    await userEvent.clear(input)
    await userEvent.type(input, 'seoul')
    await userEvent.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith('Asia/Seoul')
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('can be disabled', async () => {
    render(<TimezoneSelect value="UTC" onChange={vi.fn()} disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })
})
