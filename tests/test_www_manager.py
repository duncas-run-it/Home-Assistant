from __future__ import annotations

from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch


class TestAsyncSetupCards:

    async def test_copies_files_to_www(self, mock_hass, tmp_path):
        target = tmp_path / "www" / "ha_dashboard_cards"
        www = tmp_path / "www"

        source_dir = tmp_path / "source_www"
        source_dir.mkdir(parents=True)
        (source_dir / "synology-card.js").write_text("// synology")
        (source_dir / "rapsberry-pi.js").write_text("// pi")

        with patch(
                "custom_components.ha_dashboard_cards.www_manager.WWW_SOURCE_DIR",
                source_dir,
        ):
            from custom_components.ha_dashboard_cards.www_manager import (
                async_setup_cards,
            )

            with patch.object(
                    mock_hass.config, "path", return_value=str(www)
            ):
                result = await async_setup_cards(mock_hass)

        assert result is True
        assert (target / "synology-card.js").exists()
        assert (target / "rapsberry-pi.js").exists()
        assert (target / "synology-card.js").read_text() == "// synology"

    async def test_creates_www_dir_if_missing(self, mock_hass, tmp_path):
        config_dir = tmp_path / "config"

        source_dir = tmp_path / "source_www"
        source_dir.mkdir()
        (source_dir / "synology-card.js").write_text("// s")

        with patch(
                "custom_components.ha_dashboard_cards.www_manager.WWW_SOURCE_DIR",
                source_dir,
        ):
            from custom_components.ha_dashboard_cards.www_manager import (
                async_setup_cards,
            )

            with patch.object(
                    mock_hass.config, "path", return_value=str(config_dir)
            ):
                result = await async_setup_cards(mock_hass)

        assert result is True
        assert (config_dir / "ha_dashboard_cards" / "synology-card.js").exists()

    async def test_skips_missing_source_files(self, mock_hass, tmp_path):
        www = tmp_path / "www"
        target = www / "ha_dashboard_cards"

        source_dir = tmp_path / "empty_source"
        source_dir.mkdir()

        with patch(
                "custom_components.ha_dashboard_cards.www_manager.WWW_SOURCE_DIR",
                source_dir,
        ):
            from custom_components.ha_dashboard_cards.www_manager import (
                async_setup_cards,
            )

            with patch.object(
                    mock_hass.config, "path", return_value=str(www)
            ):
                result = await async_setup_cards(mock_hass)

        assert result is True
        assert target.exists()
        assert len(list(target.iterdir())) == 0

    async def test_returns_false_on_exception(self, mock_hass):
        with patch(
                "custom_components.ha_dashboard_cards.www_manager.Path.exists",
                side_effect=PermissionError("nope"),
        ):
            from custom_components.ha_dashboard_cards.www_manager import (
                async_setup_cards,
            )

            result = await async_setup_cards(mock_hass)

        assert result is False

    async def test_calls_perms_after_copy(self, mock_hass, tmp_path):
        target_dir = tmp_path / "www" / "ha_dashboard_cards"

        source_dir = tmp_path / "src"
        source_dir.mkdir()
        (source_dir / "synology-card.js").write_text("// s")
        (source_dir / "rapsberry-pi.js").write_text("// p")

        chmod = MagicMock()

        with patch(
                "custom_components.ha_dashboard_cards.www_manager.WWW_SOURCE_DIR",
                source_dir,
        ):
            with patch(
                    "custom_components.ha_dashboard_cards.www_manager.shutil.copy2",
                    side_effect=lambda src, dst: None,
            ):
                with patch(
                        "custom_components.ha_dashboard_cards.www_manager.os.chmod",
                        chmod,
                ):
                    from custom_components.ha_dashboard_cards.www_manager import (
                        async_setup_cards,
                    )

                    with patch.object(
                            mock_hass.config,
                            "path",
                            return_value=str(tmp_path / "www"),
                    ):
                        result = await async_setup_cards(mock_hass)

        assert result is True
        assert chmod.call_count == 2
        for card in ("synology-card.js", "rapsberry-pi.js"):
            called_paths = [str(c[0][0]) for c in chmod.call_args_list]
            assert str(target_dir / card) in called_paths


class TestAsyncRegisterCards:

    async def test_skips_when_lovelace_not_loaded(self, mock_hass):
        from custom_components.ha_dashboard_cards.www_manager import (
            async_register_cards,
        )

        with patch(
                "custom_components.ha_dashboard_cards.www_manager._LOGGER"
        ) as mock_log:
            await async_register_cards(mock_hass)

        mock_log.debug.assert_called_once_with(
            "Lovelace not loaded, skipping"
        )

    async def test_retries_when_resources_not_loaded(
            self, mock_hass, mock_lovelace_resources
    ):
        resources = mock_lovelace_resources(mock_hass)
        resources.loaded = False

        from custom_components.ha_dashboard_cards.www_manager import (
            async_register_cards,
        )
        from homeassistant.helpers.event import async_call_later

        async_call_later.reset_mock()
        await async_register_cards(mock_hass)

        async_call_later.assert_called_once()
        args, _ = async_call_later.call_args
        assert args[0] is mock_hass
        assert args[1] == 5

    async def test_creates_new_resources(
            self, mock_hass, mock_lovelace_resources
    ):
        resources = mock_lovelace_resources(mock_hass)
        resources.async_items.return_value = []

        from custom_components.ha_dashboard_cards.www_manager import (
            async_register_cards,
        )

        await async_register_cards(mock_hass)

        assert resources.async_create_item.call_count == 2
        calls = resources.async_create_item.call_args_list
        urls = [c[0][0]["url"] for c in calls]
        assert any("synology-card.js" in u for u in urls)
        assert any("rapsberry-pi.js" in u for u in urls)

    async def test_updates_existing_resource_with_new_version(
            self, mock_hass, mock_lovelace_resources
    ):
        existing = {
            "id": "res_1",
            "res_type": "module",
            "url": "/local/ha_dashboard_cards/synology-card.js?v=0.9.0",
        }
        resources = mock_lovelace_resources(mock_hass)
        resources.async_items.return_value = [existing]

        from custom_components.ha_dashboard_cards.www_manager import (
            async_register_cards,
        )

        await async_register_cards(mock_hass)

        resources.async_update_item.assert_called_once()
        args = resources.async_update_item.call_args[0]
        assert args[0] == "res_1"
        assert "v=1.0.0" in args[1]["url"]

    async def test_skips_resource_with_matching_url(
            self, mock_hass, mock_lovelace_resources
    ):
        existing = [
            {
                "id": "res_1",
                "res_type": "module",
                "url": "/local/ha_dashboard_cards/synology-card.js?v=1.0.0",
            },
            {
                "id": "res_2",
                "res_type": "module",
                "url": "/local/ha_dashboard_cards/rapsberry-pi.js?v=1.0.0",
            },
        ]
        resources = mock_lovelace_resources(mock_hass)
        resources.async_items.return_value = existing

        from custom_components.ha_dashboard_cards.www_manager import (
            async_register_cards,
        )

        await async_register_cards(mock_hass)

        resources.async_create_item.assert_not_called()
        resources.async_update_item.assert_not_called()

    async def test_handles_create_exception(
            self, mock_hass, mock_lovelace_resources
    ):
        resources = mock_lovelace_resources(mock_hass)
        resources.async_items.return_value = []
        resources.async_create_item.side_effect = Exception("create fail")

        from custom_components.ha_dashboard_cards.www_manager import (
            async_register_cards,
        )

        with patch(
                "custom_components.ha_dashboard_cards.www_manager._LOGGER"
        ) as mock_log:
            await async_register_cards(mock_hass)

        mock_log.error.assert_called()
        assert any("create fail" in str(c) for c in mock_log.error.call_args_list)

    async def test_handles_update_exception(
            self, mock_hass, mock_lovelace_resources
    ):
        existing = {
            "id": "res_1",
            "res_type": "module",
            "url": "/local/ha_dashboard_cards/synology-card.js?v=0.9.0",
        }
        resources = mock_lovelace_resources(mock_hass)
        resources.async_items.return_value = [existing]
        resources.async_update_item.side_effect = Exception("update fail")

        from custom_components.ha_dashboard_cards.www_manager import (
            async_register_cards,
        )

        with patch(
                "custom_components.ha_dashboard_cards.www_manager._LOGGER"
        ) as mock_log:
            await async_register_cards(mock_hass)

        mock_log.error.assert_called()
        assert any("update fail" in str(c) for c in mock_log.error.call_args_list)

    async def test_chmod_oserror_is_silent(self, mock_hass, tmp_path):
        source_dir = tmp_path / "src"
        source_dir.mkdir()
        (source_dir / "synology-card.js").write_text("// s")

        with patch(
                "custom_components.ha_dashboard_cards.www_manager.WWW_SOURCE_DIR",
                source_dir,
        ):
            with patch(
                    "custom_components.ha_dashboard_cards.www_manager.shutil.copy2",
                    side_effect=lambda src, dst: None,
            ):
                from custom_components.ha_dashboard_cards.www_manager import (
                    async_setup_cards,
                )

                with patch.object(
                        mock_hass.config, "path", return_value=str(tmp_path / "www")
                ):
                    with patch(
                            "custom_components.ha_dashboard_cards.www_manager.os.chmod",
                            side_effect=OSError("permission denied"),
                    ):
                        result = await async_setup_cards(mock_hass)

        assert result is True


class TestAsyncRemoveCardsAndResources:

    async def test_removes_www_directory(self, mock_hass, tmp_path):
        target_dir = tmp_path / "www" / "ha_dashboard_cards"
        target_dir.mkdir(parents=True)
        (target_dir / "synology-card.js").write_text("// s")

        from custom_components.ha_dashboard_cards.www_manager import (
            async_remove_cards_and_resources,
        )

        with patch.object(
                mock_hass.config, "path", return_value=str(tmp_path / "www")
        ):
            await async_remove_cards_and_resources(mock_hass)

        assert not target_dir.exists()

    async def test_no_error_when_directory_missing(self, mock_hass, tmp_path):
        from custom_components.ha_dashboard_cards.www_manager import (
            async_remove_cards_and_resources,
        )

        with patch.object(
                mock_hass.config, "path", return_value=str(tmp_path / "www")
        ):
            await async_remove_cards_and_resources(mock_hass)

        no_error = True
        assert no_error

    async def test_removes_lovelace_resources(
            self, mock_hass, mock_lovelace_resources
    ):
        resources = mock_lovelace_resources(mock_hass)
        resources.async_items.return_value = [
            {
                "id": "r1",
                "url": "/local/ha_dashboard_cards/synology-card.js?v=1.0.0",
            },
            {
                "id": "r2",
                "url": "/local/ha_dashboard_cards/rapsberry-pi.js?v=1.0.0",
            },
        ]

        from custom_components.ha_dashboard_cards.www_manager import (
            async_remove_cards_and_resources,
        )

        with patch.object(
                mock_hass.config,
                "path",
                return_value=str(Path.home() / "tmp_test_www"),
        ):
            await async_remove_cards_and_resources(mock_hass)

        assert resources.async_delete_item.call_count == 2
        deleted_ids = {
            c[0][0] for c in resources.async_delete_item.call_args_list
        }
        assert deleted_ids == {"r1", "r2"}

    async def test_handles_exception(self, mock_hass, tmp_path):
        target_base = tmp_path / "config"
        (target_base / "ha_dashboard_cards").mkdir(parents=True)

        from custom_components.ha_dashboard_cards.www_manager import (
            async_remove_cards_and_resources,
        )

        with patch(
                "custom_components.ha_dashboard_cards.www_manager.shutil.rmtree",
                side_effect=PermissionError("denied"),
        ):
            with patch(
                    "custom_components.ha_dashboard_cards.www_manager._LOGGER"
            ) as mock_log:
                with patch.object(
                        mock_hass.config, "path", return_value=str(target_base)
                ):
                    await async_remove_cards_and_resources(mock_hass)

            mock_log.error.assert_called_once()


class TestAsyncRegisterResourcesService:

    async def test_registers_service(self, mock_hass, mock_lovelace_resources):
        mock_lovelace_resources(mock_hass)

        from custom_components.ha_dashboard_cards.www_manager import (
            async_register_resources_service,
        )

        await async_register_resources_service(mock_hass)

        assert ("ha_dashboard_cards", "register_card_resources") in mock_hass.services._registry

    async def test_service_calls_register_cards(
            self, mock_hass, mock_lovelace_resources
    ):
        resources = mock_lovelace_resources(mock_hass)
        resources.async_items.return_value = []
        resources.async_create_item = AsyncMock()

        from custom_components.ha_dashboard_cards.www_manager import (
            async_register_resources_service,
        )

        await async_register_resources_service(mock_hass)

        handler = mock_hass.services._registry[
            ("ha_dashboard_cards", "register_card_resources")
        ]
        await handler(None)

        assert resources.async_create_item.call_count == 2
