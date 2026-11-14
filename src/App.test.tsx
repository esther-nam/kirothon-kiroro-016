import { render, screen } from '@testing-library/react'
import App from './App'
import { AppProviders } from './app/providers'
import { useRepository } from './features/timetable/data/use-repository'

function Probe() {
  return <p>{useRepository() ? 'repo' : 'none'}</p>
}

describe('App', () => {
  it('[R14.20] renders the heading and header buttons', () => {
    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )
    expect(screen.getByRole('heading', { name: 'Personal Weekly Timetable' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add event' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
  })

  it('[R18.1] AppProviders supplies the mock repository by default', () => {
    render(
      <AppProviders>
        <Probe />
      </AppProviders>,
    )
    expect(screen.getByText('repo')).toBeInTheDocument()
  })
})
