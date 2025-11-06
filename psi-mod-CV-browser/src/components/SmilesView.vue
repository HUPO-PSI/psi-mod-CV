<template>
  <div class="smiles-view" :style="{ width: width + 'px' }">
    <svg :id="svgId" ref="svgRef" :width="width" :height="height" xmlns="http://www.w3.org/2000/svg"></svg>
    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, watch, ref, computed } from 'vue'
// @ts-ignore (todo: check types for smiles drawer)
import SmilesDrawer from "smiles-drawer";

const props = defineProps<{
  smiles: string
  width?: number
  height?: number
  theme?: string
  padding?: number
}>();

const width = computed(() => props.width ?? 500);
const height = computed(() => props.height ?? 500);
const theme = computed(() => props.theme ?? 'light');
const padding = computed(() => props.padding ?? 10);

const svgRef = ref<SVGSVGElement | null>(null)
const error = ref<string | null>(null)

// Create a reasonably unique id for the element for libraries that expect a selector string
const svgId = `smiles-svg-${Math.random().toString(36).slice(2)}`

async function renderSmiles() {
  let options = {width: 500, height: 500};
  let svgDrawer = new SmilesDrawer.SvgDrawer(options);

  SmilesDrawer.parse(props.smiles, function(tree: any) {
    svgDrawer.draw(tree, document.getElementById(svgId), theme.value);
  }, function(err: any) {
    console.error(err);
  });
}

onMounted(renderSmiles)
watch(() => props.smiles, () => renderSmiles())
watch([width, height, theme, padding], () => renderSmiles())
</script>

<style scoped>
.smiles-view {
  display: inline-block;
}
.error {
  margin-top: 8px;
  color: #B00020; /* Vuetify default error color fallback */
  font-size: 0.875rem;
}
</style>
