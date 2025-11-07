<template>
  <v-container fluid class="pa-6">
    <v-row justify="center">
      <v-col cols="12">

        <!-- Search and Filter Card -->
        <v-card elevation="2" rounded="lg" class="mb-2">
          <v-card-title class="bg-primary text-white d-flex align-end">
            <v-icon class="mr-2">mdi-magnify</v-icon>
            <div class="font-weight-bold">
              Filter peptide modifications
            </div>
            <v-spacer />
            <v-btn
              variant="outlined"
              color="white"
              size="small"
              prepend-icon="mdi-restore"
              class="text-none"
              @click="resetFilters"
            >
              Reset
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-col cols="12" md="12">
              <div class="text-xl-body-1 mb-4">
                Search and filter peptide modifications by ID, name, or definition.
                You can also view cross-references and SMILES structure for each modification.
              </div>
              <v-text-field
                v-model="search"
                density="comfortable"
                placeholder="Search modifications..."
                prepend-inner-icon="mdi-magnify"
                flat
                hide-details
                clearable
                class="search-field mb-4"
              />
              <div class="text-caption text-medium-emphasis mt-n2 mb-4">
                The search field supports free text search across all PSI-MOD term properties, including ID, name,
                definition, and synonyms. Enter any keyword to filter modifications.
              </div>

              <!-- Additional filters -->
              <v-row class="align-center">
                <v-col cols="12" md="6">
                  <div class="mb-4">
                    <div class="mb-1 d-flex align-center justify-space-between">
                      <div class="text-subtitle-2">Filter by DiffMono</div>
                      <div class="text-caption text-medium-emphasis">
                        {{ diffMonoRangeDisplay }}
                      </div>
                    </div>
                    <v-range-slider
                      v-model="diffMonoRange"
                      :min="diffMonoMinMax.min"
                      :max="diffMonoMinMax.max"
                      :step="10"
                      color="primary"
                      :thumb-label="true"
                      density="comfortable"
                      hide-details
                    />
                    <div class="text-caption text-medium-emphasis">
                      Difference in monoisotopic mass relative to the unmodified residue (in Da). Move the handles to restrict modifications by mass delta.
                    </div>
                  </div>
                  <div>
                    <div class="mb-1 d-flex align-center justify-space-between">
                      <div class="text-subtitle-2">Filter by MassMono</div>
                      <div class="text-caption text-medium-emphasis">
                        {{ massMonoRangeDisplay }}
                      </div>
                    </div>
                    <v-range-slider
                      v-model="massMonoRange"
                      :min="massMonoMinMax.min"
                      :max="massMonoMinMax.max"
                      :step="10"
                      color="primary"
                      :thumb-label="true"
                      density="comfortable"
                      hide-details
                    />
                    <div class="text-caption text-medium-emphasis">
                      Absolute monoisotopic mass of the modified residue or moiety (in Da). Move the handles to limit the mass window.
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="mb-4">
                    <v-checkbox
                      v-model="leafOnly"
                      color="primary"
                      label="Show only leaf nodes"
                      density="compact"
                      hide-details
                    />
                    <div class="text-caption text-medium-emphasis">
                      Leaf terms are PSI-MOD entries without child terms. Enable this to hide higher-level grouping terms.
                    </div>
                  </div>
                  <div>
                    <v-checkbox
                      v-model="hasSmilesOnly"
                      color="primary"
                      label="Show only terms with SMILES"
                      density="compact"
                      hide-details
                    />
                    <div class="text-caption text-medium-emphasis">
                      Keep only modifications that have a SMILES notation in their cross-references, so you can preview a structure.
                    </div>
                  </div>

                  <!-- Origin filter -->
                  <div class="mt-4">
                    <v-select
                      v-model="selectedOrigin"
                      :items="originOptions"
                      label="Filter by Origin (amino acid)"
                      multiple
                      chips
                      clearable
                      density="comfortable"
                      hide-details
                    />
                    <div class="text-caption text-medium-emphasis">
                      The amino acid of origin on which the modification takes place. Clear to include all.
                    </div>
                  </div>
                </v-col>


                <!-- Small summary -->
                <v-col cols="12">
                  <div class="text-caption text-medium-emphasis">
                    Showing {{ filteredItems.length }} of {{ totalCount }} terms after applying filters.
                  </div>
                </v-col>
              </v-row>
            </v-col>
          </v-card-text>
        </v-card>

        <!-- Main Content Card -->
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
                :items="filteredItems"
                :search="''"
                fixed-header
                height="min(600px, max(300px, calc(100vh - 500px)))"
                class="elevation-0"
                hover
                show-expand
                item-value="id"
                v-model:expanded="expanded"
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
                      color="secondary"
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

                <template v-slot:item.definition="{ item }">
                  <span class="text-medium-emphasis">{{ item.definition }}</span>
                </template>

                <template v-slot:no-data>
                  <v-alert type="info" variant="tonal" class="ma-4">
                    No modifications found in the database.
                  </v-alert>
                </template>

                <!-- Expanded row content -->
                <template v-slot:expanded-row="{ item, columns }">
                  <td :colspan="columns.length">
                    <v-expand-transition>
                      <div class="pa-4 expanded-row">
                        <v-row>
                          <v-col cols="12" md="4">
                            <div class="text-subtitle-1 font-weight-medium mb-2">Cross-references</div>
                            <div v-if="item.xrefs && item.xrefs.length">
                              <v-table density="compact" class="bg-transparent">
                                <tbody>
                                <tr v-for="(xr, idx) in item.xrefs" :key="idx">
                                  <td>
                                    <span class="font-weight-medium">{{ xr.database }}</span>
                                  </td>
                                  <td>
                                    <span>{{ xr.value }}</span>
                                  </td>
                                </tr>
                                </tbody>
                              </v-table>
                            </div>
                            <div v-else class="text-medium-emphasis">No xrefs available.</div>

                            <div v-if="item.comment" class="mt-4">
                              <div class="text-subtitle-1 font-weight-medium mb-1">Comment</div>
                              <div class="text-body-2">{{ item.comment }}</div>
                            </div>
                          </v-col>
                          <v-col md="4">
                            <!-- Hierarchy section: Parents and Children IDs -->
                            <div>
                              <div class="text-subtitle-1 font-weight-medium mb-2">Hierarchy</div>

                              <div class="mb-2">
                                <div class="text-body-2 font-weight-medium mb-1">Direct parents</div>
                                <div v-if="item.parents && item.parents.length" class="d-flex flex-wrap gap-2">
                                  <v-chip
                                    v-for="(p, idx) in item.parents"
                                    :key="`parent-${idx}-${p.id}`"
                                    size="small"
                                    color="secondary"
                                    variant="tonal"
                                    class="mr-2 mb-2"
                                    title="Parent term ID"
                                  >
                                    {{ p.id }}
                                  </v-chip>
                                </div>
                                <div v-else class="text-medium-emphasis">None</div>
                              </div>
                              <div>
                                <div class="text-body-2 font-weight-medium mb-1">Direct children</div>
                                <div v-if="item.children && item.children.length" class="d-flex flex-wrap gap-2">
                                  <v-chip
                                    v-for="(c, idx) in item.children"
                                    :key="`child-${idx}-${c.id}`"
                                    size="small"
                                    color="secondary"
                                    variant="tonal"
                                    class="mr-2 mb-2"
                                    title="Child term ID"
                                  >
                                    {{ c.id }}
                                  </v-chip>
                                </div>
                                <div v-else class="text-medium-emphasis">None</div>
                              </div>
                            </div>
                          </v-col>
                          <v-col cols="12" md="4">
                            <div class="text-subtitle-1 font-weight-medium mb-2">Structure (SMILES)</div>
                            <div class="d-flex justify-center bg-white">
                              <SmilesView v-if="getSmiles(item)" :smiles="getSmiles(item)!" :width="300" :height="300" theme="light" />
                              <div v-else class="text-medium-emphasis pa-4">No SMILES available in xrefs.</div>
                            </div>
                          </v-col>
                        </v-row>
                      </div>
                    </v-expand-transition>
                  </td>
                </template>
              </v-data-table-virtual>
            </template>
            <template v-else>
              <v-alert type="error" variant="tonal" class="ma-4">
                Failed to load OBO terms: {{ error }}
              </v-alert>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useOboStore } from '@/stores/obo'
import SmilesView from '@/components/smiles/SmilesView.vue'

const oboStore = useOboStore()
const search = ref('')
const expanded = ref<string[]>([])

onMounted(() => {
  oboStore.loadFromOBO()
})

const headers = [
  {
    title: 'ID',
    key: 'id',
    width: '150px',
    sortable: true,
  },
  {
    title: 'Name',
    key: 'name',
    width: '300px',
    sortable: true,
  },
  {
    title: 'ChEBI ID',
    key: 'chebiId',
    width: '140px',
    sortable: false,
  },
  {
    title: 'Unimod ID',
    key: 'unimodId',
    width: '140px',
    sortable: false,
  },
  {
    title: 'Definition',
    key: 'definition',
    sortable: false,
  },
]

// Virtual table viewport height (px)
const tableHeight = 600

const modifications = computed(() => oboStore.allTerms)
const error = computed(() => oboStore.error)

// ----- Xref helpers -----
function findXref(item: any, key: string) {
  if (!item?.xrefs) return null
  const k = key.toLowerCase()
  return item.xrefs.find((x: any) => typeof x?.database === 'string' && x.database.toLowerCase() === k) || null
}

function getSmiles(item: any): string | null {
  const xr = findXref(item, 'SMILES')
  return xr ? xr.value : null
}

function getNumericXref(item: any, key: string): number | undefined {
  const xr = findXref(item, key)
  if (!xr) return undefined
  const n = parseFloat(String(xr.value).replace(/,/g, ''))
  return Number.isFinite(n) ? n : undefined
}

// ----- Ranges and filter state -----
const diffMonoValues = computed<number[]>(() => (modifications.value || [])
  .map(m => getNumericXref(m, 'DiffMono'))
  .filter((v): v is number => typeof v === 'number'))

const massMonoValues = computed<number[]>(() => (modifications.value || [])
  .map(m => getNumericXref(m, 'MassMono'))
  .filter((v): v is number => typeof v === 'number'))

function minMax(values: number[]): { min: number; max: number } {
  if (!values.length) return {min: 0, max: 0}
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v
  }
  min = Math.floor(min / 10) * 10
  max = Math.ceil(max / 10) * 10
  return {min, max}
}

const diffMonoMinMax = computed(() => minMax(diffMonoValues.value))
const massMonoMinMax = computed(() => minMax(massMonoValues.value))

const diffMonoRange = ref<[number, number]>([diffMonoMinMax.value.min, diffMonoMinMax.value.max])
const massMonoRange = ref<[number, number]>([massMonoMinMax.value.min, massMonoMinMax.value.max])

// Initialize ranges to full extents once data arrives
watch(diffMonoMinMax, (mm) => {
  if (mm && (diffMonoRange.value[0] === 0 && diffMonoRange.value[1] === 0) && (mm.min !== 0 || mm.max !== 0)) {
    diffMonoRange.value = [mm.min, mm.max]
  }
})
watch(massMonoMinMax, (mm) => {
  if (mm && (massMonoRange.value[0] === 0 && massMonoRange.value[1] === 0) && (mm.min !== 0 || mm.max !== 0)) {
    massMonoRange.value = [mm.min, mm.max]
  }
})

const diffMonoRangeDisplay = computed(() => {
  const [a, b] = diffMonoRange.value
  return `${a.toFixed(0)} to ${b.toFixed(0)} Da`
})
const massMonoRangeDisplay = computed(() => {
  const [a, b] = massMonoRange.value
  return `${a.toFixed(0)} to ${b.toFixed(0)} Da`
})

const leafOnly = ref(false)
const hasSmilesOnly = ref(false)

// Origin filter state and options
const selectedOrigin = ref<string[]>([])
const originOptions = computed<string[]>(() => {
  const set = new Set<string>()
  for (const m of modifications.value) {
    if (Array.isArray(m?.xrefs)) {
      for (const xr of m.xrefs) {
        if (typeof xr?.database === 'string' && xr.database.toLowerCase() === 'origin') {
          const val = String(xr.value).trim()
          if (val) set.add(val)
        }
      }
    }
  }
  // Sort so that single-character amino acids appear first, then others alphabetically
  return Array.from(set).sort((a, b) => {
    const aSingle = a.length === 1
    const bSingle = b.length === 1
    if (aSingle !== bSingle) return aSingle ? -1 : 1
    return a.localeCompare(b)
  })
})

const totalCount = computed(() => modifications.value.length)

// Apply search + filters
const filteredItems = computed(() => {
  const items = modifications.value
  const q = search.value.trim().toLowerCase()

  const applyDiff = !(diffMonoRange.value[0] === diffMonoMinMax.value.min && diffMonoRange.value[1] === diffMonoMinMax.value.max)
  const applyMass = !(massMonoRange.value[0] === massMonoMinMax.value.min && massMonoRange.value[1] === massMonoMinMax.value.max)

  return items.filter(mod => {
    // text search
    if (q) {
      const match = (
        mod.id.toLowerCase().includes(q) ||
        mod.name.toLowerCase().includes(q) ||
        mod.definition.toLowerCase().includes(q) ||
        (Array.isArray(mod.synonyms) && mod.synonyms.some((s: any) => s.text?.toLowerCase().includes(q)))
      )
      if (!match) return false
    }

    // leaf only
    if (leafOnly.value) {
      const isLeaf = !mod.children || mod.children.length === 0
      if (!isLeaf) return false
    }

    // must have SMILES
    if (hasSmilesOnly.value) {
      if (!getSmiles(mod)) return false
    }

    // Origin filter
    if (selectedOrigin.value.length) {
      const xr = findXref(mod, 'Origin')
      const originVal = xr ? String(xr.value).trim() : ''
      if (!selectedOrigin.value.includes(originVal)) return false
    }

    // DiffMono filter
    if (applyDiff) {
      const v = getNumericXref(mod, 'DiffMono')
      if (v === undefined) return false
      if (v < diffMonoRange.value[0] || v > diffMonoRange.value[1]) return false
    }

    // MassMono filter
    if (applyMass) {
      const v = getNumericXref(mod, 'MassMono')
      if (v === undefined) return false
      if (v < massMonoRange.value[0] || v > massMonoRange.value[1]) return false
    }

    return true
  })
})

// Reset all filters and search to their initial values
function resetFilters() {
  search.value = ''
  leafOnly.value = false
  hasSmilesOnly.value = false
  // Reset ranges to the current global extents
  diffMonoRange.value = [diffMonoMinMax.value.min, diffMonoMinMax.value.max]
  massMonoRange.value = [massMonoMinMax.value.min, massMonoMinMax.value.max]
  // Reset Origin filter
  selectedOrigin.value = []
  // Collapse any expanded rows
  expanded.value = []
}

function getChebiInfo(item: any): { label: string; url: string } | null {
  const refs: string[] | undefined = item?.definitionXrefs
  if (!Array.isArray(refs) || !refs.length) return null
  const ref = refs.find(r => /^chebi:\s*/i.test(r))
  if (!ref) return null
  const m = ref.match(/chebi:\s*([0-9]+)/i)
  if (!m) return null
  const chebiNum = m[1]
  const label = `CHEBI:${chebiNum}`
  const url = `https://www.ebi.ac.uk/chebi/searchId.do?chebiId=${encodeURIComponent(chebiNum!)}`
  return { label, url }
}

function getUnimodInfo(item: any): { label: string; url: string } | null {
  const refs: string[] | undefined = item?.definitionXrefs
  if (!Array.isArray(refs) || !refs.length) return null
  const ref = refs.find(r => /^unimod:\s*/i.test(r))
  if (!ref) return null
  const m = ref.match(/unimod:\s*([0-9]+)/i)
  if (!m) return null
  const unimodNum = m[1]
  const label = `Unimod:${unimodNum}`
  const url = `https://www.unimod.org/modifications_view.php?editid1=${encodeURIComponent(unimodNum!)}`
  return { label, url }
}
</script>

<style scoped>
.search-field :deep(.v-field) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.v-table) {
  border-radius: 0 0 12px 12px;
}

/* Soft hover color without relying on Vuetify CSS vars to appease type checking */
:deep(.v-data-table__tr:hover) {
  background-color: rgba(33, 150, 243, 0.05);
}
</style>


<style scoped>
/* Wrap long XRef values nicely in the list */
:deep(.v-list-item-title) {
  white-space: normal;
  word-break: break-word;
}

/* Optional soft background for expanded area */
.expanded-row {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}
</style>
