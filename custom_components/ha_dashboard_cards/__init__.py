"""Initialize the HA Dashboard Cards integration."""

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .www_manager import (
    async_register_cards,
    async_register_resources_service,
    async_remove_cards_and_resources,
    async_setup_cards,
)

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    hass.data.setdefault(DOMAIN, {})

    await async_setup_cards(hass)
    await async_register_resources_service(hass)

    async def auto_register(event):
        await async_register_cards(hass)

    if hass.is_running:
        await auto_register(None)
    else:
        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, auto_register)

    _LOGGER.info(
        "HA Dashboard Cards ready. Cards auto-registered on startup. "
        "Call 'ha_dashboard_cards.register_card_resources' to re-register."
    )

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    hass.services.async_remove(DOMAIN, "register_card_resources")
    if entry.entry_id in hass.data.get(DOMAIN, {}):
        hass.data[DOMAIN].pop(entry.entry_id)
    return True


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await async_remove_cards_and_resources(hass)
