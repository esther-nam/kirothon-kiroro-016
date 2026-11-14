import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('[R14.20] renders the heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Personal Weekly Timetable' })).toBeInTheDocument()
  })
})
