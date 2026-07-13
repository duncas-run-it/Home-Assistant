import logging
import os
import shutil
import stat
from pathlib import Path

from homeassistant.components.lovelace import DOMAIN as LOVELACE_DOMAIN
from homeassistant.core import HomeAssistant
from homeassistant.helpers.event import async_call_later

from .const import CARDS, DOMAIN, VERSION

_LOGGER = logging.getLogger(__name__)

WWW_SOURCE_DIR = Path(__file__).parent / "www"


async def async_setup_cards(hass: HomeAssistant) -> bool:
    try:
        www_dir = Path(hass.config.path("www"))
        target_dir = www_dir / "ha_dashboard_cards"

        if not www_dir.exists():
            await hass.async_add_executor_job(www_dir.mkdir)
        if not target_dir.exists():
            await hass.async_add_executor_job(target_dir.mkdir)

        copied = 0
        for card in CARDS:
            source = WWW_SOURCE_DIR / card
            target = target_dir / card
            if source.exists():
                await hass.async_add_executor_job(shutil.copy2, source, target)

                def set_perms(path=target):
                    try:
                        os.chmod(path, stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IROTH)
                    except OSError:
                        pass

                await hass.async_add_executor_job(set_perms)
                copied += 1

        _LOGGER.debug("Dashboard cards installed to www folder (%d files)", copied)
        return True
    except Exception as e:
        _LOGGER.error("Failed to set up cards: %s", e)
        return False


async def async_remove_cards_and_resources(hass: HomeAssistant) -> None:
    try:
        target_dir = Path(hass.config.path("www")) / "ha_dashboard_cards"
        if target_dir.exists():
            await hass.async_add_executor_job(shutil.rmtree, target_dir)

        lovelace = hass.data.get(LOVELACE_DOMAIN)
        if lovelace and hasattr(lovelace, "resources") and lovelace.resources.loaded:
            resources = lovelace.resources
            for card in CARDS:
                base_url = f"/local/ha_dashboard_cards/{card}"
                for resource in resources.async_items():
                    if resource["url"].split("?")[0] == base_url:
                        await resources.async_delete_item(resource["id"])
                        break
    except Exception as e:
        _LOGGER.error("Failed to remove cards/resources: %s", e)


async def async_register_cards(hass: HomeAssistant) -> None:
    lovelace = hass.data.get(LOVELACE_DOMAIN)
    if not lovelace:
        _LOGGER.debug("Lovelace not loaded, skipping")
        return

    if not getattr(lovelace, "resources", None) or not lovelace.resources.loaded:
        _LOGGER.debug("Lovelace resources not loaded, retrying in 5s")
        async_call_later(hass, 5, lambda _: hass.async_create_task(async_register_cards(hass)))
        return

    resources = lovelace.resources
    for card in CARDS:
        base_url = f"/local/ha_dashboard_cards/{card}"
        full_url = f"{base_url}?v={VERSION}"

        existing = None
        for r in resources.async_items():
            if r["url"].split("?")[0] == base_url:
                existing = r
                break

        if existing:
            if existing["url"] != full_url:
                try:
                    await resources.async_update_item(existing["id"], {
                        "res_type": "module",
                        "url": full_url,
                    })
                except Exception as e:
                    _LOGGER.error("Failed to update %s: %s", base_url, e)
        else:
            try:
                await resources.async_create_item({
                    "res_type": "module",
                    "url": full_url,
                })
            except Exception as e:
                _LOGGER.error("Failed to register %s: %s", full_url, e)


async def async_register_resources_service(hass: HomeAssistant) -> None:
    async def handle_register(call):
        await async_register_cards(hass)

    hass.services.async_register(
        DOMAIN,
        "register_card_resources",
        handle_register,
    )
