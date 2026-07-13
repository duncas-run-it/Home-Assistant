from __future__ import annotations

from unittest.mock import AsyncMock, patch


class TestAsyncSetupEntry:

    async def test_calls_setup_cards(self, mock_hass, mock_config_entry):
        from custom_components.ha_dashboard_cards import async_setup_entry

        with patch(
                "custom_components.ha_dashboard_cards.async_setup_cards",
                AsyncMock(return_value=True),
        ) as mock_setup:
            with patch(
                    "custom_components.ha_dashboard_cards.async_register_resources_service",
                    AsyncMock(),
            ):
                with patch(
                        "custom_components.ha_dashboard_cards.async_register_cards",
                        AsyncMock(),
                ):
                    result = await async_setup_entry(mock_hass, mock_config_entry)

        assert result is True
        mock_setup.assert_awaited_once_with(mock_hass)

    async def test_registers_service(self, mock_hass, mock_config_entry):
        from custom_components.ha_dashboard_cards import async_setup_entry

        with patch(
                "custom_components.ha_dashboard_cards.async_setup_cards",
                AsyncMock(return_value=True),
        ):
            with patch(
                    "custom_components.ha_dashboard_cards.async_register_resources_service",
                    AsyncMock(),
            ) as mock_reg:
                with patch(
                        "custom_components.ha_dashboard_cards.async_register_cards",
                        AsyncMock(),
                ):
                    await async_setup_entry(mock_hass, mock_config_entry)

        mock_reg.assert_awaited_once_with(mock_hass)

    async def test_registers_on_start_when_not_running(
            self, mock_hass, mock_config_entry
    ):
        mock_hass.is_running = False

        from custom_components.ha_dashboard_cards import async_setup_entry

        with patch(
                "custom_components.ha_dashboard_cards.async_setup_cards",
                AsyncMock(return_value=True),
        ):
            with patch(
                    "custom_components.ha_dashboard_cards.async_register_resources_service",
                    AsyncMock(),
            ):
                with patch(
                        "custom_components.ha_dashboard_cards.async_register_cards",
                        AsyncMock(),
                ):
                    await async_setup_entry(mock_hass, mock_config_entry)

        mock_hass.bus.async_listen_once.assert_called_once()
        event, _ = mock_hass.bus.async_listen_once.call_args[0]
        assert event == "homeassistant_started"

    async def test_auto_registers_immediately_when_running(
            self, mock_hass, mock_config_entry
    ):
        mock_hass.is_running = True

        from custom_components.ha_dashboard_cards import async_setup_entry

        with patch(
                "custom_components.ha_dashboard_cards.async_setup_cards",
                AsyncMock(return_value=True),
        ):
            with patch(
                    "custom_components.ha_dashboard_cards.async_register_resources_service",
                    AsyncMock(),
            ):
                with patch(
                        "custom_components.ha_dashboard_cards.async_register_cards",
                        AsyncMock(),
                ) as mock_reg:
                    await async_setup_entry(mock_hass, mock_config_entry)

        mock_reg.assert_awaited_once_with(mock_hass)
        assert mock_hass.bus.async_listen_once.call_count == 0

    async def test_sets_up_hass_data(self, mock_hass, mock_config_entry):
        from custom_components.ha_dashboard_cards import async_setup_entry

        with patch(
                "custom_components.ha_dashboard_cards.async_setup_cards",
                AsyncMock(return_value=True),
        ):
            with patch(
                    "custom_components.ha_dashboard_cards.async_register_resources_service",
                    AsyncMock(),
            ):
                with patch(
                        "custom_components.ha_dashboard_cards.async_register_cards",
                        AsyncMock(),
                ):
                    await async_setup_entry(mock_hass, mock_config_entry)

        assert "ha_dashboard_cards" in mock_hass.data


class TestAsyncUnloadEntry:

    async def test_removes_service(self, mock_hass, mock_config_entry):
        mock_hass.services.async_register(
            "ha_dashboard_cards", "register_card_resources", lambda _: None
        )

        from custom_components.ha_dashboard_cards import async_unload_entry

        result = await async_unload_entry(mock_hass, mock_config_entry)

        assert result is True
        assert (
                   "ha_dashboard_cards",
                   "register_card_resources",
               ) not in mock_hass.services._registry

    async def test_returns_true(self, mock_hass, mock_config_entry):
        from custom_components.ha_dashboard_cards import async_unload_entry

        result = await async_unload_entry(mock_hass, mock_config_entry)

        assert result is True

    async def test_cleans_hass_data(self, mock_hass, mock_config_entry):
        mock_hass.data["ha_dashboard_cards"] = {
            mock_config_entry.entry_id: "some_data"
        }

        from custom_components.ha_dashboard_cards import async_unload_entry

        await async_unload_entry(mock_hass, mock_config_entry)

        assert mock_hass.data.get("ha_dashboard_cards", {}) == {}


class TestAsyncRemoveEntry:

    async def test_calls_remove_cards_and_resources(
            self, mock_hass, mock_config_entry
    ):
        from custom_components.ha_dashboard_cards import async_remove_entry

        with patch(
                "custom_components.ha_dashboard_cards.async_remove_cards_and_resources",
                AsyncMock(),
        ) as mock_remove:
            await async_remove_entry(mock_hass, mock_config_entry)

        mock_remove.assert_awaited_once_with(mock_hass)
