class RpiCard extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      const card = document.createElement('ha-card');
      card.style.overflow = 'visible';
      card.header = this.config.title || 'Raspberry Pi';
      this.content = document.createElement('div');
      this.content.style.padding = '0 16px 20px';

      this.content.innerHTML = `
        <style>
          .rpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .rpi-stat { background: linear-gradient(135deg, var(--secondary-background-color, #f8fafc), var(--primary-background-color, #ffffff)); padding: 16px; border-radius: 14px; text-align: center; border: 1px solid var(--divider-color, #e2e8f0); transition: all 0.25s ease; }
          .rpi-stat:hover { box-shadow: 0 6px 16px rgba(0,0,0,0.08); transform: translateY(-2px); border-color: #3b82f6; }
          .rpi-icon { font-size: 1.5em; margin-bottom: 4px; }
          .rpi-value { font-size: 1.4em; font-weight: 700; color: var(--primary-text-color, #0f172a); }
          .rpi-value.small { font-size: 1em; }
          .rpi-label { font-size: 0.7em; color: var(--secondary-text-color, #64748b); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-top: 2px; }
          .rpi-bar { height: 8px; background: var(--divider-color, #e2e8f0); border-radius: 4px; overflow: hidden; margin-top: 6px; }
          .rpi-bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
          .rpi-bar-fill.green { background: linear-gradient(90deg, #22c55e, #4ade80); }
          .rpi-bar-fill.yellow { background: linear-gradient(90deg, #eab308, #facc15); }
          .rpi-bar-fill.red { background: linear-gradient(90deg, #ef4444, #f87171); }
          .rpi-bar-fill.blue { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
          .rpi-clickable { cursor: pointer; }
          .rpi-clickable:hover { border-color: #3b82f6 !important; }
          .rpi-warning { margin-top: 14px; padding: 12px 16px; border-radius: 10px; font-size: 0.85em; background: linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.05)); border: 1px solid rgba(239,68,68,0.3); }
          .rpi-warning-title { font-weight: 700; color: #dc2626; margin-bottom: 2px; display: flex; align-items: center; gap: 6px; }
          .rpi-warning-text { color: var(--secondary-text-color, #64748b); font-size: 0.85em; }
          .rpi-full { grid-column: 1 / -1; }
        </style>

        <div class="rpi-grid">
          <div class="rpi-stat rpi-clickable" id="rpi-temp-stat">
            <div class="rpi-icon">&#x1F9CA;</div>
            <div class="rpi-value" id="rpi-temp">--</div>
            <div class="rpi-label">CPU Temp</div>
          </div>
          <div class="rpi-stat rpi-clickable" id="rpi-ram-stat">
            <div class="rpi-icon">&#x1F9E0;</div>
            <div class="rpi-value" id="rpi-ram">--</div>
            <div class="rpi-label">RAM</div>
            <div class="rpi-bar"><div class="rpi-bar-fill blue" id="rpi-ram-bar" style="width:0%"></div></div>
          </div>
          <div class="rpi-stat rpi-clickable" id="rpi-disk-stat">
            <div class="rpi-icon">&#x1F4BE;</div>
            <div class="rpi-value" id="rpi-disk">--</div>
            <div class="rpi-label">Disk</div>
            <div class="rpi-bar"><div class="rpi-bar-fill green" id="rpi-disk-bar" style="width:0%"></div></div>
          </div>
          <div class="rpi-stat rpi-clickable" id="rpi-power-stat">
            <div class="rpi-icon">&#x26A1;</div>
            <div class="rpi-value" id="rpi-status" style="color:#10b981;font-size:1em">OK</div>
            <div class="rpi-label">Power</div>
          </div>
          <div class="rpi-stat rpi-full rpi-clickable" id="rpi-uptime-stat">
            <div class="rpi-icon">&#x23F0;</div>
            <div class="rpi-value" id="rpi-uptime">--</div>
            <div class="rpi-label">Uptime</div>
          </div>
        </div>

        <div class="rpi-warning" id="rpi-warning-box" style="display:none">
          <div class="rpi-warning-title">&#x26A0;&#xFE0F; Under-Voltage Warning</div>
          <div class="rpi-warning-text">Your power supply does not provide enough power! This can lead to SD card failures or crashes.</div>
        </div>
      `;
      card.appendChild(this.content);
      this.appendChild(card);

      const open = (entityId) => {
        if (entityId) {
          this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId }, bubbles: true, composed: true }));
        }
      };
      const clickable = (id, entityId) => {
        const el = this.querySelector('#' + id);
        if (el) el.addEventListener('click', () => {
          this._haptic('light');
          open(entityId);
        });
      };
      clickable('rpi-temp-stat', this.config.temp_entity);
      clickable('rpi-ram-stat', this.config.ram_entity);
      clickable('rpi-disk-stat', this.config.disk_entity);
      clickable('rpi-power-stat', this.config.power_entity);
      clickable('rpi-uptime-stat', this.config.uptime_entity);
    }

    const qs = (id) => this.querySelector('#' + id);

    const tempEntity = this.config.temp_entity ? hass.states[this.config.temp_entity] : null;
    const ramEntity = this.config.ram_entity ? hass.states[this.config.ram_entity] : null;
    const diskEntity = this.config.disk_entity ? hass.states[this.config.disk_entity] : null;
    const powerEntity = this.config.power_entity ? hass.states[this.config.power_entity] : null;
    const uptimeEntity = this.config.uptime_entity ? hass.states[this.config.uptime_entity] : null;

    if (tempEntity) {
      const el = qs('rpi-temp');
      if (el) el.innerText = tempEntity.state + (tempEntity.attributes.unit_of_measurement || '°C');
    }
    if (ramEntity) {
      const v = parseFloat(ramEntity.state) || 0;
      const pct = Math.min(v, 100);
      const el = qs('rpi-ram');
      if (el) el.innerText = v.toFixed(1) + '%';
      const bar = qs('rpi-ram-bar');
      if (bar) {
        bar.style.width = pct + '%';
        bar.className = 'rpi-bar-fill ' + (pct > 80 ? 'red' : pct > 50 ? 'yellow' : 'blue');
      }
    }
    if (diskEntity) {
      const v = parseFloat(diskEntity.state) || 0;
      const pct = Math.min(v, 100);
      const el = qs('rpi-disk');
      if (el) el.innerText = pct.toFixed(0) + '%';
      const bar = qs('rpi-disk-bar');
      if (bar) {
        bar.style.width = pct + '%';
        bar.className = 'rpi-bar-fill ' + (pct > 90 ? 'red' : pct > 70 ? 'yellow' : 'green');
      }
    }
    if (uptimeEntity) {
      const el = qs('rpi-uptime');
      if (el) el.innerText = this._formatUptime(uptimeEntity.state, uptimeEntity.attributes);
    }

    const warningBox = qs('rpi-warning-box');
    const statusText = qs('rpi-status');

    let hasPowerIssue = false;
    if (powerEntity) {
      const state = powerEntity.state.toLowerCase();
      if (state === 'on' || state === 'true' || state === 'problem') {
        hasPowerIssue = true;
      }
    }

    if (hasPowerIssue) {
      if (statusText) { statusText.innerText = 'Voltage Drop'; statusText.style.color = '#ef4444'; }
      if (warningBox) warningBox.style.display = 'block';
    } else {
      if (statusText) { statusText.innerText = 'OK'; statusText.style.color = '#10b981'; }
      if (warningBox) warningBox.style.display = 'none';
    }
  }

  _haptic(type) {
    const event = new Event('haptic', { bubbles: true, composed: true });
    event.detail = type;
    window.dispatchEvent(event);
  }

  _formatUptime(state, attributes) {
    if (!state) return '--';
    const looksLikeDate = /^\d{4}[-/]/.test(state) || state.includes('T') || state.includes(' at ') || state.match(/[A-Z][a-z]+ \d{1,2}, \d{4}/);
    if (looksLikeDate) {
      const parsed = Date.parse(state);
      if (!isNaN(parsed)) {
        const diff = Math.floor((Date.now() - parsed) / 1000);
        if (diff > 0) return this._secondsToDuration(diff);
      }
      return state;
    }
    const num = parseFloat(state);
    if (!isNaN(num) && num > 1000000000) {
      const diff = Math.floor(Date.now() / 1000 - num);
      if (diff > 0 && diff < 315360000) return this._secondsToDuration(diff);
      return this._secondsToDuration(num);
    }
    if (!isNaN(num) && num > 0 && num < 315360000) {
      return this._secondsToDuration(num);
    }
    return state;
  }

  _secondsToDuration(totalSeconds) {
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    let parts = [];
    if (d > 0) parts.push(d + 'd');
    if (h > 0) parts.push(h + 'h');
    parts.push(m + 'm');
    return parts.join(' ');
  }

  setConfig(config) {
    if (!config.temp_entity) {
      console.warn('RPI Card: No temp_entity defined');
    }
    this.config = config;
  }

  getCardSize() {
    return 4;
  }
}

customElements.define('raspberry-pi', RpiCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'raspberry-pi',
  name: 'Raspberry Pi Health Card',
  description: 'A clean, modern health monitor for your Raspberry Pi with under-voltage warnings.'
});
