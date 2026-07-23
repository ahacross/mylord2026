import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDialogStore = defineStore('dialog', () => {
  const modalIds = ref<string[]>([])

  const addModalId = (id: string) => {
    modalIds.value.push(id)
  }

  const lastModalId = () => modalIds.value.at(-1)

  const removeModalId = (id: string) => {
    modalIds.value = modalIds.value.filter((mId) => mId !== id)
  }

  return {
    modalIds,
    addModalId,
    lastModalId,
    removeModalId,
  }
})
