import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { failed: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }
  static getDerivedStateFromError(): State {
    return { failed: true }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error(error, info)
  }
  render() {
    if (this.state.failed)
      return (
        <main className="boot" role="alert">
          <strong>Algo não saiu como esperado.</strong>
          <span>Recarregue a página para tentar novamente.</span>
          <button className="secondary" onClick={() => window.location.reload()}>
            Recarregar
          </button>
        </main>
      )
    return this.props.children
  }
}
