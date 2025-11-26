import type { OboTerm } from '@/system/obo/OboTerm.ts'
import { defineStore } from 'pinia'
import { computed, ref, onMounted, watch } from 'vue'
import { useOboStore } from '@/stores/obo'

interface BreadcrumbPart {
  id: string
  ellipsis: boolean
  term?: OboTerm | null
}

export const useNavigationStore = defineStore('navigation', () => {
  const currentTermId = ref<string | null>(null)
  const navStack = ref<string[]>([]) // stack of previously visited term IDs

  function setRoot (id: string | null) {
    currentTermId.value = id
    navStack.value = []
  }

  function openTerm (id: string) {
    if (!id) {
      return
    }
    if (currentTermId.value === id) {
      return
    }
    if (currentTermId.value) {
      const last = navStack.value[navStack.value.length - 1]
      if (last !== currentTermId.value) {
        navStack.value.push(currentTermId.value)
      }
    }
    currentTermId.value = id
  }

  function jumpTo (index: number) {
    const path = [...navStack.value, currentTermId.value].filter(Boolean) as string[]
    if (index < 0 || index >= path.length) {
      return
    }
    if (index === path.length - 1) {
      return
    } // already current
    currentTermId.value = path[index]!
    navStack.value = path.slice(0, index)
  }

  function reset () {
    currentTermId.value = null
    navStack.value = []
  }

  const fullPath = computed<string[]>(() => {
    if (!currentTermId.value) {
      return []
    }
    return [...navStack.value, currentTermId.value]
  })

  const breadcrumb = computed<BreadcrumbPart[]>(() => {
    const path = fullPath.value
    if (path.length === 0) {
      return []
    }
    return path.map(id => ({ id, ellipsis: false }))
  })

  const breadcrumbTerms = computed<BreadcrumbPart[]>(() => {
    const obo = useOboStore()
    return breadcrumb.value.map(part => ({ ...part, term: obo.byId(part.id) ?? null }))
  })

  // Query param sync: allow opening by ?mod=NNNNN (numeric part). Keep URL updated when navigating.
  function normalizeModId(input: string | null): string | null {
    if (!input) return null
    const trimmed = input.trim()
    if (!trimmed) return null
    const modMatch = /^MOD:(\d{1,})$/.exec(trimmed)
    if (modMatch && modMatch[1]) {
      const num = modMatch[1]
      return `MOD:${num.padStart(5, '0')}`
    }
    const numMatch = /^(\d{1,})$/.exec(trimmed)
    if (numMatch && numMatch[1]) {
      const num = numMatch[1]
      return `MOD:${num.padStart(5, '0')}`
    }
    return null
  }

  function readQueryParam(): string | null {
    try {
      const params = new URLSearchParams(window.location.search)
      return params.get('mod')
    } catch {
      return null
    }
  }

  function writeQueryParam(id: string | null) {
    try {
      const url = new URL(window.location.href)
      if (id) {
        const normalized = normalizeModId(id)
        if (normalized) {
          url.searchParams.set('mod', normalized.replace('MOD:', ''))
        } else {
          url.searchParams.delete('mod')
        }
      } else {
        url.searchParams.delete('mod')
      }
      window.history.replaceState(null, '', url.toString())
    } catch {
      /* no-op */
    }
  }

  onMounted(() => {
    const qp = readQueryParam()
    const normalized = normalizeModId(qp)
    if (normalized) {
      setRoot(normalized)
    }
  })

  watch(currentTermId, (id) => {
    writeQueryParam(id)
  })

  return {
    currentTermId,
    history: navStack, // keep exported name for existing consumers
    setRoot,
    openTerm,
    jumpTo,
    reset,
    fullPath,
    breadcrumb,
    breadcrumbTerms,
  }
})
