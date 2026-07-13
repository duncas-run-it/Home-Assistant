A repo containing custom cards formed from JavaScript to showcase dashboards for Synology NAS and Raspberry Pi.

## Cards

### Synology NAS Dashboard (`synology-card.js`)

A sleek Lovelace custom card for monitoring your Synology NAS. Displays CPU, RAM, storage, disk health, network, temperature, uptime, security status, and DSM update info.

#### Configuration

| Option | Description |
|--------|-------------|
| `cpu_entity` | Sensor entity for CPU usage (%) |
| `memory_entity` | Sensor entity for RAM usage (%) |
| `volume_entity` | Sensor entity for storage volume (state or attributes with `used`/`total`) |
| `volume_used_entity` | (Optional) Separate sensor for volume used |
| `volume_total_entity` | (Optional) Separate sensor for volume total |
| `disk_entities` | Array of binary_sensor entities for disk health |
| `network_up_entity` | Sensor for upload speed |
| `network_down_entity` | Sensor for download speed |
| `temperature_entity` | Sensor for NAS temperature |
| `uptime_entity` | Sensor for system uptime |
| `security_entity` | Sensor for security status (e.g. "normal", "warning") |
| `update_entity` | Sensor for DSM update status |
| `power_on_entity` | Entity to power on the NAS (button, switch, or wake_on_lan) |
| `shutdown_entity` | Button entity to shut down the NAS |

#### Features

- **Power On button** — supports button, switch, and wake_on_lan domains
- **Shut Down button** — shows a custom in-card confirmation modal to prevent accidental shutdown
- **Haptic feedback** — vibrates on button interactions when viewed in the Home Assistant companion app (Android/iOS). Types: light on initial press, heavy on confirmed shutdown
- **Clickable stats** — tap CPU, RAM, storage, network, or temperature to open the more-info dialog

### Raspberry Pi Card (`rapsberry-pi.js`)

A basic health card for Raspberry Pi monitoring.
