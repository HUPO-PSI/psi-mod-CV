# PSI-MOD Protein Modifications Ontology

This repository contains the Human Proteome Organization (HUPO) Proteomics Standards Initiative (PSI) Protein Modifications Ontology (PSI-MOD). It is the source repository of the PSI-MOD obo file, main deliverable PSI-MOD.

## The PSI working group PSI-MOD
The description of the joint activities of the PSI-MOD working group can be found [here](http://www.psidev.info/groups/protein-modifications).

If you would like to comment on the PSI-MOD document, please submit a new issue through [GitHub](https://github.com/HUPO-PSI/psi-mod-CV/issues).


## PSI-MOD file formats : OBO, OBO-XML and OWL
The master source file for this ontology is the obo file and the OWL file is a derivative of it.

The previously available OBO-XML [file format](http://www-legacy.geneontology.org/GO.format.shtml#OBO-XML) has been deprecated in favor of the more highly supported OWL [file format](https://www.w3.org/OWL/). Pull Requests MUST include updated OBO and OWL files. The [ROBOT Tool](http://robot.obolibrary.org/) is used to create compliant OWL files from the OBO using this syntax:

	robot.bat convert --input "path-to-obo-file\psi-mod.obo" --output "path-to-obo-file\psi-mod.owl"


## History
The present repository is replacing the previous location at SourceForge CVS site (https://sourceforge.net/projects/psidev/). This link (http://psidev.cvs.sourceforge.net/viewvc/*checkout*/psidev/psi/mod/data/psi-mod.obo) found in various files can be safely substituted with the PSI-MOD PURL: (http://purl.obolibrary.org/obo/mod.obo).

# Annotation rules

Modifications are always uncharged. Naturally occuring cross-linkers are allowed, but cross-linkers added in the experiment should be added to XL-MOD. Modifications should form a tree of increasing specificity which allows users to encode the exact level of specificity known.

```
oxidized residue -> hydroxylated residue -> hydroxylated arginine -> 4-hydroxy-L-arginine
```

## Mandatory keys
- `id` the identifier (MOD:XXXXX).
- `name` 
  - full exact name non ambiguous, usage of common name ok (leaf terms): `N4-methyl-L-asparagine` and not `N-methyl-asparagine`
  - Name is final product (not a reaction description):`methylated asparagine` and not `arginine methylation`
  -  Can include a precision about origin residue, in parentheses, to remove
ambiguity: `2-pyrrolidone-5-carboxylic acid (Glu)`
- `def` describe the modification. After the def any cross identifiers can be listed.These are ids from other databases or ontologies that describe the same modification, or identifiers for papers describing this modification. Common cross references are to PubMed, RESID, ChEBI, RHEA, uniprot ptm-list. Unimod should not be referenced as this will be listed in the `xref`. Example descriptions: 
  - `A protein modification that effectively converts a SOURCE RESIDUE to MOD.`
  - `A protein modification that crosslinks two cysteine residues by formation of a chain of two or more bonded sulfur atoms.`
  - `A protein modification that effectively crosslinks an N-formyl-L-methionine residue and an L-histidine residue to form N-[(L-histidin-1'-yl)methyl]-L-methionine.`
  - `A protein modification that effectively converts four L-cysteine residues and a four-iron four-sulfur cluster to tetrakis-L-cysteinyl tetrairon tetrasulfide.`
- `is_a` the parent terms. There are two mayor trees: residue based (eg `MOD:00916 ! modified L-serine residue`) and modification type based (eg `MOD:01685 ! alpha-amino palmitoylated residue`).

## Optional keys
- `comment` a comment for human readers of the Obo file. If this modification is a cross-linker it needs to start with `cross-link NUM` to indicate the number of residues involved.
- `synonym` all synonyms for the term, these are names used in other databases or ontologies, these have to be listed as exact or related. Exact can only be used if it describes a synonym that is exactly the same meaning also exactly as specific. So Unimod synonyms always have to be listed as related.
- `relationship` used to add relationships other than `is_a` between terms. Any `[Typedef]` can be used as a relationship.
- `xref` see table:

| xref | Type  | Explanation | Examples |
| --- | --- | --- | --- |
| DiffAvg | Number (2-digits or precision) or `none` | The difference in average mass between the original residue and the modified residue. | `14.03` |
| DiffFormula | Molecular formula or `none` | The difference in molecular formula between the original residue and the modified residue. | `C 1 H 2 N 0 O 0` `C 0 H -2 N 0 O 0 S 0` `(12)C 10 (13)C 4 H 25 (14)N 2 (15)N 1 O 2 S 1` |
| DiffMono | Number (6-digits or precision) or `none` | The difference in monoisotopic mass between the original residue and the modified residue. | `14.015650` |
| FormalCharge | Number followed by sign | The formal charge of the modification | `1+` `2-` |
| Formula | Molecular formula or `none` | The full molecular formula of the modified residue (amino acid + modification(s)) | `C 6 H 10 N 2 O 2` `C 3 H 5 N 1 O 1 Se 1` |
| MassAvg | Number (2-digits or precision) or `none` | The full average mass of the modified residue (amino acid + modification(s)). | `142.16` |
| MassMono | Number (6-digits or precision) or `none` | The full monoisotopic mass of the modified residue (amino acid + modification(s)). | `142.074228` |
| Origin | string or `none` | List of all allowed sites (amino acid or other modification), a cross-linker with multiple residues has the different residues separated by a comma. | `N` `C, Q` `C, C, C, C` `MOD:00047` `H, MOD:00030` |
| Smiles | string | An OpenSMILES string encoding the full modified residue (residue + modificatio(s)) with `*` to indicate the backbone bonds. | `C(*)(=O)[C@H](COP(O)(=O)O)N*` |
| Source | string | One of `natural`, `artifact`, `hypothetical`, or `none`, if multiple are applicable take the first from this list. | `natural` |
| TermSpec | string | One of `N-term`, `C-term`, or `none`. | `N-term` |

### Molecular formula

The elements have to be in alphabetical order, isotopes are ordered low to high and before the general element. Element numbers can be negative in the `DiffFormula`. Isotopes have to be encased in round brackets `(15)` and listed before elements. Elements and element amounts have to be separated by spaces.
