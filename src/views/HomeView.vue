<template>
  <v-container>
    <dataTable :tableHeaders="tableHeaderData" :tableData="tabledata" />
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import dataTable from '@/components/dataTable.vue';

const tableHeaderData = ref([]);
const tabledata = ref([]);
</script>

<style lang="scss" scoped></style>
