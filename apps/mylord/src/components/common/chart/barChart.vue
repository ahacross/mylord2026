<template>
  <div class="bar-chart-wrapper" :style="{ width: typeof width === 'number' ? `${width}px` : width }">
    <div v-if="title" class="chart-title">
      {{ title }}
    </div>
    <div ref="$refChart" class="chart-svg-container"></div>
    <div class="chart-legend" v-if="seriesList.length && !useDynamicColor">
      <div v-for="(item, idx) in seriesList" :key="idx" class="legend-item">
        <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
        <span class="legend-label">{{ item.name }}</span>
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
    required: true,
  },
  title: {
    type: String,
    default: "",
  },
  groups: {
    type: Array,
    default: () => [],
  },
  categories: {
    type: Array,
    default: () => [],
  },
  useDynamicColor: {
    type: Boolean,
    default: false,
  },
  width: {
    type: [Number, String],
    default: 500,
  },
});

const $refChart = ref(null);

const DEFAULT_SERIES_COLORS = {
  "예배 전": "#10b981",
  "예배 후": "#3b82f6",
  "납부": "#10b981",
  "미납": "#f43f5e",
};

const COLOR_PALETTE = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"];

const seriesList = computed(() => {
  if (!props.columns || !props.columns.length) return [];
  return props.columns.map((col, idx) => {
    const name = String(col[0]);
    const color = DEFAULT_SERIES_COLORS[name] || COLOR_PALETTE[idx % COLOR_PALETTE.length];
    return { name, color };
  });
});

const drawChart = () => {
  if (!$refChart.value) return;

  d3.select($refChart.value).selectAll("svg").remove();

  if (!props.columns || !props.columns.length) return;

  const isMultiCategory = props.categories && props.categories.length > 0;
  const categories = isMultiCategory
    ? props.categories
    : props.columns.map((c) => String(c[0]));

  const seriesNames = props.columns.map((c) => String(c[0]));

  const chartData = categories.map((cat, catIdx) => {
    const row = { category: cat };
    props.columns.forEach((col) => {
      const name = String(col[0]);
      if (isMultiCategory) {
        const rawVal = typeof col[catIdx + 1] === "number" ? col[catIdx + 1] : parseFloat(col[catIdx + 1]) || 0;
        row[name] = Math.min(100, Math.max(0, rawVal));
      } else {
        const rawVal = typeof col[1] === "number" ? col[1] : parseFloat(col[1]) || 0;
        row[name] = Math.min(100, Math.max(0, rawVal));
      }
    });
    return row;
  });

  const svgContainerWidth = typeof props.width === "number" ? props.width : 500;
  const height = 240;
  const margin = { top: 35, right: 20, bottom: 50, left: 30 };

  const svg = d3
    .select($refChart.value)
    .append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .attr("viewBox", `0 0 ${svgContainerWidth} ${height}`);

  const x0 = d3
    .scaleBand()
    .domain(categories)
    .range([margin.left, svgContainerWidth - margin.right])
    .paddingInner(0.28);

  const x1 = d3
    .scaleBand()
    .domain(isMultiCategory ? seriesNames : [seriesNames[0]])
    .range([0, x0.bandwidth()])
    .padding(0.1);

  let maxVal = 0;
  chartData.forEach((d) => {
    seriesNames.forEach((sName) => {
      if (d[sName] > maxVal) maxVal = d[sName];
    });
  });
  if (maxVal === 0) maxVal = 100;

  const y = d3
    .scaleLinear()
    .domain([0, isMultiCategory ? 100 : maxVal * 1.15])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // 세분화된 파스텔 톤 동적 컬러 룰
  const getBarColor = (sName, val) => {
    if (props.useDynamicColor) {
      if (val >= 100) return "#059669"; // 100%: 현재 깊은 녹색
      if (val >= 75)  return "#84cc16"; // 75% 이상: 파스텔 톤 연두색 (Lime)
      if (val > 50)   return "#fb923c"; // 50% 초과: 파스텔 톤 주황색 (Orange)
      if (val > 25)   return "#facc15"; // 50% 이하: 파스텔 톤 노란색 (Yellow)
      return "#f87171";                 // 25% 이하: 파스텔 톤 레드 (Red)
    }
    return DEFAULT_SERIES_COLORS[sName] || COLOR_PALETTE[seriesNames.indexOf(sName) % COLOR_PALETTE.length];
  };

  // Grid Lines
  svg
    .append("g")
    .attr("class", "grid-lines")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickSize(-(svgContainerWidth - margin.left - margin.right))
        .tickFormat("")
    )
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .selectAll(".tick line")
        .attr("stroke", "#f1f5f9")
        .attr("stroke-dasharray", "3 3")
    );

  if (isMultiCategory) {
    const categoryGroup = svg
      .selectAll(".cat-group")
      .data(chartData)
      .enter()
      .append("g")
      .attr("class", "cat-group")
      .attr("transform", (d) => `translate(${x0(d.category)}, 0)`);

    seriesNames.forEach((sName) => {
      // 1. Bars
      categoryGroup
        .append("rect")
        .attr("x", () => x1(sName))
        .attr("width", x1.bandwidth())
        .attr("y", height - margin.bottom)
        .attr("height", 0)
        .attr("fill", (d) => getBarColor(sName, d[sName]))
        .attr("rx", 5)
        .transition()
        .duration(700)
        .ease(d3.easeCubicOut)
        .attr("y", (d) => y(d[sName]))
        .attr("height", (d) => height - margin.bottom - y(d[sName]));

      // 2. Bar Top Value Label (예: 100%)
      categoryGroup
        .append("text")
        .attr("x", () => (x1(sName) || 0) + x1.bandwidth() / 2)
        .attr("y", (d) => y(d[sName]) - 8)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("font-weight", "700")
        .attr("fill", "#1e293b")
        .attr("opacity", 0)
        .text((d) => (d[sName] !== undefined ? `${d[sName]}%` : ""))
        .transition()
        .duration(700)
        .attr("opacity", 1);

      // 3. Bar Bottom Sub-label (예배 전, 예배 후)
      categoryGroup
        .append("text")
        .attr("x", () => (x1(sName) || 0) + x1.bandwidth() / 2)
        .attr("y", height - margin.bottom + 16)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("font-weight", "600")
        .attr("fill", "#475569")
        .text(sName);
    });

    // 4. Category Label (4주, 12주, 연간)
    categoryGroup
      .append("text")
      .attr("x", x0.bandwidth() / 2)
      .attr("y", height - margin.bottom + 36)
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
      .attr("font-weight", "800")
      .attr("fill", "#1e293b")
      .text((d) => d.category);

    // Baseline
    svg
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", svgContainerWidth - margin.right)
      .attr("y1", height - margin.bottom)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 1);

  } else {
    // Single Category
    const singleData = props.columns.map(([k, v]) => ({
      key: String(k),
      value: typeof v === "number" ? v : parseFloat(v) || 0,
      color: DEFAULT_SERIES_COLORS[k] || COLOR_PALETTE[0],
    }));

    const xSingle = d3
      .scaleBand()
      .domain(singleData.map((d) => d.key))
      .range([margin.left, svgContainerWidth - margin.right])
      .padding(0.35);

    svg
      .selectAll(".bar")
      .data(singleData)
      .enter()
      .append("rect")
      .attr("x", (d) => xSingle(d.key))
      .attr("width", xSingle.bandwidth())
      .attr("y", height - margin.bottom)
      .attr("height", 0)
      .attr("fill", (d) => getBarColor(d.key, d.value))
      .attr("rx", 5)
      .transition()
      .duration(700)
      .ease(d3.easeCubicOut)
      .attr("y", (d) => y(d.value))
      .attr("height", (d) => height - margin.bottom - y(d.value));

    svg
      .selectAll(".val-label")
      .data(singleData)
      .enter()
      .append("text")
      .attr("x", (d) => (xSingle(d.key) || 0) + xSingle.bandwidth() / 2)
      .attr("y", (d) => y(d.value) - 6)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("font-weight", "700")
      .attr("fill", "#334155")
      .attr("opacity", 0)
      .text((d) => d.value)
      .transition()
      .duration(700)
      .attr("opacity", 1);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xSingle).tickSize(0))
      .call((g) => g.select(".domain").attr("stroke", "#e2e8f0"))
      .selectAll("text")
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .attr("fill", "#64748b")
      .attr("dy", "12px");
  }
};

onMounted(() => {
  drawChart();
});

watch(
  () => [props.columns, props.categories],
  () => {
    drawChart();
  },
  { deep: true }
);
</script>

<style scoped>
.bar-chart-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.chart-title {
  text-align: center;
  font-weight: 700;
  font-size: 16px;
  color: #334155;
  margin-bottom: 12px;
  font-family: 'Outfit', sans-serif;
}

.chart-svg-container {
  width: 100%;
}

.chart-legend {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #475569;
  font-weight: 500;
}

.legend-color {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  display: inline-block;
}
</style>
