import argparse
import difflib

from typing import Set

import fastobo

datatypes = {
    "DiffAvg": fastobo.id.PrefixedIdent("xsd", "float"),
    "DiffMono": fastobo.id.PrefixedIdent("xsd", "float"),
    "Source": fastobo.id.PrefixedIdent("xsd", "string"),
    "Origin": fastobo.id.PrefixedIdent("xsd", "string"),
    "TermSpec": fastobo.id.PrefixedIdent("xsd", "string"),
    "DiffFormula": fastobo.id.PrefixedIdent("xsd", "string"),
    "Formula": fastobo.id.PrefixedIdent("xsd", "string"),
    "MassAvg": fastobo.id.PrefixedIdent("xsd", "float"),
    "MassMono": fastobo.id.PrefixedIdent("xsd", "float"),
    "FormalCharge": fastobo.id.PrefixedIdent("xsd", "string"),
}

parser = argparse.ArgumentParser()
parser.add_argument("-i", "--input", help="input file to convert", required=True)
parser.add_argument("-o", "--output", help="output file to write", required=True)
args = parser.parse_args()

with open(args.input) as f:
    contents = f.read()
    doc = fastobo.loads(contents)


def check_spelling(ref: str, words: Set[str]) -> str:
    if ref in words:
        return ref
    nearest = difflib.get_close_matches(ref, words, n=2)
    if not nearest:
        print(f"Adding {ref} to word list")
        words.add(ref)
        return ref
    if len(nearest) > 1:
        print(f"{ref} is close to {nearest}, cannot discriminate, choosing {nearest[0]}")
    print(f"Rewriting {ref} to {nearest[0]}")
    return nearest[0]


words = {'Origin', 'DiffAvg', 'Unimod', 'MassAvg', 'GNOme', 'MassMono', 'Formula',
         'DiffFormula', 'Remap', 'Source', 'UniProt', 'TermSpec', 'FormalCharge', 'DiffMono'}


for frame in doc:

    for i, clause in reversed(list(enumerate(frame))):
        if isinstance(clause, fastobo.term.XrefClause):
            if clause.xref.desc == "none":
                frame.pop(i)

    for i, clause in enumerate(frame):
        if isinstance(clause, fastobo.term.XrefClause):
            prop = check_spelling(clause.xref.id.prefix, words)
            value = clause.xref.desc

            if prop in {"UniProt", "Unimod", "GNOme"}:
                xref = fastobo.xref.Xref(fastobo.id.parse(value))
                new_clause = fastobo.term.XrefClause(xref)
            elif prop == "Remap":
                replacement = fastobo.id.parse(value)
                new_clause = fastobo.term.ReplacedByClause(replacement)
            else:
                rel = fastobo.id.UnprefixedIdent(prop)
                pv = fastobo.pv.LiteralPropertyValue(rel, value, datatypes[prop])
                new_clause = fastobo.term.PropertyValueClause(pv)

            frame[i] = new_clause

print(f"Final Word List: {words}")

with open(args.output, "w") as dst:
    dst.write(str(doc))
