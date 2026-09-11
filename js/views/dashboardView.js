/**
 * Dashboard View Controller - Live Metrics, Health Matrix, Activity Feed
 */

import { Store } from '../state.js';
import { Charts } from '../charts.js';

export class DashboardView {
  static init() {
    this.render();
    Charts.initDashboardCharts();

    // Subscribe to state changes
    Store.subscribe((event, data, state) => {
      if (event === 'metrics_updated' || event === 'servers_updated') {
        this.updateKPIs(state);
        this.updateHealthMatrix(state);
      }
      if (event === 'activity_added' || event === 'servers_updated' || event === 'recommendations_updated') {
        this.renderActivityFeed(state.activityFeed);
      }
    });
  }

  static render() {
    const state = Store.getState();
    this.updateKPIs(state);
    this.updateHealthMatrix(state);
    this.renderActivityFeed(state.activityFeed);
  }

  static updateKPIs(state) {
    const sys = state.system;

    // CPU
    const cpuEl = document.getElementById('dash-cpu-val');
    if (cpuEl) cpuEl.innerHTML = `${sys.cpuUsage}<span class="stat-unit">%</span>`;

    // Memory
    const memEl = document.getElementById('dash-mem-val');
    if (memEl) memEl.innerHTML = `${sys.memoryUsage}<span class="stat-unit">%</span>`;

    // Servers
    const serversEl = document.getElementById('dash-servers-val');
    if (serversEl) serversEl.innerHTML = `${sys.activeServers} <span class="stat-unit">/ ${sys.maxServers}</span>`;

    // Cost
    const costEl = document.getElementById('dash-cost-val');
    if (costEl) costEl.innerHTML = `$${sys.monthlyCost.toFixed(2)}`;

    // Savings
    const savingsEl = document.getElementById('dash-savings-val');
    if (savingsEl) savingsEl.innerHTML = `$${sys.estimatedSavings.toFixed(2)}`;

    // Autoscaling Status
    const asBadge = document.getElementById('dash-as-status-badge');
    if (asBadge) {
      if (sys.autoscalingActive) {
        asBadge.className = 'badge badge-success';
        asBadge.innerHTML = '<i class="fas fa-check-circle"></i> Active';
      } else {
        asBadge.className = 'badge badge-warning';
        asBadge.innerHTML = '<i class="fas fa-pause-circle"></i> Paused';
      }
    }
  }

  static updateHealthMatrix(state) {
    const sys = state.system;

    // CPU Health Indicator
    const cpuStatusEl = document.getElementById('health-cpu-status');
    if (cpuStatusEl) {
      if (sys.cpuUsage > 80) {
        cpuStatusEl.className = 'badge badge-critical';
        cpuStatusEl.textContent = 'Critical (>80%)';
      } else if (sys.cpuUsage > 65) {
        cpuStatusEl.className = 'badge badge-warning';
        cpuStatusEl.textContent = 'Elevated';
      } else {
        cpuStatusEl.className = 'badge badge-success';
        cpuStatusEl.textContent = 'Normal';
      }
    }

    // Memory Health Indicator
    const memStatusEl = document.getElementById('health-mem-status');
    if (memStatusEl) {
      if (sys.memoryUsage > 85) {
        memStatusEl.className = 'badge badge-critical';
        memStatusEl.textContent = 'High Usage';
      } else if (sys.memoryUsage > 70) {
        memStatusEl.className = 'badge badge-warning';
        memStatusEl.textContent = 'Warning';
      } else {
        memStatusEl.className = 'badge badge-success';
        memStatusEl.textContent = 'Optimal';
      }
    }
  }

  static renderActivityFeed(activities) {
    const list = document.getElementById('dashboard-activity-list');
    if (!list) return;

    list.innerHTML = activities.slice(0, 7).map(item => `
      <div class="activity-item">
        <div class="activity-icon-badge ${item.badgeClass || 'cyan'}">
          <i class="fas ${item.icon || 'fa-info'}"></i>
        </div>
        <div class="activity-content">
          <div class="flex-between">
            <span class="activity-title">${item.title}</span>
            <span class="activity-time">${item.time}</span>
          </div>
          <div class="activity-desc">${item.desc}</div>
        </div>
      </div>
    `).join('');
  }
}
