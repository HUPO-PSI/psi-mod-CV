<template>
  <v-container fluid class="pa-6">
    <v-row justify="center">
      <v-col cols="12">
        <ProteinModificationsFilters />
        <ProteinModificationsDataTable />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useOboStore } from '@/stores/obo'
import ProteinModificationsFilters from './ProteinModificationsFilters.vue'
import ProteinModificationsDataTable from './ProteinModificationsDataTable.vue'

const oboStore = useOboStore()

onMounted(() => {
  oboStore.loadFromOBO()
})
</script>
