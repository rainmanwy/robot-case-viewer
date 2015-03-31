import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import fnmatch
from robot.api import TestData
from Logger import LOG
import pymongo
from pymongo import Connection
from pymongo.errors import ConnectionFailure
from bson.dbref import DBRef
from copy import deepcopy
from SimpleConfigParser import SimpleConfigParser


class CaseImporter(object):

    ROBOT_FILE_TYPES = ["*.txt", "*.html", "*.tsv", "*.robot"]
    FC_PATTERN = "OSS_FC_"
    US_PATTERN = "US_"

    def __init__(self):
        self.projects = []
        self.config = self._parse_setting()

    def _parse_setting(self):
        config = SimpleConfigParser()
        config.read(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'settings.ini'))
        return config

    def import_to_db(self, project, testCasePath):
        suites = self.parse_robot_suites(testCasePath)

        db = self._get_db()
        caseProject = db.project.find_one({"name":project})
        LOG.info(caseProject)
        if not caseProject:
            db.project.insert({"name": project})
        caseProject = db.project.find_one({"name":project})
        if 'suites' in caseProject:
            db.suite.remove({"_id": {"$in": [suite.id for suite in caseProject["suites"]]}})
        db.suite.insert(suites)
        db.suite.create_index([('doc',pymongo.TEXT)])
        projectSuites = [DBRef("suites", suite["_id"]) for suite in suites]
        caseProject = deepcopy(caseProject)
        caseProject["suites"] = projectSuites
        db.project.update({"name":project}, caseProject)

    def _get_db(self):
        host = self.config.getoption('db_host')
        port = int(self.config.getoption('db_port'))
        db_name = self.config.getoption('db_name')
        try:
            c = Connection(host=host, port=port)
        except ConnectionFailure, err:
            LOG.error("Could not connect to mongodb, %s" % err.message)
            sys.exit(1)
        db = c[db_name]
        return db

    def parse_robot_suites(self, path):
        robotcases = []
        for root, dirnames, filenames in os.walk(path):
            for fileType in CaseImporter.ROBOT_FILE_TYPES:
                for filename in fnmatch.filter(filenames, fileType):
                    file = os.path.join(root, filename)
                    LOG.info("Parse %s" % file)
                    if self._is_robot_suite_file(file):
                        tc = self._parse_robot_suite_file(file)
                        robotcases.append(tc)
        return robotcases

    def get_test_suites(self):
        return self.robotcases.keys()

    def get_sub_cases(self, suite):
        testcases = []
        for case in self.robotcases[suite].testcase_table.tests:
            testcases.append(case)
        return testcases

    def _parse_robot_suite_file(self, file):
        tc = TestData(source=file)
        return self._create_test_suite_data(tc)

    def _create_test_suite_data(self, tc):
        data = {}
        data["name"] = os.path.basename(tc.source)
        data["force_tags"] = self.get_force_tags(tc)
        data["default_tags"] = self.get_default_tags(tc)
        data["doc"] = tc.setting_table.doc.value
        testcases = []
        for test in tc.testcase_table.tests:
            testCase = {}
            testCase['name'] = test.name
            tags = []
            if test.tags:
                tags = test.tags.value
            testCase['tags'] = [{'value':tag.lower()} for tag in tags]
            testcases.append(testCase)
        data["testcases"] = testcases
        data["path"] = tc.source
        return data


    def _get_tags_from_suite(self, suite):
        tags = []
        tags.extend(self.get_force_tags(self.robotcases[suite]))
        tags.extend(self.get_default_tags(self.robotcases[suite]))
        for test in self.robotcases[suite].testcase_table.tests:
            tags.extend(test.tags.value or [])
        return tags

    def get_default_tags(self, tc):
        default_tags =  tc.setting_table.default_tags.value or []
        return [{"value":tag.lower()} for tag in default_tags]

    def get_force_tags(self, tc):
        force_tags = tc.setting_table.force_tags.value or []
        return [{"value":tag.lower()} for tag in force_tags]

    def _is_robot_suite_file(self, file):
        try:
            tc = TestData(source=file)
            return tc.has_tests()
        except Exception, err:
            LOG.warn("Parse %s met exception, may not be a valid robot suite file. %s" % (file, err.message))
        return False


if __name__ == "__main__":
    import optparse
    usage = """usage: python %prog <project> <path>"""
    parser = optparse.OptionParser(usage=usage)
    parser.add_option("--project", "-p", action="store", type="string", dest="project",
                      help="""Project Name""")
    parser.add_option("--case", "-c", action="store", type="string", dest="path",
                      help="Robot Suite Path")
    options, arguments = parser.parse_args()

    parser = CaseImporter()
    parser.import_to_db(options.project, options.path)


