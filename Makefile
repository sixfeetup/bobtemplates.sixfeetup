### Local development environment set up


## Variables

# Constants
TO_CLEAN = .venv myproject


## Top level targets

.PHONY: build
build: myproject
	$(MAKE) -C myproject "$(@)"

.PHONY: test
test: build
	bin/python setup.py test

.PHONY: clean
clean:
	for to_clean in $(TO_CLEAN); do \
		rm -rf "$$to_clean.bak" && \
		mv "$$to_clean" "$$to_clean.bak" || true; \
	done


## Real targets

# Create an isolated python .venvironment in `.venv/`.
.venv:
	virtualenv .venv

# Install the templates and requirements
.venv/bin/mrbob: .venv
	.venv/bin/pip install -e .

myproject: .venv/bin/mrbob
	.venv/bin/mrbob -O "$(@)" -n bobtemplates.sixfeetup:unified_buildout
