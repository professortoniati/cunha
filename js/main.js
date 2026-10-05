/**
 * main.js - Orquestrador Principal do Frontend (Modern Frontend Kit)
 * Cunha Soluções — Instalações Elétricas em São Paulo
 * 
 * Módulos integrados:
 * - AnimationsEngine (Animações aceleradas por GPU, scroll infinito e micro-interações)
 * - AnimatedCounters (Contadores progressivos com repetição na rolagem)
 * - LazyLoadManager (Carregamento sob demanda e prevenção total de CLS)
 * - Componentes Acessíveis (FAQ, Modal, Mobile Nav, Toasts)
 * - PerformanceOptimizer (Prevenção de layout thrashing e RUM Web Vitals)
 * - Regras de Negócio Cunha Soluções (Máscara de WhatsApp, Formulário e Orçamento)
 */

import { AnimationsEngine } from './modules/animations.js';
import { AnimatedCounters } from './modules/counters.js';
import { LazyLoadManager } from './modules/lazyload.js';
import { ToastManager } from './modules/components.js';
import { PerformanceOptimizer } from './modules/performance.js';

class CunhaFrontendApp {
  constructor() {
    this.animations = null;
    this.counters = null;
    this.lazyLoad = null;
  }

  /**
   * Inicialização sequencial e otimizada da aplicação
   */
  init() {
    // 1. Inicializar Lazy Loading com decodificação assíncrona
    this.lazyLoad = new LazyLoadManager();
    this.lazyLoad.init();

    // 2. Inicializar Motor de Animações com repetição infinita no scroll
    this.animations = new AnimationsEngine({
      repeat: true, // OBRIGATÓRIO: Animação dispara toda vez que entra na viewport
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12
    });
    this.animations.init();

    // 3. Inicializar Contadores Animados Reutilizáveis
    this.counters = new AnimatedCounters({
      repeat: true,
      locale: 'pt-BR'
    });
    this.counters.init();

    // 4. Inicializar Funcionalidades da Aplicação Cunha Soluções
    this.initNavbarScroll();
    this.initMobileMenu();
    this.initFaqAccordion();
    this.initPhoneMask();
    this.initCheckboxCards();
    this.initBudgetForm();
    this.initSmoothScroll();

    // 5. Monitorar Web Vitals em ambiente de teste ou console debug
    const isDebug = window.location.search.includes('debug=1') || window.location.hostname === 'localhost';
    PerformanceOptimizer.monitorWebVitals(isDebug);

    // 6. Expor helpers utilitários no escopo global
    window.Kit = {
      toast: ToastManager.show,
      refresh: () => {
        this.animations.refresh();
        this.lazyLoad.refresh();
      },
      app: this
    };

    console.info('⚡ Cunha Soluções — Modern Frontend Kit inicializado com sucesso.');
  }

  /**
   * Efeito Sticky & Blur na Navbar ao rolar
   */
  initNavbarScroll() {
    const header = document.getElementById('main-header');
    if (!header) return;

    const handleScroll = () => {
      if (window.scrollY > 30) {
        header.classList.add('navbar-scrolled');
      } else {
        header.classList.remove('navbar-scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /**
   * Menu Mobile Acessível (Drawer & Backdrop)
   */
  initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeBtn = document.getElementById('mobile-menu-close');
    const backdrop = document.getElementById('mobile-menu-backdrop');
    const menuLinks = document.querySelectorAll('.mobile-nav-link');

    if (!toggleBtn || !mobileMenu) return;

    const openMenu = () => {
      mobileMenu.classList.remove('translate-x-full');
      backdrop?.classList.remove('opacity-0', 'pointer-events-none');
      document.body.classList.add('overflow-hidden');
      toggleBtn.setAttribute('aria-expanded', 'true');
    };

    const closeMenu = () => {
      mobileMenu.classList.add('translate-x-full');
      backdrop?.classList.add('opacity-0', 'pointer-events-none');
      document.body.classList.remove('overflow-hidden');
      toggleBtn.setAttribute('aria-expanded', 'false');
    };

    toggleBtn.addEventListener('click', openMenu);
    closeBtn?.addEventListener('click', closeMenu);
    backdrop?.addEventListener('click', closeMenu);

    menuLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !mobileMenu.classList.contains('translate-x-full')) {
        closeMenu();
        toggleBtn.focus();
      }
    });
  }

  /**
   * Acordeão de Perguntas Frequentes (FAQ) com WAI-ARIA
   */
  initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
      const header = item.querySelector('.faq-header');
      if (!header) return;

      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Fecha outros itens para foco limpo
        faqItems.forEach(otherItem => {
          otherItem.classList.remove('active');
          const otherBtn = otherItem.querySelector('.faq-header');
          otherBtn?.setAttribute('aria-expanded', 'false');
        });

        // Alterna o item clicado
        if (!isActive) {
          item.classList.add('active');
          header.setAttribute('aria-expanded', 'true');
        } else {
          header.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /**
   * Máscara Automática de Telefone/WhatsApp Brasileiro
   */
  initPhoneMask() {
    const phoneInputs = document.querySelectorAll('input[type="tel"], #client-phone');

    phoneInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);

        if (value.length > 10) {
          // Formato Celular: (11) 99999-9999
          value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        } else if (value.length > 6) {
          // Formato Fixo: (11) 5555-5555
          value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
        } else if (value.length > 2) {
          value = value.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
        } else if (value.length > 0) {
          value = value.replace(/^(\d*)$/, '($1');
        }

        e.target.value = value;
      });
    });
  }

  /**
   * Checkbox Cards Interativos para Seleção de Serviços
   */
  initCheckboxCards() {
    const cards = document.querySelectorAll('.checkbox-card');
    cards.forEach(card => {
      const input = card.querySelector('input[type="checkbox"]');
      if (!input) return;

      const updateStyle = () => {
        if (input.checked) {
          card.classList.add('checked');
        } else {
          card.classList.remove('checked');
        }
      };

      input.addEventListener('change', updateStyle);
      updateStyle();
    });
  }

  /**
   * Formulário Inteligente de Orçamento e Integração com WhatsApp Oficial
   */
  initBudgetForm() {
    const form = document.getElementById('budget-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('client-name');
      const phoneInput = document.getElementById('client-phone');
      const emailInput = document.getElementById('client-email');
      const cityInput = document.getElementById('client-city');
      const neighborhoodInput = document.getElementById('client-neighborhood');
      const propertyTypeSelect = document.getElementById('property-type');
      const urgencyInput = document.querySelector('input[name="urgency"]:checked');
      const contactTimeSelect = document.getElementById('contact-time');
      const detailsInput = document.getElementById('client-details');

      let isValid = true;

      // Validação do Nome
      if (!nameInput.value.trim()) {
        this.showInputError(nameInput, 'Por favor, informe seu nome completo.');
        isValid = false;
      } else {
        this.clearInputError(nameInput);
      }

      // Validação do WhatsApp
      const cleanPhone = phoneInput.value.replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length < 10) {
        this.showInputError(phoneInput, 'Informe um número de WhatsApp válido com DDD.');
        isValid = false;
      } else {
        this.clearInputError(phoneInput);
      }

      if (!isValid) {
        const firstError = form.querySelector('.error');
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Coleta dos serviços selecionados
      const selectedServices = [];
      const serviceCheckboxes = form.querySelectorAll('input[name="services"]:checked');
      serviceCheckboxes.forEach(cb => selectedServices.push(cb.value));

      const servicesText = selectedServices.length > 0
        ? selectedServices.join(', ')
        : 'Geral / A combinar no atendimento';

      const urgencyText = urgencyInput ? urgencyInput.value : 'Normal';
      const contactTimeText = contactTimeSelect ? contactTimeSelect.value : 'Qualquer horário';
      const emailText = emailInput && emailInput.value.trim() ? emailInput.value.trim() : 'Não informado';
      const cityText = cityInput && cityInput.value.trim() ? cityInput.value.trim() : 'São Paulo';
      const neighborhoodText = neighborhoodInput && neighborhoodInput.value.trim() ? neighborhoodInput.value.trim() : 'Não informado';
      const detailsText = detailsInput && detailsInput.value.trim() ? detailsInput.value.trim() : 'Sem observações adicionais.';

      // Monta mensagem estruturada para o WhatsApp
      const messageLines = [
        '⚡ *Olá! Gostaria de solicitar um orçamento elétrico com a Cunha Soluções.*',
        '',
        '👤 *DADOS DO CLIENTE*',
        `*Nome:* ${nameInput.value.trim()}`,
        `*WhatsApp:* ${phoneInput.value.trim()}`,
        `*E-mail:* ${emailText}`,
        `*Local:* ${cityText} - Bairro: ${neighborhoodText}`,
        '',
        '🛠️ *SERVIÇO SOLICITADO*',
        `*Tipo de Imóvel:* ${propertyTypeSelect ? propertyTypeSelect.value : 'Residencial'}`,
        `*Serviço(s):* ${servicesText}`,
        '',
        '⏰ *PREFERÊNCIAS*',
        `*Urgência:* ${urgencyText}`,
        `*Melhor Horário:* ${contactTimeText}`,
        '',
        '📝 *DETALHES DO PEDIDO*',
        detailsText
      ];

      const fullMessage = messageLines.join('\n');
      const targetWhatsAppNumber = '5511974330973';
      const encodedMessage = encodeURIComponent(fullMessage);
      const whatsappUrl = `https://wa.me/${targetWhatsAppNumber}?text=${encodedMessage}`;

      this.showSuccessModal(whatsappUrl);
    });
  }

  showInputError(input, message) {
    input.classList.add('error');
    let errSpan = input.parentElement.querySelector('.error-message');
    if (!errSpan) {
      errSpan = document.createElement('span');
      errSpan.className = 'error-message text-xs text-red-600 font-medium mt-1 block';
      input.parentElement.appendChild(errSpan);
    }
    errSpan.textContent = message;
  }

  clearInputError(input) {
    input.classList.remove('error');
    const errSpan = input.parentElement.querySelector('.error-message');
    if (errSpan) errSpan.remove();
  }

  /**
   * Modal de Confirmação e Redirecionamento
   */
  showSuccessModal(url) {
    const modal = document.getElementById('success-modal');
    const openBtn = document.getElementById('modal-open-wa');

    if (modal && openBtn) {
      openBtn.href = url;
      modal.classList.remove('hidden');
      modal.classList.add('flex');

      // Auto-abertura amigável
      setTimeout(() => {
        window.open(url, '_blank');
      }, 500);

      const closeBtn = document.getElementById('modal-close-btn');
      if (closeBtn) {
        closeBtn.onclick = () => {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        };
      }
    } else {
      window.open(url, '_blank');
    }
  }

  /**
   * Rolagem suave e pré-seleção de serviços no formulário
   */
  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || !targetId.startsWith('#')) return;

        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

          // Se tiver atributo data-service, marca a checkbox correspondente no formulário
          const serviceName = this.getAttribute('data-service');
          if (serviceName) {
            const checkbox = document.querySelector(`input[name="services"][value="${serviceName}"]`);
            if (checkbox) {
              checkbox.checked = true;
              const parentCard = checkbox.closest('.checkbox-card');
              if (parentCard) parentCard.classList.add('checked');
            }
          }
        }
      });
    });
  }
}

// Inicialização segura quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new CunhaFrontendApp();
    app.init();
  });
} else {
  const app = new CunhaFrontendApp();
  app.init();
}

export {
  CunhaFrontendApp,
  AnimationsEngine,
  AnimatedCounters,
  LazyLoadManager,
  ToastManager,
  PerformanceOptimizer
};
