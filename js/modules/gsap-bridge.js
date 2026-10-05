/**
 * gsap-bridge.js - Ponte sob demanda para Animações Avançadas com GSAP + ScrollTrigger
 * IMPORTANTE: GSAP só é baixado e executado se houver elementos declarando [data-gsap].
 * Caso contrário, o peso do bundle permanece ZERO.
 */

export class GSAPBridge {
  static isLoaded = false;
  static gsap = null;
  static ScrollTrigger = null;

  /**
   * Verifica se a página contém elementos requisitando efeitos avançados GSAP
   */
  static shouldLoad() {
    return document.querySelector('[data-gsap]') !== null;
  }

  /**
   * Importa dinamicamente GSAP e ScrollTrigger via CDN ESM moderno
   */
  static async load() {
    if (GSAPBridge.isLoaded) return { gsap: GSAPBridge.gsap, ScrollTrigger: GSAPBridge.ScrollTrigger };

    try {
      // Importa via CDN ESM leve apenas quando necessário
      const gsapModule = await import('https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm');
      const scrollTriggerModule = await import('https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger/+esm');

      GSAPBridge.gsap = gsapModule.gsap || gsapModule.default;
      GSAPBridge.ScrollTrigger = scrollTriggerModule.ScrollTrigger || scrollTriggerModule.default;

      GSAPBridge.gsap.registerPlugin(GSAPBridge.ScrollTrigger);
      GSAPBridge.isLoaded = true;

      console.info('[GSAPBridge] GSAP + ScrollTrigger carregados com sucesso sob demanda.');
      return { gsap: GSAPBridge.gsap, ScrollTrigger: GSAPBridge.ScrollTrigger };
    } catch (err) {
      console.warn('[GSAPBridge] Não foi possível carregar GSAP dinamicamente. Utilizando fallback nativo CSS.', err);
      return null;
    }
  }

  /**
   * Inicializa efeitos avançados registrados
   */
  static async init() {
    if (!GSAPBridge.shouldLoad()) return;

    const loaded = await GSAPBridge.load();
    if (!loaded) return;

    const { gsap, ScrollTrigger } = loaded;

    // Exemplo de Timeline avançada com Pin / Scrube para elementos [data-gsap="pin"]
    document.querySelectorAll('[data-gsap="pin"]').forEach(section => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=100%',
        pin: true,
        pinSpacing: true
      });
    });

    // Exemplo de rotação / morph em scroll para [data-gsap="rotate"]
    document.querySelectorAll('[data-gsap="rotate"]').forEach(el => {
      gsap.to(el, {
        rotation: 360,
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
    });
  }
}
