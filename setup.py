# -*- coding: utf-8 -*-

from setuptools import find_packages
from setuptools import setup

version = '2.1'


long_description = '\n\n'.join([
    open('README.md').read(),
    open('CONTRIBUTORS.md').read(),
    open('CHANGES.md').read(),
])


setup(
    name='bobtemplates.sixfeetup',
    version=version,
    description="Unified buildout template for Plone projects.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    classifiers=[
        "Environment :: Console",
        "Intended Audience :: Developers",
        "Natural Language :: English",
        "Operating System :: OS Independent",
        "Programming Language :: Python",
        "Framework :: Plone",
        "Development Status :: 5 - Production/Stable",
        "Topic :: Software Development :: Code Generators",
        "Topic :: Utilities",
        "License :: OSI Approved :: BSD License",
    ],
    keywords='web plone zope skeleton project buildout',
    author='Six Feet Up, Inc.',
    author_email='info@sixfeetup.com',
    url='https://github.com/sixfeetup/bobtemplates.sixfeetup',
    license='BSD',
    packages=find_packages(exclude=['ez_setup']),
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        'setuptools',
        'mr.bob',
    ],
    extras_require={
        'test': [
            'nose',
            'nose-selecttests',
            'scripttest',
            'six',
            'unittest2',
        ]
    },
    entry_points={},
)
