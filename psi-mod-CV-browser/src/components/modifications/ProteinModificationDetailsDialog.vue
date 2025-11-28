<template>
  <v-dialog
    max-width="2000"
    :model-value="modelValue"
    transition="dialog-bottom-transition"
    @update:model-value="(v: boolean) => emit('update:modelValue', v)"
  >
    <v-card min-height="650" rounded="lg">
      <v-card-title class="d-flex align-center bg-primary text-white">
        <v-icon class="mr-2">mdi-information</v-icon>
        <div class="d-flex flex-column">
          <span class="text-subtitle-1 font-weight-bold">{{ currentItem?.id || 'Modification' }}</span>
          <span class="text-body-2">{{ currentItem?.name }}</span>
        </div>
        <v-spacer />
        <v-btn color="white" icon variant="text" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12" md="4">
            <div class="text-subtitle-1 font-weight-medium mb-2">Details</div>
            <div v-if="detailsXrefs.length > 0">
              <v-table class="bg-transparent" density="compact">
                <tbody>
                  <tr v-for="(xr, idx) in detailsXrefs" :key="idx">
                    <td>
                      <span class="font-weight-medium">{{ mapDatabaseName(xr.database) }}</span>
                    </td>
                    <td>
                      <span>{{ xr.value }}</span>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
            <div v-else class="text-medium-emphasis">No details available.</div>

            <div v-if="currentItem?.comment" class="mt-4">
              <div class="text-subtitle-1 font-weight-medium mb-1">Comment</div>
              <div class="text-body-2">{{ currentItem.comment }}</div>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <div>
              <div class="text-subtitle-1 font-weight-medium mb-2">Cross-references</div>

              <v-table class="bg-transparent" density="compact">
                <tbody>
                  <!-- Unimod row -->
                  <tr>
                    <td>
                      <span class="font-weight-medium">Unimod</span>
                    </td>
                    <td>
                      <template v-if="unimodXrefs.length > 0">
                        <div class="d-flex flex-wrap gap-2">
                          <v-chip
                            v-for="(xr, idx) in unimodXrefs"
                            :key="`unimod-${idx}-${xr.value}`"
                            class="mr-2"
                            color="secondary"
                            size="small"
                            variant="tonal"
                            :href="buildUnimodUrl(xr) || undefined"
                            rel="noopener"
                            target="_blank"
                          >
                            {{ xr.value }}
                          </v-chip>
                        </div>
                      </template>
                      <span v-else class="text-medium-emphasis">None</span>
                    </td>
                  </tr>

                  <!-- UniProt PTM row -->
                  <tr>
                    <td>
                      <span class="font-weight-medium">UniProt PTM</span>
                    </td>
                    <td>
                      <template v-if="uniprotPtmXrefs.length > 0">
                        <div class="d-flex flex-wrap gap-2">
                          <v-chip
                            v-for="(xr, idx) in uniprotPtmXrefs"
                            :key="`uniprot-${idx}-${xr.value}`"
                            class="mr-2"
                            color="primary"
                            size="small"
                            variant="tonal"
                          >
                            UniProt:{{ xr.value }}
                          </v-chip>
                        </div>
                      </template>
                      <span v-else class="text-medium-emphasis">None</span>
                    </td>
                  </tr>

                  <!-- ChEBI row -->
                  <tr>
                    <td>
                      <span class="font-weight-medium">ChEBI</span>
                    </td>
                    <td>
                      <template v-if="chebiXrefs.length > 0">
                        <div class="d-flex flex-wrap gap-2">
                          <v-chip
                            v-for="(xr, idx) in chebiXrefs"
                            :key="`chebi-${idx}-${xr}`"
                            class="mr-2"
                            color="deep-purple-lighten-1"
                            size="small"
                            variant="tonal"
                            :href="buildChebiUrl(xr) || undefined"
                            rel="noopener"
                            target="_blank"
                          >
                            {{ xr }}
                          </v-chip>
                        </div>
                      </template>
                      <span v-else class="text-medium-emphasis">None</span>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>

            <div class="mt-4">
              <div class="text-subtitle-1 font-weight-medium mb-2">Hierarchy</div>

              <div class="mb-2">
                <div class="text-body-2 font-weight-medium mb-1">Direct parents</div>
                <div v-if="currentItem?.parents && currentItem.parents.length > 0" class="d-flex flex-wrap gap-2">
                  <v-chip
                    v-for="(p, idx) in currentItem!.parents"
                    :key="`parent-${idx}-${p.id}`"
                    class="mr-2 mb-2 cursor-pointer"
                    color="secondary"
                    size="small"
                    title="Parent term ID"
                    variant="tonal"
                    @click="openTerm(p.id)"
                  >
                    {{ p.id }}
                  </v-chip>
                </div>
                <div v-else class="text-medium-emphasis">None</div>
              </div>

              <div>
                <div class="text-body-2 font-weight-medium mb-1">Direct children</div>
                <div v-if="currentItem?.children && currentItem.children.length > 0" class="d-flex flex-wrap gap-2">
                  <v-chip
                    v-for="(c, idx) in currentItem!.children"
                    :key="`child-${idx}-${c.id}`"
                    class="mr-2 mb-2 cursor-pointer"
                    color="secondary"
                    size="small"
                    title="Child term ID"
                    variant="tonal"
                    @click="openTerm(c.id)"
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
            <div class="d-flex">
              <SmilesView
                v-if="smiles"
                :filename="filename"
                :smiles="smiles"
                theme="light"
              />
              <div v-else class="text-medium-emphasis">No SMILES available for this residue modification.</div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="align-center justify-space-between flex-wrap px-4 pb-4">
        <div class="d-flex align-center flex-wrap gap-2">
          <!-- Breadcrumb trail always full in actions -->
          <div v-if="breadcrumbDisplay.length > 0" class="d-flex align-center flex-wrap">
            <span class="text-caption text-medium-emphasis mr-2">Navigation history</span>
            <template v-for="(bc, idx) in breadcrumbDisplay" :key="`bc-wrap-actions-${idx}-${bc.id}`">
              <v-chip
                class="cursor-pointer mr-1"
                color="primary"
                size="x-small"
                :title="bc.term?.name || bc.id"
                variant="tonal"
                @click="jumpToBreadcrumb(idx)"
              >
                {{ bc.term?.id || bc.id }}
              </v-chip>
              <v-icon
                v-if="idx < breadcrumbDisplay.length - 1"
                class="mx-1"
                size="14"
              >mdi-chevron-right</v-icon>
            </template>
          </div>
        </div>

        <v-btn color="primary" variant="tonal" @click="close">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { computed, watch } from 'vue'
  import SmilesView from '@/components/smiles/SmilesView.vue'
  import { useNavigationStore } from '@/stores/navigation'
  import { useOboStore } from '@/stores/obo'
  import type {OboTerm} from "@/system/obo/OboTerm.ts";

  interface Xref { database: string, value: string }
  interface IdRef { id: string }

  const props = defineProps<{ modelValue: boolean, item: OboTerm | null }>()
  const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

  const oboStore = useOboStore()
  const navigation = useNavigationStore()

  // Initialize root when dialog opens with provided item
  watch(() => props.item, newVal => {
    if (newVal) {
      navigation.setRoot(newVal.id)
    } else {
      navigation.reset()
    }
  }, { immediate: true })

  // Reset navigation when dialog closes
  watch(() => props.modelValue, open => {
    if (!open) navigation.reset()
  })

  const currentItem = computed<OboTerm | null>(() => {
    if (!navigation.currentTermId) return null
    const term = oboStore.byId(navigation.currentTermId!) as any
    return term || null
  })

  const allXrefs = computed<Xref[]>(() => Array.isArray(currentItem.value?.xrefs) ? currentItem.value!.xrefs as Xref[] : [])
  const unimodXrefs = computed(() => allXrefs.value.filter(x => x.database?.toLowerCase() === 'unimod'))
  const uniprotPtmXrefs = computed(() => allXrefs.value.filter(x => x.database?.toLowerCase() === 'uniprot.ptm'))
  const chebiXrefs = computed(() => currentItem.value?.definitionXrefs?.filter(x => x.toLowerCase().includes('chebi')) || [])
  const excludedSet = new Set(['unimod', 'uniprot.ptm', 'chebi'])
  const detailsXrefs = computed(() => allXrefs.value.filter(x => !excludedSet.has(String(x.database).toLowerCase())))

  const smiles = computed(() => {
    const xr = allXrefs.value.find(x => x.database.toLowerCase() === 'smiles')
    return xr ? String(xr.value) : null
  })

  const filename = computed(() => currentItem.value ? `psimod-${currentItem.value.id}-smiles-visualization` : 'smiles-visualization')

  const breadcrumbDisplay = computed(() => navigation.breadcrumbTerms)

  function openTerm (id: string) {
    navigation.openTerm(id)
  }
  function jumpToBreadcrumb (index: number) {
    navigation.jumpTo(index)
  }

  function close () {
    emit('update:modelValue', false)
  }

  function buildUnimodUrl (x: Xref): string {
    const v = String(x?.value ?? '').trim()
    if (!v) return ''
    // value expected numeric, but allow embedded pattern
    const m = v.match(/(\d{1,})/)
    if (!m) return ''
    const num = m[1]
    if (!num) return ''
    return `https://www.unimod.org/modifications_view.php?editid1=${encodeURIComponent(num)}`
  }

  function buildChebiUrl (x: string): string {
    const v = String(x ?? '').trim()
    if (!v) return ''
    const m = v.match(/(\d{1,})/)
    if (!m) return ''
    const num = m[1]
    if (!num) return ''
    return `https://www.ebi.ac.uk/chebi/searchId.do?chebiId=${encodeURIComponent(num)}`
  }

  const databaseMapping = new Map<string, string>([
    ['DiffAvg', 'Average Delta Mass'],
    ['DiffFormula', 'Delta Formula'],
    ['DiffMono', 'Monoisotopic Delta Mass'],
    ['MassAvg', 'Average Residue Mass'],
    ['MassMono', 'Monoisotopic Residue Mass'],
    ['Origin', 'Origin Residue'],
    ['TermSpec', 'Terminal Specification']
  ]);

  const mapDatabaseName = (db: string): string => {
    return databaseMapping.get(db) || db;
  };
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
</style>
