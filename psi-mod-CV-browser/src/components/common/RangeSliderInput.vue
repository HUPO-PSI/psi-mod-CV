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
        class="mr-2"
        density="compact"
        hide-details
        label="Min"
        :max="max"
        :min="min"
        :model-value="modelValue[0]"
        :step="step"
        style="max-width: 100px"
        type="number"
        @update:model-value="updateMin"
      />
      <v-range-slider
        class="flex-grow-1 mx-2"
        color="primary"
        density="comfortable"
        hide-details
        :max="max"
        :min="min"
        :model-value="modelValue"
        :step="step"
        :thumb-label="true"
        @update:model-value="updateRange"
      />
      <v-text-field
        class="ml-2"
        density="compact"
        hide-details
        label="Max"
        :max="max"
        :min="min"
        :model-value="modelValue[1]"
        :step="step"
        style="max-width: 100px"
        type="number"
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
    description: '',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: [number, number]]
  }>()

  const rangeDisplay = computed(() => {
    return `${props.modelValue[0].toFixed(2)} - ${props.modelValue[1].toFixed(2)} Da`
  })

  function updateMin (value: string | number) {
    const numValue = typeof value === 'string' ? Number.parseFloat(value) : value
    if (!isNaN(numValue)) {
      emit('update:modelValue', [numValue, props.modelValue[1]])
    }
  }

  function updateMax (value: string | number) {
    const numValue = typeof value === 'string' ? Number.parseFloat(value) : value
    if (!isNaN(numValue)) {
      emit('update:modelValue', [props.modelValue[0], numValue])
    }
  }

  function updateRange (value: [number, number]) {
    emit('update:modelValue', value)
  }
</script>
