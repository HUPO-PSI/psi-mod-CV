import type { OboTerm } from '@/system/obo/OboTerm.ts'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useOboStore } from '@/stores/obo'

interface BreadcrumbPart {
  id: string
  ellipsis: boolean
  term?: OboTerm | null
}

export const useNavigationStore = defineStore('navigation', () => {
  const currentTermId = ref<string | null>(null)
  const history = ref<string[]>([]) // stack of previously visited term IDs

  function setRoot (id: string | null) {
    currentTermId.value = id
    history.value = []
  }

  function openTerm (id: string) {
    if (!id) {
      return
    }
    if (currentTermId.value === id) {
      return
    }
    if (currentTermId.value) {
      const last = history.value[history.value.length - 1]
      if (last !== currentTermId.value) {
        history.value.push(currentTermId.value)
      }
    }
    currentTermId.value = id
  }

  function goBack () {
    const prev = history.value.pop()
    if (prev) {
      currentTermId.value = prev
    }
  }

  function jumpTo (index: number) {
    const path = [...history.value, currentTermId.value].filter(Boolean) as string[]
    if (index < 0 || index >= path.length) {
      return
    }
    if (index === path.length - 1) {
      return
    } // already current
    currentTermId.value = path[index]!
    history.value = path.slice(0, index)
  }

  function reset () {
    currentTermId.value = null
    history.value = []
  }

  const fullPath = computed<string[]>(() => {
    if (!currentTermId.value) {
      return []
    }
    return [...history.value, currentTermId.value]
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

  return {
    currentTermId,
    history,
    setRoot,
    openTerm,
    goBack,
    jumpTo,
    reset,
    fullPath,
    breadcrumb,
    breadcrumbTerms,
  }
})
