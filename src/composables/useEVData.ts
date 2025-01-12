import { ref, onMounted } from 'vue'
import Papa from 'papaparse'
import type { EVData } from '../types/EVData'

export function useEVData() {
    const evData = ref<EVData[]>([])
    const loading = ref<boolean>(true)
    const error = ref<Error | null>(null)

    const loadData = async () => {
        try {
            const response = await fetch('/data/ev_population.csv')
            const csvText = await response.text()

            const { data } = Papa.parse<EVData>(csvText, {
                header: true,
                skipEmptyLines: true
            })

            evData.value = data
            loading.value = false
        } catch (err) {
            error.value = err instanceof Error ? err : new Error('Unknown error occurred')
            loading.value = false
        }
    }

    onMounted(loadData)

    return {
        evData,
        loading,
        error
    }
} 