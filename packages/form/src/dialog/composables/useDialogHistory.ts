import { useDialogStore } from '../stores/dialog'

export function useDialogHistory() {
  const storeDialog = useDialogStore()

  const pushHistory = (modalId: string) => {
    const currentState = typeof window !== 'undefined' ? window.history.state : {}
    const nextPosition = typeof currentState?.position === 'number' ? currentState.position + 1 : undefined
    history.pushState(
      {
        ...currentState,
        ...(nextPosition !== undefined ? { position: nextPosition } : {}),
        modalId,
      },
      '',
      window.location.href,
    )
    storeDialog.addModalId(modalId)
  }

  const popHistory = (modalId: string) => {
    if (typeof window !== 'undefined' && window.history.state?.modalId === modalId) {
      history.back()
    }
    storeDialog.removeModalId(modalId)
  }

  return {
    pushHistory,
    popHistory,
  }
}
