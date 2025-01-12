<template>
  <div class="chart">
    <h3>Top Models Distribution</h3>
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'
import type { EVData } from '@/types/EVData'

const props = defineProps<{
  data: EVData[]
}>()

const chartRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const createChart = () => {
  if (!chartRef.value) return

  // Count models
  const modelCounts: Record<string, number> = {}
  props.data.forEach(item => {
    const modelKey = `${item.Make} ${item.Model}`
    modelCounts[modelKey] = (modelCounts[modelKey] || 0) + 1
  })

  // Get top 10 models
  const topModels = Object.entries(modelCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: topModels.map(([model]) => model),
      datasets: [{
        data: topModels.map(([, count]) => count),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40', '#FF6384', '#36A2EB',
          '#FFCE56', '#4BC0C0'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 12
          }
        }
      }
    }
  })
}

onMounted(() => {
  if (props.data.length > 0) {
    createChart()
  }
})

watch(() => props.data, () => {
  if (chart) {
    chart.destroy()
  }
  if (props.data.length > 0) {
    createChart()
  }
}, { deep: true })
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
}

h3 {
  text-align: center;
  margin-bottom: 1rem;
}
</style>
w
