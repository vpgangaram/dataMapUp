<template>
  <div class="summary-stats">
    <div class="stat-card">
      <h4>Total Vehicles</h4>
      <div class="stat-value">{{ totalVehicles }}</div>
    </div>
    <div class="stat-card">
      <h4>Average Range</h4>
      <div class="stat-value">{{ averageRange }} mi</div>
    </div>
    <div class="stat-card">
      <h4>Top Manufacturer</h4>
      <div class="stat-value">{{ topManufacturer }}</div>
    </div>
    <div class="stat-card">
      <h4>CAFV Eligible</h4>
      <div class="stat-value">{{ cafvPercentage }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EVData } from '@/types/EVData'

const props = defineProps<{
  data: EVData[]
}>()

const totalVehicles = computed(() => props.data.length)

const averageRange = computed(() => {
  const total = props.data.reduce((sum, item) =>
    sum + parseInt(item["Electric Range"] || '0'), 0)
  return Math.round(total / props.data.length)
})

const topManufacturer = computed(() => {
  const makes: Record<string, number> = {}
  props.data.forEach(item => {
    makes[item.Make] = (makes[item.Make] || 0) + 1
  })
  return Object.entries(makes)
    .sort(([,a], [,b]) => b - a)[0][0]
})

const cafvPercentage = computed(() => {
  const eligible = props.data.filter(item =>
    item["Clean Alternative Fuel Vehicle (CAFV) Eligibility"]
    .includes("Eligible")
  ).length
  return Math.round((eligible / props.data.length) * 100)
})
</script>

<style scoped>
.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

h4 {
  margin: 0 0 0.5rem 0;
  color: #666;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}
</style>
