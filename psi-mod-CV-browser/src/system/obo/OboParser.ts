import type { OboTerm } from '@/system/obo/OboTerm.ts'

/**
 * Parser for OBO-format files (focused on PSI-MOD). It parses [Term] sections into OboTerm objects.
 *
 * Notes/assumptions:
 * - Only [Term] blocks are parsed; header info is ignored.
 * - Captures: id, name, def (+def xrefs), synonyms, xrefs, subset(s), comment, is_obsolete, and is_a (hierarchy).
 * - Synonym format expected: `synonym: "Text" SCOPE TYPE [xref1, xref2]`
 * - Xref format supports both `xref: Key: "Value"` and `xref: DB:ID` styles.
 *
 * @author Pieter Verschaffelt
 */
export class OboParser {
  /** Extracts the data-version value from an OBO file header (e.g., "data-version: 1.031.6"). */
  public static parseDataVersion (input: string): string | null {
    // Match the data-version line anywhere in the file; capture value until newline or an inline comment "! ..."
    const m = input.match(/^\s*data-version:\s*([^\r\n!]+)(?:\s*!.*)?$/m)
    return m ? m[1]!.trim() : null
  }

  /** Parse OBO file content into a list of OboTerm objects using a Web Worker. */
  public static parse (input: string): Promise<OboTerm[]> {
    return new Promise((resolve, reject) => {
      try {
        // Create the worker (Vite-compatible URL resolution)
        const worker = new Worker(new URL('./OboParser.worker.ts', import.meta.url), { type: 'module' })

        const cleanup = () => {
          try { worker.terminate() } catch { /* ignore */ }
        }

        worker.onmessage = (ev: MessageEvent) => {
          const { type, payload, error } = (ev.data || {}) as { type: string, payload?: unknown, error?: unknown }
          if (type === 'result') {
            cleanup()
            resolve(payload as OboTerm[])
          } else if (type === 'error') {
            cleanup()
            reject(new Error(String(error)))
          }
        }

        worker.onerror = (e) => {
          cleanup()
          reject(e as any)
        }

        worker.postMessage({ type: 'parse', payload: input })
      } catch (e) {
        reject(e)
      }
    })
  }
}
