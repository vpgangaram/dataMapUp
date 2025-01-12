<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3>Electric Range Distribution</h3>
      <div class="controls">
            Histogram
      </div>
    </div>

    <div class="chart-wrapper">
      <canvas ref="chartRef"></canvas>
    </div>

    <div class="range-stats" v-if="stats">
      <v-chip-group>
        <v-chip color="primary">
          Average: {{ stats.average }}mi
        </v-chip>
        <v-chip color="success">
          Max: {{ stats.max }}mi
        </v-chip>
        <v-chip color="warning">
          Min: {{ stats.min }}mi
        </v-chip>
        <v-chip color="info">
          Median: {{ stats.median }}mi
        </v-chip>
      </v-chip-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'
import 'chartjs-chart-box-and-violin-plot'
import type { EVData } from '@/types/EVData'

const props = defineProps<{
  data: EVData[]
}>()

const chartRef = ref<HTMLCanvasElement | null>(null)
const chartType = ref('histogram')
const stats = ref<any>(null)
let chart: Chart | null = null

const calculateStats = (ranges: number[]) => {
  const sortedRanges = [...ranges].sort((a, b) => a - b)
  const sum = sortedRanges.reduce((a, b) => a + b, 0)

  return {
    min: Math.min(...ranges),
    max: Math.max(...ranges),
    average: Math.round(sum / ranges.length),
    median: sortedRanges[Math.floor(sortedRanges.length / 2)]
  }
}

const createHistogram = (ranges: number[]) => {
  const bucketSize = 50
  const maxRange = Math.max(...ranges)
  const buckets: Record<string, number> = {}

  for (let i = 0; i <= maxRange; i += bucketSize) {
    buckets[`${i}-${i + bucketSize - 1}`] = 0
  }

  ranges.forEach(range => {
    const bucketIndex = Math.floor(range / bucketSize)
    const bucketKey = `${bucketIndex * bucketSize}-${(bucketIndex + 1) * bucketSize - 1}`
    buckets[bucketKey] = (buckets[bucketKey] || 0) + 1
  })

  return {
    labels: Object.keys(buckets),
    data: Object.values(buckets)
  }
}

const createChart = () => {
  if (!chartRef.value) return

  const ranges = props.data
    .map(item => parseInt(item["Electric Range"] || '0'))
    .filter(range => range > 0)

  stats.value = calculateStats(ranges)

  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  if (chartType.value === 'histogram') {
    const { labels, data } = createHistogram(ranges)

    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Number of Vehicles',
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Vehicles: ${context.parsed.y}`
              },
              title: (items) => {
                return `Range: ${items[0].label} miles`
              }
            }
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
              text: 'Range (miles)'
            }
          }
        }
      }
    })
  }
}

watch(() => props.data, () => {
  if (chart) {
    chart.destroy()
  }
  createChart()
}, { deep: true })

watch(chartType, () => {
  if (chart) {
    chart.destroy()
  }
  createChart()
})

onMounted(() => {
  if (props.data.length > 0) {
    createChart()
  }
})
</script>

<style scoped>
.chart-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-wrapper {
  flex-grow: 1;
  position: relative;
  min-height: 300px;
}

.range-stats {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}

h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}
</style>
