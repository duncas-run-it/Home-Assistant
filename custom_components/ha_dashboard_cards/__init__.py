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
    await async_setup_cards(hass)
    await async_register_resources_service(hass)

    if hass.is_running:
        await async_register_cards(hass)
    else:
        hass.bus.async_listen_once(
            EVENT_HOMEASSISTANT_STARTED,
            lambda _: hass.async_create_task(async_register_cards(hass)),
        )

    _LOGGER.info(
        "HA Dashboard Cards ready. Cards auto-registered on startup. "
        "Call 'ha_dashboard_cards.register_card_resources' to re-register."
    )

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    hass.services.async_remove(DOMAIN, "register_card_resources")
    return True


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await async_remove_cards_and_resources(hass)
