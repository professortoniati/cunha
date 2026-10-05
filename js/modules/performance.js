/**
 * performance.js - Monitoramento de Web Vitals, Prevenção de Reflows e Dynamic Imports
 * Fornece otimizações para LCP (Largest Contentful Paint), CLS (Cumulative Layout Shift)
 * e INP (Interaction to Next Paint).
 */

export class PerformanceOptimizer {
  /**
   * Monitora métricas de Core Web Vitals localmente para auditoria contínua
   */
  static monitorWebVitals(debug = false) {
    if (!('PerformanceObserver' in window)) return;

    try {
      // 1. Monitorar LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (debug) {
          console.info(`[Web Vitals] LCP: ${lastEntry.startTime.toFixed(2)}ms`, lastEntry.element);
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // 2. Monitorar CLS (Cumulative Layout Shift)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            if (debug) {
              console.info(`[Web Vitals] CLS acumulado: ${clsValue.toFixed(4)}`, entry.sources);
            }
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      // 3. Monitorar INP / Interações
      const inpObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (debug) {
            console.info(`[Web Vitals] Interação (Duração: ${entry.duration.toFixed(2)}ms):`, entry.name);
          }
        }
      });
      inpObserver.observe({ type: 'event', durationThreshold: 40, buffered: true });
    } catch (e) {
      // Silencioso em navegadores sem suporte a certas flags
    }
  }

  /**
   * Carregamento dinâmico adiado até tempo ocioso (requestIdleCallback)
   * @param {Function} importFn Função retornando import('...')
   * @param {number} timeout Tempo limite em ms
   */
  static loadOnIdle(importFn, timeout = 2500) {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => importFn(), { timeout });
    } else {
      setTimeout(() => importFn(), 1000);
    }
  }

  /**
   * Carregamento dinâmico na primeira interação do usuário (pointerdown, scroll, keydown)
   * Ideal para widgets pesados (chat, mapas, carrosséis secundários)
   * @param {Function} importFn
   */
  static loadOnFirstInteraction(importFn) {
    const trigger = () => {
      ['pointerdown', 'touchstart', 'keydown', 'scroll'].forEach(evt => {
        window.removeEventListener(evt, trigger, { passive: true });
      });
      importFn();
    };

    ['pointerdown', 'touchstart', 'keydown', 'scroll'].forEach(evt => {
      window.addEventListener(evt, trigger, { passive: true, once: true });
    });
  }

  /**
   * Utilitário Anti-Layout Thrashing: Agrupa leituras antes de escritas
   * @param {Function} readFn Operações de getComputedStyle, offsetHeight, etc.
   * @param {Function} writeFn Operações de style.transform, classList, etc.
   */
  static batch(readFn, writeFn) {
    window.requestAnimationFrame(() => {
      const readResult = readFn ? readFn() : null;
      window.requestAnimationFrame(() => {
        if (writeFn) writeFn(readResult);
      });
    });
  }
}
