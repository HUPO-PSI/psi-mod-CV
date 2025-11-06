/**
 * Represents a cross-reference for a PSI-MOD term
 */
export interface OboXref {
  database: string                // Database/key (e.g., "Unimod", "Origin", "DiffMono")
  value: string                   // The value (e.g., "Unimod:162", "S", "47.944450")
}
