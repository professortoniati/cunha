/**
 * CUNHA SOLUÇÕES — SCRIPT PRINCIPAL
 * Funcionalidades: Navbar Sticky, Menu Mobile, FAQ Accordion, Máscara de Telefone,
 * Validação Inteligente e Integração com WhatsApp.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initMobileMenu();
  initFaqAccordion();
  initPhoneMask();
  initBudgetForm();
  initCheckboxCards();
  initSmoothScroll();
});

/**
 * 1. NAVBAR SCROLL EFFECT
 */
function initNavbarScroll() {
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
 * 2. MOBILE MENU CONTROLLER
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');
  const backdrop = document.getElementById('mobile-menu-backdrop');
  const menuLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !mobileMenu) return;

  const openMenu = () => {
    mobileMenu.classList.remove('translate-x-full');
    backdrop.classList.remove('opacity-0', 'pointer-events-none');
    document.body.classList.add('overflow-hidden');
    toggleBtn.setAttribute('aria-expanded', 'true');
  };

  const closeMenu = () => {
    mobileMenu.classList.add('translate-x-full');
    backdrop.classList.add('opacity-0', 'pointer-events-none');
    document.body.classList.remove('overflow-hidden');
    toggleBtn.setAttribute('aria-expanded', 'false');
  };

  toggleBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (backdrop) backdrop.addEventListener('click', closeMenu);

  menuLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.classList.contains('translate-x-full')) {
      closeMenu();
    }
  });
}

/**
 * 3. ACCORDION FAQ
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Fecha todos os outros itens
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        const otherBtn = otherItem.querySelector('.faq-header');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });

      // Alterna o item atual
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
 * 4. MÁSCARA AUTOMÁTICA DE WHATSAPP / TELEFONE
 */
function initPhoneMask() {
  const phoneInputs = document.querySelectorAll('input[type="tel"], #client-phone');

  phoneInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);

      if (value.length > 10) {
        // Formato Celular/WhatsApp: (11) 99999-9999
        value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
      } else if (value.length > 6) {
        // Formato Telefone fixo: (11) 5555-5555
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
 * 5. CHECKBOX CARDS INTERATIVOS
 */
function initCheckboxCards() {
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
 * 6. FORMULÁRIO DE ORÇAMENTO INTELIGENTE (ENVIO WHATSAPP)
 */
function initBudgetForm() {
  const form = document.getElementById('budget-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Coleta dos campos
    const nameInput = document.getElementById('client-name');
    const phoneInput = document.getElementById('client-phone');
    const emailInput = document.getElementById('client-email');
    const cityInput = document.getElementById('client-city');
    const neighborhoodInput = document.getElementById('client-neighborhood');
    const propertyTypeSelect = document.getElementById('property-type');
    const urgencyInput = document.querySelector('input[name="urgency"]:checked');
    const contactTimeSelect = document.getElementById('contact-time');
    const detailsInput = document.getElementById('client-details');

    // Validação Básica
    let isValid = true;

    if (!nameInput.value.trim()) {
      showError(nameInput, 'Por favor, informe seu nome.');
      isValid = false;
    } else {
      clearError(nameInput);
    }

    const cleanPhone = phoneInput.value.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      showError(phoneInput, 'Informe um número de WhatsApp válido com DDD.');
      isValid = false;
    } else {
      clearError(phoneInput);
    }

    if (!isValid) {
      const firstError = form.querySelector('.error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Coleta dos serviços selecionados
    const selectedServices = [];
    const serviceCheckboxes = form.querySelectorAll('input[name="services"]:checked');
    serviceCheckboxes.forEach(cb => selectedServices.push(cb.value));

    const servicesText = selectedServices.length > 0 
      ? selectedServices.join(', ') 
      : 'Não especificado (orientar no atendimento)';

    const urgencyText = urgencyInput ? urgencyInput.value : 'Normal';
    const contactTimeText = contactTimeSelect ? contactTimeSelect.value : 'Qualquer horário';
    const emailText = emailInput && emailInput.value.trim() ? emailInput.value.trim() : 'Não informado';
    const cityText = cityInput && cityInput.value.trim() ? cityInput.value.trim() : 'São Paulo';
    const neighborhoodText = neighborhoodInput && neighborhoodInput.value.trim() ? neighborhoodInput.value.trim() : 'Não informado';
    const detailsText = detailsInput && detailsInput.value.trim() ? detailsInput.value.trim() : 'Nenhuma observação adicional.';

    // Monta a mensagem estruturada conforme SPEC.md
    const messageLines = [
      '⚡ *Olá! Gostaria de solicitar um orçamento elétrico.*',
      '',
      '👤 *DADOS DO CLIENTE*',
      `*Nome:* ${nameInput.value.trim()}`,
      `*WhatsApp:* ${phoneInput.value.trim()}`,
      `*E-mail:* ${emailText}`,
      `*Local:* ${cityText} - Bairro: ${neighborhoodText}`,
      '',
      '🛠️ *SERVIÇO SOLICITADO*',
      `*Tipo de Atendimento:* ${propertyTypeSelect.value}`,
      `*Serviço(s) Desejado(s):* ${servicesText}`,
      '',
      '⏰ *PREFERÊNCIAS*',
      `*Urgência:* ${urgencyText}`,
      `*Melhor Horário para Contato:* ${contactTimeText}`,
      '',
      '📝 *DETALHES DA NECESSIDADE*',
      detailsText
    ];

    const fullMessage = messageLines.join('\n');
    const targetWhatsAppNumber = '5511974330973';
    const encodedMessage = encodeURIComponent(fullMessage);
    const whatsappUrl = `https://wa.me/${targetWhatsAppNumber}?text=${encodedMessage}`;

    // Exibe modal de confirmação ou redireciona
    showSuccessModal(whatsappUrl);
  });
}

function showError(input, message) {
  input.classList.add('error');
  let errSpan = input.parentElement.querySelector('.error-message');
  if (!errSpan) {
    errSpan = document.createElement('span');
    errSpan.className = 'error-message text-xs text-red-600 font-medium mt-1 block';
    input.parentElement.appendChild(errSpan);
  }
  errSpan.textContent = message;
}

function clearError(input) {
  input.classList.remove('error');
  const errSpan = input.parentElement.querySelector('.error-message');
  if (errSpan) errSpan.remove();
}

/**
 * 7. MODAL DE SUCESSO E ABERTURA DO WHATSAPP
 */
function showSuccessModal(url) {
  const modal = document.getElementById('success-modal');
  const openBtn = document.getElementById('modal-open-wa');

  if (modal && openBtn) {
    openBtn.href = url;
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Abre automaticamente após breve delay amigável
    setTimeout(() => {
      window.open(url, '_blank');
    }, 400);

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
 * 8. SMOOTH SCROLL & PRE-SELEÇÃO DE SERVIÇOS
 */
function initSmoothScroll() {
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

        // Se for um link de serviço com data-service, marca a checkbox correspondente no formulário
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
