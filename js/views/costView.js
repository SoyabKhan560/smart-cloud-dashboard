/**
 * Cost Optimization View Controller - Spend Metrics, Charts, Recommendations Engine
 */

import { Store } from '../state.js';
import { Charts } from '../charts.js';
import { ToastManager } from '../components/toast.js';
import { ModalManager } from '../components/modal.js';

export class CostView {
  static init() {
    this.render();
    Charts.initCostCharts();

    // Subscribe to state updates
    Store.subscribe((event, data, state) => {
      if (['recommendations_updated', 'metrics_updated', 'servers_updated'].includes(event)) {
        this.render();
      }
    });
  }

  static render() {
    const state = Store.getState();
    const sys = state.system;

    // KPI Values
    const curCostEl = document.getElementById('cost-stat-current');
    if (curCostEl) curCostEl.textContent = `$${sys.monthlyCost.toFixed(2)}`;

    const prevCostEl = document.getElementById('cost-stat-prev');
    if (prevCostEl) prevCostEl.textContent = `$${sys.prevMonthlyCost.toFixed(2)}`;

    const estCostEl = document.getElementById('cost-stat-est');
    if (estCostEl) estCostEl.textContent = `$${sys.estimatedMonthlyCost.toFixed(2)}`;

    const potSavingsEl = document.getElementById('cost-stat-savings');
    if (potSavingsEl) potSavingsEl.textContent = `$${sys.estimatedSavings.toFixed(2)}`;

    const efficiencyEl = document.getElementById('cost-stat-efficiency');
    if (efficiencyEl) efficiencyEl.textContent = `${sys.costEfficiency}%`;

    // Render Recommendations
    this.renderRecommendations(state.recommendations);
  }

  static renderRecommendations(recommendations) {
    const container = document.getElementById('cost-recommendations-list');
    if (!container) return;

    container.innerHTML = recommendations.map(rec => `
      <div class="recommendation-card" id="card-${rec.id}">
        <div class="rec-left">
          <div class="rec-icon-box">
            <i class="fas fa-lightbulb"></i>
          </div>
          <div class="rec-content">
            <div class="rec-title">${rec.title}</div>
            <div class="rec-desc">${rec.desc}</div>
          </div>
        </div>
        <div class="rec-right">
          <div>
            <span class="rec-savings">+$${rec.savings.toFixed(2)}</span>
            <span class="rec-savings-label">/ mo</span>
          </div>
          ${rec.applied ? `
            <button class="btn btn-secondary btn-sm" disabled style="opacity: 0.7;">
              <i class="fas fa-check text-success"></i> Applied
            </button>
          ` : `
            <button class="btn btn-primary btn-sm btn-apply-rec" data-id="${rec.id}">
              <i class="fas fa-bolt"></i> Apply
            </button>
          `}
        </div>
      </div>
    `).join('');

    // Bind Apply buttons
    container.querySelectorAll('.btn-apply-rec').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const rec = recommendations.find(r => r.id === id);
        if (!rec) return;

        ModalManager.confirm({
          title: 'Apply Cost Optimization',
          message: `Apply policy: <b>${rec.title}</b>?<br><br>This will reduce cloud spending by an estimated <b>$${rec.savings.toFixed(2)}/month</b> immediately.`,
          confirmText: 'Apply Optimization',
          onConfirm: () => {
            Store.applyRecommendation(id);
            ToastManager.success('Optimization Applied', `Reduced monthly cloud budget by $${rec.savings.toFixed(2)}.`);
          }
        });
      });
    });
  }
}
