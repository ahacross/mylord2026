<template>
  <div class="doughnut-chart-wrapper">
    <div v-if="title" class="chart-title">
      {{ title }}
    </div>

    <div ref="$refChart" class="chart-svg-container"></div>

    <div class="chart-legend" v-if="legendItems.length">
      <div v-for="(item, idx) in legendItems" :key="idx" class="legend-item">
        <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
        <span class="legend-label">{{ item.label }}</span>
        <span class="legend-value">{{ item.value }}개월</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  columns: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: '',
  },
})

const $refChart = ref(null)

const COLOR_MAP = {
  납부: '#10b981',
  미납: '#cbd5e1',
}

const parsedData = computed(() => {
  if (!props.columns || !props.columns.length) return []
  return props.columns.map(([label, val]) => ({
    label: String(label),
    value: typeof val === 'number' ? val : parseFloat(val) || 0,
    color: COLOR_MAP[label] || '#3b82f6',
  }))
})

const legendItems = computed(() => parsedData.value)

const paidCount = computed(() => {
  const item = parsedData.value.find((d) => d.label === '납부')
  return item ? item.value : 0
})

const totalCount = computed(() => {
  const sum = parsedData.value.reduce((acc, cur) => acc + cur.value, 0)
  return sum || 12
})

const drawChart = () => {
  if (!$refChart.value) return

  d3.select($refChart.value).selectAll('svg').remove()

  const data = parsedData.value
  if (!data.length) return

  const width = 200
  const height = 160
  const radius = Math.min(width, height) / 2 - 10

  const svg = d3
    .select($refChart.value)
    .append('svg')
    .attr('width', '100%')
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`)

  const pie = d3
    .pie()
    .value((d) => d.value)
    .sort(null)

  const arc = d3
    .arc()
    .innerRadius(radius * 0.65)
    .outerRadius(radius)
    .cornerRadius(6)

  const arcs = svg.selectAll('.arc').data(pie(data)).enter().append('g').attr('class', 'arc')

  arcs
    .append('path')
    .attr('fill', (d) => d.data.color)
    .transition()
    .duration(800)
    .ease(d3.easeCubicOut)
    .attrTween('d', function (d) {
      const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d)
      return function (t) {
        return arc(interpolate(t))
      }
    })

  // 중앙 텍스트 영역
  const textGroup = svg.append('g').attr('transform', 'translate(0, 0)')

  textGroup
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('y', -2)
    .attr('font-size', '20px')
    .attr('font-weight', '800')
    .attr('fill', '#0f172a')
    .text(`${paidCount.value} / ${totalCount.value}`)

  const rate = Math.round((paidCount.value / totalCount.value) * 100)
  textGroup
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('y', 16)
    .attr('font-size', '11px')
    .attr('font-weight', '600')
    .attr('fill', '#10b981')
    .text(`${rate}% 달성`)
}

onMounted(drawChart)
watch(() => props.columns, drawChart, { deep: true })
</script>

<style scoped lang="scss">
.doughnut-chart-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.chart-title {
  text-align: center;
  font-weight: 700;
  font-size: 15px;
  color: #334155;
  margin-bottom: 4px;
}

.chart-svg-container {
  width: 100%;
  max-width: 220px;
  display: flex;
  justify-content: center;
}

.chart-legend {
  display: flex;
  gap: 14px;
  justify-content: center;
  margin-top: 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #475569;
}

.legend-color {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.legend-label {
  font-weight: 600;
}

.legend-value {
  font-weight: 700;
  color: #0f172a;
}
</style>
