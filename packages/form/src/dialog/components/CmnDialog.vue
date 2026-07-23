<template>
  <DialogComponent v-bind="$attrs" :close="() => emit('cancel')">
    <template #title>
      {{ title }}
    </template>
    <slot />
    <template #buttons>
      <button v-if="type === 'confirm'" class="point" @click="emit('confirm')">
        {{ confirmTxt }}
      </button>
      <button :class="{ point: type === 'alert' }" @click="emit('cancel')">
        {{ cancelTxt }}
      </button>
    </template>
  </DialogComponent>
</template>

<script setup lang="ts">
import DialogComponent from './DialogComponent.vue'

const emit = defineEmits(['confirm', 'cancel', 'closed'])

interface Props {
  type: string
  title: string
  confirmTxt: string
  cancelTxt: string
  useHistory: boolean
}

withDefaults(defineProps<Props>(), {
  type: '',
  title: '',
})
</script>
