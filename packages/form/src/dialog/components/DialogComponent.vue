<template>
  <VueFinalModal
    v-model="modelValue"
    class="vfm"
    content-class="vfm__content"
    :modalId="modalId"
    content-transition="vfm-fade"
    overlay-transition="vfm-fade"
    aria-labelledby="dialog-title"
  >
    <div class="popup">
      <button class="close" @click="closeDialog" aria-label="닫기">
        <img :src="ImgClose" alt="닫기" draggable="false" style="width: 16px; height: 16px; display: block" />
      </button>
      <div v-if="isTitle" class="popup-header">
        <span id="dialog-title">
          <slot name="title" />
        </span>
      </div>
      <div class="popup-contents">
        <slot />
      </div>
      <div class="popup-actions">
        <slot name="buttons" :close="closeDialog">
          <button @click="closeDialog">닫기</button>
        </slot>
      </div>
    </div>
  </VueFinalModal>
</template>
<script setup lang="ts">
import { ref, computed, useSlots, watch, onMounted } from 'vue'
import ImgClose from '../assets/close.svg'
import { VueFinalModal, useVfm } from 'vue-final-modal'
import { useDialogStore } from '../stores/dialog'
import { useEventListener } from '@vueuse/core'

const emit = defineEmits(['closed'])
const modelValue = defineModel<boolean>()

const modalId = ref<string>(`modal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`)
const closeDialog = () => {
  modelValue.value = false
  emit('closed')
}

const isTitle = computed(() => !!useSlots().title)

const storeDialog = useDialogStore()

watch(modelValue, (val) => {
  if (val) {
    const currentState = typeof window !== 'undefined' ? window.history.state : {}
    const nextPosition = typeof currentState?.position === 'number' ? currentState.position + 1 : undefined
    history.pushState(
      {
        ...currentState,
        ...(nextPosition !== undefined ? { position: nextPosition } : {}),
        modalId: modalId.value,
      },
      '',
      window.location.href,
    )
    storeDialog.addModalId(modalId.value)
  } else {
    if (typeof window !== 'undefined' && window.history.state?.modalId === modalId.value) {
      history.back()
    }

    storeDialog.removeModalId(modalId.value)
    emit('closed')
  }
})

onMounted(() => {
  useEventListener(window, 'popstate', () => {
    try {
      const vfm = useVfm()
      if (modalId.value) {
        vfm.close(modalId.value)
      } else {
        vfm.closeAll()
      }
    } catch {
      // fallback
    }
  })
})
</script>

<style lang="scss">
@use '../assets/vfm' as *;
</style>
