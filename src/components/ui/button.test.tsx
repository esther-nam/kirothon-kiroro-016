import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders its label with Tailwind classes', () => {
    render(<Button>Save</Button>)
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('inline-flex', 'bg-primary')
  })

  it('applies the variant classes', () => {
    render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass('bg-destructive')
  })
})
