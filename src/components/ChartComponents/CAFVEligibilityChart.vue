<template>
  <div class="chart">
    <h3>CAFV Eligibility Distribution</h3>
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

  const eligibilityCounts: Record<string, number> = {}
  props.data.forEach(item => {
    const status = item["Clean Alternative Fuel Vehicle (CAFV) Eligibility"]
    eligibilityCounts[status] = (eligibilityCounts[status] || 0) + 1
  })

  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(eligibilityCounts),
      datasets: [{
        data: Object.values(eligibilityCounts),
        backgroundColor: ['#4BC0C0', '#FF6384', '#FFCE56']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
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
