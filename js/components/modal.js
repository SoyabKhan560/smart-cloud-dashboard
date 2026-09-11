/**
 * Modal Dialog Component for Confirmations and Actions
 */

export class ModalManager {
  static init() {
    let overlay = document.getElementById('global-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'global-modal-overlay';
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-header">
            <div class="modal-title" id="modal-title">
              <i class="fas fa-question-circle text-cyan"></i>
              <span id="modal-title-text">Confirm Action</span>
            </div>
            <button class="toast-close" id="modal-close-x"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body" id="modal-body-text">Are you sure you want to proceed?</div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="modal-btn-cancel">Cancel</button>
            <button class="btn btn-primary" id="modal-btn-confirm">Confirm</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      // Event listeners
      overlay.querySelector('#modal-close-x').addEventListener('click', () => this.close());
      overlay.querySelector('#modal-btn-cancel').addEventListener('click', () => this.close());
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.close();
      });
    }
    this.overlay = overlay;
  }

  static confirm({ title, message, confirmText = 'Confirm', confirmClass = 'btn-primary', onConfirm }) {
    if (!this.overlay) this.init();

    const titleEl = this.overlay.querySelector('#modal-title-text');
    const bodyEl = this.overlay.querySelector('#modal-body-text');
    const confirmBtn = this.overlay.querySelector('#modal-btn-confirm');

    titleEl.textContent = title;
    bodyEl.innerHTML = message;
    confirmBtn.textContent = confirmText;
    confirmBtn.className = `btn ${confirmClass}`;

    // Clean up old listener
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    newConfirmBtn.addEventListener('click', () => {
      this.close();
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
    });

    this.overlay.classList.add('active');
  }

  static close() {
    if (this.overlay) {
      this.overlay.classList.remove('active');
    }
  }
}
