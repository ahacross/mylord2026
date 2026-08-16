<template>
  <div class="gauge-chart-wrapper">
    <div v-if="title" class="chart-title">
      {{ title }}
    </div>
    <div ref="$refChart" class="chart-svg-container"></div>
    <div class="chart-legend" v-if="legendItems.length">
      <div 
        v-for="(item, idx) in legendItems" 
        :key="idx" 
        class="legend-item"
      >
        <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
        <span class="legend-label">{{ item.label }}</span>
        <span class="legend-value">{{ item.value }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import * as d3 from "d3";

const props = defineProps({
  columns: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: "",
  },
});

const $refChart = ref(null);

const COLOR_PALETTE = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"];

const parsedData = computed(() => {
  if (!props.columns || !props.columns.length) return [];
  return props.columns.map(([rawLabel, val], index) => {
    let label = String(rawLabel);
    if (label.includes("_")) {
      label = label.split("_")[0];
    }
    const rawVal = typeof val === 'number' ? val : parseFloat(val) || 0
    return {
      label,
      value: Math.min(100, Math.max(0, rawVal)),
      color: COLOR_PALETTE[index % COLOR_PALETTE.length],
    }
  });
});

const legendItems = computed(() => parsedData.value);

const drawGauge = () => {
  if (!$refChart.value) return;

  d3.select($refChart.value).selectAll("svg").remove();

  const data = parsedData.value;
  if (!data.length) return;

  const width = 220;
  const height = 140;

  const svg = d3
    .select($refChart.value)
    .append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height - 20})`);

  const minAngle = -Math.PI / 2;
  const maxAngle = Math.PI / 2;

  const baseRadius = 85;
  const barThickness = 12;
  const gap = 5;

  data.forEach((d, i) => {
    const outerRadius = baseRadius - i * (barThickness + gap);
    const innerRadius = outerRadius - barThickness;

    const bgArc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(minAngle)
      .endAngle(maxAngle)
      .cornerRadius(6);

    svg
      .append("path")
      .attr("d", bgArc)
      .attr("fill", "#f1f5f9");

    const targetAngle = minAngle + (d.value / 100) * (maxAngle - minAngle);

    const fgArc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(minAngle)
      .cornerRadius(6);

    const path = svg
      .append("path")
      .attr("fill", d.color);

    path
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attrTween("d", function () {
        const interpolate = d3.interpolate(minAngle, targetAngle);
        return function (t) {
          fgArc.endAngle(interpolate(t));
          return fgArc();
        };
      });
  });

  const avgValue = Math.round(
    data.reduce((acc, cur) => acc + cur.value, 0) / data.length
  );

  const textGroup = svg.append("g").attr("transform", "translate(0, -10)");

  textGroup
    .append("text")
    .attr("text-anchor", "middle")
    .attr("font-size", "22px")
    .attr("font-weight", "700")
    .attr("fill", "#1e293b")
    .attr("font-family", "Outfit, sans-serif")
    .text(`${avgValue}%`);

  textGroup
    .append("text")
    .attr("text-anchor", "middle")
    .attr("y", 16)
    .attr("font-size", "11px")
    .attr("font-weight", "500")
    .attr("fill", "#64748b")
    .text("평균 출석률");
};

onMounted(() => {
  drawGauge();
});

watch(
  () => props.columns,
  () => {
    drawGauge();
  },
  { deep: true }
);
</script>

<style scoped>
.gauge-chart-wrapper {
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
  font-family: 'Outfit', sans-serif;
}

.chart-svg-container {
  width: 100%;
  max-width: 240px;
  display: flex;
  justify-content: center;
}

.chart-legend {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 4px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #475569;
}

.legend-color {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.legend-label {
  font-weight: 500;
}

.legend-value {
  font-weight: 700;
  color: #1e293b;
}
</style>
