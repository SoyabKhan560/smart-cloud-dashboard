/**
 * Autoscaling View Controller - Policy Controls, Live Node Rack, Scaling History
 */

import { Store } from '../state.js';
import { ToastManager } from '../components/toast.js';
import { ModalManager } from '../components/modal.js';

export class AutoscalingView {
  static init() {
    this.bindEvents();
    this.render();

    // Subscribe to state updates
    Store.subscribe((event, data, state) => {
      if (['metrics_updated', 'policy_updated', 'servers_updated'].includes(event)) {
        this.render();
      }
    });
  }

  static bindEvents() {
    // Master Autoscaling Toggle
    const masterSwitch = document.getElementById('as-master-toggle');
    if (masterSwitch) {
      masterSwitch.addEventListener('change', (e) => {
        const isActive = e.target.checked;
        Store.updateAutoscalingPolicy({ autoscalingActive: isActive });
        ToastManager.info('Autoscaling Policy', `Autoscaling engine is now ${isActive ? 'ENABLED' : 'PAUSED'}.`);
      });
    }

    // Scale Up Threshold Slider
    const upSlider = document.getElementById('as-scale-up-slider');
    const upVal = document.getElementById('as-scale-up-val');
    if (upSlider && upVal) {
      upSlider.addEventListener('input', (e) => {
        upVal.textContent = `${e.target.value}%`;
      });
      upSlider.addEventListener('change', (e) => {
        Store.updateAutoscalingPolicy({ scaleUpThreshold: parseInt(e.target.value) });
        ToastManager.success('Threshold Saved', `Scale-up threshold updated to ${e.target.value}%.`);
      });
    }

    // Scale Down Threshold Slider
    const downSlider = document.getElementById('as-scale-down-slider');
    const downVal = document.getElementById('as-scale-down-val');
    if (downSlider && downVal) {
      downSlider.addEventListener('input', (e) => {
        downVal.textContent = `${e.target.value}%`;
      });
      downSlider.addEventListener('change', (e) => {
        Store.updateAutoscalingPolicy({ scaleDownThreshold: parseInt(e.target.value) });
        ToastManager.success('Threshold Saved', `Scale-down threshold updated to ${e.target.value}%.`);
      });
    }

    // Min / Max Inputs
    const minInput = document.getElementById('as-min-servers');
    const maxInput = document.getElementById('as-max-servers');
    if (minInput) {
      minInput.addEventListener('change', (e) => {
        const val = parseInt(e.target.value) || 1;
        Store.updateAutoscalingPolicy({ minServers: val });
      });
    }
    if (maxInput) {
      maxInput.addEventListener('change', (e) => {
        const val = parseInt(e.target.value) || 5;
        Store.updateAutoscalingPolicy({ maxServers: val });
      });
    }

    // Manual Scale Up Button
    const manualUpBtn = document.getElementById('btn-manual-scale-up');
    if (manualUpBtn) {
      manualUpBtn.addEventListener('click', () => {
        const state = Store.getState();
        if (state.system.activeServers >= state.system.maxServers) {
          ToastManager.warning('Cluster Limit', `Cannot scale up beyond maximum limit (${state.system.maxServers} nodes).`);
          return;
        }

        ModalManager.confirm({
          title: 'Manual Scale Up',
          message: `Are you sure you want to provision an additional server instance? Cluster size will increase to <b>${state.system.activeServers + 1} servers</b>.`,
          confirmText: 'Scale Up Node',
          onConfirm: () => {
            Store.scaleServer(state.system.activeServers + 1, 'Manual operator override');
            ToastManager.success('Instance Provisioned', `Cluster successfully scaled to ${state.system.activeServers} nodes.`);
          }
        });
      });
    }

    // Manual Scale Down Button
    const manualDownBtn = document.getElementById('btn-manual-scale-down');
    if (manualDownBtn) {
      manualDownBtn.addEventListener('click', () => {
        const state = Store.getState();
        if (state.system.activeServers <= state.system.minServers) {
          ToastManager.warning('Cluster Limit', `Cannot scale down below minimum limit (${state.system.minServers} node).`);
          return;
        }

        ModalManager.confirm({
          title: 'Manual Scale Down',
          message: `Are you sure you want to terminate an active instance? Cluster size will decrease to <b>${state.system.activeServers - 1} servers</b>.`,
          confirmText: 'Scale Down',
          confirmClass: 'btn-danger',
          onConfirm: () => {
            Store.scaleServer(state.system.activeServers - 1, 'Manual operator override');
            ToastManager.info('Instance Decommissioned', `Cluster scaled down to ${state.system.activeServers} nodes.`);
          }
        });
      });
    }
  }

  static render() {
    const state = Store.getState();
    const sys = state.system;

    // Controls sync
    const masterSwitch = document.getElementById('as-master-toggle');
    if (masterSwitch) masterSwitch.checked = sys.autoscalingActive;

    const minInput = document.getElementById('as-min-servers');
    if (minInput && document.activeElement !== minInput) minInput.value = sys.minServers;

    const maxInput = document.getElementById('as-max-servers');
    if (maxInput && document.activeElement !== maxInput) maxInput.value = sys.maxServers;

    const upSlider = document.getElementById('as-scale-up-slider');
    const upVal = document.getElementById('as-scale-up-val');
    if (upSlider && upVal && document.activeElement !== upSlider) {
      upSlider.value = sys.scaleUpThreshold;
      upVal.textContent = `${sys.scaleUpThreshold}%`;
    }

    const downSlider = document.getElementById('as-scale-down-slider');
    const downVal = document.getElementById('as-scale-down-val');
    if (downSlider && downVal && document.activeElement !== downSlider) {
      downSlider.value = sys.scaleDownThreshold;
      downVal.textContent = `${sys.scaleDownThreshold}%`;
    }

    // Summary Metric Badges
    const curServersEl = document.getElementById('as-stat-current-servers');
    if (curServersEl) curServersEl.textContent = sys.activeServers;

    const curCpuEl = document.getElementById('as-stat-current-cpu');
    if (curCpuEl) curCpuEl.textContent = `${sys.cpuUsage}%`;

    // Render Live Server Nodes Visual Rack
    this.renderServerCluster(state.servers);

    // Render History Table
    this.renderHistoryTable(state.scalingHistory);
  }

  static renderServerCluster(servers) {
    const clusterContainer = document.getElementById('server-nodes-grid');
    if (!clusterContainer) return;

    clusterContainer.innerHTML = servers.map((srv, idx) => {
      const isRunning = srv.status === 'running';
      let badgeHtml = '';

      if (srv.status === 'running') {
        badgeHtml = '<span class="badge badge-success"><i class="fas fa-play-circle"></i> Running</span>';
      } else if (srv.status === 'starting') {
        badgeHtml = '<span class="badge badge-info"><i class="fas fa-spinner fa-spin"></i> Starting</span>';
      } else if (srv.status === 'stopping') {
        badgeHtml = '<span class="badge badge-warning"><i class="fas fa-power-off"></i> Stopping</span>';
      } else {
        badgeHtml = '<span class="badge"><i class="fas fa-moon"></i> Scaled Down</span>';
      }

      const cpuVal = isRunning ? srv.cpu : 0;
      const memVal = isRunning ? srv.memory : 0;

      return `
        <div class="server-node-card ${srv.status}">
          <div class="server-card-top">
            <div class="server-identity">
              <div class="server-icon"><i class="fas fa-server"></i></div>
              <div>
                <div class="server-title">Server ${idx + 1} (${srv.name})</div>
                <div class="server-ip">${srv.ip} &bull; ${srv.region}</div>
              </div>
            </div>
            ${badgeHtml}
          </div>

          <div class="server-metrics">
            <div class="server-metric-row">
              <div class="metric-row-header">
                <span>CPU Utilization</span>
                <span style="font-family: var(--font-mono); font-weight: 600;">${cpuVal}%</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill ${cpuVal > 80 ? 'progress-critical' : 'progress-cyan'}" style="width: ${cpuVal}%"></div>
              </div>
            </div>

            <div class="server-metric-row">
              <div class="metric-row-header">
                <span>Memory Allocation</span>
                <span style="font-family: var(--font-mono); font-weight: 600;">${memVal}%</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill progress-purple" style="width: ${memVal}%"></div>
              </div>
            </div>
          </div>

          <div class="server-footer-actions">
            <span>Uptime: ${srv.uptime}</span>
            <span class="badge badge-purple" style="font-size: 0.65rem;">t3.large</span>
          </div>
        </div>
      `;
    }).join('');
  }

  static renderHistoryTable(history) {
    const tbody = document.getElementById('autoscaling-history-tbody');
    if (!tbody) return;

    tbody.innerHTML = history.map(item => `
      <tr>
        <td style="font-family: var(--font-mono); font-weight: 600;">${item.time}</td>
        <td>
          <span class="badge ${item.action === 'Scale Up' ? 'badge-purple' : 'badge-info'}">
            <i class="fas ${item.action === 'Scale Up' ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
            ${item.action}
          </span>
        </td>
        <td style="font-family: var(--font-mono);">${item.cpu}</td>
        <td><b>${item.servers}</b> nodes</td>
        <td>${item.reason}</td>
      </tr>
    `).join('');
  }
}
