### Local development environment set up

## Project-specific variables, set before running

# Set to the SSH host from which to rsync the project data:
#DATA_HOST = prod.example.com
DATA_ZODB_HOST = $(DATA_HOST)
DATA_DB_HOST = $(DATA_HOST)
# Uncomment if rsync should be run as root on the DATA_HOST:
#DATA_HOST_RSYNC_PATH = --rsync-path="sudo rsync"
# Set to the directory where this project is deployed on DATA_HOST:
#DEPLOY_DIR = /srv/prod.example.com
# Set to the URL of the project data DB SQL dump file:
#DATA_DB_DUMP_URL = https://extranet.example.com/path/to/db-dump.sql.gz

# Set to non-empty if the project uses MySQL, sets up an isolated DB instance.
# Use the var/mysql/mysql.sock UNIX socket to connect to the DB.
#DB_MYSQL = true
# Set to the name of the DB to be used for the project
#DB_NAME = foo_project_db_name
# Set to the user name used to connect to the DB:
DB_USER = $(USER)
# Set to the password used to authenticate to the DB:
DB_PASSWD = $(DB_USER)
# Set to non-empty if DATA_DOWNLOAD is set and
# DB data will be downloaded via rsync (as opposed to loading a DB dump file)
#DATA_DB_SYNC = true
# TODO Add PostgreSQL

## Option Variables
# Set to non-empty to enable downloading/syncing project data.
# Requires setting DATA_HOST and DEPLOY_DIR above.
# $ make DATA_DOWNLOAD=true data
#DATA_DOWNLOAD = true
# Set to non-empty to overwrite local data changes from DATA_HOST, e.g:
# $ make DATA_OVERWRITE=true data
#DATA_OVERWRITE = true

# Constants
TO_CLEAN = var/filestorage var/blobstorage var/mysql parts buildout.cfg env

## Dynamic variables
CHECKOUT_DIR=$(dir $(realpath $(firstword $(MAKEFILE_LIST))))

ifndef DATA_OVERWRITE
	DATA_RSYNC_OPTS = --append-verify
endif

ifdef DB_MYSQL
BUILD_PREREQS = var/mysql/auto.cnf
RUN_PREREQS = start-mysqld
endif
ifdef DATA_DOWNLOAD
BUILD_PREREQS += data
endif


## Top level targets

.PHONY: build
build: $(BUILD_PREREQS) bin/instance1

.PHONY: data
data: rsync-zodb

.PHONY: run
run: build $(RUN_PREREQS)
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

# Optionally set up an isolated MySQL DB instance
ifdef DB_MYSQL
define DB_MYSQLD_ARGS =
	--datadir=$(CHECKOUT_DIR)var/mysql \
	--socket=$(CHECKOUT_DIR)var/mysql/mysql.sock \
	--skip-networking \
	--pid-file=$(CHECKOUT_DIR)var/mysql/mysql.pid \
	--log-error=$(CHECKOUT_DIR)var/mysql/error.log
endef
define DB_MYSQL_ARGS =
	-S $(CHECKOUT_DIR)var/mysql/mysql.sock \
	-u "$(DB_USER)" --password="$(DB_PASSWD)"
endef
.PHONY: mysql
mysql: build start-mysqld
	mysql $(DB_MYSQL_ARGS) "$(DB_NAME)"
.PHONY: start-mysqld
start-mysqld:
	$(MAKE) stop-mysqld
	mysqld --defaults-extra-file=$(CHECKOUT_DIR)etc/my.cnf \
		$(DB_MYSQLD_ARGS) &
	sleep 1
.PHONY: stop-mysqld
stop-mysqld:
	kill $(shell cat $(CHECKOUT_DIR)var/mysql/mysql.pid) || true
	sleep 1
var/mysql/auto.cnf:
	$(MAKE) stop-mysqld
ifneq ($(and $(DATA_DOWNLOAD),$(DATA_DB_SYNC)),)
	rsync -vzPrlptD --inplace $(DATA_RSYNC_OPTS) --delete \
		$(DATA_HOST_RSYNC_PATH) \
		$(DATA_DB_HOST):/var/lib/mysql var/
	$(MAKE) start-mysqld
else
ifdef DATA_DOWNLOAD
ifdef DATA_DB_DUMP_URL
	wget --no-check-certificate -c -O "var/db-$(DB_NAME)-dump.sql.gz" \
		"$(DATA_DB_DUMP_URL)"
endif
endif
	mysqld --initialize-insecure $(DB_MYSQLD_ARGS)
	$(MAKE) start-mysqld
	echo "CREATE DATABASE $(DB_NAME); CREATE USER '$(DB_USER)'@'localhost' IDENTIFIED BY '$(DB_PASSWD)'; GRANT ALL PRIVILEGES ON *.* TO '$(DB_USER)'@'localhost'; FLUSH PRIVILEGES;" \
		| sudo mysql -S $(CHECKOUT_DIR)var/mysql/mysql.sock \
		|| ($(MAKE) stop-mysqld; rm -rf var/mysql; false)
ifdef DATA_DOWNLOAD
ifdef DATA_DB_DUMP_URL
	gunzip --stdout "var/db-$(DB_NAME)-dump.sql.gz" | \
		mysql $(DB_MYSQL_ARGS) "$(DB_NAME)" \
		|| ($(MAKE) stop-mysqld; rm -rf var/mysql; false)
endif
endif
endif
endif

# Copy the project data
ifdef DATA_DOWNLOAD
.PHONY: ssh-copy-ids
ssh-copy-ids:
	ssh -o "PasswordAuthentication no" -o "ConnectTimeout 5" \
		$(DATA_ZODB_HOST) true || \
		ssh-copy-id -o "ConnectTimeout 5" $(DATA_ZODB_HOST)
.PHONY: rsync-zodb
rsync-zodb: ssh-copy-ids data-targets.txt
	rsync -vzPrlptD --rsync-path="sudo rsync" \
		--inplace $(DATA_RSYNC_OPTS) --files-from=data-targets.txt \
		$(DATA_HOST_RSYNC_PATH) \
		$(DATA_ZODB_HOST):$(DEPLOY_DIR)/ ./
endif
