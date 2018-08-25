We choose to commit compiled CSS/JS to the repository so that you may work
on the project without needing to set up and build the theme assets.

However, if you need to make changes to the theme:

1. Install node.js if you do not have it, then:

$ cd [path/to/project]/[project_name]/theme
$ npm install

2. After that is done once - and after each time any plugins are added to 
   package.json - you can use default command to start a task that will
   watch continually for changes to CSS/JS and build them until it is stopped:

$ gulp

 - If you need to do a one-time build:

$ gulp build

----

Barceloneta assets here are based on 1.8.1 which ships with Plone 5.1.2.

- static/css/barceloneta-compiled.css
- index.html
- rules.xml
