<template>
  <div class="smiles-view d-inline-flex flex-column ga-2">
    <svg
      :id="svgId"
      ref="svgRef"
      :width="width"
      :height="height"
      xmlns="http://www.w3.org/2000/svg"
    ></svg>

    <v-menu v-model="isMenuOpen" location="bottom" transition="fade-transition">
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          color="primary"
          variant="outlined"
          :loading="isRendering"
          prepend-icon="mdi-menu-down"
        >
          Download visualization
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          title="Download as SVG"
          @click="onDownloadSVG"
          :disabled="isRendering || !!error"
        />
        <v-list-item
          title="Download as PNG"
          @click="onDownloadPNG"
          :disabled="isRendering || !!error"
        />
      </v-list>
    </v-menu>

    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, watch, ref, computed } from 'vue'
// @ts-ignore (todo: check types for smiles drawer)
import SmilesDrawer from 'smiles-drawer'

const props = defineProps<{
  smiles: string
  width?: number
  height?: number
  theme?: string
  padding?: number
  filename?: string
}>()

const width = computed(() => props.width ?? 500)
const height = computed(() => props.height ?? 500)
const theme = computed(() => props.theme ?? 'light')
const padding = computed(() => props.padding ?? 10)

const svgRef = ref<SVGSVGElement | null>(null)
const error = ref<string | null>(null)
const isMenuOpen = ref(false)
const isRendering = ref(false)

// Create a reasonably unique id for the element for libraries that expect a selector string
const svgId = `smiles-svg-${Math.random().toString(36).slice(2)}`

function buildFilename(ext: 'svg' | 'png') {
  const base = props.filename?.trim() || 'smiles-visualization'
  return `${base}.${ext}`
}

async function renderSmilesSVG(): Promise<void> {
  if (!props.smiles) return

  const svgEl = svgRef.value
  if (!svgEl) return

  isRendering.value = true
  error.value = null

  const options = { width: width.value, height: height.value, padding: padding.value }
  const svgDrawer = new SmilesDrawer.SvgDrawer(options)

  // Clear previous drawing
  while (svgEl.firstChild) {
    svgEl.removeChild(svgEl.firstChild)
  }

  await new Promise<void>((resolve, reject) => {
    SmilesDrawer.parse(
      props.smiles,
      (tree: any) => {
        try {
          svgDrawer.draw(tree, svgEl, theme.value)
          resolve()
        } catch (e) {
          console.error(e)
          error.value = 'Failed to render SMILES.'
          reject(e)
        }
      },
      (err: any) => {
        console.error(err)
        error.value = 'Failed to parse SMILES.'
        reject(err)
      }
    )
  }).catch(() => {})

  isRendering.value = false
}

async function downloadSVGFile(): Promise<void> {
  await renderSmilesSVG()

  const svgEl = svgRef.value
  if (!svgEl) return

  const serializer = new XMLSerializer()
  let svgString = serializer.serializeToString(svgEl)

  if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  }

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = buildFilename('svg')
  document.body.appendChild(a)
  a.click()
  a.remove()

  URL.revokeObjectURL(url)
}

async function renderPNG(): Promise<HTMLCanvasElement | null> {
  await renderSmilesSVG()

  const svgEl = svgRef.value
  if (!svgEl) return null

  const serializer = new XMLSerializer()
  let svgString = serializer.serializeToString(svgEl)

  if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  }

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const img = new Image()

  const canvas = document.createElement('canvas')
  canvas.width = width.value
  canvas.height = height.value

  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      try {
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get 2D context'))
          return
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve()
      } catch (e) {
        reject(e)
      } finally {
        URL.revokeObjectURL(url)
      }
    }

    img.onerror = (e) => {
      console.error('Failed to load SVG for PNG conversion', e)
      URL.revokeObjectURL(url)
      reject(e as any)
    }

    img.src = url
  }).catch((e) => {
    console.error(e)
  })

  return canvas
}

async function downloadPNGFile(): Promise<void> {
  const canvas = await renderPNG()
  if (!canvas) return

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png')
  )

  if (!blob) return

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = buildFilename('png')
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

async function onDownloadSVG() {
  isMenuOpen.value = false
  await downloadSVGFile()
}

async function onDownloadPNG() {
  isMenuOpen.value = false
  await downloadPNGFile()
}

onMounted(() => {
  renderSmilesSVG()
})
watch(
  () => props.smiles,
  () => {
    renderSmilesSVG()
  }
)
watch([width, height, theme, padding], () => {
  renderSmilesSVG()
})
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
