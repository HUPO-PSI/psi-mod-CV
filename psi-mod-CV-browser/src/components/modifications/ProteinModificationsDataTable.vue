<template>
  <v-card elevation="2" rounded="lg">
    <v-card-title class="bg-primary text-white d-flex align-end">
      <v-icon class="mr-2">mdi-database</v-icon>
      <div class="font-weight-bold">
        Residue modifications
      </div>
    </v-card-title>
    <v-card-text class="pa-0">
      <template v-if="!error">
        <v-data-table-virtual
          class="elevation-0"
          :custom-key-sort="customKeySort"
          fixed-header
          :headers="headers"
          :height="lgAndUp ? 'calc(100vh - 210px)': ''"
          hover
          item-value="id"
          :items="augmentedItems"
          :search="''"
          @click:row="onRowClick"
        >
          <template #item.id="{ item }">
            <v-chip
              class="font-weight-medium"
              color="primary"
              size="small"
              variant="flat"
            >
              {{ item.id }}
            </v-chip>
          </template>

          <template #item.name="{ item }">
            <span class="font-weight-medium">{{ item.name }}</span>
          </template>

          <template #item.chebiId="{ item }">
            <template v-if="getChebiInfo(item)">
              <v-chip
                class="font-weight-medium"
                color="deep-purple-lighten-1"
                :href="getChebiInfo(item)!.url"
                rel="noopener"
                size="small"
                target="_blank"
                variant="tonal"
              >
                {{ getChebiInfo(item)!.label }}
              </v-chip>
            </template>
            <span v-else class="text-medium-emphasis">N/A</span>
          </template>

          <template #item.unimodId="{ item }">
            <template v-if="getUnimodInfo(item)">
              <v-chip
                class="font-weight-medium"
                color="secondary"
                :href="getUnimodInfo(item)!.url"
                rel="noopener"
                size="small"
                target="_blank"
                variant="tonal"
              >
                {{ getUnimodInfo(item)!.label }}
              </v-chip>
            </template>
            <span v-else class="text-medium-emphasis">N/A</span>
          </template>

          <!-- XRef chip columns: Origin and TermSpec -->
          <template #item.origin="{ item }">
            <template v-if="getXrefValue(item, 'Origin')">
              <v-chip
                class="font-weight-medium"
                color="red-lighten-1"
                size="small"
                variant="tonal"
              >
                {{ getXrefValue(item, 'Origin') }}
              </v-chip>
            </template>
            <span v-else class="text-medium-emphasis">N/A</span>
          </template>

          <template #item.termSpec="{ item }">
            <template v-if="getXrefValue(item, 'TermSpec')">
              <v-chip
                class="font-weight-medium"
                color="orange-darken-2"
                size="small"
                variant="tonal"
              >
                {{ getXrefValue(item, 'TermSpec') }}
              </v-chip>
            </template>
            <span v-else class="text-medium-emphasis">N/A</span>
          </template>

          <template #no-data>
            <v-alert class="ma-4" type="info" variant="tonal">
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
        <v-alert class="ma-4" type="error" variant="tonal">
          Failed to load OBO terms: {{ error }}
        </v-alert>
      </template>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
  import { onMounted, ref, watch } from 'vue'
  import ProteinModificationDetailsDialog from '@/components/modifications/ProteinModificationDetailsDialog.vue'
  import { useProteinModificationsFilters } from '@/composables/useProteinModificationsFilters'
  import { useOboStore } from '@/stores/obo'
  import { useDisplay } from 'vuetify'

  const { lgAndUp } = useDisplay();

  const {
    error,
    augmentedItems,
    customKeySort,
    getXrefValue,
    getChebiInfo,
    getUnimodInfo,
  } = useProteinModificationsFilters()

  const oboStore = useOboStore()

  const detailsOpen = ref(false)
  const selectedItem = ref<any | null>(null)

  const headers = [
    { title: 'ID', key: 'id', width: '10%', sortable: true },
    { title: 'Name', key: 'name', width: '30%', sortable: true },
    { title: 'ChEBI ID', key: 'chebiId', width: '20%', sortable: true },
    { title: 'Unimod ID', key: 'unimodId', width: '20%', sortable: true },
    { title: 'Origin', key: 'origin', width: '20%', sortable: true },
    { title: 'TermSpec', key: 'termSpec', width: '20%', sortable: true },
  ]

  function normalizeModId (input: string | null): string | null {
    if (!input) return null
    const trimmed = input.trim()
    if (!trimmed) return null
    const modMatch = /^MOD:(\d{1,})$/.exec(trimmed)
    if (modMatch && modMatch[1]) {
      const num = modMatch[1]
      return `MOD:${num.padStart(5, '0')}`
    }
    const numMatch = /^(\d{1,})$/.exec(trimmed)
    if (numMatch && numMatch[1]) {
      const num = numMatch[1]
      return `MOD:${num.padStart(5, '0')}`
    }
    return null
  }

  function readQueryParam (): string | null {
    try {
      const params = new URLSearchParams(window.location.search)
      return params.get('mod')
    } catch {
      return null
    }
  }

  function writeQueryParam (id: string | null) {
    try {
      const url = new URL(window.location.href)
      if (id) {
        const normalized = normalizeModId(id)
        if (normalized) {
          url.searchParams.set('mod', normalized.replace('MOD:', ''))
        } else {
          url.searchParams.delete('mod')
        }
      } else {
        url.searchParams.delete('mod')
      }
      history.replaceState(null, '', url.toString())
    } catch {
      /* no-op */
    }
  }

  function openDetails (item: any) {
    selectedItem.value = item
    detailsOpen.value = true
  }

  function onRowClick (ev: MouseEvent, row: any) {
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

  onMounted(async () => {
    if (!oboStore.loaded) {
      await oboStore.loadFromOBO()
    }
    const qp = readQueryParam()
    const normalized = normalizeModId(qp)
    if (normalized) {
      const term = oboStore.byId(normalized)
      if (term) {
        openDetails(term as any)
      }
    }
  })

  watch([detailsOpen, selectedItem], ([open, item]) => {
    if (open && item?.id) {
      writeQueryParam(item.id)
    } else if (!open) {
      writeQueryParam(null)
    }
  })
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
