import type { OboSynonym } from '@/system/obo/OboSynonym.ts'
import type { OboXref } from '@/system/obo/OboXRef.ts'

/**
 * Represents a single term from the PSI-MOD.obo file
 */
export interface OboTerm {
  id: string // MOD ID (e.g., "MOD:00046")
  name: string // Term name (e.g., "O-phospho-L-serine")
  definition: string // Full definition text
  definitionXrefs?: string[] // Citation references from definition (e.g., ["PubMed:18688235"])
  synonyms: OboSynonym[] // List of all synonyms
  xrefs: OboXref[] // List of all cross-references
  isObsolete?: boolean // Whether the term is obsolete
  comment?: string // Optional comment field
  subset?: string[] // Subset memberships (e.g., ["PSI-MOD-slim"])
  // Hierarchy relationships populated by OboParser in a second pass
  parents?: OboTerm[] // Direct parent terms via is_a relationship
  children?: OboTerm[] // Direct child terms via is_a relationship
}
