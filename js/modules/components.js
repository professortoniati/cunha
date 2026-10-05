/**
 * components.js - Componentes Acessíveis e Reutilizáveis em Vanilla JS
 * Implementa Dialog Modal nativo com Focus Trap, Tabs com suporte a Teclado ARIA,
 * Acordeão com grid CSS e Navegação Mobile com controle de foco.
 */

/* ==========================================================================
   1. MODAL ACESSÍVEL (Utilizando a API nativa <dialog>)
   ========================================================================== */
export class AccessibleModal {
  constructor() {
    this.openTriggers = document.querySelectorAll('[data-modal-open]');
    this.closeTriggers = document.querySelectorAll('[data-modal-close]');
    this.activeTrigger = null;
  }

  init() {
    this.openTriggers.forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-modal-open');
        const modal = document.getElementById(modalId);
        if (modal && typeof modal.showModal === 'function') {
          this.activeTrigger = btn;
          modal.showModal();
          document.body.style.overflow = 'hidden';
        }
      });
    });

    this.closeTriggers.forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('dialog');
        this.closeModal(modal);
      });
    });

    // Fechar ao clicar no backdrop do dialog
    document.querySelectorAll('dialog.modal').forEach(dialog => {
      dialog.addEventListener('click', (e) => {
        const rect = dialog.getBoundingClientRect();
        const isInDialog = (
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width
        );
        if (!isInDialog) {
          this.closeModal(dialog);
        }
      });

      // Trata tecla Escape
      dialog.addEventListener('close', () => {
        document.body.style.overflow = '';
        if (this.activeTrigger) {
          this.activeTrigger.focus();
          this.activeTrigger = null;
        }
      });
    });
  }

  closeModal(modal) {
    if (modal && modal.open) {
      modal.close();
      document.body.style.overflow = '';
      if (this.activeTrigger) {
        this.activeTrigger.focus();
        this.activeTrigger = null;
      }
    }
  }
}

/* ==========================================================================
   2. ABAS ACESSÍVEIS (WAI-ARIA Tabs Pattern com Teclado)
   ========================================================================== */
export class AccessibleTabs {
  constructor(containerSelector = '.tabs') {
    this.containers = document.querySelectorAll(containerSelector);
  }

  init() {
    this.containers.forEach(container => {
      const tabList = container.querySelector('[role="tablist"]');
      const tabs = container.querySelectorAll('[role="tab"]');
      const panels = container.querySelectorAll('[role="tabpanel"]');

      if (!tabList || !tabs.length) return;

      tabs.forEach((tab, index) => {
        // Clique do mouse
        tab.addEventListener('click', () => {
          this.activateTab(tab, tabs, panels);
        });

        // Navegação pelo teclado (ArrowLeft, ArrowRight, Home, End)
        tab.addEventListener('keydown', (e) => {
          let targetIndex = null;

          if (e.key === 'ArrowRight') {
            targetIndex = (index + 1) % tabs.length;
          } else if (e.key === 'ArrowLeft') {
            targetIndex = (index - 1 + tabs.length) % tabs.length;
          } else if (e.key === 'Home') {
            targetIndex = 0;
          } else if (e.key === 'End') {
            targetIndex = tabs.length - 1;
          }

          if (targetIndex !== null) {
            e.preventDefault();
            tabs[targetIndex].focus();
            this.activateTab(tabs[targetIndex], tabs, panels);
          }
        });
      });
    });
  }

  activateTab(selectedTab, allTabs, allPanels) {
    allTabs.forEach(t => {
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
    });

    selectedTab.setAttribute('aria-selected', 'true');
    selectedTab.setAttribute('tabindex', '0');

    const controlsId = selectedTab.getAttribute('aria-controls');
    allPanels.forEach(p => {
      if (p.id === controlsId) {
        p.removeAttribute('hidden');
      } else {
        p.setAttribute('hidden', '');
      }
    });
  }
}

/* ==========================================================================
   3. ACORDEÃO ACESSÍVEL (Accordion / Disclosure)
   ========================================================================== */
export class AccessibleAccordion {
  constructor(accordionSelector = '.accordion') {
    this.accordions = document.querySelectorAll(accordionSelector);
  }

  init() {
    this.accordions.forEach(accordion => {
      const triggers = accordion.querySelectorAll('.accordion-trigger');

      triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
          const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
          const allowMultiple = accordion.dataset.allowMultiple === 'true';

          if (!allowMultiple && !isExpanded) {
            // Fecha outros acordeões no mesmo grupo
            triggers.forEach(other => {
              if (other !== trigger) {
                other.setAttribute('aria-expanded', 'false');
              }
            });
          }

          trigger.setAttribute('aria-expanded', (!isExpanded).toString());
        });
      });
    });
  }
}

/* ==========================================================================
   4. NAVEGAÇÃO MOBILE (Offcanvas / Hamburger Menu)
   ========================================================================== */
export class AccessibleMobileNav {
  constructor() {
    this.toggleBtn = document.querySelector('.nav-toggle');
    this.drawer = document.querySelector('.mobile-nav-drawer');
  }

  init() {
    if (!this.toggleBtn || !this.drawer) return;

    this.toggleBtn.addEventListener('click', () => {
      const isOpen = this.drawer.classList.contains('is-open');
      this.toggle(!isOpen);
    });

    // Fecha ao clicar em um link interno
    this.drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => this.toggle(false));
    });

    // Fecha ao pressionar Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.drawer.classList.contains('is-open')) {
        this.toggle(false);
        this.toggleBtn.focus();
      }
    });
  }

  toggle(shouldOpen) {
    this.drawer.classList.toggle('is-open', shouldOpen);
    this.toggleBtn.setAttribute('aria-expanded', shouldOpen.toString());
    document.body.style.overflow = shouldOpen ? 'hidden' : '';
  }
}

/* ==========================================================================
   5. GERENCIADOR DE TOASTS (Notificações Não-Bloqueantes)
   ========================================================================== */
export class ToastManager {
  static container = null;

  static init() {
    if (!ToastManager.container) {
      ToastManager.container = document.createElement('div');
      ToastManager.container.className = 'toast-container';
      ToastManager.container.setAttribute('aria-live', 'polite');
      ToastManager.container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(ToastManager.container);
    }
  }

  /**
   * Dispara uma notificação toast
   * @param {string} message Mensagem exibida
   * @param {string} type 'success' | 'error' | 'info'
   * @param {number} duration Duração em ms
   */
  static show(message, type = 'info', duration = 3500) {
    ToastManager.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${message}</span>
      <button type="button" aria-label="Fechar notificação" style="margin-inline-start: 10px; font-weight: bold; cursor: pointer;">&times;</button>
    `;

    ToastManager.container.appendChild(toast);

    // Animação de entrada
    requestAnimationFrame(() => {
      toast.classList.add('is-visible');
    });

    const close = () => {
      toast.classList.remove('is-visible');
      toast.addEventListener('transitionend', () => {
        toast.remove();
      }, { once: true });
    };

    toast.querySelector('button').addEventListener('click', close);
    setTimeout(close, duration);
  }
}
