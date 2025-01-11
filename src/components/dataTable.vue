<template>
  <v-container>
    <v-data-table :headers="tableHeaders ? tableHeaders : null" :items="tableData ? tableData : null" density="compact"
      item-key="name"></v-data-table>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const props = defineProps({
  tableHeaders: {
    require: false,
  },
  tableData: {
    required: true,
  }
});



watch(() => props, () => {
  console.log(props)
})
</script>

<style lang="scss" scoped></style>
