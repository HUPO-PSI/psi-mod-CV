<template>
  <v-dialog
    max-width="2000"
    :model-value="modelValue"
    transition="dialog-bottom-transition"
    @update:model-value="(v: boolean) => emit('update:modelValue', v)"
  >
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center bg-primary text-white">
        <v-icon class="mr-2">mdi-information</v-icon>
        <div class="d-flex flex-column">
          <span class="text-subtitle-1 font-weight-bold">{{ item?.id || 'Modification' }}</span>
          <span class="text-body-2">{{ item?.name }}</span>
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
            <div v-if="item?.xrefs && item.xrefs.length > 0">
              <v-table class="bg-transparent" density="compact">
                <tbody>
                  <tr v-for="(xr, idx) in item!.xrefs" :key="idx">
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

            <div v-if="item?.comment" class="mt-4">
              <div class="text-subtitle-1 font-weight-medium mb-1">Comment</div>
              <div class="text-body-2">{{ item.comment }}</div>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <div>
              <div class="text-subtitle-1 font-weight-medium mb-2">Hierarchy</div>

              <div class="mb-2">
                <div class="text-body-2 font-weight-medium mb-1">Direct parents</div>
                <div v-if="item?.parents && item.parents.length > 0" class="d-flex flex-wrap gap-2">
                  <v-chip
                    v-for="(p, idx) in item!.parents"
                    :key="`parent-${idx}-${p.id}`"
                    class="mr-2 mb-2"
                    color="secondary"
                    size="small"
                    title="Parent term ID"
                    variant="tonal"
                  >
                    {{ p.id }}
                  </v-chip>
                </div>
                <div v-else class="text-medium-emphasis">None</div>
              </div>

              <div>
                <div class="text-body-2 font-weight-medium mb-1">Direct children</div>
                <div v-if="item?.children && item.children.length > 0" class="d-flex flex-wrap gap-2">
                  <v-chip
                    v-for="(c, idx) in item!.children"
                    :key="`child-${idx}-${c.id}`"
                    class="mr-2 mb-2"
                    color="secondary"
                    size="small"
                    title="Child term ID"
                    variant="tonal"
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
            <div class="d-flex bg-white">
              <SmilesView
                v-if="smiles"
                :filename="filename"
                :height="300"
                :smiles="smiles"
                theme="light"
                :width="300"
              />
              <div v-else class="text-medium-emphasis">No SMILES available in xrefs.</div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn color="primary" variant="tonal" @click="close">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import SmilesView from '@/components/smiles/SmilesView.vue'

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

  const props = defineProps<{
    modelValue: boolean
    item: ModItem | null
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', v: boolean): void
  }>()

  function findXref (item: ModItem | null | undefined, key: string) {
    if (!item?.xrefs) return null
    const k = key.toLowerCase()
    return item.xrefs.find((x: any) => typeof x?.database === 'string' && x.database.toLowerCase() === k) || null
  }

  const smiles = computed(() => {
    const xr = findXref(props.item, 'SMILES')
    return xr ? (xr as any).value as string : null
  })

  const filename = computed(() => {
    if (!props.item) {
      return 'smiles-visualization'
    }
    return `psimod-${props.item.id}-smiles-visualization`
  })

  function close () {
    emit('update:modelValue', false)
  }
</script>
