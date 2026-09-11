/**
 * Alerts & Notifications View Controller - Filter Tabs & Resolution
 */

import { Store } from '../state.js';
import { ToastManager } from '../components/toast.js';

export class AlertsView {
  static currentFilter = 'all';

  static init() {
    this.bindEvents();
    this.render();

    // Subscribe to alerts changes
    Store.subscribe((event, data, state) => {
      if (event === 'alerts_updated') {
        this.render();
      }
    });
  }

  static bindEvents() {
    const filterPills = document.querySelectorAll('.filter-pill');
    filterPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        filterPills.forEach(p => p.classList.remove('active'));
        const target = e.currentTarget;
        target.classList.add('active');
        this.currentFilter = target.getAttribute('data-filter');
        this.render();
      });
    });
  }

  static render() {
    const state = Store.getState();
    const alerts = state.alerts;

    // Update filter counts
    const countAll = alerts.length;
    const countCrit = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;
    const countWarn = alerts.filter(a => a.severity === 'warning' && a.status === 'active').length;
    const countInfo = alerts.filter(a => a.severity === 'info' && a.status === 'active').length;
    const countRes = alerts.filter(a => a.status === 'resolved').length;

    const elAll = document.getElementById('filter-count-all');
    if (elAll) elAll.textContent = countAll;
    const elCrit = document.getElementById('filter-count-critical');
    if (elCrit) elCrit.textContent = countCrit;
    const elWarn = document.getElementById('filter-count-warning');
    if (elWarn) elWarn.textContent = countWarn;
    const elInfo = document.getElementById('filter-count-info');
    if (elInfo) elInfo.textContent = countInfo;
    const elRes = document.getElementById('filter-count-resolved');
    if (elRes) elRes.textContent = countRes;

    // Filter list
    let filtered = alerts;
    if (this.currentFilter === 'critical') {
      filtered = alerts.filter(a => a.severity === 'critical' && a.status === 'active');
    } else if (this.currentFilter === 'warning') {
      filtered = alerts.filter(a => a.severity === 'warning' && a.status === 'active');
    } else if (this.currentFilter === 'info') {
      filtered = alerts.filter(a => a.severity === 'info' && a.status === 'active');
    } else if (this.currentFilter === 'resolved') {
      filtered = alerts.filter(a => a.status === 'resolved');
    }

    const container = document.getElementById('alerts-container-list');
    if (!container) return;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
          <i class="fas fa-check-double" style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--accent-cyan);"></i>
          <div style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary);">No Alerts In This Category</div>
          <div style="font-size: 0.85rem; margin-top: 0.35rem;">All systems within acceptable operational boundaries.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(alert => {
      const isResolved = alert.status === 'resolved';
      let icon = 'fa-info-circle';
      if (alert.severity === 'critical') icon = 'fa-radiation';
      else if (alert.severity === 'warning') icon = 'fa-exclamation-triangle';
      else if (alert.severity === 'success') icon = 'fa-check-circle';

      return `
        <div class="alert-item-card ${alert.severity} ${isResolved ? 'resolved' : ''}">
          <div class="alert-left-block">
            <div class="alert-severity-icon">
              <i class="fas ${icon}"></i>
            </div>
            <div class="alert-details">
              <div class="alert-title-row">
                <span class="badge badge-${alert.severity}">${alert.severity}</span>
                <span class="alert-headline">${alert.title}</span>
              </div>
              <div class="alert-description">${alert.desc}</div>
              <div class="alert-meta">
                <span class="alert-meta-item"><i class="far fa-clock"></i> ${alert.time}</span>
                <span class="alert-meta-item"><i class="fas fa-microchip"></i> us-east-1</span>
                <span class="badge ${isResolved ? 'badge-success' : 'badge-warning'}" style="font-size: 0.65rem;">
                  ${isResolved ? 'Resolved' : 'Active'}
                </span>
              </div>
            </div>
          </div>

          <div class="alert-actions-block">
            ${!isResolved ? `
              <button class="btn btn-secondary btn-sm btn-resolve-alert" data-id="${alert.id}">
                <i class="fas fa-check"></i> Mark as Resolved
              </button>
            ` : `
              <span class="text-muted" style="font-size: 0.8rem;"><i class="fas fa-check-double text-success"></i> Cleared</span>
            `}
          </div>
        </div>
      `;
    }).join('');

    // Bind Resolve buttons
    container.querySelectorAll('.btn-resolve-alert').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const alertId = e.currentTarget.getAttribute('data-id');
        Store.resolveAlert(alertId);
        ToastManager.success('Alert Resolved', 'The alert status has been archived.');
      });
    });
  }
}
