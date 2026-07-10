class SynologyCard extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      const card = document.createElement('ha-card');
      card.style.overflow = 'visible';
      card.header = this.config.title || 'Synology NAS';
      this.content = document.createElement('div');
      this.content.style.padding = '0 16px 20px';
      
      this.content.innerHTML = `
        <style>
          .syno-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .syno-stat { background: linear-gradient(135deg, var(--secondary-background-color, #f8fafc), var(--primary-background-color, #ffffff)); padding: 16px; border-radius: 14px; text-align: center; border: 1px solid var(--divider-color, #e2e8f0); transition: all 0.25s ease; }
          .syno-stat:hover { box-shadow: 0 6px 16px rgba(0,0,0,0.08); transform: translateY(-2px); border-color: #3b82f6; }
          .syno-icon { font-size: 1.5em; margin-bottom: 4px; }
          .syno-value { font-size: 1.5em; font-weight: 700; color: var(--primary-text-color, #0f172a); }
          .syno-label { font-size: 0.7em; color: var(--secondary-text-color, #64748b); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-top: 2px; }
          .syno-unit { font-size: 0.6em; font-weight: 400; color: var(--secondary-text-color, #94a3b8); }
          .syno-section { margin-top: 16px; }
          .syno-section-title { font-size: 0.75em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #3b82f6; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid rgba(59,130,246,0.2); display: flex; align-items: center; gap: 6px; }
          .syno-full { grid-column: 1 / -1; }
          .syno-bar { height: 10px; background: var(--divider-color, #e2e8f0); border-radius: 5px; overflow: hidden; margin-top: 8px; }
          .syno-bar-fill { height: 100%; border-radius: 5px; transition: width 0.6s ease; }
          .syno-bar-fill.green { background: linear-gradient(90deg, #22c55e, #4ade80); }
          .syno-bar-fill.yellow { background: linear-gradient(90deg, #eab308, #facc15); }
          .syno-bar-fill.red { background: linear-gradient(90deg, #ef4444, #f87171); }
          .syno-bar-fill.blue { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
          .syno-disk { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: linear-gradient(135deg, var(--secondary-background-color, #f8fafc), var(--primary-background-color, #ffffff)); border-radius: 10px; margin-bottom: 8px; border: 1px solid var(--divider-color, #e2e8f0); }
          .syno-disk:last-child { margin-bottom: 0; }
          .syno-disk-name { font-size: 0.85em; font-weight: 600; color: var(--primary-text-color); }
          .syno-disk-status { font-size: 0.75em; padding: 3px 10px; border-radius: 20px; font-weight: 600; }
          .syno-disk-status.normal { background: rgba(34,197,94,0.15); color: #16a34a; }
          .syno-disk-status.warning { background: rgba(234,179,8,0.15); color: #ca8a04; }
          .syno-disk-status.critical { background: rgba(239,68,68,0.15); color: #dc2626; }
          .syno-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 0.9em; border-bottom: 1px solid var(--divider-color, rgba(226,232,240,0.3)); }
          .syno-row:last-child { border-bottom: none; }
          .syno-row-label { color: var(--secondary-text-color, #64748b); display: flex; align-items: center; gap: 6px; }
          .syno-row-value { font-weight: 700; color: var(--primary-text-color); }
          .syno-alert-box { margin-top: 12px; padding: 12px 16px; border-radius: 10px; font-size: 0.85em; display: none; }
          .syno-alert-box.show { display: block; }
          .syno-alert-box.warning { background: linear-gradient(135deg, rgba(234,179,8,0.12), rgba(234,179,8,0.05)); border: 1px solid rgba(234,179,8,0.3); }
          .syno-alert-box.critical { background: linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.05)); border: 1px solid rgba(239,68,68,0.3); }
          .syno-alert-box.success { background: linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.05)); border: 1px solid rgba(34,197,94,0.3); display: block; }
          .syno-alert-title { font-weight: 700; margin-bottom: 2px; display: flex; align-items: center; gap: 6px; }
          .syno-alert-box.warning .syno-alert-title { color: #ca8a04; }
          .syno-alert-box.critical .syno-alert-title { color: #dc2626; }
          .syno-alert-box.success .syno-alert-title { color: #16a34a; }
          .syno-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 16px; padding-top: 4px; }
          .syno-btn { padding: 12px; border: none; border-radius: 12px; font-weight: 700; font-size: 0.85em; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 6px; }
          .syno-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.15); }
          .syno-btn:active { transform: translateY(0); }
          .syno-btn.power { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; }
          .syno-btn.power:hover { background: linear-gradient(135deg, #4ade80, #22c55e); }
          .syno-btn.shutdown { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }
          .syno-btn.shutdown:hover { background: linear-gradient(135deg, #f87171, #ef4444); }
          .syno-status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 0.75em; font-weight: 600; }
          .syno-status-badge.ok { background: rgba(34,197,94,0.15); color: #16a34a; }
          .syno-status-badge.warning { background: rgba(234,179,8,0.15); color: #ca8a04; }
          .syno-status-badge.critical { background: rgba(239,68,68,0.15); color: #dc2626; }
          .syno-status-badge.neutral { background: rgba(100,116,139,0.15); color: #64748b; }
          .syno-clickable { cursor: pointer; }
          .syno-clickable:hover { border-color: #3b82f6 !important; }
          .syno-row.syno-clickable:hover { background: rgba(59,130,246,0.05); border-radius: 6px; margin: 0 -4px; padding: 8px 4px; }
        </style>

        <div class="syno-section">
          <div class="syno-section-title">&#x1F4CA; System</div>
          <div class="syno-grid">
            <div class="syno-stat syno-clickable" id="syno-cpu-stat">
              <div class="syno-icon">&#x1F5A5;</div>
              <div class="syno-value" id="syno-cpu">--</div>
              <div class="syno-label">CPU</div>
              <div class="syno-bar"><div class="syno-bar-fill blue" id="syno-cpu-bar" style="width:0%"></div></div>
            </div>
            <div class="syno-stat syno-clickable" id="syno-ram-stat">
              <div class="syno-icon">&#x1F4BE;</div>
              <div class="syno-value" id="syno-ram">--</div>
              <div class="syno-label">RAM</div>
              <div class="syno-bar"><div class="syno-bar-fill blue" id="syno-ram-bar" style="width:0%"></div></div>
            </div>
          </div>
        </div>

        <div class="syno-section">
          <div class="syno-section-title">&#x1F4E6; Storage</div>
          <div class="syno-grid">
            <div class="syno-stat syno-full syno-clickable" id="syno-volume-container">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span style="font-weight:600;font-size:0.85em;color:var(--primary-text-color)">Volume 1</span>
                <span class="syno-label" style="font-size:0.8em"><span id="syno-vol-pct">0</span>%</span>
              </div>
              <div class="syno-bar"><div class="syno-bar-fill green" id="syno-vol-bar" style="width:0%"></div></div>
              <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:0.75em">
                <span style="color:var(--secondary-text-color)"><span id="syno-vol-used">0</span></span>
                <span style="color:var(--secondary-text-color)"><span id="syno-vol-total">0</span></span>
              </div>
            </div>
          </div>
          <div id="syno-disks" style="margin-top:10px"></div>
        </div>

        <div class="syno-section">
          <div class="syno-section-title">&#x1F4E1; Network</div>
          <div class="syno-grid">
            <div class="syno-stat syno-clickable" id="syno-upload-stat">
              <div class="syno-icon">&#x2B06;&#xFE0F;</div>
              <div class="syno-value" id="syno-upload" style="font-size:1.15em">--</div>
              <div class="syno-label">Upload</div>
            </div>
            <div class="syno-stat syno-clickable" id="syno-download-stat">
              <div class="syno-icon">&#x2B07;&#xFE0F;</div>
              <div class="syno-value" id="syno-download" style="font-size:1.15em">--</div>
              <div class="syno-label">Download</div>
            </div>
          </div>
        </div>

        <div class="syno-section">
          <div class="syno-section-title">&#x1F534; Status</div>
          <div class="syno-row syno-clickable" id="syno-temp-row"><span class="syno-row-label">&#x1F321;&#xFE0F; Temperature</span><span class="syno-row-value" id="syno-temp">--</span></div>
          <div class="syno-row"><span class="syno-row-label">&#x23F1;&#xFE0F; Uptime</span><span class="syno-row-value" id="syno-uptime">--</span></div>
          <div class="syno-row"><span class="syno-row-label">&#x1F6E1;&#xFE0F; Security</span><span class="syno-row-value" id="syno-security">--</span></div>
          <div class="syno-row"><span class="syno-row-label">&#x1F504; DSM Update</span><span class="syno-row-value" id="syno-update">--</span></div>
          <div id="syno-alerts"></div>
        </div>

        <div class="syno-buttons">
          <button class="syno-btn power" id="syno-btn-power"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v10M6.5 5.5a9 9 0 1 0 11 0"/></svg> Power On</button>
          <button class="syno-btn shutdown" id="syno-btn-shutdown"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4" y1="4" x2="20" y2="20"/></svg> Shut Down</button>
        </div>
      `;
      card.appendChild(this.content);
      this.appendChild(card);

      this.querySelector('#syno-btn-power').addEventListener('click', () => {
        if (this.config.power_on_entity) {
          const domain = this.config.power_on_entity.split('.')[0];
          if (domain === 'button') {
            hass.callService('button', 'press', { entity_id: this.config.power_on_entity });
          } else if (domain === 'switch') {
            hass.callService('switch', 'turn_on', { entity_id: this.config.power_on_entity });
          } else if (domain === 'wake_on_lan') {
            hass.callService('wake_on_lan', 'send_magic_packet', { mac: this.config.power_on_entity });
          }
        }
      });
      this.querySelector('#syno-btn-shutdown').addEventListener('click', () => {
        if (this.config.shutdown_entity && confirm('Shut down the NAS?')) {
          hass.callService('button', 'press', { entity_id: this.config.shutdown_entity });
        }
      });

      const open = (entityId) => {
        if (entityId) {
          this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId }, bubbles: true, composed: true }));
        }
      };
      const clickable = (id, entityId) => {
        const el = this.querySelector('#' + id);
        if (el) el.addEventListener('click', () => open(entityId));
      };
      clickable('syno-cpu-stat', this.config.cpu_entity);
      clickable('syno-ram-stat', this.config.memory_entity);
      clickable('syno-volume-container', this.config.volume_entity);
      clickable('syno-upload-stat', this.config.network_up_entity);
      clickable('syno-download-stat', this.config.network_down_entity);
      clickable('syno-temp-row', this.config.temperature_entity);
    }

    const qs = (id) => this.querySelector('#' + id);

    const cpu = this.config.cpu_entity ? hass.states[this.config.cpu_entity] : null;
    const mem = this.config.memory_entity ? hass.states[this.config.memory_entity] : null;
    const vol = this.config.volume_entity ? hass.states[this.config.volume_entity] : null;
    const volUsed = this.config.volume_used_entity ? hass.states[this.config.volume_used_entity] : null;
    const volTotal = this.config.volume_total_entity ? hass.states[this.config.volume_total_entity] : null;
    const diskEntities = this.config.disk_entities || [];
    const netUp = this.config.network_up_entity ? hass.states[this.config.network_up_entity] : null;
    const netDown = this.config.network_down_entity ? hass.states[this.config.network_down_entity] : null;
    const temp = this.config.temperature_entity ? hass.states[this.config.temperature_entity] : null;
    const uptime = this.config.uptime_entity ? hass.states[this.config.uptime_entity] : null;
    const sec = this.config.security_entity ? hass.states[this.config.security_entity] : null;
    const update = this.config.update_entity ? hass.states[this.config.update_entity] : null;

    if (cpu) {
      const v = parseFloat(cpu.state) || 0;
      const pct = Math.min(v, 100);
      const el = qs('syno-cpu');
      if (el) el.innerText = v.toFixed(1) + '%';
      const bar = qs('syno-cpu-bar');
      if (bar) {
        bar.style.width = pct + '%';
        bar.className = 'syno-bar-fill ' + (pct > 80 ? 'red' : pct > 50 ? 'yellow' : 'blue');
      }
    }
    if (mem) {
      const v = parseFloat(mem.state) || 0;
      const pct = Math.min(v, 100);
      const el = qs('syno-ram');
      if (el) el.innerText = v.toFixed(2) + '%';
      const bar = qs('syno-ram-bar');
      if (bar) {
        bar.style.width = pct + '%';
        bar.className = 'syno-bar-fill ' + (pct > 80 ? 'red' : pct > 50 ? 'yellow' : 'blue');
      }
    }

    if (vol) {
      const used = parseFloat(vol.attributes.used) || 0;
      const total = parseFloat(vol.attributes.total) || 0;
      if (used && total) {
        const pct = Math.min((used / total) * 100, 100);
        const pctEl = qs('syno-vol-pct');
        if (pctEl) pctEl.innerText = pct.toFixed(0);
        const usedEl = qs('syno-vol-used');
        if (usedEl) usedEl.innerText = this._formatBytes(used);
        const totalEl = qs('syno-vol-total');
        if (totalEl) totalEl.innerText = this._formatBytes(total);
        const bar = qs('syno-vol-bar');
        if (bar) {
          bar.style.width = pct + '%';
          bar.className = 'syno-bar-fill ' + (pct > 90 ? 'red' : pct > 70 ? 'yellow' : 'green');
        }
      } else {
        const pct = parseFloat(vol.state) || 0;
        const pctEl = qs('syno-vol-pct');
        if (pctEl) pctEl.innerText = pct.toFixed(0);
        const bar = qs('syno-vol-bar');
        if (bar) {
          bar.style.width = Math.min(pct, 100) + '%';
          bar.className = 'syno-bar-fill ' + (pct > 90 ? 'red' : pct > 70 ? 'yellow' : 'green');
        }
        if (volUsed) {
          const el = qs('syno-vol-used');
          if (el) el.innerText = this._roundWithUnit(volUsed.state, volUsed.attributes.unit_of_measurement);
        }
        if (volTotal) {
          const el = qs('syno-vol-total');
          if (el) el.innerText = this._roundWithUnit(volTotal.state, volTotal.attributes.unit_of_measurement);
        }
      }
    }

    if (netUp) {
      const el = qs('syno-upload');
      if (el) el.innerHTML = this._formatSpeed(netUp.state, netUp.attributes.unit_of_measurement);
    }
    if (netDown) {
      const el = qs('syno-download');
      if (el) el.innerHTML = this._formatSpeed(netDown.state, netDown.attributes.unit_of_measurement);
    }
    if (temp) {
      const v = parseFloat(temp.state) || 0;
      const el = qs('syno-temp');
      if (el) el.innerText = v.toFixed(0) + (temp.attributes.unit_of_measurement || '°C');
    }
    if (uptime) {
      const el = qs('syno-uptime');
      if (el) el.innerText = this._formatUptime(uptime.state, uptime.attributes);
    }
    if (sec) {
      const el = qs('syno-security');
      if (el) {
        const s = sec.state.toLowerCase();
        const good = ['normal', 'ok', 'off', 'safe', 'up_to_date', 'none', 'clear'];
        const bad = ['warning', 'critical', 'alert', 'problem', 'outdated', 'error'];
        const css = good.includes(s) ? 'ok' : bad.includes(s) ? 'critical' : 'neutral';
        const label = good.includes(s) ? 'Safe' : sec.state;
        el.innerHTML = '<span class="syno-status-badge ' + css + '">' + label + '</span>';
      }
    }
    if (update) {
      const el = qs('syno-update');
      if (el) {
        const s = update.state.toLowerCase();
        const good = ['up_to_date', 'normal', 'ok', 'off', 'none', 'current'];
        const bad = ['available', 'warning', 'critical', 'outdated'];
        const css = good.includes(s) ? 'ok' : bad.includes(s) ? 'warning' : 'neutral';
        const label = good.includes(s) ? 'Up to Date' : update.state;
        el.innerHTML = '<span class="syno-status-badge ' + css + '">' + label + '</span>';
      }
    }

    const container = qs('syno-disks');
    if (container && diskEntities.length > 0) {
      const now = Date.now();
      if (!this._diskLastUpdate || now - this._diskLastUpdate > 30000) {
        let html = '';
        for (const ent of diskEntities) {
          const s = hass.states[ent];
          if (!s) continue;
          const st = (s.state || '').toLowerCase();
          const statusClass = st === 'normal' || st === 'on' ? 'normal' : st === 'warning' ? 'warning' : 'critical';
          const statusText = st === 'on' ? 'Normal' : s.state;
          html += '<div class="syno-disk"><span class="syno-disk-name"><span style="margin-right:6px">' + this._diskIcon(st) + '</span>' + (s.attributes.friendly_name || ent) + '</span><span class="syno-disk-status ' + statusClass + '">' + statusText + '</span></div>';
        }
        container.innerHTML = html;
        this._diskLastUpdate = now;
      }
    }

    const alerts = qs('syno-alerts');
    if (alerts) {
      let alertHtml = '';
      if (sec) {
        const s = sec.state.toLowerCase();
        const good = ['normal', 'ok', 'off', 'safe', 'none', 'clear'];
        if (!good.includes(s)) {
          alertHtml += '<div class="syno-alert-box critical show"><div class="syno-alert-title">&#x26A0;&#xFE0F; Security Alert</div>' + sec.state + '</div>';
        } else {
          alertHtml += '<div class="syno-alert-box success show"><div class="syno-alert-title">&#x2705; System Secure</div>No security issues detected</div>';
        }
      }
      if (update) {
        const s = update.state.toLowerCase();
        const good = ['up_to_date', 'normal', 'ok', 'off', 'none', 'current'];
        if (!good.includes(s)) {
          alertHtml += '<div class="syno-alert-box warning show"><div class="syno-alert-title">&#x1F504; Update Available</div>' + update.state + '</div>';
        }
      }
      alerts.innerHTML = alertHtml;
    }
  }

  _diskIcon(status) {
    if (status === 'normal' || status === 'on') return '&#x1F7E2;';
    if (status === 'warning') return '&#x1F7E1;';
    return '&#x1F534;';
  }

  _formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  _formatSpeed(val, unit) {
    const num = parseFloat(val) || 0;
    if (!unit || unit === 'B/s') {
      if (num < 1024) return (num || 0).toFixed(1) + ' <span class="syno-unit">B/s</span>';
      if (num < 1048576) return (num / 1024).toFixed(1) + ' <span class="syno-unit">KB/s</span>';
      return (num / 1048576).toFixed(1) + ' <span class="syno-unit">MB/s</span>';
    }
    return val + ' <span class="syno-unit">' + (unit || '') + '</span>';
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

  _roundWithUnit(val, unit) {
    const num = parseFloat(val);
    if (isNaN(num)) return val + (unit ? ' ' + unit : '');
    return num.toFixed(2) + ' ' + (unit || '');
  }

  setConfig(config) {
    if (!config.cpu_entity) console.warn('Synology Card: Missing cpu_entity');
    this.config = config;
    this._diskLastUpdate = 0;
  }

  getCardSize() {
    return 5;
  }
}

customElements.define('synology-card', SynologyCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'synology-card',
  name: 'Synology NAS Dashboard',
  description: 'Sleek dashboard for Synology NAS monitoring'
});
