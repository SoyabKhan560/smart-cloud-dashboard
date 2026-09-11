/**
 * Auth View Controller - Login & Session Flow
 */

import { Store } from '../state.js';
import { ToastManager } from '../components/toast.js';

export class AuthView {
  static init() {
    const loginForm = document.getElementById('login-form');
    const demoFillBtn = document.getElementById('btn-demo-credentials');
    const googleLoginBtn = document.getElementById('btn-google-login');

    if (demoFillBtn) {
      demoFillBtn.addEventListener('click', () => {
        const emailInput = document.getElementById('login-email');
        const passInput = document.getElementById('login-password');
        if (emailInput) emailInput.value = 'admin@cloudscale.io';
        if (passInput) passInput.value = 'CloudOptimizer#2026';
        ToastManager.info('Demo Credentials Filled', 'Ready to sign in as Cloud DevOps Lead');
      });
    }

    if (googleLoginBtn) {
      googleLoginBtn.addEventListener('click', () => {
        this.completeLogin({
          name: 'Alex Vance (Google SSO)',
          email: 'alex.vance@company.com',
          role: 'Site Reliability Engineer',
          avatarText: 'AV'
        });
      });
    }

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
          ToastManager.warning('Validation Error', 'Please enter both your email and password.');
          return;
        }

        this.completeLogin({
          name: email.split('@')[0].replace('.', ' ').toUpperCase(),
          email: email,
          role: 'DevOps Architect',
          avatarText: email.substring(0, 2).toUpperCase()
        });
      });
    }
  }

  static completeLogin(userData) {
    Store.setAuth(true, userData);
    ToastManager.success('Welcome back!', `Logged into ${userData.role} workspace.`);
    
    // Smooth transition from login screen to dashboard
    const loginView = document.getElementById('view-login');
    const appShell = document.getElementById('app-shell');
    
    if (loginView) loginView.classList.add('hidden');
    if (appShell) appShell.classList.remove('hidden');

    window.location.hash = '#dashboard';
  }

  static logout() {
    Store.setAuth(false);
    ToastManager.info('Signed Out', 'You have been safely disconnected.');
    
    const loginView = document.getElementById('view-login');
    const appShell = document.getElementById('app-shell');
    
    if (appShell) appShell.classList.add('hidden');
    if (loginView) loginView.classList.remove('hidden');

    window.location.hash = '#login';
  }
}
