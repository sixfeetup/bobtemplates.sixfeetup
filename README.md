# bobtemplates.unified_buildout

`bobtemplates.sixfetup` provides a [mr.bob](http://mrbob.readthedocs.org/en/latest/) `unified_buildout` template to generate a buildout for Plone based projects.


## Features

The project created with ``bobtemplates.sixfeetup`` use the current Six Feet Up deployment best-practices when creating an project.

**Buildout**

The package is contained in a buildout that allows you to build Plone with the new package installed for testing-purposes.

**Policy**

The package contains a policy package.

**Theme**

Adds a Diazo theme package based on Barceloneta.

**Content**

Adds a content package for new Dexterity based content types.

**Migration**

A starting point for creating a transmogrifier import pipeline.


## Installation

**Installation in a virtualenv**

You can install `bobtemplates.sixfeetup` in a virtualenv.
    
```shell
$ pip install bobtemplates.sixfeetup
```

With `pip 6.0` or newer `mr.bob` will automatically be installed as a dependency. If you still use a older version of pip you need install `mr.bob` before `bobtemplates.sixfeetup`.

```shell
$ pip install mr.bob
```

Now you can use it like this

```shell
$ mrbob -O myproject bobtemplates.sixfeetup:unified_buildout
```

See [the documentation of mr.bob](http://mrbob.readthedocs.org/en/latest/) for further information.


## Development

To contribute to these templates, clone the repository then in the package folder create a virtualenv and install the package::

```shell
$ make
```


## Contribute

- Issue Tracker: https://github.com/sixfeetup/bobtemplates.sixfeetup/issues
- Source Code: https://github.com/sixfeetup/bobtemplates.sixfeetup


## Support

If you are having issues, please let us know.
