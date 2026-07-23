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
import { useEventListener } from '@vueuse/core'
import { useDialogHistory } from '../composables/useDialogHistory'

interface Props {
  useHistory?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  useHistory: true,
})

const emit = defineEmits(['closed'])
const modelValue = defineModel<boolean>()

const modalId = ref<string>(`modal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`)
const closeDialog = () => {
  modelValue.value = false
  emit('closed')
}

const isTitle = computed(() => !!useSlots().title)

const { pushHistory, popHistory } = useDialogHistory()
let isPushed = false

const handlePush = () => {
  if (!props.useHistory || isPushed) return
  isPushed = true
  pushHistory(modalId.value)
}

const handlePop = () => {
  if (props.useHistory && isPushed) {
    popHistory(modalId.value)
    isPushed = false
  }
  emit('closed')
}

watch(modelValue, (val) => {
  if (val) {
    handlePush()
  } else {
    handlePop()
  }
})

onMounted(() => {
  if (modelValue.value === undefined || modelValue.value === true) {
    handlePush()
  }

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
