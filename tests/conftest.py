from __future__ import annotations

from unittest.mock import MagicMock

from tests.fixtures import mock_hass, mock_lovelace_resources, mock_config_entry, tmp_path  # noqa: F401
from tests.mocks import _MockHass, _MockCallbackType

_HA_MODULES = {
    "homeassistant",
    "homeassistant.const",
    "homeassistant.core",
    "homeassistant.config_entries",
    "homeassistant.data_entry_flow",
    "homeassistant.components",
    "homeassistant.components.lovelace",
    "homeassistant.helpers",
    "homeassistant.helpers.event",
    "homeassistant.helpers.dispatcher",
    "homeassistant.util",
    "homeassistant.util.json",
}


def _install_ha_stubs():
    import sys

    already = {m for m in _HA_MODULES if m in sys.modules}
    missing = _HA_MODULES - already
    if not missing:
        return

    import types

    for mod_name in sorted(missing):
        parts = mod_name.split(".")
        parent = sys.modules.get(parts[0])
        if parent is None:
            parent = types.ModuleType(parts[0])
            sys.modules[parts[0]] = parent

        for i in range(1, len(parts)):
            child_name = ".".join(parts[: i + 1])
            if child_name not in sys.modules:
                child = types.ModuleType(child_name)
                sys.modules[child_name] = child
                setattr(sys.modules[".".join(parts[:i])], parts[i], child)

    _stub_const()
    _stub_core()
    _stub_config_entries()
    _stub_data_entry_flow()
    _stub_lovelace()
    _stub_helpers()


def _stub_const():
    import homeassistant.const as mod

    mod.EVENT_HOMEASSISTANT_STARTED = "homeassistant_started"


def _stub_core():
    import homeassistant.core as mod

    mod.HomeAssistant = _MockHass
    mod.CallbackType = _MockCallbackType
    mod.callback = lambda f: f


def _stub_config_entries():
    import homeassistant.config_entries as mod

    class _MockConfigEntryState:
        LOADED = "loaded"
        NOT_LOADED = "not_loaded"
        SETUP_ERROR = "setup_error"
        SETUP_RETRY = "setup_retry"
        FAILED_UNLOAD = "failed_unload"

    class _MockConfigFlow:
        VERSION = 1

        def __init_subclass__(cls, **kwargs):
            pass

        def __init__(self):
            self._hass = None

        def _async_current_entries(self):
            return []

        def async_abort(self, *, reason):
            return {"type": "abort", "reason": reason}

        def async_create_entry(self, *, title, data):
            return {"type": "create_entry", "title": title, "data": data}

        def async_show_form(self, *, step_id, data_schema):
            return {"type": "form", "step_id": step_id, "schema": data_schema}

    class _MockConfigEntry:
        def __init__(self, domain="test", data=None, entry_id="mock_entry_id", title="", source=None):
            self.domain = domain
            self.data = data or {}
            self.entry_id = entry_id
            self.title = title
            self.source = source
            self.state = _MockConfigEntryState.NOT_LOADED

        def add_to_hass(self, hass):
            if "mock_entries" not in hass.data:
                hass.data["mock_entries"] = {}
            hass.data["mock_entries"][self.entry_id] = self

    class _MockHandlerRegistry(dict):
        def register(self, domain):
            def decorator(cls):
                self[domain] = cls
                return cls

            return decorator

    class _MockOptionsFlow:
        def __init__(self):
            self._hass = None

        def async_show_form(self, *, step_id, data_schema):
            return {"type": "form", "step_id": step_id, "schema": data_schema}

        def async_create_entry(self, *, title, data):
            return {"type": "create_entry", "title": title, "data": data}

        def async_step_init(self, user_input=None):
            pass

    mod.ConfigEntry = _MockConfigEntry
    mod.ConfigFlow = _MockConfigFlow
    mod.OptionsFlow = _MockOptionsFlow
    mod.ConfigEntryState = _MockConfigEntryState
    mod.HANDLERS = _MockHandlerRegistry()
    mod.SOURCE_USER = "user"


def _stub_data_entry_flow():
    import homeassistant.data_entry_flow as mod

    class _MockFlowResultType:
        FORM = "form"
        CREATE_ENTRY = "create_entry"
        ABORT = "abort"

    mod.FlowResultType = _MockFlowResultType
    mod.FlowResult = dict


def _stub_lovelace():
    import homeassistant.components.lovelace as mod

    mod.DOMAIN = "lovelace"


def _stub_helpers():
    import homeassistant.helpers.event as mod

    mod.async_call_later = MagicMock()


_install_ha_stubs()
