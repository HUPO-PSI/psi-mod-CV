ROBOT  = robot
PYTHON = python

.PHONY: all
all: PSI-MOD.owl PSI-MOD-newstyle.obo

PSI-MOD.owl: PSI-MOD-newstyle.obo
	$(ROBOT) convert --input $^ --output $@

PSI-MOD-newstyle.obo: PSI-MOD.obo
	$(PYTHON) src/scripts/convert.py --input $^ --output $@

