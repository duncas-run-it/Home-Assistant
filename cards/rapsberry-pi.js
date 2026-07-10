class RpiCard extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      const card = document.createElement('ha-card');
      card.header = this.config.title || 'Raspberry Pi Health';
      this.content = document.createElement('div');
      this.content.style.padding = '0 16px 16px';
      
      this.content.innerHTML = `
        <style>
          .rpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .rpi-stat { background: var(--secondary-background-color, #f8fafc); padding: 15px; border-radius: 12px; text-align: center; border: 1px solid var(--divider-color, #e2e8f0); transition: all 0.2s ease; }
          .rpi-stat:hover { box-shadow: 0 4px 6px rgba(0,0,0,0.05); transform: translateY(-2px); }
          .rpi-value { font-size: 1.6em; font-weight: 700; color: var(--primary-text-color, #0f172a); margin-top: 5px; }
          .rpi-label { font-size: 0.75em; color: var(--secondary-text-color, #64748b); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px; }
          
          .rpi-warning { margin-top: 15px; padding: 15px; background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; border-radius: 6px; display: none; }
          .rpi-warning-title { font-weight: bold; color: #ef4444; font-size: 1.1em; margin-bottom: 5px; display: flex; align-items: center; }
          .rpi-warning-text { font-size: 0.9em; color: var(--primary-text-color); margin-bottom: 10px; }
          .rpi-warning a { display: inline-block; background: #ef4444; color: white !important; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-size: 0.85em; font-weight: bold; }
          .rpi-warning a:hover { background: #dc2626; }
        </style>

        <div class="rpi-grid">
          <div class="rpi-stat">
            <div class="rpi-label">CPU Temp</div>
            <div class="rpi-value" id="rpi-temp">--</div>
          </div>
          <div class="rpi-stat">
            <div class="rpi-label">RAM Usage</div>
            <div class="rpi-value" id="rpi-ram">--</div>
          </div>
          <div class="rpi-stat">
            <div class="rpi-label">Disk Space</div>
            <div class="rpi-value" id="rpi-disk">--</div>
          </div>
          <div class="rpi-stat">
            <div class="rpi-label">Power Status</div>
            <div class="rpi-value" id="rpi-status" style="color: #10b981;">OK</div>
          </div>
        </div>

        <div class="rpi-warning" id="rpi-warning-box">
          <div class="rpi-warning-title">⚠️ Under-Voltage Warning</div>
          <div class="rpi-warning-text">Your power supply does not provide enough power! This can lead to SD card failures or crashes.</div>
        </div>
      `;
      card.appendChild(this.content);
      this.appendChild(card);
    }

    const tempEntity = this.config.temp_entity ? hass.states[this.config.temp_entity] : null;
    const ramEntity = this.config.ram_entity ? hass.states[this.config.ram_entity] : null;
    const diskEntity = this.config.disk_entity ? hass.states[this.config.disk_entity] : null;
    const powerEntity = this.config.power_entity ? hass.states[this.config.power_entity] : null;

    if (tempEntity) this.querySelector('#rpi-temp').innerText = tempEntity.state + (tempEntity.attributes.unit_of_measurement || '°C');
    if (ramEntity) this.querySelector('#rpi-ram').innerText = ramEntity.state + (ramEntity.attributes.unit_of_measurement || '%');
    if (diskEntity) this.querySelector('#rpi-disk').innerText = diskEntity.state + (diskEntity.attributes.unit_of_measurement || '%');

    const warningBox = this.querySelector('#rpi-warning-box');
    const statusText = this.querySelector('#rpi-status');

    // Logic for Raspberry Pi Under-Voltage sensor (binary_sensor.rpi_power_status)
    // Often "on" means problem detected, "off" means OK.
    let hasPowerIssue = false;
    if (powerEntity) {
      const state = powerEntity.state.toLowerCase();
      if (state === 'on' || state === 'true' || state === 'problem') {
        hasPowerIssue = true;
      }
    }

    if (hasPowerIssue) {
      statusText.innerText = 'Voltage Drop';
      statusText.style.color = '#ef4444';
      warningBox.style.display = 'block';
    } else {
      statusText.innerText = 'OK';
      statusText.style.color = '#10b981';
      warningBox.style.display = 'none';
    }
  }

  setConfig(config) {
    if (!config.temp_entity) {
      console.warn("RPI Card: No temp_entity defined");
    }
    this.config = config;
  }

  getCardSize() {
    return 3;
  }
}

customElements.define('raspberry-pi', RpiCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "raspberry-pi",
  name: "Raspberry Pi Health Card",
  description: "A clean, modern health monitor for your Raspberry Pi with under-voltage warnings."
});

