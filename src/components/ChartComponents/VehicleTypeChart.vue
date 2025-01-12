<template>
  <div class="chart">
    <h3>Vehicle Types Distribution</h3>
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

  const vehicleTypes: Record<string, number> = {}
  props.data.forEach(item => {
    vehicleTypes[item['Electric Vehicle Type']] = (vehicleTypes[item['Electric Vehicle Type']] || 0) + 1;
  });


  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(vehicleTypes),
      datasets: [{
        data: Object.values(vehicleTypes),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0'
        ]
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
