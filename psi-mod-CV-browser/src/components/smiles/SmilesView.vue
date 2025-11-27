<template>
  <div class="d-flex flex-column" style="width: 100%;">
    <v-card class="mb-2">
      <v-card-text>
        <div class="smiles-view ga-2 bg-white align-center justify-center">
          <svg
            :id="svgId"
            ref="svgRef"
            :height="height"
            :width="`calc(min(${width}, 100%))`"
            xmlns="http://www.w3.org/2000/svg"
          />

          <div v-if="error" class="error">
            {{ error }}
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-menu v-model="isMenuOpen" location="bottom" transition="fade-transition">
          <template #activator="{ props: menuProps }">
            <v-btn
              v-bind="menuProps"
              append-icon="mdi-menu-down"
              color="primary"
              :loading="isRendering"
              prepend-icon="mdi-download"
              variant="outlined"
            >
              Save image
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              :disabled="isRendering || !!error"
              title="Save as SVG"
              @click="onDownloadSVG"
            />
            <v-list-item
              :disabled="isRendering || !!error"
              title="Save as PNG"
              @click="onDownloadPNG"
            />
          </v-list>
        </v-menu>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
  // @ts-ignore (todo: check types for smiles drawer)
  import SmilesDrawer from 'smiles-drawer'
  import { computed, onMounted, ref, watch } from 'vue'

  const props = defineProps<{
    smiles: string
    width?: number
    height?: number
    theme?: string
    padding?: number
    filename?: string
  }>()

  const width = computed(() => props.width ?? 500)
  const height = computed(() => props.height ?? 300)
  const theme = computed(() => props.theme ?? 'light')
  const padding = computed(() => props.padding ?? 10)

  const svgRef = ref<SVGSVGElement | null>(null)
  const error = ref<string | null>(null)
  const isMenuOpen = ref(false)
  const isRendering = ref(false)

  // Create a reasonably unique id for the element for libraries that expect a selector string
  const svgId = `smiles-svg-${Math.random().toString(36).slice(2)}`

  function buildFilename (ext: 'svg' | 'png') {
    const base = props.filename?.trim() || 'smiles-visualization'
    return `${base}.${ext}`
  }

  async function renderSmilesSVG (): Promise<void> {
    if (!props.smiles) return

    const svgEl = svgRef.value
    if (!svgEl) return

    isRendering.value = true
    error.value = null

    const options = { width: width.value, height: height.value, padding: padding.value }
    const svgDrawer = new SmilesDrawer.SvgDrawer(options)

    // Clear previous drawing
    while (svgEl.firstChild) {
      svgEl.firstChild.remove()
    }

    await new Promise<void>((resolve, reject) => {
      SmilesDrawer.parse(
        props.smiles,
        (tree: any) => {
          try {
            svgDrawer.draw(tree, svgEl, theme.value)
            resolve()
          } catch (error_) {
            console.error(error_)
            error.value = 'Failed to render SMILES.'
            reject(error_)
          }
        },
        (err: any) => {
          console.error(err)
          error.value = 'Failed to parse SMILES.'
          reject(err)
        },
      )
    }).catch(() => {})

    isRendering.value = false
  }

  async function downloadSVGFile (): Promise<void> {
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
    document.body.append(a)
    a.click()
    a.remove()

    URL.revokeObjectURL(url)
  }

  async function renderPNG (): Promise<HTMLCanvasElement | null> {
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
      img.addEventListener('load', () => {
        try {
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Failed to get 2D context'))
            return
          }
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve()
        } catch (error_) {
          reject(error_)
        } finally {
          URL.revokeObjectURL(url)
        }
      })

      img.onerror = e => {
        console.error('Failed to load SVG for PNG conversion', e)
        URL.revokeObjectURL(url)
        reject(e as any)
      }

      img.src = url
    }).catch(error_ => {
      console.error(error_)
    })

    return canvas
  }

  async function downloadPNGFile (): Promise<void> {
    const canvas = await renderPNG()
    if (!canvas) return

    const blob: Blob | null = await new Promise(resolve =>
      canvas.toBlob(b => resolve(b), 'image/png'),
    )

    if (!blob) return

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = buildFilename('png')
    document.body.append(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function onDownloadSVG () {
    isMenuOpen.value = false
    await downloadSVGFile()
  }

  async function onDownloadPNG () {
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
    },
  )
  watch([width, height, theme, padding], () => {
    renderSmilesSVG()
  })
</script>

<style>
.error {
  margin-top: 8px;
  color: #B00020; /* Vuetify default error color fallback */
  font-size: 0.875rem;
}
</style>
