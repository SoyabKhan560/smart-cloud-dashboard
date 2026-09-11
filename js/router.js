/**
 * Single Page Router & Navigation View Switcher
 */

import { Store } from './state.js';

export class Router {
  static routes = {
    'login': { title: 'Sign In', subtitle: 'Access your cloud workspace', icon: 'fa-lock' },
    'dashboard': { title: 'Dashboard', subtitle: 'Real-time telemetry and infrastructure health', icon: 'fa-tachometer-alt' },
    'autoscaling': { title: 'Autoscaling Engine', subtitle: 'Live cluster nodes, dynamic thresholds, and scaling rules', icon: 'fa-layer-group' },
    'cost': { title: 'Cost Optimization', subtitle: 'Spend telemetry, budget forecasts, and AI savings recommendations', icon: 'fa-chart-pie' },
    'alerts': { title: 'Alerts & Notifications', subtitle: 'Severity alerts, anomaly detection, and operational logs', icon: 'fa-bell' },
    'assistant': { title: 'Smart Cloud Assistant', subtitle: 'AI-driven cloud infrastructure guidance and queries', icon: 'fa-robot' },
    'settings': { title: 'Settings & Cloud Config', subtitle: 'Manage cloud credentials, thresholds, and notifications', icon: 'fa-sliders-h' }
  };

  static init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    
    // Sidebar nav link clicks
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const route = e.currentTarget.getAttribute('data-route');
        if (route) {
          window.location.hash = `#${route}`;
          // Close mobile sidebar if open
          document.querySelector('.sidebar')?.classList.remove('open');
        }
      });
    });

    // Initial route check
    this.handleRoute();
  }

  static handleRoute() {
    const rawHash = window.location.hash.replace('#', '') || 'dashboard';
    const state = Store.getState();

    // If unauthenticated and not on login, redirect to login
    let route = rawHash;
    if (!state.auth.isAuthenticated && route !== 'login') {
      window.location.hash = '#login';
      return;
    }

    if (!this.routes[route]) {
      route = 'dashboard';
    }

    // Toggle Login View vs App Shell
    const loginView = document.getElementById('view-login');
    const appShell = document.getElementById('app-shell');

    if (route === 'login') {
      if (loginView) loginView.classList.remove('hidden');
      if (appShell) appShell.classList.add('hidden');
      return;
    } else {
      if (loginView) loginView.classList.add('hidden');
      if (appShell) appShell.classList.remove('hidden');
    }

    // Switch active view container
    document.querySelectorAll('.view-section').forEach(section => {
      section.classList.remove('active-view');
    });

    const targetSection = document.getElementById(`view-${route}`);
    if (targetSection) {
      targetSection.classList.add('active-view');
    }

    // Update Topbar
    const routeInfo = this.routes[route];
    const titleEl = document.getElementById('topbar-page-title');
    const subtitleEl = document.getElementById('topbar-page-subtitle');

    if (titleEl && routeInfo) {
      titleEl.innerHTML = `<i class="fas ${routeInfo.icon} text-cyan"></i> ${routeInfo.title}`;
    }
    if (subtitleEl && routeInfo) {
      subtitleEl.textContent = routeInfo.subtitle;
    }

    // Update active nav item in sidebar
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(nav => {
      nav.classList.remove('active');
      if (nav.getAttribute('data-route') === route) {
        nav.classList.add('active');
      }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  static navigate(route) {
    window.location.hash = `#${route}`;
  }
}
