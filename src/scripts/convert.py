import argparse
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

for frame in doc:

    for i, clause in reversed(list(enumerate(frame))):
        if isinstance(clause, fastobo.term.XrefClause):
            if clause.xref.desc == "none":
                frame.pop(i)

    for i, clause in enumerate(frame):
        if isinstance(clause, fastobo.term.XrefClause):
            property = clause.xref.id.prefix
            value = clause.xref.desc

            if property in {"UniProt", "Unimod", "GNOme"}:
                xref = fastobo.xref.Xref(fastobo.id.parse(value))
                new_clause = fastobo.term.XrefClause(xref)
            elif property == "Remap":
                replacement = fastobo.id.parse(value)
                new_clause = fastobo.term.ReplacedByClause(replacement)
            else:
                rel = fastobo.id.UnprefixedIdent(property)
                pv = fastobo.pv.LiteralPropertyValue(rel, value, datatypes[property]) 
                new_clause = fastobo.term.PropertyValueClause(pv)
           
            frame[i] = new_clause
            
with open(args.output, "w") as dst:
    print(doc, file=dst)
