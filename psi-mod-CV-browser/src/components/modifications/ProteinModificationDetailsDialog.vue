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
            <div class="text-subtitle-1 font-weight-medium mb-2">Cross-references</div>
            <div v-if="currentItem?.xrefs && currentItem.xrefs.length > 0">
              <v-table class="bg-transparent" density="compact">
                <tbody>
                  <tr v-for="(xr, idx) in currentItem!.xrefs" :key="idx">
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

            <div v-if="currentItem?.comment" class="mt-4">
              <div class="text-subtitle-1 font-weight-medium mb-1">Comment</div>
              <div class="text-body-2">{{ currentItem.comment }}</div>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <div>
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
              <div v-else class="text-medium-emphasis">No SMILES available in xrefs.</div>
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

  interface Xref { database: string, value: string }
  interface IdRef { id: string }
  interface ModItem {
    id: string
    name: string
    definition?: string
    xrefs?: Xref[]
    parents?: IdRef[]
    children?: IdRef[]
    comment?: string
  }

  const props = defineProps<{ modelValue: boolean, item: ModItem | null }>()
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

  const currentItem = computed<ModItem | null>(() => {
    if (!navigation.currentTermId) return null
    const term = oboStore.byId(navigation.currentTermId!) as any
    return term || null
  })

  const smiles = computed(() => {
    const xr = currentItem.value?.xrefs?.find(x => x.database.toLowerCase() === 'smiles')
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
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
</style>
