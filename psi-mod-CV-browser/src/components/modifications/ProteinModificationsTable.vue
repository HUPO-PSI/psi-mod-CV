<template>
  <v-container class="pa-6" fluid>
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
  import ProteinModificationsDataTable from './ProteinModificationsDataTable.vue'
  import ProteinModificationsFilters from './ProteinModificationsFilters.vue'

  const oboStore = useOboStore()

  onMounted(() => {
    oboStore.loadFromOBO()
  })
</script>
