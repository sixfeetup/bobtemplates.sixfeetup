bobtemplates.unified_buildout
=============================

``bobtemplates.unified_buildout`` provides a `mr.bob <http://mrbob.readthedocs.org/en/latest/>`_ template to generate a buildout for Plone based projects.


Features
--------

Package created with ``bobtemplates.unified_buildout`` use the current Six Feet Up deployment best-practices when creating an project.

Buildout
    The package is contained in a buildout that allows you to build Plone with the new package installed for testing-purposes.

Policy
    The package contains a policy package.

Theme
    Adds a simple bootstrap-based Diazo theme package.

Content
    Adds a content package for new Dexterity based content types.


Compatibility
=============

Add-ons created with ``bobtemplates.plone`` are tested to work in Plone 4.3.x and Plone 5.
They should also work with older versions but that was not tested.
It should work on Linux, Mac and Windows.


Installation
------------

Installation in a virtualenv
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

You can install ``bobtemplates.unified_buildout`` in a virtualenv.::
    
    $ pip install bobtemplates.unified_buildout

With ``pip 6.0`` or newer ``mr.bob`` will automatically be installed as a dependency. If you still use a older version of pip you need install ``mr.bob`` before ``bobtemplates.unified_buildout``.::

    $ pip install mr.bob

Now you can use it like this::

    $ mrbob -O myproject bobtemplates:unified_buildout

See `the documentation of mr.bob <http://mrbob.readthedocs.org/en/latest/>`_  for further information.


Contribute
----------

- Issue Tracker: https://github.com/sixfeetup/bobtemplates.unified_buildout/issues
- Source Code: https://github.com/sixfeetup/bobtemplates.unified_buildout

Support
-------

If you are having issues, please let us know.
