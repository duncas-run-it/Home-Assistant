from __future__ import annotations

from pathlib import Path
from unittest.mock import MagicMock


class _MockServices:
    def __init__(self):
        self._registry = {}

    def async_register(self, domain, service, handler):
        self._registry[(domain, service)] = handler

    def async_remove(self, domain, service):
        self._registry.pop((domain, service), None)


class _MockBus:
    def __init__(self):
        self.async_listen_once = MagicMock()


class _MockConfig:
    def path(self, *parts):
        import tempfile
        d = Path(tempfile.gettempdir()) / "ha_test_config"
        return str(d / "/".join(parts))


class _MockHass:
    def __init__(self):
        self.data = {}
        self.services = _MockServices()
        self.bus = _MockBus()
        self.config = _MockConfig()
        self.is_running = False

    async def async_add_executor_job(self, fn, *args):
        return fn(*args)


class _MockCallbackType:
    pass
