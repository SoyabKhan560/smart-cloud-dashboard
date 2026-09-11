/**
 * State Management & Event Bus for Smart Cloud Autoscaling & Cost Optimizer
 */

import { APP_CONFIG } from './config.js';

class StateStore {
  constructor() {
    this.state = {
      auth: {
        isAuthenticated: false,
        user: {
          name: 'Alex Vance',
          email: 'admin@cloudscale.io',
          role: 'DevOps Architect',
          avatarText: 'AV'
        }
      },
      system: { ...APP_CONFIG.initialData.system },
      servers: [ ...APP_CONFIG.initialData.servers.map(s => ({ ...s })) ],
      alerts: [ ...APP_CONFIG.initialData.alerts.map(a => ({ ...a })) ],
      recommendations: [ ...APP_CONFIG.initialData.recommendations.map(r => ({ ...r })) ],
      scalingHistory: [ ...APP_CONFIG.initialData.scalingHistory.map(h => ({ ...h })) ],
      activityFeed: [
        { id: 1, type: 'scale-up', icon: 'fa-arrow-up', badgeClass: 'purple', title: 'Server Scaled Up', desc: 'Cluster expanded to 3 instances due to CPU spike', time: '14:22:10' },
        { id: 2, type: 'alert', icon: 'fa-exclamation-triangle', badgeClass: 'amber', title: 'CPU Threshold Exceeded', desc: 'Cluster load peaked above 80% limit', time: '14:20:05' },
        { id: 3, type: 'cost', icon: 'fa-piggy-bank', badgeClass: 'green', title: 'Cost Optimization Applied', desc: 'Idle snapshot cleanup saved $8.50/mo', time: '12:45:18' },
        { id: 4, type: 'scale-down', icon: 'fa-arrow-down', badgeClass: 'cyan', title: 'Server Scaled Down', desc: 'Load normalized, node app-worker-04 entered standby', time: '11:05:42' },
        { id: 5, type: 'health', icon: 'fa-check-circle', badgeClass: 'green', title: 'Health Ping Verified', desc: 'AWS us-east-1 connection latency optimal (18ms)', time: '10:00:00' }
      ],
      currentView: 'dashboard'
    };

    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data, this.state);
      } catch (err) {
        console.error('State subscriber error:', err);
      }
    });
  }

  // Auth mutations
  setAuth(isAuthenticated, user = null) {
    this.state.auth.isAuthenticated = isAuthenticated;
    if (user) {
      this.state.auth.user = { ...this.state.auth.user, ...user };
    }
    this.notify('auth_changed', this.state.auth);
  }

  // System telemetry update
  updateMetrics(metrics) {
    this.state.system = { ...this.state.system, ...metrics };
    this.notify('metrics_updated', this.state.system);
  }

  // Autoscaling policy update
  updateAutoscalingPolicy(policy) {
    this.state.system = { ...this.state.system, ...policy };
    this.notify('policy_updated', this.state.system);
  }

  // Server instance scale up / scale down
  scaleServer(targetCount, reason = 'Workload adjustment') {
    const min = this.state.system.minServers;
    const max = this.state.system.maxServers;
    const count = Math.min(Math.max(targetCount, min), max);

    this.state.system.activeServers = count;

    // Adjust server objects
    this.state.servers.forEach((srv, index) => {
      if (index < count) {
        if (srv.status !== 'running') {
          srv.status = 'running';
          srv.cpu = Math.floor(Math.random() * 30) + 45;
          srv.memory = Math.floor(Math.random() * 25) + 40;
        }
      } else {
        srv.status = 'scaled-down';
        srv.cpu = 0;
        srv.memory = 0;
      }
    });

    const now = new Date().toLocaleTimeString();
    const actionName = targetCount > this.state.system.activeServers ? 'Scale Up' : 'Scale Down';

    this.state.scalingHistory.unshift({
      time: now,
      action: actionName,
      cpu: `${this.state.system.cpuUsage}%`,
      servers: count,
      reason
    });

    this.addActivity({
      type: actionName === 'Scale Up' ? 'scale-up' : 'scale-down',
      icon: actionName === 'Scale Up' ? 'fa-arrow-up' : 'fa-arrow-down',
      badgeClass: actionName === 'Scale Up' ? 'purple' : 'cyan',
      title: `Server ${actionName}`,
      desc: `${actionName} executed: ${count} active servers. Reason: ${reason}`,
      time: now
    });

    this.notify('servers_updated', { servers: this.state.servers, activeServers: count });
  }

  // Add an activity feed item
  addActivity(item) {
    const newItem = { id: Date.now(), ...item };
    this.state.activityFeed.unshift(newItem);
    if (this.state.activityFeed.length > 20) this.state.activityFeed.pop();
    this.notify('activity_added', newItem);
  }

  // Add an alert
  addAlert(alert) {
    const newAlert = { id: `alt-${Date.now()}`, status: 'active', ...alert };
    this.state.alerts.unshift(newAlert);
    this.notify('alerts_updated', this.state.alerts);
  }

  // Resolve an alert
  resolveAlert(alertId) {
    const alert = this.state.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'resolved';
      this.notify('alerts_updated', this.state.alerts);
    }
  }

  // Apply a cost recommendation
  applyRecommendation(recId) {
    const rec = this.state.recommendations.find(r => r.id === recId);
    if (rec && !rec.applied) {
      rec.applied = true;
      this.state.system.estimatedSavings = +(this.state.system.estimatedSavings + rec.savings).toFixed(2);
      this.state.system.monthlyCost = +(this.state.system.monthlyCost - rec.savings).toFixed(2);
      this.state.system.costEfficiency = Math.min(98, this.state.system.costEfficiency + 3);

      this.addActivity({
        type: 'cost',
        icon: 'fa-check-circle',
        badgeClass: 'green',
        title: 'Optimization Applied',
        desc: `Applied "${rec.title}" saving $${rec.savings.toFixed(2)}/mo`,
        time: new Date().toLocaleTimeString()
      });

      this.notify('recommendations_updated', { recommendations: this.state.recommendations, system: this.state.system });
    }
  }
}

export const Store = new StateStore();
