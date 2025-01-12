<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3>Yearly EV Adoption Trend</h3>
      <div class="controls">
        <v-btn-toggle v-model="viewType" mandatory density="comfortable">
          <v-btn value="yearly" prepend-icon="mdi-chart-bar">
            Yearly
          </v-btn>
          <v-btn value="cumulative" prepend-icon="mdi-chart-line">
            Cumulative
          </v-btn>
        </v-btn-toggle>

        <v-btn-toggle v-model="groupBy" mandatory density="comfortable" class="ml-4">
          <v-btn value="all">
            All
          </v-btn>
          <v-btn value="type">
            By Type
          </v-btn>
          <v-btn value="make">
            By Make
          </v-btn>
        </v-btn-toggle>
      </div>
    </div>

    <div class="chart-wrapper">
      <canvas ref="chartRef"></canvas>
    </div>

    <div class="trend-stats" v-if="stats">
      <v-chip-group>
        <v-chip color="primary">
          Total EVs: {{ stats.total }}
        </v-chip>
        <v-chip :color="stats.growthRate >= 0 ? 'success' : 'error'">
          YoY Growth: {{ stats.growthRate }}%
        </v-chip>
        <v-chip color="info">
          Peak Year: {{ stats.peakYear }}
        </v-chip>
      </v-chip-group>
    </div>
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
const viewType = ref('yearly')
const groupBy = ref('all')
const stats = ref(null)
let chart: Chart | null = null

const CHART_COLORS = [
  'rgba(75, 192, 192, 0.6)',
  'rgba(255, 99, 132, 0.6)',
  'rgba(255, 205, 86, 0.6)',
  'rgba(54, 162, 235, 0.6)',
  'rgba(153, 102, 255, 0.6)',
]

const calculateStats = (yearlyData: Record<string, number>) => {
  const years = Object.keys(yearlyData).sort()
  const total = Object.values(yearlyData).reduce((sum, count) => sum + count, 0)
  const lastYear = years[years.length - 1]
  const previousYear = years[years.length - 2]

  const growthRate = previousYear ?
    Math.round(((yearlyData[lastYear] - yearlyData[previousYear]) / yearlyData[previousYear]) * 100) :
    0

  const peakYear = years.reduce((max, year) =>
    yearlyData[year] > yearlyData[max] ? year : max
  , years[0])

  return {
    total,
    growthRate,
    peakYear
  }
}

const processData = () => {
  const yearlyData= {}

  if (groupBy.value === 'all') {
    props.data.forEach(item => {
      const year = item["Model Year"]
      yearlyData[year] = (yearlyData[year] || 0) + 1
    })

    return {
      labels: Object.keys(yearlyData).sort(),
      datasets: [{
        label: 'All EVs',
        data: Object.keys(yearlyData).sort().map(year => yearlyData[year]),
        backgroundColor: CHART_COLORS[0],
        borderColor: CHART_COLORS[0].replace('0.6', '1'),
        borderWidth: 1
      }]
    }
  } else {
    const groupedData: Record<string, Record<string, number>> = {}

    props.data.forEach(item => {
      const year = item["Model Year"]
      const groupKey = groupBy.value === 'type' ?
        item["Electric Vehicle Type"] :
        item.Make

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {}
      }
      groupedData[groupKey][year] = (groupedData[groupKey][year] || 0) + 1
    })

    const years = [...new Set(props.data.map(item => item["Model Year"]))].sort()

    return {
      labels: years,
      datasets: Object.entries(groupedData)
        .sort(([, dataA], [, dataB]) =>
          Object.values(dataB).reduce((a, b) => a + b, 0) -
          Object.values(dataA).reduce((a, b) => a + b, 0)
        )
        .slice(0, 5) // Top 5 groups
        .map(([key, data], index) => ({
          label: key,
          data: years.map(year => data[year] || 0),
          backgroundColor: CHART_COLORS[index],
          borderColor: CHART_COLORS[index].replace('0.6', '1'),
          borderWidth: 1
        }))
    }
  }
}

const createChart = () => {
  if (!chartRef.value) return

  const { labels, datasets } = processData()

  // Calculate cumulative data if needed
  if (viewType.value === 'cumulative') {
    datasets.forEach(dataset => {
      let sum = 0
      dataset.data = dataset.data.map(value => {
        sum += value
        return sum
      })
    })
  }

  // Calculate stats for all EVs
  const allYearlyData: Record<string, number> = {}
  labels.forEach((year, index) => {
    allYearlyData[year] = datasets.reduce((sum, dataset) => sum + dataset.data[index], 0)
  })
  stats.value = calculateStats(allYearlyData)

  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  chart = new Chart(ctx, {
    type: viewType.value === 'yearly' ? 'bar' : 'line',
    data: {
      labels,
      datasets: datasets.map(dataset => ({
        ...dataset,
        fill: viewType.value === 'cumulative',
        tension: 0.1
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || ''
              const value = context.parsed.y
              return `${label}: ${value} vehicles`
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Year'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: viewType.value === 'yearly' ? 'Number of Vehicles' : 'Total Vehicles'
          }
        }
      }
    }
  })
}

watch([viewType, groupBy], () => {
  if (chart) {
    chart.destroy()
  }
  createChart()
})

watch(() => props.data, () => {
  if (chart) {
    chart.destroy()
  }
  createChart()
}, { deep: true })

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
  flex-wrap: wrap;
  gap: 1rem;
}

.chart-wrapper {
  flex-grow: 1;
  position: relative;
  min-height: 300px;
}

.trend-stats {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}

.controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}
</style>
