/**
 * Represents a synonym for a PSI-MOD term
 */
export interface OboSynonym {
  text: string                    // The actual synonym text (e.g., "ModRes")
  scope: 'EXACT' | 'BROAD' | 'NARROW' | 'RELATED'  // Scope qualifier
  type: string                    // Type (e.g., "PSI-MOD-label", "RESID-name")
  xrefs?: string[]                // Optional cross-references (usually empty [])
}
