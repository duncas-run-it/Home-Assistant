from __future__ import annotations

import shutil
import tempfile
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

import pytest

from tests.mocks import _MockHass


@pytest.fixture
def tmp_path():
    d = Path(tempfile.mkdtemp())
    yield d
    shutil.rmtree(d, ignore_errors=True)


@pytest.fixture
def mock_hass():
    return _MockHass()


@pytest.fixture
def mock_lovelace_resources():
    resources = MagicMock()
    resources.loaded = True
    resources.async_items = MagicMock(return_value=[])
    resources.async_create_item = AsyncMock()
    resources.async_update_item = AsyncMock()
    resources.async_delete_item = AsyncMock()

    lovelace = MagicMock()
    lovelace.resources = resources

    def _install(hass):
        import homeassistant.components.lovelace as lovelace_mod
        hass.data[lovelace_mod.DOMAIN] = lovelace
        return resources

    return _install


@pytest.fixture
def mock_config_entry():
    from homeassistant.config_entries import ConfigEntry
    return ConfigEntry(domain="ha_dashboard_cards", data={}, entry_id="test_entry_1", title="HA Dashboard Cards")
