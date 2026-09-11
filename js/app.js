/**
 * Application Bootstrapper & Live Simulation Engine
 */

import { APP_CONFIG } from './config.js';
import { Store } from './state.js';
import { Api } from './api.js';
import { Charts } from './charts.js';
import { ToastManager } from './components/toast.js';
import { ModalManager } from './components/modal.js';
import { Router } from './router.js';

import { AuthView } from './views/authView.js';
import { DashboardView } from './views/dashboardView.js';
import { AutoscalingView } from './views/autoscalingView.js';
import { CostView } from './views/costView.js';
import { AlertsView } from './views/alertsView.js';
import { AssistantView } from './views/assistantView.js';
import { SettingsView } from './views/settingsView.js';

class App {
  static init() {
    console.info(`Initializing ${APP_CONFIG.appName} v${APP_CONFIG.version}...`);

    // Global Components
    ToastManager.init();
    ModalManager.init();

    // Initialize all views
    AuthView.init();
    DashboardView.init();
    AutoscalingView.init();
    CostView.init();
    AlertsView.init();
    AssistantView.init();
    SettingsView.init();

    // App shell bindings
    this.bindAppShell();

    // Router
    Router.init();

    // Start Live Telemetry Loop
    this.startTelemetryTicker();
  }

  static bindAppShell() {
    // Mobile Drawer Toggle
    const mobileToggle = document.getElementById('btn-mobile-menu');
    const sidebar = document.querySelector('.sidebar');
    if (mobileToggle && sidebar) {
      mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // User Profile in Sidebar & Logout
    const logoutBtn = document.getElementById('btn-sidebar-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        ModalManager.confirm({
          title: 'Sign Out',
          message: 'Are you sure you want to end your active cloud management session?',
          confirmText: 'Sign Out',
          confirmClass: 'btn-danger',
          onConfirm: () => {
            AuthView.logout();
          }
        });
      });
    }

    // Workload Surge Simulation Button
    const surgeBtn = document.getElementById('btn-trigger-surge');
    if (surgeBtn) {
      surgeBtn.addEventListener('click', () => this.simulateWorkloadSurge());
    }

    // State update for user info in topbar/sidebar
    Store.subscribe((event, data, state) => {
      if (event === 'auth_changed') {
        const user = state.auth.user;
        const nameEls = document.querySelectorAll('.user-display-name');
        const roleEls = document.querySelectorAll('.user-display-role');
        const avatarEls = document.querySelectorAll('.user-avatar-initials');

        nameEls.forEach(el => el.textContent = user.name);
        roleEls.forEach(el => el.textContent = user.role);
        avatarEls.forEach(el => el.textContent = user.avatarText);
      }
    });
  }

  /**
   * Demonstrates the real-time autoscaling magic:
   * 1. Injects 89% CPU spike
   * 2. Alerts engine notices threshold breach (>80%)
   * 3. Autoscaling engine provisions new instance
   * 4. Load balances and stabilizes
   */
  static simulateWorkloadSurge() {
    ToastManager.warning('Simulating Traffic Surge', 'Injected +45% load increase across cluster nodes...');
    
    // 1. Spike CPU
    Store.updateMetrics({ cpuUsage: 89, memoryUsage: 78 });
    Charts.pushMetrics(89, 78, Store.getState().system.activeServers);

    // 2. Add alert
    Store.addAlert({
      severity: 'critical',
      title: 'High CPU Surge (>85%) Detected',
      desc: 'Instantaneous inbound web traffic spike triggered scale-up threshold.',
      time: 'Just now'
    });

    // 3. Trigger Autoscaling after 1.5s
    setTimeout(() => {
      const state = Store.getState();
      if (state.system.autoscalingActive && state.system.activeServers < state.system.maxServers) {
        const nextCount = state.system.activeServers + 1;
        Store.scaleServer(nextCount, 'Autoscaling policy: CPU > 80% threshold');
        ToastManager.success('Autoscaling Action Executed', `Cluster automatically expanded to ${nextCount} instances to absorb workload surge.`);

        // 4. Stabilize CPU after scaling
        setTimeout(() => {
          Store.updateMetrics({ cpuUsage: 64, memoryUsage: 55 });
          Charts.pushMetrics(64, 55, nextCount);
          ToastManager.info('Load Normalized', 'Average CPU stabilized at 64% across expanded node pool.');
        }, 3000);
      }
    }, 1500);
  }

  /**
   * Periodic real-time background ticker (polling / simulation)
   */
  static startTelemetryTicker() {
    setInterval(async () => {
      const state = Store.getState();
      // Only ticker when user is authenticated
      if (!state.auth.isAuthenticated) return;

      try {
        const res = await Api.getMetrics();
        if (res && res.data) {
          Charts.pushMetrics(res.data.cpuUsage, res.data.memoryUsage, state.system.activeServers);
        }
      } catch (err) {
        // Silently handle
      }
    }, APP_CONFIG.TELEMETRY_INTERVAL_MS);
  }
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
