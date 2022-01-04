# Using a custom buildout

The `Makefile` should build the local development environment, optionally
copy the project data, and start all the processes necessary to work with the
site on `localhost`.  See the comments under `Project-specific variables`
and `Option Variables` near the top of the `Makefile`, set any desired
options and necessary variables, then run:

```shell
$ make run
```

To run unit tests, you can use:

```shell
$ make test
```

See the comments at the top of `etc/ssh_config` regarding including SSH
configuration specific to this project, such as port forwards, bastion hosts,
and user names.  Note that this may be required for downloading project data
via the `Makefile`.

## Installing PIL

The buildout will install PIL for you (via the Pillow egg)

## Using a different Python installation

Buildout will use your system Python installation by default. However, Zope
2.10 (and by extension, Plone) will only work with Python 2.4. You can verify
which version of Python you have, by running:

```shell
$ python -V
```

If that is not a 2.4 version, you need to install Python 2.4 from
http://python.org. If you wish to keep another version as your main system
Python, edit buildout.cfg and add an 'executable' option to the "[buildout]"
section, pointing to a python interpreter binary:

```
[buildout]
...
executable = /path/to/python
```

## Working with buildout.cfg

You can change any option in buildout.cfg and re-run bin/buildout to reflect
the changes. This may delete things inside the 'parts' directory, but should
keep your Data.fs and source files intact.

To save time, you can run buildout in "offline" (-o) and non-updating (-N)
mode, which will prevent it from downloading things and checking for new
versions online:

```shell
$ bin/buildout -Nov
```

## Extending buildout configs

This buildout makes use of the 'extends' functionality of buildout.  The
buildout.cfg contains only minimal information.  Here are what the rest of the
configs are for.

**buildout.cfg.tmpl**

This is a template to be used for the buildout.cfg at the root of the
site. See the file for more details.

**base.cfg**

The base config contains all of the configuration for the basis of the site.
Typical sections include zope2, instance, zeoserver and plone.  In this
config we include all the eggs and products that will be used in all of the
extended configs.

**local.cfg**

The local config sets up our local development environment for us.  It
includes all the debugging packages that are typically used during
development.  It extends base.cfg and debug.cfg

**debug.cfg**

The debug config contains all of our debugging products and packages. One
package to make note of is PDBDebugMode.  It will open up a pdb prompt
anytime there is an error.  This will cause the page to hang until you tell
pdb to (c)ontinue.

The debug config also contains a way to 'refresh' your product in
plone.reload.  You can access it like this:

```
http://<zope_host>:<zope_port>/@@reload
```

And also a way of recording doctests:

```
http://<zope_host>:<zope_port>/++resource++recorder/index.html
```

Take a look at the config to see what other tools are available.

**release.cfg**

The release config is the base config for doing releases.  It contains the
specific versions of eggs that are needed to make the site run properly.  It
also contains some configuration that is common for each release stage.

**versions.cfg**

This contains the pinned versions of packages for use when release to production

**testing.cfg**

The dev config merely sets up the proper port and ip-address for the dev
site to run on.

**staging.cfg**

The maint config merely sets up the proper port and ip-address for the maint
site to run on.

**prod.cfg**

The prod config is similar to the dev and maint configs in that it sets up
the proper ip-address and port numbers.  But it can also be used to set up a
Zope cluster, tune the number of threads being used, bump up zeo cache
sizes, set up pound, squid, nginx, etc.  This will be the config used to run
the site in production mode.

## Creating new eggs

New packages you are working on (but which are not yet released as eggs and
uploaded to the Python Package Index, aka PYPI) should be placed in src. You can do:

```shell
 $ cd src/
 $ paster create -t plone my.package
```

Use `paster create --list-templates` to see all available templates. Answer
the questions and you will get a new egg. Then tell buildout about your egg
by editing buildout.cfg and adding your source directory to 'develop':

```
[buildout]
...
develop =
  src/my.package
```

You can list multiple packages here, separated by whitespace or indented
newlines.

You probably also want the Zope instance to know about the package. Add its
package name to the list of eggs in the `[instance]` section, or under the
main `[buildout]` section:

```
[instance]
...
eggs =
  my.package
```

If you also require a ZCML slug for your package, buildout can create one
automatically. Just add the package to the 'zcml' option:

```
[instance]
...
zcml =
  my.package
```

When you are finished, re-run buildout. Offline, non-updating mode should
suffice:

```shell
$ bin/buildout -Nov
```

## Developing old-style products

If you are developing old-style Zope 2 products (not eggs) then you can do so
by placing the product code in the top-level 'products' directory. This is
analogous to the `Products/` directory inside a normal Zope 2 instance and is
scanned on start-up for new products.  The products folder is populated using
svn:externals on the directory.  See the products/EXTERNALS.txt for more info.

These products are only available in the profiles/local.cfg:

```
[instance]
...
products =
   ${buildout:directory}/products
```

To release your old style products you'll need to tag them and then enable the
`[products-release]` part in the profiles/release.cfg:

```
release-parts =
   products-release
   ${buildout:base-parts}

[products-release]
recipe = plone.recipe.distros
urls =
  https://dist.sixfeetup.com/private/my-project/MyProduct.tgz

[instance]
...
products =
   ${instance:base-products}
   ${products-release:location}
```

## Depending on a new egg

If you want to use a new egg that is in the Python Package Index, all you need
to do is to add it to the "eggs" option under the main `[buildout]` section:

```
[buildout]
...
eggs =
  my.package
```

If it's listed somewhere else than the Python Package Index, you can add a link
telling buildout where to find it in the 'find-links' option:

```
[buildout]
...
find-links =
  http://dist.plone.org
  http://download.zope.org/distribution/
  http://effbot.org/downloads
  http://some.host.com/packages
```

## Using existing old-style products

If you are using an old-style (non-egg) product, you can either add it as an
automatically downloaded archive or put it in the top-level "products" folder.
The former is probably better, because it means you can redistribute your
buildout.cfg more easily:

```
[third-party]
recipe = plone.recipe.distros
urls =
  http://plone.org/products/someproduct/releases/1.3/someproduct-1.3.tar.gz
```

If someproduct-1.3.tar.gz extracts into several products inside a top-level
directory, e.g. SomeProduct-1.3/PartOne and SomeProduct-1.3/PartTwo, then
add it as a "nested package":

```
[third-party]
recipe = plone.recipe.distros
urls =
  http://plone.org/products/someproduct/releases/1.3/someproduct-1.3.tar.gz
nested-packages =
  someproduct-1.3.tar.gz
```

Alternatively, if it extracts to a directory which contains the version
number, add it as a "version suffix package":

```
[third-party]
recipe = plone.recipe.distros
urls =
  http://plone.org/products/someproduct/releases/1.3/someproduct-1.3.tar.gz
version-suffix-packages =
  someproduct-1.3.tar.gz

[buildout]
...
parts =
  plone
  zope2
  third-party
  instance
```

Note that "third-party" comes before the "instance" part:

```
[myproduct]
recipe = plone.recipe.bundlecheckout
url = http://svn.plone.org/svn/collective/myproduct/trunk
```

Finally, you need to tell Zope to find this new checkout and add it to its
list of directories that are scanned for products:

```
[instance]
...
products =
  ${buildout:directory}/products
  ${third-party:location}
```

Without this last step, the "myproduct" part is simply managing an svn
checkout and could potentially be used for something else instead.


## Makefile

### What to put in the `Makefile`, why and how.

The main goal of the `Makefile` is to capture in version control any steps
required for local development in an executable and repeatable way.
Documentation of those steps, such as in wiki, easily gets out of date.  An
individual developer will run into an issue, make a few attempts at addressing
it, and some combination of those attempts will resolve the issue.  Now that
the developer is able to proceed, do they take the extra time to update the
`README`, let alone a wiki?  What would they update it with if they're not
sure which combination of steps addressed the issue?  If the attempts were
made in an executable form that can be captured in VCS, they're much easier
and faster to capture and therefor much more likely to be captured.

Local development is, pragmatically speaking, notoriously fragile.  Seldom do
two runs of the set up process succeed without at least one issue, even when
run on the same machine.  This is true across many languages, frameworks, and
systems.  As such perfection is not the goal of the `Makefile`.  Rather the
goal is to make solutions to local development issues much more *likely* to be
captured and much more *likely* to be executable.  For example, if doing an
ad-hoc maintenance task, add a target to the `Makefile` with the commands
you'd otherwise be typing in your shell.  Iterate by invoking make to run that
target, `$ make foo`, then change the commands under that target in the
`Makefile`, repeat until it works for you, then commit the new target in
VCS.  There's no need to make sure it's repeatable by everyone, it's enough
that it's discover-able.  If another developer needs something similar, then
*they* can iterate similarly and capture their changes in VCS.  This way we
can document more and approach repeatability over time while costing little
extra time.

There are ways to parameterize and share code between recipes when multiple
developers are doing similar but different tasks, see below in 
[How to add or change targets](https://github.com/sixfeetup/bobtemplates.sixfeetup/blob/master/bobtemplates/sixfeetup/unified_buildout/README.md#how-to-add-or-change-targets).
OTOH, if you're going too far down either of those routes it's probably a
sign that the task is a real requirement, not the kind of ad-hoc task our 
use of `Makefile` is intended for.  In that case, it's time to move such a
task out of the `Makefile` and into some other tool such as
[docker](https://docs.docker.com/get-started/),
[zc.buildout](http://www.buildout.org) or a well factored script.

### How to add or change targets

Start by understanding [the fundamentals of Makefile]
(https://www.gnu.org/software/make/manual/html_node/Rule-Introduction.html):

  * If a recipe actually generates files and/or directories, then the target
    should be a real target referring to the most relevant thing that recipe
    generates.  For example:

    * The main reason to run `virtualenv env` is to generate
      `env/bin/python` so that should be the target.
    * The main reason to run `env/bin/pip install -r requirements.txt` may
      be to generate `env/bin/buildout` so that should be the target.

  * Use prerequisites for the target whenever possible to avoid running
    recipes unnecessarily.  For example:

    * Running `env/bin/pip install -r requirements.txt` requires that
      the `virtualenv` has been created, and we want it to be run again
      if `requirements.txt` has changed so the prerequisites should
      be `env/bin/python requirements.txt`.
    * Running `env/bin/buildout` requires that the
      `requirements.txt` have been installed, that `buildout.cfg` has been
      created and should be run again if any of `profiles/*.cfg` have
      changed so those should be the prerequisites.

  * Understand how `make` uses the modification time stamps of the target
    and it's prerequisites to decide which recipes need to be run.  This
    understanding is useful, for example, to force certain targets to be
    rebuilt, e.g. `$ touch buildout.cfg` to force buildout to be run.

  * Use separate `Makefile` files together in the relevant directories to
    keep changes close to related changes in VCS.  For example, if the project
    has a back-end REST API and front-end UI, put the API set up in
    `api/Makefile` and the front-end set up in `ui/Makefile` and invoke
    their targets as appropriate in the recipes of the top-level
    `Makefile`:

    ```
      .PHONY: build
      build:
    $(MAKE) -C api build
    $(MAKE) -C ui build

      .PHONY: run-api
      run-api:
    $(MAKE) -C api run
      .PHONY: run-ui
      run-ui:
    $(MAKE) -C ui run
    ```

  * Use `$(@)` to refer to the target in the recipe.

When adding a target whose recipe doesn't generate any meaningful files and/or
directories or whose recipe commands should be run every time, then use [a
phony target](https://www.gnu.org/software/make/manual/html_node/Phony-Targets.html),
such as for a `run` target that runs development servers or
a `test` target that runs the tests.  This tells `make` not to expect the
recipe to generate anything in particular.

You may also use the `-j` option to tell `make` how many targets to run
simultaneously.  This can be an easy way to run multiple processes at once,
such as to run a back-end web server and a front-end web server:

```
.PHONY: run
run:
    $(MAKE) -j 2 run-zope run-webpack
.PHONY: run-zope
run-zope:
    bin/instance fg
.PHONY: run-webpack
run-webpack:
    npx webpack
```

That way a developer may run both processes in the same shell seeing all
console output in one shell or may run them in separate shells for separate
output or so that one process can be restarted separately.

If a target's commands are getting long or require more logic than is
convenient in the `Makefile`, such as loops or anything but the simplest
conditionals, put the commands in a script (shell, Python, etc.), and invoke
that script in the target's recipe.

[Makefile variables](https://www.gnu.org/software/make/manual/html_node/Using-Variables.html) 
can be used to parameterize recipes. [Makefile canned recipes](https://www.gnu.org/software/make/manual/html_node/Canned-Recipes.html)
can also be used to share common code between recipes.  These
features can also be used together for more complex factoring of `Makefile`
code, though this may be a sign such tasks should be moved out of the
`Makefile`, see above in `Makefile`.

If a recipe doesn't create any meaningful files or directories that can be
used as a target, or the modification times of those files and/or directories
aren't updated leading to the recipe always being run, you can use `tee` to
write a log file.  Be sure to `touch` one of the prerequisites on failure so
that the recipe will be run again next time in that case:

```
bin/instance: var/log env/bin/buildout
    env/bin/buildout | tee -a var/log/buildout.log \
  || touch env/bin/buildout
```

### How to invoke `make`

Invoking `$ make` with out specifying a target will run the default target
which should be the target to "build" everything without "running" the project.
IOW, without running a development server, tests, etc..  Invoking make with
targets, such as `$ make test run` will run those targets in sequence.

Variables in the `Makefile` can also be overridden on the command line.
This can be used to modify the execution of a target providing a sort of
option system.  For example, the default `Makefile` build may copy project
data from PROD and won't overwrite local data with project data on each run so
the developer can work with changed data without constantly repeating those
changes.  If there's an issue on TESTING caused by differences in the data,
however, variables could be used to tell `make` to overwrite local data and
to do so specifically with data from TESTING so the issue can be reproduced
and debugged locally:

```shell
$ make DATA_RSYNC_OPTS= DATA_HOST=testing.example.com run
```

### Why use `make`?

Adding a shell script for each local development step or task is too much
overhead for most of such steps.  `Makefile` also has a rudimentary
"dependency" system it uses to figure out which steps to run which can be used
to avoid running unnecessary steps which saves developer time and
interruptions.  Also, adding a set of arbitrary shell commands to a
`Makefile` has much less overhead than adding them to other systems such as
[docker](https://docs.docker.com/get-started/),
[zc.buildout](http://www.buildout.org), [webpack](https://webpack.js.org),
[gulp](https://gulpjs.com). Finally, `make` is available pretty much everywhere
so there are essentially no external dependency issues.

Unfortunately, tabs are required by `make`, so it is recommended that you
configure your editor to represent tab characters with how ever many spaces
you prefer.

## Using Windows

To use buildout on Windows, you will need to install a few dependencies which
other platforms manage on their own.

You can use an installer version of all the steps below from this link:

http://release.ingeniweb.com/third-party-dist/python2.4.4-win32.zip

Or follow these steps manually (thanks to Hanno Schlichting for these):

### Python

(http://python.org)

- Download and install Python 2.4.4 using the Windows installer from
  http://www.python.org/ftp/python/2.4.4/python-2.4.4.msi
  Select 'Install for all users' and it will put Python into the
  `C:\Python24` folder by default.

- You also want the pywin32 extensions available from
  http://downloads.sourceforge.net/pywin32/pywin32-210.win32-py2.4.exe?modtime=1159009237&big_mirror=0

- And as a last step you want to download the Python imaging library available
  from http://effbot.org/downloads/PIL-1.1.6.win32-py2.4.exe

- If you develop Zope based applications you will usually only need Python 2.4
  at the moment, so it's easiest to put the Python binary on the systems PATH,
  so you don't need to specify its location manually each time you call it.

  Thus, put `C:\Python24` and `C:\Python24\Scripts` onto the PATH. You can
  find the PATH definition in the control panel under system preferences on
  the advanced tab at the bottom. The button is called environment variables.
  You want to add it at the end of the already existing PATH in the system
  section. Paths are separated by a semicolons.

- You can test if this was successful by opening a new shell (cmd) and type
  in `python -V`. It should report version 2.4.4 (or whichever version you
  installed).

  Opening a new shell can be done quickly by using the key combination
  **Windows-r** or if you are using Parallels on a Mac **Apple-r**. Type in `cmd`
  into the popup box that opens up and hit enter.

## Installing PIL

To use Plone, you need PIL, the Python Imaging Library. If you don't already
have this, download and install it from http://www.pythonware.com/products/pil.

## Subversion

(http://subversion.tigris.org)

- Download the nice installer from
  http://subversion.tigris.org/files/documents/15/35379/svn-1.4.2-setup.exe

- Run the installer. It defaults to installing into
  "C:\Program Files\Subversion".

- Now put the install locations bin subfolder (for example
  "C:\Program Files\Subversion\bin") on your system PATH in the same way you
  put Python on it.

- Open a new shell again and type in: `svn --version` it should report
  version 1.4.2 or newer.


## MinGW

(http://www.mingw.org/)

This is a native port of the gcc compiler and its dependencies for Windows.
There are other approaches enabling you to compile Python C extensions on
Windows including Cygwin and using the official Microsoft C compiler, but this
is a lightweight approach that uses only freely available tools. As
it's used by a lot of people chances are high it will work for you and there's
plenty of documentation out there to help you in troubleshooting problems.

- Download the MinGW installer from
  http://downloads.sourceforge.net/mingw/MinGW-5.1.3.exe?modtime=1168794334&big_mirror=1

- The installer will ask you which options you would like to install. Choose
  base and make here. It will install into "C:\MinGW" by default. The install
  might take some time as it's getting files from sourceforge.net and you
  might need to hit 'retry' a couple of times.

- Now put the install location's bin subfolder (for example "C:\MinGW\bin") on
  your system PATH in the same way you put Python on it.

- Test this again by typing in: `gcc --version` on a newly opened shell and
  it should report version 3.4.2 or newer.


### Configure Distutils to use MinGW

Some general information are available from
http://www.mingw.org/MinGWiki/index.php/Python%20extensions for example but
you don't need to read them all.

- Create a file called `distutils.cfg` in "C:\Python24\Lib\distutils". Open it
  with a text editor (`notepad distutils.cfg`) and fill in the following lines:

```
[build]
compiler=mingw32
```

This will tell distutils to use MinGW as the default compiler, so you don't
need to specify it manually using `--compiler=mingw32` while calling a
package's setup.py with a command that involves building C extensions. This
is extremely useful if the build command is written down in a buildout
recipe where you cannot change the options without hacking the recipe
itself. The z2c.recipe.zope2install used in ploneout is one such example.
