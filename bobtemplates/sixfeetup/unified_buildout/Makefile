### Local development environment set up

SHELL=/usr/bin/env bash -o pipefail
CHECKOUT_DIR=$(dir $(realpath $(firstword $(MAKEFILE_LIST))))

## Project-specific variables, set before running

# Set to the SSH host from which to rsync the project data:
#DATA_HOST = prod.example.com
DATA_ZODB_HOST = $(DATA_HOST)
DATA_DB_HOST = $(DATA_HOST)
# Uncomment if rsync should be run as root on the DATA_HOST:
#DATA_RSYNC_OPTS +=  --rsync-path="sudo rsync"
# Set to the directory where this project is deployed on DATA_HOST:
#DEPLOY_DIR = /srv/prod.example.com
# Set to the URL of the project data DB SQL dump file:
#DATA_SQL_DB_DUMP_URL = https://extranet.example.com/path/to/db-dump.sql.gz

# Set to the name of the SQL DB software if the project uses a SQL DB.  The
# `Makefile` will set up an isolated SQL DB instance.  Use the `sql-client`
# target to connect to the DB.

# Requires pg_ctl
#SQL_DB_TYPE = postgresql

#SQL_DB_TYPE = mysql

# Set to the name of the DB to be used for the project
SQL_DB_NAME = $(notdir $(CHECKOUT_DIR:/=))
# Set to the user name used to connect to the DB:
SQL_DB_USER = $(USER)
# Set to the password used to authenticate to the DB:
SQL_DB_PASSWD = $(SQL_DB_USER)

# Set to non-empty if DATA_DOWNLOAD is set and
# DB data will be downloaded via rsync (as opposed to loading a DB dump file)
#DATA_SQL_DB_SYNC = true

## Option Variables
# Set to non-empty to enable downloading/syncing project data.
# Requires setting DATA_HOST and DEPLOY_DIR above.
# $ make DATA_DOWNLOAD=true data
#DATA_DOWNLOAD = true
# Set to non-empty to overwrite local data changes from DATA_HOST, e.g:
# $ make DATA_OVERWRITE=true data
#DATA_OVERWRITE = true
# Set to non-empty to run a dummy MTA locally in the checkout
#MTA_LOCAL = true

# Constants
DATA_TARGETS = var/filestorage var/blobstorage

## Dynamic variables

ifdef DATA_DOWNLOAD
BUILD_PREREQS = data
endif

ifndef DATA_OVERWRITE
	DATA_RSYNC_OPTS +=  --append-verify
endif


## SQL DB settings for specific software

ifeq ($(SQL_DB_TYPE),postgresql)
SQL_DB_INSTANCE = var/$(SQL_DB_TYPE)/PG_VERSION
SQL_DB_CLIENT = psql
define SQL_DB_SERVER_ARGS =
	-D "var/$(SQL_DB_TYPE)/" -o '-c config_file="etc/$(SQL_DB_TYPE).conf"'
endef
define SQL_DB_CLIENT_ARGS =
	-h "$(CHECKOUT_DIR)var/$(SQL_DB_TYPE)" -p 8432 \
	"$(SQL_DB_NAME)" "$(SQL_DB_USER)"
endef
# Handle optional target prerequisites
BUILD_PREREQS += var/$(SQL_DB_TYPE)/PG_VERSION
RUN_PREREQS = start-sql-server
DATA_TARGETS += var/$(SQL_DB_TYPE)
endif

ifeq ($(SQL_DB_TYPE),mysql)
SQL_DB_INSTANCE = var/$(SQL_DB_TYPE)/auto.cnf
SQL_DB_CLIENT = $(SQL_DB_TYPE)
define SQL_DB_SERVER_ARGS =
	--skip-grant-tables \
	--datadir=$(CHECKOUT_DIR)var/$(SQL_DB_TYPE) \
	--socket=$(CHECKOUT_DIR)var/$(SQL_DB_TYPE)/$(SQL_DB_TYPE).sock \
	--skip-networking \
	--pid-file=$(CHECKOUT_DIR)var/$(SQL_DB_TYPE)/$(SQL_DB_TYPE).pid \
	--log-error=$(CHECKOUT_DIR)var/$(SQL_DB_TYPE)/error.log
endef
define SQL_DB_CLIENT_ARGS =
	-S $(CHECKOUT_DIR)var/$(SQL_DB_TYPE)/$(SQL_DB_TYPE).sock \
	-u "$(SQL_DB_USER)" --password="$(SQL_DB_PASSWD)" "$(SQL_DB_NAME)"
endef
# Handle optional target prerequisites
BUILD_PREREQS += var/$(SQL_DB_TYPE)/auto.cnf
RUN_PREREQS = start-sql-server
DATA_TARGETS += var/$(SQL_DB_TYPE)
endif

TO_CLEAN = $(DATA_TARGETS) parts buildout.cfg env


## Top level targets

.PHONY: build
build: $(BUILD_PREREQS) bin/instance1

.PHONY: data
data: rsync-zodb

.PHONY: run
ifdef MTA_LOCAL
run:
	$(MAKE) -j 2 run-mta run-zope
else
run: run-zope
endif
.PHONY: run-zope
run-zope: $(RUN_PREREQS) build
	scripts/control fg
.PHONY: run-mta
run-mta: env/bin/python
	env/bin/maildump

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
	touch "$(@)"

# Download Plone's eggs and products, as well as other dependencies, create a
# new Zope 2 installation, and create a new Zope instance configured with
# these products.
bin/instance1: \
		requirements.txt env/bin/buildout \
		setup.py buildout.cfg profiles/*.cfg
	env/bin/buildout


# Optionally set up an isolated SQL DB instance

.PHONY: sql-client
sql-client: build start-sql-server
	$(SQL_DB_CLIENT) $(SQL_DB_CLIENT_ARGS)

.PHONY: start-sql-server
start-sql-server:
	$(MAKE) stop-sql-server
ifeq ($(SQL_DB_TYPE),postgresql)
	pg_ctl start $(SQL_DB_SERVER_ARGS)
endif
ifeq ($(SQL_DB_TYPE),mysql)
	mysqld --defaults-extra-file=$(CHECKOUT_DIR)etc/my.cnf \
		$(SQL_DB_SERVER_ARGS) &
endif
	sleep 1

.PHONY: stop-sql-server
stop-sql-server:
ifeq ($(SQL_DB_TYPE),postgresql)
	pg_ctl stop $(SQL_DB_SERVER_ARGS) || true
endif
ifeq ($(SQL_DB_TYPE),mysql)
	kill $(shell cat $(CHECKOUT_DIR)var/$(SQL_DB_TYPE)/$(SQL_DB_TYPE).pid) || true
endif
	sleep 1

$(SQL_DB_INSTANCE):
	$(MAKE) stop-sql-server
ifneq ($(and $(DATA_DOWNLOAD),$(DATA_SQL_DB_SYNC)),)
# If you can't get SSH access via an account that has sudo *without* password
# you can use the following approach to use an askpass program, but it's
# pretty cumbersome, much better all around to use a separate account:
# https://unix.bris.ac.uk/2015/08/04/rsync-between-two-hosts-using-sudo-and-a-password-prompt/
# DATA_RSYNC_OPTS += "-e 'ssh -X' \
#	--rsync-path='SUDO_ASKPASS=/usr/bin/ssh-askpass sudo -A rsync'"
#	ssh -t $(DATA_SQL_DB_HOST) 'sudo -n true || sudo apt install ssh-askpass'
	rsync -vzPrlptD --inplace $(DATA_RSYNC_OPTS) --delete \
		$(DATA_SQL_DB_HOST):/var/lib/$(SQL_DB_TYPE) var/
	$(MAKE) start-sql-server
else
ifdef DATA_DOWNLOAD
ifdef DATA_SQL_DB_DUMP_URL
	wget --no-check-certificate -c -O "var/db-$(SQL_DB_NAME)-dump.sql.gz" \
		"$(DATA_SQL_DB_DUMP_URL)"
endif
endif
ifeq ($(SQL_DB_TYPE),postgresql)
	pg_ctl initdb -D var/$(SQL_DB_TYPE)/
endif
ifeq ($(SQL_DB_TYPE),mysql)
	mysqld --initialize-insecure $(SQL_DB_SERVER_ARGS)
endif
	$(MAKE) start-sql-server
ifdef DATA_DOWNLOAD
ifdef DATA_SQL_DB_DUMP_URL
	gunzip --stdout "var/db-$(SQL_DB_NAME)-dump.sql.gz" | \
		$(SQL_DB_CLIENT) $(SQL_DB_CLIENT_ARGS) \
		|| ($(MAKE) stop-sql-server; rm -rf var/$(SQL_DB_TYPE); false)
endif
endif
endif

# Copy the project data
.PHONY: ssh-copy-ids
ssh-copy-ids:
	ssh -o "PasswordAuthentication no" -o "ConnectTimeout 5" \
		$(DATA_ZODB_HOST) true || \
		ssh-copy-id -o "ConnectTimeout 5" $(DATA_ZODB_HOST)
.PHONY: rsync-zodb
rsync-zodb: ssh-copy-ids data-targets.txt
	rsync -vzPrlptD --inplace $(DATA_RSYNC_OPTS) --delete \
		--files-from=data-targets.txt \
		$(DATA_ZODB_HOST):$(DEPLOY_DIR)/ ./
.PHONY: backup-data
backup-data: rsync-zodb
	rsync -va $(DATA_TARGETS) ./ ./var/bak/
.PHONY: restore-data
restore-data:
	rsync -va $(DATA_RSYNC_FILES) ./var/bak/ ./
