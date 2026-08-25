import { Component, type ErrorInfo, type ReactNode } from 'react'

export interface SidebarContentBoundaryProps {
  /** Changing the selected contribution clears an error from the old one. */
  resetKey: string
  children: ReactNode
  fallback(retry: () => void): ReactNode
  onError?(error: unknown, info: ErrorInfo): void
}

interface SidebarContentBoundaryState {
  hasError: boolean
  error?: unknown
}

/** Contains one failing contribution without taking down the sidebar shell. */
export class SidebarContentBoundary extends Component<SidebarContentBoundaryProps, SidebarContentBoundaryState> {
  state: SidebarContentBoundaryState = { hasError: false }

  static getDerivedStateFromError(error: unknown): SidebarContentBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    this.props.onError?.(error, info)
  }

  componentDidUpdate(previous: SidebarContentBoundaryProps): void {
    if (previous.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: undefined })
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback(() => { this.setState({ hasError: false, error: undefined }) })
    }
    return this.props.children
  }
}
