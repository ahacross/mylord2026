import { h } from 'vue'
import CmnDialog from '../components/CmnDialog.vue'
import { useModal, VueFinalModal } from 'vue-final-modal'
import type { ComponentProps } from 'vue-final-modal'

interface DialogOptions {
  title?: string
  msg: string
  confirmTxt?: string
  cancelTxt?: string
}

const Dialog =
  (type: string) =>
  (options: DialogOptions, modalProps: Partial<ComponentProps<typeof VueFinalModal>> = {}) =>
    new Promise((resolve: (value: boolean) => void) => {
      const { open, close } = useModal({
        component: CmnDialog,
        attrs: {
          type,
          title: options.title || '',
          confirmTxt: options.confirmTxt || '확인',
          cancelTxt: options.cancelTxt || (type === 'alert' ? '확인' : '취소'),
          useHistory: true,
          ...modalProps,
          onConfirm() {
            resolve(true)
            close()
          },
          onCancel() {
            resolve(false)
            close()
          },
          onClosed() {
            resolve(false)
          },
        },
        slots: {
          default: () =>
            h(
              'div',
              {},
              options.msg.split(/<br\s*\/?>/gi).map((text: string) => h('p', text)),
            ),
        },
      })
      setTimeout(open, 100)
    })

export const useDialog = {
  alert: Dialog('alert'),
  confirm: Dialog('confirm'),
}
