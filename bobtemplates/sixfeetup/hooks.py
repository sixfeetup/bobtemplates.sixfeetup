#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Render bobtemplates.sixfeetup hooks.
"""
import os
import shutil
import string
import subprocess
import sys


def get_git_info(value):
    """Try to get information from the git-config.
    """
    gitargs = ['git', 'config', '--get']
    try:
        result = subprocess.check_output(gitargs + [value]).strip()
        return result
    except (OSError, subprocess.CalledProcessError):
        pass


def validate_projectname(configurator):
    """Find out if the name target-dir entered when invoking the command
    can be a valid python-package.
    """
    package_dir = os.path.basename(configurator.target_directory)
    fail = False

    allowed = set(string.ascii_letters + string.digits + '.-_')
    if not set(package_dir).issubset(allowed):
        fail = True

    if package_dir.startswith('.') or package_dir.endswith('.'):
        fail = True

    if fail:
        msg = "Error: '{0}' is not a valid project name.\n".format(package_dir)
        msg += "Please use a valid name (like mybuildout or "
        msg += "myproject.buildout)"
        sys.exit(msg)


def pre_site_name(configurator, question):
    """ grab the target directory to create project name
    """
    validate_projectname(configurator)


def post_plone_version(configurator, question, answer):
    """Find out what version of Plone we want
    """
    _set_plone_version_variables(configurator, answer)
    return answer


def _set_plone_version_variables(configurator, version):
    configurator.variables['is_plone5'] = False
    configurator.variables['is_plone4'] = False
    configurator.variables['pre_plone4'] = False
    configurator.variables['pre_plone5'] = False
    configurator.variables['pre_plone52'] = False
    configurator.variables['pyflakes_version'] = 'pyflakes'
    # Find out if it is supposed to be Plone 5.
    if version.startswith('5'):
        configurator.variables['is_plone5'] = True
        if version < '5.2':
            configurator.variables['pre_plone52'] = True
    elif version.startswith('4'):
        configurator.variables['pre_plone5'] = True
        configurator.variables['is_plone4'] = True
    else:
        configurator.variables['pre_plone5'] = True
        configurator.variables['pre_plone4'] = True
        configurator.variables['pyflakes_version'] = 'pyflakes<=0.4'
    configurator.variables['plone_minor_version'] = ".".join(
        version.split('.')[:2])


def post_password(configurator, question, answer):
    """ generate password if pwgen is installed and no password provided
    """
    if not answer:
        answer = run_cmd('pwgen -acn 9 1')
        if not answer:
            answer = 'admin'
    return answer


def run_cmd(cmd):
    """Run a command and get back the output
    """
    ret = subprocess.Popen(
        cmd,
        shell=True,
        stdout=subprocess.PIPE
        ).communicate()
    return ret[0][:-1]


def prepare_render(configurator):
    """Set the project_name for the buildout
    """
    # get package-name and package-type from user-input
    project_name = os.path.basename(configurator.target_directory)
    configurator.variables['project_name'] = project_name


def cleanup_package(configurator):
    """Removed unneeded bits based on answers to question
    """
    # path for normal packages in a unified buildut (project/project/content)
    base_path = "{0}/{1}".format(
        configurator.target_directory,
        configurator.variables['project_name'])

    # find out what to delete
    to_delete = []

    if not configurator.variables['include_policy']:
        to_delete.extend([
            "{0}/policy",
        ])

    if not configurator.variables['include_theme']:
        to_delete.extend([
            "{0}/theme",
        ])

    if not configurator.variables['include_content']:
        to_delete.extend([
            "{0}/content",
        ])

    if not configurator.variables['include_migration']:
        to_delete.extend([
            "{0}/migration",
        ])

    # Plone 5 doesn't use the properties.xml anymore
    if configurator.variables['is_plone5']:
        to_delete.extend([
            "{0}/policy/profiles/qa/properties.xml",
            "{0}/theme/profiles/default/cssregistry.xml",
            "{0}/theme/profiles/default/jsregistry.xml",
        ])

    # remove parts
    for path in to_delete:
        path = path.format(base_path)
        if os.path.exists(path):
            if os.path.isdir(path):
                shutil.rmtree(path)
            else:
                os.remove(path)
