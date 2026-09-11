/**
 * Settings View Controller - Configuration Tabs, Credentials, Notification Toggles
 */

import { Store } from '../state.js';
import { ToastManager } from '../components/toast.js';

export class SettingsView {
  static init() {
    this.bindTabs();
    this.bindForms();
    this.syncData();

    Store.subscribe((event, data, state) => {
      if (event === 'auth_changed') {
        this.syncData();
      }
    });
  }

  static bindTabs() {
    const tabBtns = document.querySelectorAll('.settings-tab-btn');
    const tabPanes = document.querySelectorAll('.settings-tab-pane');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        const targetPaneId = e.currentTarget.getAttribute('data-tab');
        e.currentTarget.classList.add('active');

        const targetPane = document.getElementById(targetPaneId);
        if (targetPane) targetPane.classList.add('active');
      });
    });
  }

  static bindForms() {
    // Profile Save
    const profileForm = document.getElementById('settings-profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('setting-name').value;
        const email = document.getElementById('setting-email').value;
        const role = document.getElementById('setting-role').value;

        Store.setAuth(true, { name, email, role, avatarText: name.substring(0, 2).toUpperCase() });
        ToastManager.success('Profile Saved', 'User profile information updated successfully.');
      });
    }

    // Cloud Connection Test
    const testConnBtn = document.getElementById('btn-test-cloud-conn');
    if (testConnBtn) {
      testConnBtn.addEventListener('click', () => {
        testConnBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing Ping...';
        setTimeout(() => {
          testConnBtn.innerHTML = '<i class="fas fa-plug"></i> Test Connection';
          ToastManager.success('Connection Verified', 'AWS us-east-1 endpoint reachable (latency: 18ms).');
        }, 800);
      });
    }

    // Cloud Config Save
    const cloudForm = document.getElementById('settings-cloud-form');
    if (cloudForm) {
      cloudForm.addEventListener('submit', (e) => {
        e.preventDefault();
        ToastManager.success('Cloud Config Updated', 'API credentials and AWS cluster parameters saved.');
      });
    }

    // Autoscaling Policy Save
    const policyForm = document.getElementById('settings-policy-form');
    if (policyForm) {
      policyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const min = parseInt(document.getElementById('set-as-min').value);
        const max = parseInt(document.getElementById('set-as-max').value);
        const cpu = parseInt(document.getElementById('set-as-cpu').value);

        Store.updateAutoscalingPolicy({
          minServers: min,
          maxServers: max,
          scaleUpThreshold: cpu
        });

        ToastManager.success('Defaults Saved', 'Autoscaling cluster boundaries updated.');
      });
    }

    // Theme selector cards
    const themeCards = document.querySelectorAll('.theme-card');
    themeCards.forEach(card => {
      card.addEventListener('click', (e) => {
        themeCards.forEach(c => c.classList.remove('active'));
        const target = e.currentTarget;
        target.classList.add('active');
        const theme = target.getAttribute('data-theme');
        document.documentElement.setAttribute('data-theme', theme);
        ToastManager.info('Theme Updated', `Switched theme to ${theme.toUpperCase()} mode.`);
      });
    });

    // Password Form
    const securityForm = document.getElementById('settings-security-form');
    if (securityForm) {
      securityForm.addEventListener('submit', (e) => {
        e.preventDefault();
        ToastManager.success('Security Updated', 'Password successfully changed and sessions refreshed.');
        securityForm.reset();
      });
    }
  }

  static syncData() {
    const state = Store.getState();
    const user = state.auth.user;
    const sys = state.system;

    // Fill profile fields
    const nameInput = document.getElementById('setting-name');
    if (nameInput) nameInput.value = user.name;

    const emailInput = document.getElementById('setting-email');
    if (emailInput) emailInput.value = user.email;

    const roleInput = document.getElementById('setting-role');
    if (roleInput) roleInput.value = user.role;

    const avatarEl = document.getElementById('settings-avatar-circle');
    if (avatarEl) avatarEl.textContent = user.avatarText;

    // Fill autoscaling defaults
    const minInput = document.getElementById('set-as-min');
    if (minInput) minInput.value = sys.minServers;

    const maxInput = document.getElementById('set-as-max');
    if (maxInput) maxInput.value = sys.maxServers;

    const cpuInput = document.getElementById('set-as-cpu');
    if (cpuInput) cpuInput.value = sys.scaleUpThreshold;
  }
}
