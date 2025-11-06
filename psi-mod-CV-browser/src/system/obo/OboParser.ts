import type { OboTerm } from "@/system/obo/OboTerm.ts";
import type { OboSynonym } from "@/system/obo/OboSynonym.ts";
import type { OboXref } from "@/system/obo/OboXRef.ts";

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
  /** Parse OBO file content into a list of OboTerm objects. */
  public static parse(input: string): OboTerm[] {
    const lines = input.split(/\r?\n/);

    const terms: OboTerm[] = [];
    const idToTerm = new Map<string, OboTerm>();
    const childToParents = new Map<string, string[]>();
    let inTerm = false;

    // Working buffers for the current term
    let id: string | undefined;
    let name: string | undefined;
    let definition: string | undefined;
    let definitionXrefs: string[] | undefined;
    let synonyms: OboSynonym[] = [];
    let xrefs: OboXref[] = [];
    let isObsolete = false;
    let comment: string | undefined;
    let subset: string[] | undefined;

    function pushCurrent() {
      if (!id || !name || !definition) {
        // Incomplete [Term] block; skip.
        reset();
        return;
      }
      const term: OboTerm = {
        id,
        name,
        definition,
        synonyms: synonyms.slice(),
        xrefs: xrefs.slice(),
        parents: [],
        children: [],
      };
      if (definitionXrefs && definitionXrefs.length) term.definitionXrefs = definitionXrefs.slice();
      if (isObsolete) term.isObsolete = true;
      if (comment) term.comment = comment;
      if (subset && subset.length) term.subset = subset.slice();
      terms.push(term);
      idToTerm.set(term.id, term);
      reset();
    }

    function reset() {
      inTerm = false;
      id = undefined;
      name = undefined;
      definition = undefined;
      definitionXrefs = undefined;
      synonyms = [];
      xrefs = [];
      isObsolete = false;
      comment = undefined;
      subset = undefined;
    }

    const defRe = /^def:\s+"([\s\S]*?)"\s*(?:\[(.*)\])?\s*$/; // capture text and optional [xrefs]
    const synRe = /^synonym:\s+"([\s\S]*?)"\s+(EXACT|BROAD|NARROW|RELATED)\s+([^\s]+)\s*(?:\[(.*)\])?\s*$/;

    for (let rawLine of lines) {
      const line = rawLine.replace(/\r$/, "").trimEnd();
      if (!line) {
        // Empty line delimits blocks
        continue;
      }

      // Start of a new term
      if (line === "[Term]") {
        if (inTerm) {
          pushCurrent();
        }
        inTerm = true;
        continue;
      }

      if (!inTerm) {
        // Ignore header/typedef sections for now
        continue;
      }

      // Ignore inline comments that start with '!' (rare in content lines)
      if (line.startsWith("!")) {
        continue;
      }

      // id
      if (line.startsWith("id:")) {
        id = line.substring(3).trim();
        continue;
      }

      // name
      if (line.startsWith("name:")) {
        name = line.substring(5).trim();
        continue;
      }

      // def: "..." [xref1, xref2]
      if (line.startsWith("def:")) {
        const m = line.match(defRe);
        if (m && m.length >= 2 && m[1]) {
          definition = unescapeQuotes(m[1]);
          const refs = m[2];
          if (refs && refs.trim().length) {
            definitionXrefs = splitBracketList(refs);
          } else {
            definitionXrefs = undefined;
          }
        } else {
          throw new Error(`Invalid definition format in line: ${line}`);
        }
        continue;
      }

      // synonym: "..." SCOPE TYPE [refs]
      if (line.startsWith("synonym:")) {
        const m = line.match(synRe);
        if (m) {

          if (!m[1] || !m[3]) {
            throw new Error(`Invalid synonym format in line: ${line}`);
          }

          const text = unescapeQuotes(m[1]);
          const scopeValue = m[2];
          if (!scopeValue || !['EXACT', 'BROAD', 'NARROW', 'RELATED'].includes(scopeValue)) {
            throw new Error(`Invalid scope value "${scopeValue}" in line: ${line}`);
          }
          const scope = scopeValue as OboSynonym["scope"];
          const type = m[3];
          const refs = m[4];
          const xrefList = refs && refs.trim().length ? splitBracketList(refs) : undefined;
          synonyms.push({text, scope, type, xrefs: xrefList});
        }
        continue;
      }

      // xref: Key: "Value"  OR  xref: DB:ID  OR  xref: Key: Value
      if (line.startsWith("xref:")) {
        const rest = line.substring(5).trim();
        const colonIdx = rest.indexOf(":");
        if (colonIdx > 0) {
          const database = rest.substring(0, colonIdx).trim();
          let value = rest.substring(colonIdx + 1).trim();
          // Remove surrounding quotes if present
          value = stripQuotes(value);
          xrefs.push({ database, value });
        }
        continue;
      }

      // subset: may occur multiple times
      if (line.startsWith("subset:")) {
        const val = line.substring(7).trim();
        if (!subset) subset = [];
        if (val) subset.push(val);
        continue;
      }

      // comment:
      if (line.startsWith("comment:")) {
        comment = line.substring(8).trim();
        continue;
      }

      // is_obsolete:
      if (line.startsWith("is_obsolete:")) {
        const val = line.substring(12).trim().toLowerCase();
        isObsolete = val === "true" || val === "t" || val === "1";
        continue;
      }

      // is_a: capture parent relationships for hierarchy (e.g., "is_a: MOD:00000 ! parent name")
      if (line.startsWith("is_a:")) {
        const rest = line.substring(5).trim();
        if (!rest.includes("!")) {
          throw new Error(`Missing required ! separator in is_a line: ${line}`);
        }
        // Take token before optional '!' and before any trailing annotation
        const beforeBang = rest.split("!")[0]!.trim();
        const parentId = beforeBang.split(/\s+/)[0];
        if (id && parentId) {
          const list = childToParents.get(id) ?? [];
          list.push(parentId);
          childToParents.set(id, list);
        }
        continue;
      }

      // Other relationship types not needed for now
      if (line.startsWith("relationship:")) {
        continue;
      }

      // Other keys are ignored for now
    }

    // If file ended while inside a term, push it
    if (inTerm) {
      pushCurrent();
    }

    // Second pass: wire up parents and children using collected is_a relations
    for (const [childId, parentIds] of childToParents.entries()) {
      const child = idToTerm.get(childId);
      if (!child) continue;
      for (const parentId of parentIds) {
        const parent = idToTerm.get(parentId);
        if (!parent) continue; // parent might be external or undefined
        // Ensure arrays exist (defensive, though we initialize them on creation)
        if (!child.parents) child.parents = [];
        if (!parent.children) parent.children = [];
        if (!child.parents.some(p => p.id === parent.id)) child.parents.push(parent);
        if (!parent.children.some(c => c.id === child.id)) parent.children.push(child);
      }
    }

    return terms;
  }
}

function stripQuotes(s: string): string {
  // remove optional trailing comment after value like '! something' (rare)
  const bang = s.indexOf(" ! ");
  if (bang >= 0) s = s.substring(0, bang).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.substring(1, s.length - 1);
  }
  return s;
}

function unescapeQuotes(s: string): string {
  return s.replace(/\\\"/g, '"');
}

function splitBracketList(contentInsideBrackets: string): string[] {
  // Example: "PubMed:18688235, RESID:AA0016" -> ["PubMed:18688235", "RESID:AA0016"]
  return contentInsideBrackets
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}
