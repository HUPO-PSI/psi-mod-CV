import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { OboParser } from '@/system/obo/OboParser.ts'
import type { OboTerm } from '@/system/obo/OboTerm.ts'

export const useOboStore = defineStore('obo', () => {
  // State
  const terms = ref<OboTerm[]>([])
  const loaded = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Getters
  const allTerms = computed(() => terms.value)
  const termCount = computed(() => terms.value.length)

  const byId = (id: string) => {
    // Build a quick map on demand; for large datasets you could cache this with a computed/map if needed
    const map = new Map<string, OboTerm>()
    for (const t of terms.value) map.set(t.id, t)
    return map.get(id)
  }

  // Simple search by name or synonym text (case-insensitive)
  const search = (q: string) => {
    const query = q.trim().toLowerCase()
    if (!query) return terms.value
    return terms.value.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.synonyms?.some(s => s.text.toLowerCase().includes(query))
    )
  }

  // Actions
  async function loadFromOBO() {
    if (loaded.value && terms.value.length) return
    error.value = null
    try {
      // Import the OBO file as raw text at build-time
      const oboText: string = (await import('@/assets/data/PSI-MOD.obo?raw')).default as unknown as string
      const parsed = OboParser.parse(oboText)
      terms.value = parsed
      loaded.value = true
    } catch (e: any) {
      console.error('Failed to load/parse OBO file:', e)
      error.value = e?.message ?? String(e)
      loaded.value = false
      terms.value = []
    }
  }

  return {
    // state
    terms,
    loaded,
    error,
    // getters
    allTerms,
    termCount,
    byId,
    search,
    // actions
    loadFromOBO,
  }
})
