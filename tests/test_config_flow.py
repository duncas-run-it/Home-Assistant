from __future__ import annotations

from unittest.mock import MagicMock


class TestHaDashboardCardsConfigFlow:

    async def test_step_user_shows_form(self):
        from custom_components.ha_dashboard_cards.config_flow import (
            HaDashboardCardsConfigFlow,
        )

        flow = HaDashboardCardsConfigFlow()
        result = await flow.async_step_user(user_input=None)

        assert result["type"] == "form"
        assert result["step_id"] == "user"

    async def test_step_user_creates_entry(self):
        from custom_components.ha_dashboard_cards.config_flow import (
            HaDashboardCardsConfigFlow,
        )

        flow = HaDashboardCardsConfigFlow()
        result = await flow.async_step_user(user_input={})

        assert result["type"] == "create_entry"
        assert result["title"] == "HA Dashboard Cards"
        assert result["data"] == {}

    async def test_step_user_aborts_if_already_configured(self):
        from custom_components.ha_dashboard_cards.config_flow import (
            HaDashboardCardsConfigFlow,
        )

        flow = HaDashboardCardsConfigFlow()

        flow._async_current_entries = MagicMock(return_value=["existing"])

        result = await flow.async_step_user(user_input={})

        assert result["type"] == "abort"
        assert result["reason"] == "single_instance_allowed"

    async def test_options_flow_init_shows_form(self):
        from custom_components.ha_dashboard_cards.config_flow import (
            HaDashboardCardsOptionsFlow,
        )

        flow = HaDashboardCardsOptionsFlow()
        result = await flow.async_step_init(user_input=None)

        assert result["type"] == "form"
        assert result["step_id"] == "init"

    async def test_options_flow_init_submit(self):
        from custom_components.ha_dashboard_cards.config_flow import (
            HaDashboardCardsOptionsFlow,
        )

        flow = HaDashboardCardsOptionsFlow()
        result = await flow.async_step_init(user_input={})

        assert result["type"] == "create_entry"
        assert result["data"] == {}

    async def test_async_get_options_flow(self):
        from custom_components.ha_dashboard_cards.config_flow import (
            HaDashboardCardsConfigFlow,
            HaDashboardCardsOptionsFlow,
        )

        flow = HaDashboardCardsConfigFlow()
        entry = MagicMock()
        options_flow = flow.async_get_options_flow(entry)

        assert isinstance(options_flow, HaDashboardCardsOptionsFlow)
