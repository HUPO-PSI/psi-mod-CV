<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// Proxy for v-model usage
const dialog = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})

function close() {
  dialog.value = false
}
</script>

<template>
  <v-dialog v-model="dialog" max-width="1000px">
    <v-card>
      <v-card-title class="text-h6">About</v-card-title>
      <v-card-text>
        <p>
          PSI-MOD Residue Modifications Browser
        </p>
        <p class="text-body-2">
          This tool lets you browse and inspect PSI-MOD controlled vocabulary entries
          for protein residue modifications.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="flat" @click="close">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<style scoped>
.text-body-2 {
  opacity: 0.9;
}
</style>
