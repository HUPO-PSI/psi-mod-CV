import type { OboTerm } from '@/system/obo/OboTerm.ts'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { OboParser } from '@/system/obo/OboParser.ts'

export const useOboStore = defineStore('obo', () => {
  // State
  const terms = ref<OboTerm[]>([])
  const loaded = ref<boolean>(false)
  const error = ref<string | null>(null)
  const dataVersion = ref<string | null>(null)

  // Getters
  const allTerms = computed(() => terms.value)
  const termCount = computed(() => terms.value.length)

  const byId = (id: string) => {
    // Build a quick map on demand; for large datasets you could cache this with a computed/map if needed
    const map = new Map<string, OboTerm>()
    for (const t of terms.value) {
      map.set(t.id, t)
    }
    return map.get(id)
  }

  // Simple search by name or synonym text (case-insensitive)
  const search = (q: string) => {
    const query = q.trim().toLowerCase()
    if (!query) {
      return terms.value
    }
    return terms.value.filter(t =>
      t.name.toLowerCase().includes(query)
      || t.synonyms?.some(s => s.text.toLowerCase().includes(query)),
    )
  }

  // Actions
  async function loadFromOBO () {
    if (loaded.value && terms.value.length > 0) {
      return
    }
    error.value = null
    try {
      // Import the OBO file as raw text at build-time
      const oboText: string = (await import('@/assets/data/PSI-MOD.obo?raw')).default as unknown as string

      // Use OboParser to extract data-version
      dataVersion.value = OboParser.parseDataVersion(oboText)

      // Parse terms
      terms.value = OboParser.parse(oboText)
      loaded.value = true
    } catch (error_: any) {
      console.error('Failed to load/parse OBO file:', error_)
      error.value = error_?.message ?? String(error_)
      loaded.value = false
      terms.value = []
      dataVersion.value = null
    }
  }

  return {
    // state
    terms,
    loaded,
    error,
    dataVersion,
    // getters
    allTerms,
    termCount,
    byId,
    search,
    // actions
    loadFromOBO,
  }
})
