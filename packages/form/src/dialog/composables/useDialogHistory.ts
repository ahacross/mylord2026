export function useDialogHistory() {
  const pushHistory = (modalId: string) => {
    if (typeof window === 'undefined') return
    const currentState = window.history.state || {}
    const nextPosition = typeof currentState?.position === 'number' ? currentState.position + 1 : undefined
    try {
      history.pushState(
        {
          ...currentState,
          ...(nextPosition !== undefined ? { position: nextPosition } : {}),
          modalId,
        },
        '',
        window.location.href,
      )
    } catch {
      // ignore
    }
  }

  const popHistory = (modalId: string) => {
    if (typeof window !== 'undefined' && window.history.state?.modalId === modalId) {
      try {
        history.back()
      } catch {
        // ignore
      }
    }
  }

  return {
    pushHistory,
    popHistory,
  }
}
