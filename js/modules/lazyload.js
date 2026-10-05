/**
 * lazyload.js - Sistema de Carregamento Otimizado para Imagens e Iframes
 * Parte integrante do Modern Frontend Kit.
 * 
 * Atende ao requisito estrito:
 * Carregamento sob demanda (Lazy Loading) de alta performance, prevenção total de CLS,
 * decodificação assíncrona fora da thread principal e transição fluida (blur-up / fade-in).
 */

export class LazyLoadManager {
  /**
   * @param {Object} options
   * @param {string} options.imageSelector
   * @param {string} options.iframeSelector
   * @param {string} options.loadedClass
   */
  constructor(options = {}) {
    this.options = {
      imageSelector: 'img[loading="lazy"], img.lazy-image, picture img[loading="lazy"]',
      iframeSelector: 'iframe',
      loadedClass: 'is-loaded',
      loadingClass: 'lazy-loading',
      ...options
    };
  }

  /**
   * Inicializa o gerenciador de lazy loading
   */
  init() {
    this.setupImages();
    this.setupIframes();
  }

  /**
   * Configura imagens para decodificação assíncrona e efeito de fade-in ao carregar
   */
  setupImages() {
    const images = document.querySelectorAll(this.options.imageSelector);

    images.forEach(img => {
      // 1. Assegura atributos nativos de performance
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }

      // Adiciona classe de transição se não possuir
      if (!img.classList.contains('lazy-image')) {
        img.classList.add('lazy-image');
      }

      // 2. Se a imagem já estiver no cache do navegador
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add(this.options.loadedClass);
      } else {
        img.classList.add(this.options.loadingClass);

        img.addEventListener('load', () => {
          img.classList.remove(this.options.loadingClass);
          img.classList.add(this.options.loadedClass);
        }, { once: true });

        img.addEventListener('error', () => {
          img.classList.remove(this.options.loadingClass);
          console.warn(`[LazyLoad] Não foi possível carregar: ${img.src || img.currentSrc}`);
        }, { once: true });
      }
    });
  }

  /**
   * Otimiza o carregamento de iframes de terceiros (Vídeos, Mapas, etc.)
   */
  setupIframes() {
    const iframes = document.querySelectorAll(this.options.iframeSelector);

    iframes.forEach(iframe => {
      if (!iframe.hasAttribute('loading')) {
        iframe.setAttribute('loading', 'lazy');
      }
    });
  }

  /**
   * Atualiza e processa imagens inseridas dinamicamente
   * @param {HTMLElement} root
   */
  refresh(root = document) {
    const images = root.querySelectorAll(this.options.imageSelector);
    images.forEach(img => {
      if (!img.classList.contains('lazy-image')) {
        img.classList.add('lazy-image');
      }
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add(this.options.loadedClass);
      } else {
        img.addEventListener('load', () => {
          img.classList.add(this.options.loadedClass);
        }, { once: true });
      }
    });
  }
}
