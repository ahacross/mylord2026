import 'vue-final-modal/style.css'
import './assets/vfm.scss'
import { createVfm as createVfmOriginal } from 'vue-final-modal'

export const createVfm = (): any => createVfmOriginal()

export { default as DialogComponent } from './components/DialogComponent.vue'
export { default as CmnDialog } from './components/CmnDialog.vue'
export * from './composables/useDialog'
export { ModalsContainer, useModal, useModalSlot, useVfm } from 'vue-final-modal'
export { useDialogStore } from './stores/dialog'
