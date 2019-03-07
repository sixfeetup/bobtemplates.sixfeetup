### Local development environment set up

## Variables

# Constants
TO_CLEAN = var/filestorage var/blobstorage parts buildout.cfg env

## Top level targets

.PHONY: build
build: bin/instance

.PHONY: run
run: build
	scripts/control fg

.PHONY: test
test: build
	bin/test

.PHONY: clean
clean:
	scripts/control stop || true
	for to_clean in $(TO_CLEAN); do \
		rm -rf "$$to_clean.bak" && \
		mv "$$to_clean" "$$to_clean.bak" || true; \
	done


## Real targets

# Copy the ``buildout.cfg.tmpl`` into the buildout root, and edit to uncomment
# the profile you want to run.
buildout.cfg: profiles/buildout.cfg.tmpl
# Give the developer a chance to review changes to the template if it's
# changed since we copied it
	if [ -e "$(@)" ]; then \
	    diff -u "profiles/buildout.cfg.tmpl" "$(@)"; \
	    echo "Run `$ touch $(@)` to ignore changes in the template"; \
	    exit 1; \
	fi
	git checkout develop
	sed -e 's/^#    profiles\/local.cfg$$/    profiles\/local.cfg/' \
		profiles/"$(@).tmpl" >"$(@)"

# Create an isolated python environment in `env/`.
env:
	virtualenv env --python=python2.7

# Install the versions of zc.buildout and setuptools you need.
env/bin/buildout: env requirements.txt
	env/bin/pip install -r requirements.txt

# Download Plone's eggs and products, as well as other dependencies, create a
# new Zope 2 installation, and create a new Zope instance configured with
# these products.
bin/instance1: \
		requirements.txt env/bin/buildout \
		setup.py buildout.cfg profiles/*.cfg
	env/bin/buildout
