<template>
  <div class="dashboard">
    <div v-if="loading" class="loading">
      Loading data...
    </div>
    <div v-else-if="error" class="error">
      {{ error.message }}
    </div>
    <div v-else>
      <!-- Filters Section -->
      <div class="filters">
        <div class="filter-group">
          <label>Make:</label>
          <select v-model="filters.make">
            <option value="">All</option>
            <option v-for="make in uniqueMakes" :key="make" :value="make">
              {{ make }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>Year:</label>
          <select v-model="filters.year">
            <option value="">All</option>
            <option v-for="year in uniqueYears" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>Vehicle Type:</label>
          <select v-model="filters.vehicleType">
            <option value="">All</option>
            <option v-for="type in uniqueTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>
      </div>

      <SummaryStats :data="filteredData" />

      <!-- Charts Grid -->
      <div class="dashboard-grid">
        <div class="chart-container">
          <VehicleTypeChart :data="filteredData" />
        </div>
        <div class="chart-container">
          <ManufacturerChart :data="filteredData" />
        </div>
        <div class="chart-container">
          <RangeDistributionChart :data="filteredData" />
        </div>
        <div class="chart-container">
          <ModelDistributionChart :data="filteredData" />
        </div>
        <div class="chart-container">
          <CAFVEligibilityChart :data="filteredData" />
        </div>
        <div class="chart-container">
          <YearlyTrendChart :data="filteredData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEVData } from '@/composables/useEVData'
import VehicleTypeChart from '@/components/ChartComponents/VehicleTypeChart.vue'
import ManufacturerChart from '@/components/ChartComponents/ManufacturerChart.vue'
import RangeDistributionChart from '@/components/ChartComponents/RangeDistributionChart.vue'
import ModelDistributionChart from '@/components/ChartComponents/ModelDistributionChart.vue'
import SummaryStats from '@/components/ChartComponents/SummaryStats.vue'
import CAFVEligibilityChart from '@/components/ChartComponents/CAFVEligibilityChart.vue'
import YearlyTrendChart from '@/components/ChartComponents/YearlyTrendChart.vue'

const { evData, loading, error } = useEVData()

const filters = ref({
  make: '',
  year: '',
  vehicleType: ''
})

const uniqueMakes = computed(() =>
  [...new Set(evData.value.map(item => item.Make))].sort()
)

const uniqueYears = computed(() =>
  [...new Set(evData.value.map(item => item["Model Year"]))].sort().reverse()
)

const uniqueTypes = computed(() =>
  [...new Set(evData.value.map(item => item["Electric Vehicle Type"]))].sort()
)

const filteredData = computed(() => {
  return evData.value.filter(item => {
    const makeMatch = !filters.value.make || item.Make === filters.value.make
    const yearMatch = !filters.value.year || item["Model Year"] === filters.value.year
    const typeMatch = !filters.value.vehicleType || item["Electric Vehicle Type"] === filters.value.vehicleType
    return makeMatch && yearMatch && typeMatch
  })
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 150px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-container {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
}
</style>
