/**
 * Smart Cloud Autoscaling & Cost Optimizer - Application Configuration
 */

export const APP_CONFIG = {
  appName: 'Smart Cloud Autoscaling & Cost Optimizer',
  tagline: 'Intelligent scaling. Lower costs. Smarter cloud.',
  version: '2.4.0-prod',

  // Set to true for live browser simulation, false when connecting to local/remote backend
  USE_MOCK_API: true,
  API_BASE_URL: 'http://localhost:5000/api',

  // API Endpoints Specification (Prepared for Python / psutil backend)
  endpoints: {
    metrics: '/metrics',
    servers: '/servers',
    autoscaling: '/autoscaling',
    cost: '/cost',
    alerts: '/alerts',
    resolveAlert: '/alerts/resolve',
    assistant: '/assistant',
    settings: '/settings'
  },

  // Live telemetry polling interval in milliseconds
  TELEMETRY_INTERVAL_MS: 3000,

  // Initial Seed Data (Realistic Cloud Cluster Profile)
  initialData: {
    system: {
      cpuUsage: 68,
      memoryUsage: 54,
      networkTrafficMB: 142.6,
      storageUsageGB: 240,
      activeServers: 3,
      minServers: 1,
      maxServers: 5,
      autoscalingActive: true,
      scaleUpThreshold: 80,
      scaleDownThreshold: 30,
      cloudStatus: 'Connected',
      provider: 'AWS (us-east-1)',
      monthlyCost: 128.40,
      prevMonthlyCost: 163.10,
      estimatedMonthlyCost: 142.00,
      estimatedSavings: 34.70,
      costEfficiency: 84
    },
    servers: [
      { id: 'srv-01', name: 'app-prod-worker-01', ip: '10.0.1.14', status: 'running', cpu: 71, memory: 58, region: 'us-east-1a', uptime: '14d 6h' },
      { id: 'srv-02', name: 'app-prod-worker-02', ip: '10.0.1.28', status: 'running', cpu: 64, memory: 52, region: 'us-east-1b', uptime: '14d 6h' },
      { id: 'srv-03', name: 'app-prod-worker-03', ip: '10.0.1.42', status: 'running', cpu: 69, memory: 53, region: 'us-east-1c', uptime: '2d 11h' },
      { id: 'srv-04', name: 'app-prod-worker-04', ip: '10.0.1.55', status: 'scaled-down', cpu: 0, memory: 0, region: 'us-east-1a', uptime: 'Standby' },
      { id: 'srv-05', name: 'app-prod-worker-05', ip: '10.0.1.69', status: 'scaled-down', cpu: 0, memory: 0, region: 'us-east-1b', uptime: 'Standby' }
    ],
    alerts: [
      { id: 'alt-101', severity: 'critical', title: 'High CPU Surge on Server Cluster', desc: 'Average CPU utilization crossed 85% for more than 3 consecutive sampling cycles.', time: '12 mins ago', status: 'active' },
      { id: 'alt-102', severity: 'warning', title: 'Memory Threshold Warning', desc: 'Worker instance app-prod-worker-01 memory reached 88% cache threshold.', time: '42 mins ago', status: 'active' },
      { id: 'alt-103', severity: 'info', title: 'Autoscaling Policy Triggered', desc: 'Workload increase detected. Provisioned 1 additional EC2 t3.large instance.', time: '2 hours ago', status: 'resolved' },
      { id: 'alt-104', severity: 'warning', title: 'Unexpected Egress Cost Spike', desc: 'Outbound network transfer in us-east-1 exceeded daily budget threshold by 14%.', time: '5 hours ago', status: 'active' },
      { id: 'alt-105', severity: 'success', title: 'Cost Optimization Applied', desc: 'Automated policy terminated 2 idle dev instances, saving $24.50/month.', time: '1 day ago', status: 'resolved' },
      { id: 'alt-106', severity: 'critical', title: 'Cloud Health Ping Latency', desc: 'AWS API gateway response latency increased to 340ms.', time: '1 day ago', status: 'resolved' }
    ],
    recommendations: [
      { id: 'rec-1', title: 'Remove 1 Idle Server in us-east-1b', desc: 'Server app-prod-worker-04 had < 5% CPU utilization over the last 72 hours.', savings: 24.50, applied: false },
      { id: 'rec-2', title: 'Right-size Over-provisioned Memory', desc: 'Downgrade memory allocation from 16GB to 8GB on analytics staging nodes.', savings: 18.20, applied: false },
      { id: 'rec-3', title: 'Schedule Automated Night/Weekend Shutdown', desc: 'Power off non-production environments between 8:00 PM and 7:00 AM EST.', savings: 31.00, applied: false },
      { id: 'rec-4', title: 'Switch to 1-Year Compute Savings Plan', desc: 'Commit to baseline compute usage for predictable workload discount.', savings: 45.00, applied: false },
      { id: 'rec-5', title: 'Purge Orphaned EBS Snapshots', desc: 'Found 14 unattached snapshots and unallocated Elastic IPs in us-east-1.', savings: 8.50, applied: false }
    ],
    scalingHistory: [
      { time: '14:22:10', action: 'Scale Up', cpu: '84%', servers: 3, reason: 'CPU exceeded threshold (80%)' },
      { time: '11:05:42', action: 'Scale Down', cpu: '26%', servers: 2, reason: 'Workload dropped below 30%' },
      { time: '08:15:30', action: 'Scale Up', cpu: '82%', servers: 3, reason: 'Morning traffic spike detected' },
      { time: '02:00:15', action: 'Scale Down', cpu: '22%', servers: 2, reason: 'Night scheduled policy execution' }
    ]
  }
};
