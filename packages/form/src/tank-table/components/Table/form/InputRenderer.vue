<template>
  <div class="input-wrapper">
    <input v-model="model" v-bind="inputAttrs" @blur="$emit('blur')" class="render-input" />
    <button v-if="model" type="button" class="btn-clear" @mousedown.prevent="clearAndBlur">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useAttrs, computed } from 'vue'

defineOptions({ inheritAttrs: false })

const model = defineModel<any>()

const emit = defineEmits<{
  (e: 'blur'): void
}>()

const attrs = useAttrs()

const inputAttrs = computed(() => {
  const { class: _, value: __, ...rest } = attrs
  return rest
})

const clearAndBlur = () => {
  model.value = ''
  emit('blur')
}
</script>

<style scoped>
.input-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background-color: #fff;
}

.render-input {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: 2px solid #2563eb;
  border-radius: 0;
  padding: 0 38px 0 8px;
  outline: none;
  font-size: inherit;
  font-family: inherit;
}

.btn-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #94a3b8;
  z-index: 2;
}

.btn-clear:hover {
  color: #475569;
}

.btn-clear svg {
  width: 24px;
  height: 24px;
}
</style>
