<template>
  <VueDatePicker v-model="datePickerModel" v-bind="props" :range="rangeProp" :formats="resolvedFormats" teleport="body" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type RootProps, VueDatePicker, WeekStart } from '@vuepic/vue-datepicker'
import { ko } from '@common/utils'

// defineOptions({
//   inheritAttrs: false,
// })

const props = withDefaults(defineProps<Omit<RootProps, 'modelValue'>>(), {
  locale: () => ko,
  modelType: 'yyyyMMdd',
  clearable: true,
  noToday: true,
  weekStart: WeekStart.Sunday,
  yearFirst: true,
  yearRange: () => [2000, 2040],
  autoApply: true,
  timeConfig: () => ({
    enableTimePicker: false,
  }),
  actionRow: () => ({
    selectBtnLabel: '선택',
    cancelBtnLabel: '취소',
  }),
  range: false,
})

const resolvedFormats = computed(() => {
  if (props.formats) return props.formats
  const { modelType } = props
  if (modelType === 'yyyyMMdd' || modelType === 'yyyy-MM-dd' || modelType === 'yyyy.MM.dd') {
    return { input: 'yyyy.MM.dd', preview: 'yyyy.MM.dd' }
  } else if (modelType === 'yyyyMM' || modelType === 'yyyy-MM' || modelType === 'yyyy.MM') {
    return { input: 'yyyy.MM', preview: 'yyyy.MM' }
  } else {
    return { input: 'yyyy', preview: 'yyyy' }
  }
})

const rangeProp = computed(() => {
  if (props.range === false) {
    return false
  } else {
    let returnRange = { partialRange: true }
    if (typeof props.range === 'object') {
      returnRange = { ...returnRange, ...props.range }
    }
    return returnRange
  }
})

const rawModel = defineModel<any>()

const datePickerModel = computed({
  get() {
    if (typeof rawModel.value === 'number') {
      return String(rawModel.value)
    }
    return rawModel.value
  },
  set(val) {
    if (typeof rawModel.value === 'number' && typeof val === 'string' && !isNaN(Number(val))) {
      rawModel.value = Number(val)
    } else {
      rawModel.value = val
    }
  },
})
</script>

<style>
@import '@vuepic/vue-datepicker/dist/main.css';
</style>
