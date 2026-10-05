/**
 * animations.js - Sistema de Animações de Alta Performance (GPU Composited)
 * Parte integrante do Modern Frontend Kit.
 * 
 * Atende ao requisito estrito:
 * Animações de objetos infinitas na rolagem (repetíveis sempre que entrarem e saírem da viewport),
 * executadas estritamente via transform e opacity (60/120fps sem reflows)
 * e com respeito incondicional à diretiva prefers-reduced-motion.
 */

export class AnimationsEngine {
  /**
   * @param {Object} options Configurações do observador
   * @param {string} options.rootMargin Margem de detecção da viewport
   * @param {number|number[]} options.threshold Porcentagem visível para disparar
   * @param {boolean} options.repeat Se verdadeiro, anima toda vez que o objeto entra na tela (infinito)
   */
  constructor(options = {}) {
    this.options = {
      rootMargin: options.rootMargin || '0px 0px -40px 0px',
      threshold: options.threshold || 0.12,
      selector: options.selector || '[class*="anim-"], [data-anim]',
      repeat: options.repeat !== undefined ? options.repeat : true, // OBRIGATÓRIO: infinito/repetível na rolagem
      ...options
    };

    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.observer = null;
    this.parallaxElements = [];
    this.isParallaxRunning = false;
  }

  /**
   * Inicializa o motor de animações
   */
  init() {
    // 1. Se o usuário prefere redução de movimento, ativa tudo estaticamente sem animação
    if (this.prefersReducedMotion) {
      document.querySelectorAll(this.options.selector).forEach(el => {
        el.classList.add('is-animated', 'animation-completed');
      });
      return;
    }

    // 2. Configura o IntersectionObserver para animações de entrada e saída (infinitas)
    this.setupObserver();

    // 3. Registra elementos com animação
    this.observeElements();

    // 4. Inicializa o sistema de Parallax leve
    this.setupParallax();
  }

  /**
   * Cria a instância do IntersectionObserver reutilizável e infinito
   */
  setupObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        const isRepeatable = el.dataset.animRepeat !== undefined
          ? el.dataset.animRepeat === 'true'
          : this.options.repeat;

        if (entry.isIntersecting) {
          // Entrou na viewport -> dispara a animação
          this.triggerAnimation(el);

          if (!isRepeatable) {
            this.observer.unobserve(el);
          }
        } else if (isRepeatable) {
          // Saiu da viewport pela rolagem -> reseta o estado para animar novamente ao retornar
          this.resetAnimation(el);
        }
      });
    }, {
      rootMargin: this.options.rootMargin,
      threshold: this.options.threshold
    });
  }

  /**
  /**
   * Obtém os itens filhos para animação em cascata (stagger)
   * @param {HTMLElement} el
   * @returns {HTMLElement[]|NodeList}
   */
  getStaggerChildren(el) {
    const items = el.querySelectorAll('.anim-stagger-item');
    return items.length > 0 ? items : Array.from(el.children);
  }

  /**
   * Adiciona elementos ao observador
   */
  observeElements() {
    const elements = document.querySelectorAll(this.options.selector);

    elements.forEach((el) => {
      // Se for item de stagger, configura índice dinâmico se ausente
      if (el.classList.contains('anim-stagger-parent')) {
        const children = this.getStaggerChildren(el);
        children.forEach((child, index) => {
          child.style.setProperty('--stagger-index', index);
        });
      }

      // Parallax é tratado separadamente
      if (el.classList.contains('anim-parallax')) {
        this.parallaxElements.push(el);
      } else {
        this.observer.observe(el);
      }
    });
  }

  /**
   * Dispara a animação no elemento e seus itens em cascata
   * @param {HTMLElement} el
   */
  triggerAnimation(el) {
    el.classList.remove('animation-completed');
    el.classList.add('is-animated');

    // Se for contêiner de stagger, anima os filhos progressivamente
    if (el.classList.contains('anim-stagger-parent')) {
      const children = this.getStaggerChildren(el);
      children.forEach((child, index) => {
        child.style.setProperty('--stagger-index', index);
        child.classList.remove('animation-completed');
        child.classList.add('is-animated');
      });
    }

    // Libera will-change após a transição finalizar para economia de GPU
    const onTransitionEnd = () => {
      if (el.classList.contains('is-animated')) {
        el.classList.add('animation-completed');
      }
      el.removeEventListener('transitionend', onTransitionEnd);
    };
    el.addEventListener('transitionend', onTransitionEnd, { once: true });
  }

  /**
   * Reseta a animação ao sair da viewport para permitir execução infinita ao rolar novamente
   * @param {HTMLElement} el
   */
  resetAnimation(el) {
    el.classList.remove('is-animated', 'animation-completed');

    if (el.classList.contains('anim-stagger-parent')) {
      const children = this.getStaggerChildren(el);
      children.forEach(child => {
        child.classList.remove('is-animated', 'animation-completed');
      });
    }
  }

  /**
   * Sistema de Parallax suave usando requestAnimationFrame e transform3d
   */
  setupParallax() {
    if (this.parallaxElements.length === 0 || this.prefersReducedMotion) return;

    const onScroll = () => {
      if (!this.isParallaxRunning) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          this.parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.parallaxSpeed) || 0.15;
            const rect = el.getBoundingClientRect();
            // Calcula apenas quando visível na tela
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              const offset = (scrollY - (el.offsetTop - window.innerHeight / 2)) * speed;
              el.style.setProperty('--parallax-y', `${offset.toFixed(1)}px`);
            }
          });
          this.isParallaxRunning = false;
        });
        this.isParallaxRunning = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /**
   * Adiciona dinamicamente novos elementos ao observador (ex: conteúdo dinâmico / modais)
   * @param {HTMLElement|NodeList} target
   */
  refresh(target = document) {
    if (this.prefersReducedMotion) return;
    const elements = target instanceof HTMLElement ? [target] : target;
    elements.forEach(el => {
      if (el.matches && el.matches(this.options.selector)) {
        this.observer?.observe(el);
      }
      el.querySelectorAll?.(this.options.selector).forEach(child => {
        this.observer?.observe(child);
      });
    });
  }
}
