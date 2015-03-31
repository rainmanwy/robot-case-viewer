import logging

class Logger(object):

    def __init__(self, level=logging.INFO):
        self.logger = logging.getLogger("Logger")
        formatter = logging.Formatter('%(asctime)s %(levelname)4s %(message)s')
        stream = logging.StreamHandler()
        stream.setLevel(logging.DEBUG)
        stream.setFormatter(formatter)
        self.logger.addHandler(stream)
        self.set_log_level(level)

    def get_logger(self):
        return self.logger

    def info(self, msg):
        self.logger.info(msg)

    def critical(self, msg):
        self.logger.critical(msg)

    def error(self, msg):
        self.logger.error(msg)

    def debug(self, msg):
        self.logger.debug(msg)

    def warn(self, msg):
        self.logger.warn(msg)

    def set_log_level(self, level=logging.INFO):
        self.logger.setLevel(level)

LOG = Logger()
