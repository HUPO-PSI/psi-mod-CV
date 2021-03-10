# PSI-MOD Mass Modifications Ontology

This repository contains the Human Proteome Organization (HUPO) Proteomics Standards Initiative (PSI) Mass Modifications Ontology (PSI-MOD). The content here was moved from the old SourceForge CVS site (https://sourceforge.net/projects/psidev/). It is the source repository of the PSI-MOD obo file, main deliverable PSI-MOD, which is reactivated in this repository.

## The PSI working group PSI-MOD  
The joint activities PSI-MOD working group has been reactivated after a long stand-by period. Description of the project can be found [here](http://www.psidev.info/groups/protein-modifications).

If you would like to comment on the PSI-MOD document, please submit a new issue through [GitHub](https://github.com/HUPO-PSI/psi-mod-CV/issues).

This link (http://psidev.cvs.sourceforge.net/viewvc/*checkout*/psidev/psi/mod/data/psi-mod.obo) found in various files can be safely substituted with the PSI-MOD PURL: (http://purl.obolibrary.org/obo/mod.obo).

## OBO-XML and OWL Files
The OBO-XML [file format](http://www-legacy.geneontology.org/GO.format.shtml#OBO-XML) has been deprecated in favor of the more highly supported OWL [file format](https://www.w3.org/OWL/). Pull Requests MUST include updated OBO and OWL files. The [ROBOT Tool](http://robot.obolibrary.org/) is used to create compliant OWL files from the OBO using this syntax:

	robot.bat convert --input "path-to-obo-file\psi-mod.obo" --output "path-to-obo-file\psi-mod.owl"

Note that the master source file for this ontology is the obo file and the OWL file is a derivative of it.
