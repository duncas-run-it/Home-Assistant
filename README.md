A collection of sleek, custom Lovelace dashboard cards for Home Assistant with built-in haptic feedback and visual editors.

## Installation (HACS)

1. Go to **HACS → Frontend → ⋮ → Custom repositories**
2. Add `https://github.com/duncas-run-it/Home-Assistant` with category **Lovelace**
3. Click **Install** on the desired card(s)
4. Add the card resource: **Settings → Dashboards → Resources → Add Resource**
   - URL: `/hacsfiles/home-assistant/synology-card.js`
   - Type: **JavaScript Module**
5. Repeat for additional cards if needed
6. Refresh your browser (or use the HA refresh button)

## Manual Install

Copy the desired `.js` file to `<config>/www/`, then add it as a resource:
- **Settings → Dashboards → Resources → Add Resource**
- URL: `/local/synology-card.js` (or `/local/rapsberry-pi.js`)
- Type: **JavaScript Module**

## Cards

### Synology NAS Dashboard (`synology-card.js`)

A sleek Lovelace custom card for monitoring your Synology NAS. Displays CPU, RAM, storage, disk health, network, temperature, uptime, security status, and DSM update info.

Type: `custom:synology-card`

#### Configuration

| Option | Description |
|--------|-------------|
| `title` | Card header title (default: "Synology NAS") |
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

- **Visual editor** — configure all entities through the HA dashboard UI (no YAML required)
- **Power On button** — supports button, switch, and wake_on_lan domains
- **Shut Down button** — shows a custom in-card confirmation modal to prevent accidental shutdown
- **Haptic feedback** — vibrates on button interactions when viewed in the Home Assistant companion app (Android/iOS). Types: light on initial press, heavy on confirmed shutdown
- **Clickable stats** — tap CPU, RAM, storage, network, or temperature to open the more-info dialog

### Raspberry Pi Card (`rapsberry-pi.js`)

A modern health monitor for Raspberry Pi with CPU temperature, RAM usage, disk space, power status, and uptime.

Type: `custom:raspberry-pi`

#### Configuration

| Option | Description |
|--------|-------------|
| `title` | Card header title (default: "Raspberry Pi") |
| `temp_entity` | Sensor entity for CPU temperature |
| `ram_entity` | Sensor entity for RAM usage (%) |
| `disk_entity` | Sensor entity for disk usage (%) |
| `power_entity` | Binary sensor for under-voltage detection (`on` = problem, `off` = OK) |
| `uptime_entity` | (Optional) Sensor for system uptime |

#### Features

- **Visual editor** — configure all entities through the HA dashboard UI
- **Progress bars** — RAM and disk usage show visual bars with color thresholds
- **Under-voltage alert** — red warning box when power issues detected
- **Haptic feedback** — light tap when tapping stats on the companion app
- **Clickable stats** — tap any stat to open the more-info dialog
- **Uptime display** — auto-formats timestamps, epoch, and seconds into human-readable durations
