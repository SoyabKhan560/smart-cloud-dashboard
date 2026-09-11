/**
 * Chart.js Integration & Dark Theme Telemetry Graphs
 */

export class ChartController {
  constructor() {
    this.charts = {};
    this.maxDataPoints = 12;
  }

  // Common dark theme options
  getDefaultOptions(unit = '%', yMax = 100) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 20, 34, 0.95)',
          titleColor: '#f8fafc',
          bodyColor: '#94a3b8',
          borderColor: 'rgba(255, 255, 255, 0.12)',
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: (context) => `${context.parsed.y}${unit}`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)', borderColor: 'transparent' },
          ticks: { color: '#64748b', font: { family: 'Inter', size: 10 } }
        },
        y: {
          min: 0,
          max: yMax,
          grid: { color: 'rgba(255, 255, 255, 0.05)', borderColor: 'transparent' },
          ticks: {
            color: '#64748b',
            font: { family: 'Inter', size: 10 },
            callback: (val) => `${val}${unit}`
          }
        }
      }
    };
  }

  // Initialize Dashboard 4 real-time charts
  initDashboardCharts() {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js library not loaded yet');
      return;
    }

    const timeLabels = ['14:10', '14:12', '14:14', '14:16', '14:18', '14:20', '14:22', '14:24'];

    // 1. CPU Usage Chart
    const cpuCanvas = document.getElementById('chart-cpu');
    if (cpuCanvas && !this.charts.cpu) {
      const ctx = cpuCanvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 200);
      gradient.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
      gradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

      this.charts.cpu = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [...timeLabels],
          datasets: [{
            data: [58, 62, 65, 70, 78, 84, 72, 68],
            borderColor: '#06b6d4',
            borderWidth: 2,
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: '#06b6d4'
          }]
        },
        options: this.getDefaultOptions('%', 100)
      });
    }

    // 2. Memory Usage Chart
    const memCanvas = document.getElementById('chart-memory');
    if (memCanvas && !this.charts.memory) {
      const ctx = memCanvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 200);
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0.0)');

      this.charts.memory = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [...timeLabels],
          datasets: [{
            data: [48, 50, 52, 51, 53, 56, 55, 54],
            borderColor: '#8b5cf6',
            borderWidth: 2,
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: '#8b5cf6'
          }]
        },
        options: this.getDefaultOptions('%', 100)
      });
    }

    // 3. Server Count Chart
    const srvCanvas = document.getElementById('chart-servers');
    if (srvCanvas && !this.charts.servers) {
      const ctx = srvCanvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 200);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

      this.charts.servers = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [...timeLabels],
          datasets: [{
            data: [2, 2, 2, 3, 3, 3, 3, 3],
            borderColor: '#3b82f6',
            borderWidth: 2,
            backgroundColor: gradient,
            fill: true,
            stepped: true,
            pointRadius: 4,
            pointBackgroundColor: '#3b82f6'
          }]
        },
        options: this.getDefaultOptions('', 6)
      });
    }

    // 4. Cloud Cost Over Time Chart
    const costCanvas = document.getElementById('chart-cost');
    if (costCanvas && !this.charts.cost) {
      const ctx = costCanvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 200);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

      this.charts.cost = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'],
          datasets: [{
            data: [18.2, 42.5, 68.0, 89.4, 108.2, 119.5, 128.4],
            borderColor: '#10b981',
            borderWidth: 2,
            backgroundColor: gradient,
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: '#10b981'
          }]
        },
        options: this.getDefaultOptions('$', 160)
      });
    }
  }

  // Initialize Cost Optimization Page Charts
  initCostCharts() {
    if (typeof Chart === 'undefined') return;

    // Daily Cloud Spending
    const dailyCanvas = document.getElementById('chart-daily-spend');
    if (dailyCanvas && !this.charts.dailySpend) {
      const ctx = dailyCanvas.getContext('2d');
      this.charts.dailySpend = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            data: [4.8, 5.2, 4.3, 6.1, 5.8, 3.2, 3.1],
            backgroundColor: 'rgba(6, 182, 212, 0.65)',
            hoverBackgroundColor: '#06b6d4',
            borderRadius: 6
          }]
        },
        options: this.getDefaultOptions('$', 8)
      });
    }

    // Monthly Comparison
    const monthlyCanvas = document.getElementById('chart-monthly-compare');
    if (monthlyCanvas && !this.charts.monthlyCompare) {
      const ctx = monthlyCanvas.getContext('2d');
      this.charts.monthlyCompare = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Jun', 'Jul', 'Aug', 'Sep (Est)'],
          datasets: [
            {
              label: 'Actual Spend',
              data: [178, 163, 155, 128],
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              borderRadius: 6
            },
            {
              label: 'Optimized Target',
              data: [140, 135, 130, 115],
              backgroundColor: 'rgba(16, 185, 129, 0.7)',
              borderRadius: 6
            }
          ]
        },
        options: {
          ...this.getDefaultOptions('$', 200),
          plugins: {
            legend: {
              display: true,
              labels: { color: '#94a3b8', font: { family: 'Inter', size: 10 } }
            }
          }
        }
      });
    }

    // Cost vs Server Count
    const correlationCanvas = document.getElementById('chart-cost-servers');
    if (correlationCanvas && !this.charts.costVsServer) {
      const ctx = correlationCanvas.getContext('2d');
      this.charts.costVsServer = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['1 Server', '2 Servers', '3 Servers', '4 Servers', '5 Servers'],
          datasets: [
            {
              label: 'Monthly Cost ($)',
              data: [42.8, 85.6, 128.4, 171.2, 214.0],
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              tension: 0.3,
              fill: true,
              pointRadius: 4,
              pointBackgroundColor: '#8b5cf6'
            }
          ]
        },
        options: this.getDefaultOptions('$', 250)
      });
    }
  }

  // Push new live telemetry point
  pushMetrics(cpu, memory, servers) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (this.charts.cpu) {
      this.charts.cpu.data.labels.push(time);
      this.charts.cpu.data.datasets[0].data.push(cpu);
      if (this.charts.cpu.data.labels.length > this.maxDataPoints) {
        this.charts.cpu.data.labels.shift();
        this.charts.cpu.data.datasets[0].data.shift();
      }
      this.charts.cpu.update('none');
    }

    if (this.charts.memory) {
      this.charts.memory.data.labels.push(time);
      this.charts.memory.data.datasets[0].data.push(memory);
      if (this.charts.memory.data.labels.length > this.maxDataPoints) {
        this.charts.memory.data.labels.shift();
        this.charts.memory.data.datasets[0].data.shift();
      }
      this.charts.memory.update('none');
    }

    if (this.charts.servers) {
      this.charts.servers.data.labels.push(time);
      this.charts.servers.data.datasets[0].data.push(servers);
      if (this.charts.servers.data.labels.length > this.maxDataPoints) {
        this.charts.servers.data.labels.shift();
        this.charts.servers.data.datasets[0].data.shift();
      }
      this.charts.servers.update('none');
    }
  }
}

export const Charts = new ChartController();
