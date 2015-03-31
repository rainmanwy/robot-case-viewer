Robot Case Portal
-----------------

This webapp is implemented with nodejs+mongodb

Functionalities
-----------------
* Import Robot Test Cases to mongodb
* Support to show robot cases in web page
* Show Robot Test Cases in browser
* Tag filter
* Export Robot Test Cases to csv file

Installation
-----------------
* python 2.x/robotframework/pymongo/mongodb/nodejs need be installed firstly
* Edit 'settings.ini' file for mongodb parameters
* Edit 'filterTags' in 'settings.js', add filter tags you want to use

Usage
-----------------
* Run 'CaseImporter.py' in 'case_importer' folder to import robot test cases import mongodb
* Run 'start.sh' in 'bin' folder to start web server
* Access url 'http://127.0.0.1:3000' should no error
