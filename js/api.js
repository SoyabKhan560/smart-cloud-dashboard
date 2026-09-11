/**
 * API Integration Layer for Smart Cloud Autoscaling & Cost Optimizer
 * Supports seamless switching between Mock Simulation Mode and Real Python/psutil REST API.
 */

import { APP_CONFIG } from './config.js';
import { Store } from './state.js';

class ApiService {
  constructor() {
    this.useMock = APP_CONFIG.USE_MOCK_API;
    this.baseUrl = APP_CONFIG.API_BASE_URL;
  }

  setMockMode(useMock) {
    this.useMock = useMock;
    console.info(`[API Service] Mode switched to: ${useMock ? 'Mock Engine' : 'Live REST Backend'}`);
  }

  async _fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {})
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.warn(`[API] Network error fetching ${url}. Falling back to state data:`, err.message);
      throw err;
    }
  }

  // GET /api/metrics
  async getMetrics() {
    if (this.useMock) {
      const state = Store.getState();
      // Simulate realistic slight jitter around current utilization
      const jitter = (Math.random() * 4 - 2);
      const currentCpu = Math.min(99, Math.max(15, Math.round(state.system.cpuUsage + jitter)));
      const currentMem = Math.min(95, Math.max(30, Math.round(state.system.memoryUsage + (jitter * 0.5))));
      
      Store.updateMetrics({
        cpuUsage: currentCpu,
        memoryUsage: currentMem
      });

      return {
        success: true,
        data: {
          ...state.system,
          cpuUsage: currentCpu,
          memoryUsage: currentMem,
          timestamp: new Date().toISOString()
        }
      };
    }

    return await this._fetch(APP_CONFIG.endpoints.metrics);
  }

  // GET /api/servers
  async getServers() {
    if (this.useMock) {
      return {
        success: true,
        data: Store.getState().servers
      };
    }
    return await this._fetch(APP_CONFIG.endpoints.servers);
  }

  // GET /api/autoscaling
  async getAutoscaling() {
    if (this.useMock) {
      const sys = Store.getState().system;
      return {
        success: true,
        data: {
          autoscalingActive: sys.autoscalingActive,
          activeServers: sys.activeServers,
          minServers: sys.minServers,
          maxServers: sys.maxServers,
          scaleUpThreshold: sys.scaleUpThreshold,
          scaleDownThreshold: sys.scaleDownThreshold,
          cooldownSeconds: 300,
          currentCpu: sys.cpuUsage
        }
      };
    }
    return await this._fetch(APP_CONFIG.endpoints.autoscaling);
  }

  // POST /api/autoscaling
  async updateAutoscaling(policy) {
    if (this.useMock) {
      Store.updateAutoscalingPolicy(policy);
      return { success: true, message: 'Autoscaling policy updated successfully', data: policy };
    }
    return await this._fetch(APP_CONFIG.endpoints.autoscaling, {
      method: 'POST',
      body: JSON.stringify(policy)
    });
  }

  // GET /api/cost
  async getCost() {
    if (this.useMock) {
      const sys = Store.getState().system;
      return {
        success: true,
        data: {
          monthlyCost: sys.monthlyCost,
          prevMonthlyCost: sys.prevMonthlyCost,
          estimatedMonthlyCost: sys.estimatedMonthlyCost,
          potentialSavings: sys.estimatedSavings,
          costEfficiency: sys.costEfficiency,
          breakdown: {
            compute: 78.60,
            storage: 24.30,
            network: 15.50,
            other: 10.00
          },
          recommendations: Store.getState().recommendations
        }
      };
    }
    return await this._fetch(APP_CONFIG.endpoints.cost);
  }

  // GET /api/alerts
  async getAlerts() {
    if (this.useMock) {
      return {
        success: true,
        data: Store.getState().alerts
      };
    }
    return await this._fetch(APP_CONFIG.endpoints.alerts);
  }

  // POST /api/alerts/resolve
  async resolveAlert(alertId) {
    if (this.useMock) {
      Store.resolveAlert(alertId);
      return { success: true, message: `Alert ${alertId} resolved` };
    }
    return await this._fetch(APP_CONFIG.endpoints.resolveAlert, {
      method: 'POST',
      body: JSON.stringify({ alertId })
    });
  }

  // POST /api/assistant
  async askAssistant(userMessage) {
    if (this.useMock) {
      // Intelligent mock reasoning based on current live state
      const state = Store.getState();
      const cpu = state.system.cpuUsage;
      const mem = state.system.memoryUsage;
      const servers = state.system.activeServers;
      const cost = state.system.monthlyCost;
      const savings = state.system.estimatedSavings;
      const query = userMessage.toLowerCase();

      let reply = '';

      if (query.includes('why') && (query.includes('scale up') || query.includes('scaled up'))) {
        reply = `Your cluster automatically scaled up because average CPU utilization exceeded the **${state.system.scaleUpThreshold}% scale-up threshold** during traffic peaks. 
        
Currently, you have **${servers} active instances** running. If the workload sustains below ${state.system.scaleDownThreshold}%, the autoscaler will safely initiate a scale-down cycle.`;
      } else if (query.includes('reduce') || query.includes('saving') || query.includes('cost')) {
        reply = `You have an estimated **$${savings.toFixed(2)}/month** in immediate savings opportunities!

Here are top recommendations:
1. **Remove Idle Server:** Node \`app-prod-worker-04\` is currently idle. Applying this saves ~$24.50/mo.
2. **Right-size RAM:** Analytics worker instances have 48% unused memory allocated.
3. **Automate Night Schedules:** Shutting down staging clusters after hours saves ~$31.00/mo.

You can apply these directly in the **Cost Optimization** tab.`;
      } else if (query.includes('cpu') || query.includes('memory') || query.includes('usage')) {
        reply = `Real-time Telemetry Snapshot:
- **CPU Utilization:** \`${cpu}%\` (${cpu > 75 ? '⚠️ Elevated' : '✅ Healthy'})
- **Memory Allocation:** \`${mem}%\` (Optimal)
- **Active Node Pool:** \`${servers} / ${state.system.maxServers} instances\`
- **Autoscaler State:** \`${state.system.autoscalingActive ? 'Active' : 'Disabled'}\``;
      } else if (query.includes('add') && query.includes('server')) {
        if (cpu > 75) {
          reply = `Given that current CPU utilization is at **${cpu}%**, adding another node will help distribute incoming traffic spikes and prevent throttling.`;
        } else {
          reply = `With current CPU at **${cpu}%** and **${servers} instances** online, your infrastructure has healthy headroom. Adding another server is **not recommended** right now as it would increase monthly costs unnecessarily.`;
        }
      } else if (query.includes('health') || query.includes('status')) {
        reply = `**Infrastructure Health Summary:**
- **Core Status:** All systems operational.
- **Cloud Provider:** AWS us-east-1 (Latency: 19ms).
- **Active Nodes:** ${servers} healthy instances.
- **Cost Efficiency:** ${state.system.costEfficiency}%.
- **Active Alerts:** ${state.alerts.filter(a => a.status === 'active').length} unresolved notifications.`;
      } else {
        reply = `I have analyzed your cloud infrastructure in **AWS us-east-1**. 

Your current cluster has **${servers} active instances**, operating at **${cpu}% CPU** and **${mem}% Memory**. Current projected monthly spend is **$${cost.toFixed(2)}** with an efficiency rating of **${state.system.costEfficiency}%**.

Would you like me to identify idle instances or simulate an autoscaling stress test?`;
      }

      // Simulate realistic AI generation latency
      await new Promise(resolve => setTimeout(resolve, 600));

      return {
        success: true,
        data: {
          reply,
          timestamp: new Date().toISOString()
        }
      };
    }

    return await this._fetch(APP_CONFIG.endpoints.assistant, {
      method: 'POST',
      body: JSON.stringify({ message: userMessage })
    });
  }

  // GET /api/settings
  async getSettings() {
    if (this.useMock) {
      return {
        success: true,
        data: {
          provider: 'AWS',
          region: 'us-east-1',
          connected: true,
          apiKeyMasked: 'AKI••••••••••••••42G',
          emailAlerts: true,
          highCpuAlerts: true,
          highCostAlerts: true,
          autoscalingAlerts: true
        }
      };
    }
    return await this._fetch(APP_CONFIG.endpoints.settings);
  }

  // POST /api/settings
  async updateSettings(settings) {
    if (this.useMock) {
      return { success: true, message: 'Settings saved successfully' };
    }
    return await this._fetch(APP_CONFIG.endpoints.settings, {
      method: 'POST',
      body: JSON.stringify(settings)
    });
  }
}

export const Api = new ApiService();
