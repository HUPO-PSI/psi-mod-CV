<template>
  <v-card elevation="2" rounded="lg">
    <v-card-title class="bg-primary text-white d-flex align-end">
      <v-icon class="mr-2">mdi-database</v-icon>
      <div class="font-weight-bold">
        Peptide modifications
      </div>
    </v-card-title>
    <v-card-text class="pa-0">
      <template v-if="!error">
        <v-data-table-virtual
          :headers="headers"
          :items="augmentedItems"
          :custom-key-sort="customKeySort"
          :search="''"
          fixed-header
          height="min(600px, max(300px, calc(100vh - 500px)))"
          class="elevation-0"
          hover
          item-value="id"
          @click:row="onRowClick"
        >
          <template v-slot:item.id="{ item }">
            <v-chip
              color="primary"
              variant="flat"
              size="small"
              class="font-weight-medium"
            >
              {{ item.id }}
            </v-chip>
          </template>

          <template v-slot:item.name="{ item }">
            <span class="font-weight-medium">{{ item.name }}</span>
          </template>

          <!-- New columns: ChEBI ID and Unimod ID from definition xrefs -->
          <template v-slot:item.chebiId="{ item }">
            <template v-if="getChebiInfo(item)">
              <v-chip
                :href="getChebiInfo(item)!.url"
                target="_blank"
                rel="noopener"
                color="deep-purple-lighten-1"
                variant="tonal"
                size="small"
                class="font-weight-medium"
              >
                {{ getChebiInfo(item)!.label }}
              </v-chip>
            </template>
            <span v-else class="text-medium-emphasis">N/A</span>
          </template>

          <template v-slot:item.unimodId="{ item }">
            <template v-if="getUnimodInfo(item)">
              <v-chip
                :href="getUnimodInfo(item)!.url"
                target="_blank"
                rel="noopener"
                color="secondary"
                variant="tonal"
                size="small"
                class="font-weight-medium"
              >
                {{ getUnimodInfo(item)!.label }}
              </v-chip>
            </template>
            <span v-else class="text-medium-emphasis">N/A</span>
          </template>

          <!-- XRef chip columns: Origin and TermSpec -->
          <template v-slot:item.origin="{ item }">
            <template v-if="getXrefValue(item, 'Origin')">
              <v-chip
                color="red-lighten-1"
                variant="tonal"
                size="small"
                class="font-weight-medium"
              >
                {{ getXrefValue(item, 'Origin') }}
              </v-chip>
            </template>
            <span v-else class="text-medium-emphasis">N/A</span>
          </template>

          <template v-slot:item.termSpec="{ item }">
            <template v-if="getXrefValue(item, 'TermSpec')">
              <v-chip
                color="orange-darken-2"
                variant="tonal"
                size="small"
                class="font-weight-medium"
              >
                {{ getXrefValue(item, 'TermSpec') }}
              </v-chip>
            </template>
            <span v-else class="text-medium-emphasis">N/A</span>
          </template>

          <template v-slot:no-data>
            <v-alert type="info" variant="tonal" class="ma-4">
              No modifications found in the database.
            </v-alert>
          </template>
        </v-data-table-virtual>

        <ProteinModificationDetailsDialog
          v-model="detailsOpen"
          :item="selectedItem"
        />
      </template>
      <template v-else>
        <v-alert type="error" variant="tonal" class="ma-4">
          Failed to load OBO terms: {{ error }}
        </v-alert>
      </template>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useProteinModificationsFilters } from '@/composables/useProteinModificationsFilters'
import ProteinModificationDetailsDialog from '@/components/modifications/ProteinModificationDetailsDialog.vue'

const {
  error,
  augmentedItems,
  customKeySort,
  getXrefValue,
  getChebiInfo,
  getUnimodInfo,
} = useProteinModificationsFilters()

const detailsOpen = ref(false)
const selectedItem = ref<any | null>(null)

const headers = [
  {
    title: 'ID',
    key: 'id',
    width: '10%',
    sortable: true,
  },
  {
    title: 'Name',
    key: 'name',
    width: '30%',
    sortable: true,
  },
  {
    title: 'ChEBI ID',
    key: 'chebiId',
    width: '20%',
    sortable: true,
  },
  {
    title: 'Unimod ID',
    key: 'unimodId',
    width: '20%',
    sortable: true,
  },
  {
    title: 'Origin',
    key: 'origin',
    width: '20%',
    sortable: true,
  },
  {
    title: 'TermSpec',
    key: 'termSpec',
    width: '20%',
    sortable: true,
  }
]

function openDetails(item: any) {
  selectedItem.value = item
  detailsOpen.value = true
}

function onRowClick(ev: MouseEvent, row: any) {
  // Ignore clicks on interactive elements (links, buttons, chips)
  const target = ev.target as HTMLElement | null
  if (target && target.closest('a, button, .v-btn, .v-chip, [role="button"]')) {
    return
  }
  const item = row && (row.item ?? row.raw ?? row)
  if (item) {
    openDetails(item)
  }
}
</script>

<style scoped>
:deep(.v-table) {
  border-radius: 0 0 12px 12px;
}

/* Make table rows feel interactive */
:deep(.v-data-table__tr) {
  cursor: pointer;
}

/* Soft hover color without relying on Vuetify CSS vars to appease type checking */
:deep(.v-data-table__tr:hover) {
  background-color: rgba(33, 150, 243, 0.05);
}

/* Wrap long XRef values nicely in the list */
:deep(.v-list-item-title) {
  white-space: normal;
  word-break: break-word;
}
</style>
