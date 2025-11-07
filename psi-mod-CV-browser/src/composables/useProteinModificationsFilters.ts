import { ref, computed, watch } from 'vue'
import { useOboStore } from '@/stores/obo'

// Singleton state to be shared across all component instances
let sharedState: ReturnType<typeof createSharedState> | null = null

function createSharedState() {
  const oboStore = useOboStore()

  // Search and filter state
  const search = ref('')
  const leafOnly = ref(true)
  const hasSmilesOnly = ref(false)
  const selectedOrigin = ref<string[]>([])
  const selectedTermSpec = ref<string[]>([])

  // Get modifications from store
  const modifications = computed(() => oboStore.allTerms)
  const error = computed(() => oboStore.error)

  // ----- Xref helpers -----
  function findXref(item: any, key: string) {
    if (!item?.xrefs) return null
    const k = key.toLowerCase()
    return item.xrefs.find((x: any) => typeof x?.database === 'string' && x.database.toLowerCase() === k) || null
  }

  function getSmiles(item: any): string | null {
    const xr = findXref(item, 'SMILES')
    return xr ? xr.value : null
  }

  function getNumericXref(item: any, key: string): number | undefined {
    const xr = findXref(item, key)
    if (!xr) return undefined
    const n = parseFloat(String(xr.value).replace(/,/g, ''))
    return Number.isFinite(n) ? n : undefined
  }

  function getXrefValue(item: any, key: string): string | null {
    const xr = findXref(item, key)
    return xr ? String(xr.value) : null
  }

  // ----- Ranges and filter state -----
  const diffMonoValues = computed<number[]>(() => (modifications.value || [])
    .map(m => getNumericXref(m, 'DiffMono'))
    .filter((v): v is number => typeof v === 'number'))

  const massMonoValues = computed<number[]>(() => (modifications.value || [])
    .map(m => getNumericXref(m, 'MassMono'))
    .filter((v): v is number => typeof v === 'number'))

  function minMax(values: number[]): { min: number; max: number } {
    if (!values.length) return {min: 0, max: 0}
    let min = Number.POSITIVE_INFINITY
    let max = Number.NEGATIVE_INFINITY
    for (const v of values) {
      if (v < min) min = v;
      if (v > max) max = v
    }
    min = Math.floor(min / 10) * 10
    max = Math.ceil(max / 10) * 10
    return {min, max}
  }

  const diffMonoMinMax = computed(() => minMax(diffMonoValues.value))
  const massMonoMinMax = computed(() => minMax(massMonoValues.value))

  const diffMonoRange = ref<[number, number]>([diffMonoMinMax.value.min, diffMonoMinMax.value.max])
  const massMonoRange = ref<[number, number]>([massMonoMinMax.value.min, massMonoMinMax.value.max])

  // Initialize ranges to full extents once data arrives
  watch(diffMonoMinMax, (mm) => {
    if (mm && (diffMonoRange.value[0] === 0 && diffMonoRange.value[1] === 0) && (mm.min !== 0 || mm.max !== 0)) {
      diffMonoRange.value = [mm.min, mm.max]
    }
  })
  watch(massMonoMinMax, (mm) => {
    if (mm && (massMonoRange.value[0] === 0 && massMonoRange.value[1] === 0) && (mm.min !== 0 || mm.max !== 0)) {
      massMonoRange.value = [mm.min, mm.max]
    }
  })

  const diffMonoRangeDisplay = computed(() => {
    const [a, b] = diffMonoRange.value
    return `${a.toFixed(0)} to ${b.toFixed(0)} Da`
  })
  const massMonoRangeDisplay = computed(() => {
    const [a, b] = massMonoRange.value
    return `${a.toFixed(0)} to ${b.toFixed(0)} Da`
  })

  // Numeric input proxies for manual editing of range endpoints, with clamping
  function clamp(val: number, min: number, max: number): number {
    if (!Number.isFinite(val)) return min
    return Math.min(Math.max(val, min), max)
  }

  const diffMonoMinVal = computed<number>({
    get() {
      return diffMonoRange.value[0]
    },
    set(v: number) {
      const mm = diffMonoMinMax.value
      const min = clamp(v, mm.min, mm.max)
      // ensure min does not exceed current max
      diffMonoRange.value = [Math.min(min, diffMonoRange.value[1]), diffMonoRange.value[1]]
    }
  })
  const diffMonoMaxVal = computed<number>({
    get() {
      return diffMonoRange.value[1]
    },
    set(v: number) {
      const mm = diffMonoMinMax.value
      const max = clamp(v, mm.min, mm.max)
      // ensure max is not below current min
      diffMonoRange.value = [diffMonoRange.value[0], Math.max(max, diffMonoRange.value[0])]
    }
  })

  const massMonoMinVal = computed<number>({
    get() {
      return massMonoRange.value[0]
    },
    set(v: number) {
      const mm = massMonoMinMax.value
      const min = clamp(v, mm.min, mm.max)
      massMonoRange.value = [Math.min(min, massMonoRange.value[1]), massMonoRange.value[1]]
    }
  })
  const massMonoMaxVal = computed<number>({
    get() {
      return massMonoRange.value[1]
    },
    set(v: number) {
      const mm = massMonoMinMax.value
      const max = clamp(v, mm.min, mm.max)
      massMonoRange.value = [massMonoRange.value[0], Math.max(max, massMonoRange.value[0])]
    }
  })

  // Origin filter state and options
  const originOptions = computed<string[]>(() => {
    const set = new Set<string>()
    for (const m of modifications.value) {
      if (Array.isArray(m?.xrefs)) {
        for (const xr of m.xrefs) {
          if (typeof xr?.database === 'string' && xr.database.toLowerCase() === 'origin') {
            const val = String(xr.value).trim()
            if (val) set.add(val)
          }
        }
      }
    }
    // Sort so that single-character amino acids appear first, then others alphabetically
    return Array.from(set).sort((a, b) => {
      const aSingle = a.length === 1
      const bSingle = b.length === 1
      if (aSingle !== bSingle) return aSingle ? -1 : 1
      return a.localeCompare(b)
    })
  })

  // TermSpec filter state and options (values from xrefs["TermSpec"])
  const termSpecOptions = computed<string[]>(() => {
    const set = new Set<string>()
    for (const m of modifications.value) {
      if (Array.isArray(m?.xrefs)) {
        for (const xr of m.xrefs) {
          if (typeof xr?.database === 'string' && xr.database.toLowerCase() === 'termspec') {
            const val = String(xr.value).trim()
            if (val) set.add(val)
          }
        }
      }
    }
    // Simple alphabetical sort
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  })

  const totalCount = computed(() => modifications.value.length)

  // Apply search + filters
  const filteredItems = computed(() => {
    const items = modifications.value
    const q = search.value.trim().toLowerCase()

    const applyDiff = !(diffMonoRange.value[0] === diffMonoMinMax.value.min && diffMonoRange.value[1] === diffMonoMinMax.value.max)
    const applyMass = !(massMonoRange.value[0] === massMonoMinMax.value.min && massMonoRange.value[1] === massMonoMinMax.value.max)

    return items.filter(mod => {
      // text search
      if (q) {
        const match = (
          mod.id.toLowerCase().includes(q) ||
          mod.name.toLowerCase().includes(q) ||
          mod.definition.toLowerCase().includes(q) ||
          (Array.isArray(mod.synonyms) && mod.synonyms.some((s: any) => s.text?.toLowerCase().includes(q)))
        )
        if (!match) return false
      }

      // leaf only
      if (leafOnly.value) {
        const isLeaf = !mod.children || mod.children.length === 0
        if (!isLeaf) return false
      }

      // must have SMILES
      if (hasSmilesOnly.value) {
        if (!getSmiles(mod)) return false
      }

      // Origin filter
      if (selectedOrigin.value.length) {
        const xr = findXref(mod, 'Origin')
        const originVal = xr ? String(xr.value).trim() : ''
        if (!selectedOrigin.value.includes(originVal)) return false
      }

      // TermSpec filter
      if (selectedTermSpec.value.length) {
        const xr = findXref(mod, 'TermSpec')
        const termSpecVal = xr ? String(xr.value).trim() : ''
        if (!selectedTermSpec.value.includes(termSpecVal)) return false
      }

      // DiffMono filter
      if (applyDiff) {
        const v = getNumericXref(mod, 'DiffMono')
        if (v === undefined) return false
        if (v < diffMonoRange.value[0] || v > diffMonoRange.value[1]) return false
      }

      // MassMono filter
      if (applyMass) {
        const v = getNumericXref(mod, 'MassMono')
        if (v === undefined) return false
        if (v < massMonoRange.value[0] || v > massMonoRange.value[1]) return false
      }

      return true
    })
  })

  // Provide primitive fields on the items for columns that render from xrefs, so built-in sorting works
  const augmentedItems = computed(() => {
    return filteredItems.value.map((m: any) => {
      const chebi = getChebiInfo(m)
      const unimod = getUnimodInfo(m)
      const origin = getXrefValue(m, 'Origin') ?? ''
      const termSpec = getXrefValue(m, 'TermSpec') ?? ''
      // Keep original object props and add sortable primitive props
      return {
        ...m,
        chebiId: chebi ? chebi.label : '',
        unimodId: unimod ? unimod.label : '',
        origin,
        termSpec,
      }
    })
  })

  // Reset all filters and search to their initial values
  function resetFilters() {
    search.value = ''
    leafOnly.value = true
    hasSmilesOnly.value = false
    // Reset ranges to the current global extents
    diffMonoRange.value = [diffMonoMinMax.value.min, diffMonoMinMax.value.max]
    massMonoRange.value = [massMonoMinMax.value.min, massMonoMinMax.value.max]
    // Reset Origin filter
    selectedOrigin.value = []
    // Reset TermSpec filter
    selectedTermSpec.value = []
  }

  function getChebiInfo(item: any): { label: string; url: string } | null {
    const refs: string[] | undefined = item?.definitionXrefs
    if (!Array.isArray(refs) || !refs.length) return null
    const ref = refs.find(r => /^chebi:\s*/i.test(r))
    if (!ref) return null
    const m = ref.match(/chebi:\s*([0-9]+)/i)
    if (!m) return null
    const chebiNum = m[1]
    const label = `CHEBI:${chebiNum}`
    const url = `https://www.ebi.ac.uk/chebi/searchId.do?chebiId=${encodeURIComponent(chebiNum!)}`
    return { label, url }
  }

  function getUnimodInfo(item: any): { label: string; url: string } | null {
    const refs: string[] | undefined = item?.definitionXrefs
    if (!Array.isArray(refs) || !refs.length) return null
    const ref = refs.find(r => /^unimod:\s*/i.test(r))
    if (!ref) return null
    const m = ref.match(/unimod:\s*([0-9]+)/i)
    if (!m) return null
    const unimodNum = m[1]
    const label = `Unimod:${unimodNum}`
    const url = `https://www.unimod.org/modifications_view.php?editid1=${encodeURIComponent(unimodNum!)}`
    return { label, url }
  }

  // Custom key sort: ensure N/A (empty) sorts first on ascending and last on descending for specific columns
  function compareNAFirst(a: unknown, b: unknown): number {
    const av = (a ?? '').toString().trim()
    const bv = (b ?? '').toString().trim()
    const aEmpty = av.length === 0
    const bEmpty = bv.length === 0
    if (aEmpty && bEmpty) return 0
    if (aEmpty) return 1
    if (bEmpty) return -1
    // Use localeCompare with numeric so strings like "CHEBI:2" < "CHEBI:10" numerically
    return av.localeCompare(bv, undefined, { sensitivity: 'base', numeric: true })
  }

  const customKeySort: Record<string, (a: unknown, b: unknown) => number> = {
    chebiId: compareNAFirst,
    unimodId: compareNAFirst,
    origin: compareNAFirst,
    termSpec: compareNAFirst,
  }

  return {
    // State
    search,
    leafOnly,
    hasSmilesOnly,
    selectedOrigin,
    selectedTermSpec,
    diffMonoRange,
    massMonoRange,
    diffMonoMinVal,
    diffMonoMaxVal,
    massMonoMinVal,
    massMonoMaxVal,

    // Computed
    modifications,
    error,
    diffMonoMinMax,
    massMonoMinMax,
    diffMonoRangeDisplay,
    massMonoRangeDisplay,
    originOptions,
    termSpecOptions,
    totalCount,
    filteredItems,
    augmentedItems,
    customKeySort,

    // Functions
    findXref,
    getSmiles,
    getNumericXref,
    getXrefValue,
    resetFilters,
    getChebiInfo,
    getUnimodInfo,
  }
}

export function useProteinModificationsFilters() {
  if (!sharedState) {
    sharedState = createSharedState()
  }
  return sharedState
}
