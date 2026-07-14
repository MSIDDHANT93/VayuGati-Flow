"""
Tests for app.utils.logger logging configuration.
"""

import logging

from app.utils import logger as logger_module
from app.utils.logger import setup_logging, logger


class TestSetupLogging:
    """Tests for setup_logging."""

    def test_returns_named_logger(self):
        result = setup_logging()
        assert isinstance(result, logging.Logger)
        assert result.name == "vayugati"

    def test_has_single_stream_handler(self):
        result = setup_logging()
        assert len(result.handlers) == 1
        assert isinstance(result.handlers[0], logging.StreamHandler)

    def test_no_duplicate_handlers_on_reconfigure(self):
        setup_logging()
        result = setup_logging()
        assert len(result.handlers) == 1

    def test_formatter_configured(self):
        result = setup_logging()
        formatter = result.handlers[0].formatter
        assert formatter is not None
        record = logging.LogRecord(
            name="vayugati",
            level=logging.INFO,
            pathname=__file__,
            lineno=1,
            msg="hello",
            args=(),
            exc_info=None,
        )
        formatted = formatter.format(record)
        assert "vayugati" in formatted
        assert "INFO" in formatted
        assert "hello" in formatted

    def test_level_follows_debug_setting(self, monkeypatch):
        class FakeSettings:
            debug = True

        monkeypatch.setattr(logger_module, "settings", FakeSettings())
        result = setup_logging()
        assert result.level == logging.DEBUG
        assert result.handlers[0].level == logging.DEBUG

    def test_level_info_when_debug_disabled(self, monkeypatch):
        class FakeSettings:
            debug = False

        monkeypatch.setattr(logger_module, "settings", FakeSettings())
        result = setup_logging()
        assert result.level == logging.INFO


class TestModuleLogger:
    """Tests for the module-level logger instance."""

    def test_module_logger_configured(self):
        assert isinstance(logger, logging.Logger)
        assert logger.name == "vayugati"
