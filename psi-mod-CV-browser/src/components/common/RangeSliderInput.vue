<template>
  <div class="mb-4">
    <div class="mb-1 d-flex align-center justify-space-between">
      <div class="text-subtitle-2">{{ label }}</div>
      <div class="text-caption text-medium-emphasis">
        {{ rangeDisplay }}
      </div>
    </div>
    <div class="d-flex align-center">
      <v-text-field
        :model-value="modelValue[0]"
        type="number"
        label="Min"
        :min="min"
        :max="max"
        :step="step"
        density="compact"
        hide-details
        class="mr-2"
        style="max-width: 100px"
        @update:model-value="updateMin"
      />
      <v-range-slider
        :model-value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        color="primary"
        :thumb-label="true"
        density="comfortable"
        hide-details
        class="flex-grow-1 mx-2"
        @update:model-value="updateRange"
      />
      <v-text-field
        :model-value="modelValue[1]"
        type="number"
        label="Max"
        :min="min"
        :max="max"
        :step="step"
        density="compact"
        hide-details
        class="ml-2"
        style="max-width: 100px"
        @update:model-value="updateMax"
      />
    </div>
    <div v-if="description" class="text-caption text-medium-emphasis mt-1">
      {{ description }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  label: string
  modelValue: [number, number]
  min: number
  max: number
  step?: number
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  step: 10,
  description: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: [number, number]]
}>()

const rangeDisplay = computed(() => {
  return `${props.modelValue[0].toFixed(2)} - ${props.modelValue[1].toFixed(2)}`
})

const updateMin = (value: string | number) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (!isNaN(numValue)) {
    emit('update:modelValue', [numValue, props.modelValue[1]])
  }
}

const updateMax = (value: string | number) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (!isNaN(numValue)) {
    emit('update:modelValue', [props.modelValue[0], numValue])
  }
}

const updateRange = (value: [number, number]) => {
  emit('update:modelValue', value)
}
</script>
