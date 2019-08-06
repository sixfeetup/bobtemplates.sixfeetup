### Local development environment set up


## Variables

# Constants
TO_CLEAN = .venv myproject


## Top level targets

.PHONY: build
build: .venv/bin/mrbob myproject/.git myproject/Makefile
	$(MAKE) -C myproject "$(@)"

.PHONY: test
test: build
	.venv/bin/python setup.py test

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

myproject/.git:
	git checkout develop
	git init myproject
	touch myproject/.gitignore
	cd myproject && \
		git add .gitignore && \
		git commit -m "Allow branch creation" && \
		git checkout -b develop
myproject/Makefile: \
		bobtemplates/sixfeetup/* bobtemplates/sixfeetup/*/* \
		bobtemplates/sixfeetup/*/*/* bobtemplates/sixfeetup/*/*/*/* \
		bobtemplates/sixfeetup/*/*/*/*/* \
		bobtemplates/sixfeetup/*/*/*/*/*/*
	.venv/bin/mrbob -O "myproject" \
		-n bobtemplates.sixfeetup:unified_buildout
	touch "$(@)"
	read -p \
		"Hit return after making any changes in myproject/ to run myproject/Makefile" \
		ignored
