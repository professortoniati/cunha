/**
 * counters.js - Sistema de Contadores Animados Reutilizável
 * Parte integrante do Modern Frontend Kit.
 * 
 * Acionado estritamente via Intersection Observer quando o elemento entra na viewport.
 * Suporta contagem infinita/repetível na rolagem (reseta e reconta ao sair e entrar da tela).
 * Suporte a números inteiros/decimais, porcentagens e moedas (BRL, USD, EUR) via Intl.NumberFormat.
 */

export class AnimatedCounters {
  /**
   * @param {Object} options
   * @param {string} options.selector Seletor CSS dos elementos contadores
   * @param {string} options.locale Localidade padrão para formatação
   * @param {boolean} options.repeat Se deve re-animar ao rolar novamente
   */
  constructor(options = {}) {
    this.selector = options.selector || '[data-counter-target]';
    this.defaultLocale = options.locale || 'pt-BR';
    this.repeat = options.repeat !== undefined ? options.repeat : true;
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.observer = null;
    this.activeAnimations = new WeakMap();
  }

  /**
   * Inicializa o observador dos contadores
   */
  init() {
    const elements = document.querySelectorAll(this.selector);
    if (!elements.length) return;

    if (this.prefersReducedMotion) {
      elements.forEach(el => this.renderFinalValue(el));
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        const isRepeatable = el.dataset.counterRepeat !== undefined
          ? el.dataset.counterRepeat === 'true'
          : this.repeat;

        if (entry.isIntersecting) {
          this.animateCounter(el);
          if (!isRepeatable) {
            this.observer.unobserve(el);
          }
        } else if (isRepeatable) {
          // Cancela animação ativa se ainda estiver rodando
          const cancelFn = this.activeAnimations.get(el);
          if (cancelFn) {
            cancelFn();
            this.activeAnimations.delete(el);
          }
          // Reseta para o valor inicial antes da próxima aparição
          this.renderInitialValue(el);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -30px 0px'
    });

    elements.forEach(el => {
      this.renderInitialValue(el);
      this.observer.observe(el);
    });
  }

  /**
   * Renderiza o valor inicial (0) com o formato correto
   * @param {HTMLElement} el
   */
  renderInitialValue(el) {
    const type = el.dataset.counterType || 'number';
    const currency = el.dataset.counterCurrency || 'BRL';
    const decimals = parseInt(el.dataset.counterDecimals, 10) || (type === 'currency' ? 2 : 0);
    const prefix = el.dataset.counterPrefix || '';
    const suffix = el.dataset.counterSuffix || (type === 'percent' ? '%' : '');
    const locale = el.dataset.counterLocale || this.defaultLocale;

    const formatter = this.createFormatter(type, currency, decimals, locale);
    let formatted = formatter.format(0);
    if (type === 'percent' && !formatted.includes('%') && !suffix.includes('%')) {
      formatted += '%';
    }
    el.textContent = `${prefix}${formatted}${suffix}`;
  }

  /**
   * Anima o contador com curva de aceleração suave (easeOutExpo)
   * @param {HTMLElement} el
   */
  animateCounter(el) {
    const target = parseFloat(el.dataset.counterTarget) || 0;
    const duration = parseInt(el.dataset.counterDuration, 10) || 1600;
    const type = el.dataset.counterType || 'number';
    const currency = el.dataset.counterCurrency || 'BRL';
    const decimals = parseInt(el.dataset.counterDecimals, 10) || (type === 'currency' ? 2 : (target % 1 !== 0 ? 1 : 0));
    const prefix = el.dataset.counterPrefix || '';
    const suffix = el.dataset.counterSuffix || (type === 'percent' ? '%' : '');
    const locale = el.dataset.counterLocale || this.defaultLocale;

    let startTime = null;
    let animFrameId = null;
    let isCancelled = false;

    this.activeAnimations.set(el, () => {
      isCancelled = true;
      if (animFrameId) cancelAnimationFrame(animFrameId);
    });

    const formatter = this.createFormatter(type, currency, decimals, locale);

    const step = (currentTime) => {
      if (isCancelled) return;
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Curva EaseOutExpo: 1 - 2^(-10 * progress)
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentValue = ease * target;

      let formatted = formatter.format(currentValue);

      if (type === 'percent' && !formatted.includes('%') && !suffix.includes('%')) {
        formatted += '%';
      }

      el.textContent = `${prefix}${formatted}${suffix}`;

      if (progress < 1) {
        animFrameId = window.requestAnimationFrame(step);
      } else {
        this.renderFinalValue(el);
        this.activeAnimations.delete(el);
      }
    };

    animFrameId = window.requestAnimationFrame(step);
  }

  /**
   * Cria o formatador nativo Intl.NumberFormat
   */
  createFormatter(type, currency, decimals, locale) {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        });
      case 'percent':
        return new Intl.NumberFormat(locale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        });
      case 'number':
      default:
        return new Intl.NumberFormat(locale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        });
    }
  }

  /**
   * Renderiza o valor final diretamente sem animação (para acessibilidade ou término)
   * @param {HTMLElement} el
   */
  renderFinalValue(el) {
    const target = parseFloat(el.dataset.counterTarget) || 0;
    const type = el.dataset.counterType || 'number';
    const currency = el.dataset.counterCurrency || 'BRL';
    const decimals = parseInt(el.dataset.counterDecimals, 10) || (type === 'currency' ? 2 : (target % 1 !== 0 ? 1 : 0));
    const prefix = el.dataset.counterPrefix || '';
    const suffix = el.dataset.counterSuffix || (type === 'percent' ? '%' : '');
    const locale = el.dataset.counterLocale || this.defaultLocale;

    const formatter = this.createFormatter(type, currency, decimals, locale);
    let formatted = formatter.format(target);

    if (type === 'percent' && !formatted.includes('%') && !suffix.includes('%')) {
      formatted += '%';
    }

    el.textContent = `${prefix}${formatted}${suffix}`;
  }
}
