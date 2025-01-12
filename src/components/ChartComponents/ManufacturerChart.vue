<template>
  <div class="chart">
    <h3>Top Manufacturers Distribution</h3>
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const chartRef = ref(null)
let chart = null

const createChart = () => {
  const manufacturers = {}
  props.data.forEach(item => {
    manufacturers[item.Make] = (manufacturers[item.Make] || 0) + 1
  })

  const sortedManufacturers = Object.entries(manufacturers)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  const ctx = chartRef.value.getContext('2d')
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sortedManufacturers.map(([make]) => make),
      datasets: [{
        label: 'Number of Vehicles',
        data: sortedManufacturers.map(([, count]) => count),
        backgroundColor: '#36A2EB',
        borderColor: '#2693e6',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Vehicles'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Manufacturer'
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
