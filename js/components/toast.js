/**
 * Toast Notification Component
 */

export class ToastManager {
  static init() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    this.container = container;
  }

  static show({ title, message, type = 'info', duration = 4000 }) {
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle text-success';
    else if (type === 'warning') iconClass = 'fa-exclamation-triangle text-warning';
    else if (type === 'critical') iconClass = 'fa-times-circle text-critical';
    else iconClass = 'fa-bell text-cyan';

    toast.innerHTML = `
      <div class="toast-icon"><i class="fas ${iconClass}"></i></div>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close notification"><i class="fas fa-times"></i></button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
      toast.style.animation = 'slideInRight 0.25s reverse forwards';
      setTimeout(() => toast.remove(), 250);
    };

    closeBtn.addEventListener('click', dismiss);
    if (duration > 0) {
      setTimeout(dismiss, duration);
    }

    this.container.appendChild(toast);
  }

  static success(title, message) {
    this.show({ title, message, type: 'success' });
  }

  static warning(title, message) {
    this.show({ title, message, type: 'warning' });
  }

  static critical(title, message) {
    this.show({ title, message, type: 'critical' });
  }

  static info(title, message) {
    this.show({ title, message, type: 'info' });
  }
}
