<template>
  <div class="smiles-status">
    <v-tooltip v-if="loaded" location="bottom" :text="tooltip">
      <template #activator="{ props }">
        <div class="d-flex align-center" v-bind="props">
          <v-progress-circular
            v-if="total > 0"
            :model-value="percentage"
            :size="40"
            :width="8"
            color="white"
          >
            <span class="text-caption font-weight-medium">{{ formatted }}</span>
          </v-progress-circular>
        </div>
      </template>
    </v-tooltip>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useOboStore } from '@/stores/obo.ts'

interface Props {
  precision?: number
}

const props = withDefaults(defineProps<Props>(), {
  precision: 1,
})

const obo = useOboStore()

// Reactive data derivations
const error = computed(() => obo.error)
const loaded = computed(() => obo.loaded && !obo.error)

const terms = computed(() => obo.terms)
const total = computed(() => terms.value.length)

// Count terms that have at least one SMILES xref
const smilesCount = computed(() => {
  if (!loaded.value) return 0
  let count = 0
  for (const t of terms.value) {
    // Defensive checks (xrefs always present per parser) but keep safe
    if (t.xrefs && t.xrefs.some(x => x.database === 'SMILES')) count++
  }
  return count
})

const percentage = computed(() => {
  if (!loaded.value || total.value === 0) return 0
  return (smilesCount.value / total.value) * 100
})

const formatted = computed(() => {
  const p = percentage.value
  if (p > 0 && p < 0.1 && props.precision > 0) return '<0.1%'
  if (props.precision === 0) return Math.round(p) + '%'
  return p.toFixed(props.precision).replace(/\.0+$/, '') + '%'
})

const tooltip = computed(() => {
  if (error.value) return 'Failed to load OBO terms'
  if (!loaded.value) return 'Loading SMILES coverage...'
  return `${smilesCount.value} of ${total.value} terms have SMILES structures (${formatted.value})`
})
</script>

<style scoped>
.smiles-status {
  display: flex;
  align-items: center;
}
</style>

