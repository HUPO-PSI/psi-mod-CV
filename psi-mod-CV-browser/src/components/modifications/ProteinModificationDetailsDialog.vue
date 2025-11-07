<template>
  <v-dialog
    :model-value="modelValue"
    @update:modelValue="(v: boolean) => emit('update:modelValue', v)"
    max-width="2000"
    transition="dialog-bottom-transition"
  >
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center bg-primary text-white">
        <v-icon class="mr-2">mdi-information</v-icon>
        <div class="d-flex flex-column">
          <span class="text-subtitle-1 font-weight-bold">{{ item?.id || 'Modification' }}</span>
          <span class="text-body-2">{{ item?.name }}</span>
        </div>
        <v-spacer />
        <v-btn icon variant="text" color="white" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12" md="4">
            <div class="text-subtitle-1 font-weight-medium mb-2">Cross-references</div>
            <div v-if="item?.xrefs && item.xrefs.length">
              <v-table density="compact" class="bg-transparent">
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
                <div v-if="item?.parents && item.parents.length" class="d-flex flex-wrap gap-2">
                  <v-chip
                    v-for="(p, idx) in item!.parents"
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
                <div v-if="item?.children && item.children.length" class="d-flex flex-wrap gap-2">
                  <v-chip
                    v-for="(c, idx) in item!.children"
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
              <SmilesView v-if="smiles" :smiles="smiles" :width="300" :height="300" theme="light" />
              <div v-else class="text-medium-emphasis pa-4">No SMILES available in xrefs.</div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="tonal" color="primary" @click="close">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import SmilesView from '@/components/smiles/SmilesView.vue'

interface Xref { database: string; value: string }
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

function findXref(item: ModItem | null | undefined, key: string) {
  if (!item?.xrefs) return null
  const k = key.toLowerCase()
  return item.xrefs.find((x: any) => typeof x?.database === 'string' && x.database.toLowerCase() === k) || null
}

const smiles = computed(() => {
  const xr = findXref(props.item, 'SMILES')
  return xr ? (xr as any).value as string : null
})

function close() {
  emit('update:modelValue', false)
}
</script>
