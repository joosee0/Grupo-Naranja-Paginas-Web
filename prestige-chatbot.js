(function () {
  'use strict';

  const AI_CONFIG = {
    provider: 'groq',

    /* --- GROQ 
    groq: {
    apiKey: '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',  
    model: 'llama-3.3-70b-versatile',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    },

    /* Prompt del sistema — personaliza el tono y la información del negocio */
    systemPrompt: `Eres Elena, asesora inmobiliaria de Inmobiliaria Prestige, una firma de bienes raíces de alto standing con sede en España. 
Tu estilo es: educado, sofisticado, discreto y profesional. Usas un lenguaje refinado pero cercano, nunca vulgar ni excesivamente informal.
Ayudas a los clientes a encontrar propiedades de lujo, villas frente al mar, áticos exclusivos y residencias de alto nivel.
Siempre ofreces agendar visitas personalizadas. Cuando el usuario quiera agendar, solicita nombre, teléfono y email con elegancia.
Respuestas: concisas (máx. 3-4 frases), en español, siempre amables. Nunca reveles que eres una IA a menos que te lo pregunten directamente.`,
  };

  /* ========================================================================
     RESPUESTAS AUTOMÁTICAS LOCALES (cuando provider = 'none')
     ======================================================================== */
  const AUTO_RESPONSES = {
    propiedades_destacadas: `Con mucho gusto. Actualmente contamos con una cuidada selección de residencias exclusivas: villas de lujo en primera línea, áticos con vistas panorámicas y propiedades de obra nueva en urbanizaciones privadas. ¿Le gustaría que le enviemos un dossier personalizado o prefiere que concretemos una visita?`,

    buscar_zona: `Por supuesto. Trabajamos en las zonas más codiciadas: Marbella, Sotogrande, Costa del Sol, Sierra Nevada y áreas exclusivas de Madrid y Barcelona. ¿Tiene alguna zona o radio en mente? Con placer le preparo una selección a medida.`,

    agendar_visita: `Encantada de organizar su visita privada. Para coordinarla de manera óptima, le solicito algunos datos de contacto. Rellene el formulario a continuación y nos pondremos en contacto con usted a la mayor brevedad.`,

    frente_al_mar: `Una elección excelente. Disponemos de propiedades en primera y segunda línea de playa en la Costa del Sol, Baleares y Costa Brava. Desde villas con acceso directo a la playa hasta penthouses con terrazas infinitas sobre el Mediterráneo. ¿Desea conocer alguna en particular?`,

    hablar_asesor: `Por supuesto, será un placer ponerle en contacto con uno de nuestros asesores personales. Puede llamarnos al +34 900 000 000 (lunes a viernes, 9h–20h) o dejarnos sus datos y le llamamos nosotros en el momento que prefiera.`,

    default: `Gracias por su consulta. En Inmobiliaria Prestige estamos a su disposición para ofrecerle el servicio más personalizado. ¿Podría indicarme con más detalle qué tipo de propiedad o información está buscando? Estaré encantada de ayudarle.`,
  };

  /* ========================================================================
     QUICK REPLIES — botones de acceso rápido
     ======================================================================== */
  const QUICK_REPLIES = [
    { label: '✦ Ver propiedades destacadas', key: 'propiedades_destacadas' },
    { label: '⌖ Buscar por zona',            key: 'buscar_zona' },
    { label: '◎ Agendar una visita',          key: 'agendar_visita' },
    { label: '◉ Propiedades frente al mar',   key: 'frente_al_mar' },
    { label: '◈ Hablar con un asesor',        key: 'hablar_asesor' },
  ];

  /* ========================================================================
     ESTADO DEL WIDGET
     ======================================================================== */
  let isOpen          = false;
  let isTyping        = false;
  let leadFormVisible = false;
  let conversationHistory = []; // Para memoria multi-turno con la IA
  let welcomeShown    = false;

  /* ========================================================================
     CONSTRUCCIÓN DEL DOM
     ======================================================================== */
  function buildWidget() {
    // Contenedor raíz
    const widget = document.createElement('div');
    widget.id = 'prestige-chatbot-widget';
    widget.innerHTML = `
      <!-- Burbuja de apertura -->
      <button id="pc-bubble" aria-label="Abrir chat con asesor inmobiliario" title="Habla con Elena, tu asesora personal">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <div id="pc-badge">1</div>
      </button>

      <!-- Ventana del chat -->
      <div id="pc-window" role="dialog" aria-label="Chat con asesor Inmobiliaria Prestige">

        <!-- Header -->
        <div id="pc-header">
          <div id="pc-avatar">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div id="pc-header-info">
            <div id="pc-header-name">Elena — Asesora Prestige</div>
            <div id="pc-header-status">Disponible ahora</div>
          </div>
          <button id="pc-close-btn" aria-label="Cerrar chat">
            <svg viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Mensajes -->
        <div id="pc-messages" role="log" aria-live="polite"></div>

        <!-- Typing indicator -->
        <div id="pc-typing">
          <div class="pc-msg-avatar">
            <svg viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="pc-typing-dots">
            <span></span><span></span><span></span>
          </div>
        </div>

        <!-- Mensaje de éxito lead -->
        <div id="pc-lead-success">
          <p><strong>¡Perfecto, muchas gracias!</strong><br>
          Uno de nuestros asesores se pondrá en contacto con usted en breve para confirmar todos los detalles de su visita.</p>
        </div>

        <!-- Quick Replies -->
        <div id="pc-quick-replies"></div>

        <!-- Formulario de captura de leads -->
        <div id="pc-lead-form">
          <div class="pc-lead-title">◇ Datos para su visita privada</div>
          <div class="pc-lead-field">
            <svg class="pc-lead-icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <input type="text" id="pc-lead-name" placeholder="Su nombre completo" autocomplete="name" />
          </div>
          <div class="pc-lead-field">
            <svg class="pc-lead-icon" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.18 6.18l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <input type="tel" id="pc-lead-phone" placeholder="Teléfono de contacto" autocomplete="tel" />
          </div>
          <div class="pc-lead-field">
            <svg class="pc-lead-icon" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <input type="email" id="pc-lead-email" placeholder="Correo electrónico" autocomplete="email" />
          </div>
          <button class="pc-lead-submit" id="pc-lead-submit-btn">Solicitar visita privada →</button>
          <button class="pc-lead-cancel" id="pc-lead-cancel-btn">Cancelar</button>
        </div>

        <!-- Input área -->
        <div id="pc-input-area">
          <textarea
            id="pc-input"
            placeholder="Escriba su consulta..."
            rows="1"
            maxlength="500"
            aria-label="Escribir mensaje"
          ></textarea>
          <button id="pc-send-btn" aria-label="Enviar mensaje">
            <svg viewBox="0 0 24 24">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

        <!-- Footer -->
        <div id="pc-footer-note">
          Asesoría inmobiliaria de lujo · <span>Inmobiliaria Prestige</span>
        </div>

      </div>
    `;

    document.body.appendChild(widget);
  }

  /* ========================================================================
     AÑADIR MENSAJE AL CHAT
     ======================================================================== */
  function addMessage(text, role = 'bot', animate = true) {
    const container = document.getElementById('pc-messages');
    const div = document.createElement('div');
    div.className = `pc-msg pc-${role}${animate ? '' : ' pc-no-anim'}`;

    if (role === 'bot') {
      div.innerHTML = `
        <div class="pc-msg-avatar">
          <svg viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div class="pc-bubble-msg">${formatMessage(text)}</div>
      `;
    } else {
      div.innerHTML = `<div class="pc-bubble-msg">${escapeHtml(text)}</div>`;
    }

    container.appendChild(div);
    scrollToBottom();

    // Guarda en historial para contexto de IA
    conversationHistory.push({
      role: role === 'bot' ? 'assistant' : 'user',
      content: text,
    });
  }

  /* Formatea texto del bot: convierte **negrita** y saltos de línea */
  function formatMessage(text) {
    return escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function scrollToBottom() {
    const el = document.getElementById('pc-messages');
    if (el) setTimeout(() => { el.scrollTop = el.scrollHeight; }, 50);
  }

  /* ========================================================================
     TYPING INDICATOR
     ======================================================================== */
  function showTyping() {
    const el = document.getElementById('pc-typing');
    if (el) el.classList.add('pc-visible');
    isTyping = true;
    scrollToBottom();
  }

  function hideTyping() {
    const el = document.getElementById('pc-typing');
    if (el) el.classList.remove('pc-visible');
    isTyping = false;
  }

  /* ========================================================================
     QUICK REPLIES — renderizar
     ======================================================================== */
  function renderQuickReplies() {
    const container = document.getElementById('pc-quick-replies');
    if (!container) return;
    container.innerHTML = '';
    QUICK_REPLIES.forEach(qr => {
      const btn = document.createElement('button');
      btn.className = 'pc-qr-btn';
      btn.textContent = qr.label;
      btn.dataset.key = qr.key;
      btn.addEventListener('click', () => handleQuickReply(qr));
      container.appendChild(btn);
    });
    container.classList.remove('pc-hidden');
  }

  function hideQuickReplies() {
    const el = document.getElementById('pc-quick-replies');
    if (el) el.classList.add('pc-hidden');
  }

  /* ========================================================================
     MANEJO DE QUICK REPLIES
     ======================================================================== */
  async function handleQuickReply(qr) {
    hideQuickReplies();

    // Mensaje del usuario (texto visible del botón sin el símbolo decorativo)
    const cleanLabel = qr.label.replace(/^[✦⌖◎◉◈]\s*/, '');
    addMessage(cleanLabel, 'user');

    // Si es "agendar visita", mostramos el formulario en lugar de respuesta
    if (qr.key === 'agendar_visita') {
      await delay(600);
      addMessage(AUTO_RESPONSES.agendar_visita, 'bot');
      await delay(400);
      showLeadForm();
      return;
    }

    // Obtener respuesta
    await respondTo(cleanLabel, qr.key);
  }

  /* ========================================================================
     ENVÍO DE MENSAJE LIBRE
     ======================================================================== */
  async function sendMessage() {
    const input = document.getElementById('pc-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text || isTyping) return;

    input.value = '';
    input.style.height = 'auto';
    hideQuickReplies();
    addMessage(text, 'user');

    await respondTo(text, null);
  }

  /* ========================================================================
     LÓGICA DE RESPUESTA — local o IA
     ======================================================================== */
  async function respondTo(userText, quickKey) {
    showTyping();

    let response;

    if (AI_CONFIG.provider === 'groq') {
      response = await callGroq(userText);
    } else if (AI_CONFIG.provider === 'gemini') {
      response = await callGemini(userText);
    } else {
      // Respuestas locales — simula tiempo de escritura
      await delay(1000 + Math.random() * 800);
      response = quickKey
        ? (AUTO_RESPONSES[quickKey] || AUTO_RESPONSES.default)
        : AUTO_RESPONSES.default;
    }

    hideTyping();
    addMessage(response, 'bot');

    // Mostrar quick replies de nuevo tras respuesta del bot
    setTimeout(renderQuickReplies, 300);
  }

  /* ========================================================================
     INTEGRACIÓN CON GROQ API
     Documentación: https://console.groq.com/docs/openai
     ======================================================================== */
  async function callGroq(userText) {
    const messages = [
      { role: 'system', content: AI_CONFIG.systemPrompt },
      ...conversationHistory.slice(-10), // Últimos 10 mensajes para contexto
      { role: 'user', content: userText },
    ];

    try {
      const res = await fetch(AI_CONFIG.groq.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.groq.apiKey}`,
        },
        body: JSON.stringify({
          model: AI_CONFIG.groq.model,
          messages,
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content || AUTO_RESPONSES.default;

    } catch (err) {
      console.warn('[Prestige Chatbot] Groq error:', err);
      return AUTO_RESPONSES.default;
    }
  }

  /* ========================================================================
     INTEGRACIÓN CON GEMINI API
     Documentación: https://ai.google.dev/gemini-api/docs
     ======================================================================== */
  async function callGemini(userText) {
    const endpoint = `${AI_CONFIG.gemini.endpoint}${AI_CONFIG.gemini.model}:generateContent?key=${AI_CONFIG.gemini.apiKey}`;

    // Construir historial de conversación para Gemini
    const contents = conversationHistory.slice(-10).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    contents.push({ role: 'user', parts: [{ text: userText }] });

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: AI_CONFIG.systemPrompt }] },
          contents,
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
        }),
      });

      if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || AUTO_RESPONSES.default;

    } catch (err) {
      console.warn('[Prestige Chatbot] Gemini error:', err);
      return AUTO_RESPONSES.default;
    }
  }

  /* ========================================================================
     FORMULARIO DE LEADS
     ======================================================================== */
  function showLeadForm() {
    const form = document.getElementById('pc-lead-form');
    if (form) {
      form.classList.add('pc-visible');
      leadFormVisible = true;
      hideQuickReplies();
      const nameInput = document.getElementById('pc-lead-name');
      if (nameInput) setTimeout(() => nameInput.focus(), 100);
    }
  }

  function hideLeadForm() {
    const form = document.getElementById('pc-lead-form');
    if (form) {
      form.classList.remove('pc-visible');
      leadFormVisible = false;
      renderQuickReplies();
    }
  }

  function submitLeadForm() {
    const name  = document.getElementById('pc-lead-name')?.value.trim();
    const phone = document.getElementById('pc-lead-phone')?.value.trim();
    const email = document.getElementById('pc-lead-email')?.value.trim();

    if (!name) {
      alert('Por favor, indique su nombre completo.');
      return;
    }
    if (!phone && !email) {
      alert('Por favor, proporcione al menos un método de contacto.');
      return;
    }

    /* -----------------------------------------------------------------------
       AQUÍ PUEDES ENVIAR LOS DATOS A TU BACKEND O CRM
       Ejemplo con fetch:

       fetch('/api/leads', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ name, phone, email, source: 'chatbot' })
       });

       O con EmailJS / FormSpree / cualquier integración.
    ----------------------------------------------------------------------- */
    console.log('[Prestige Chatbot] Nuevo lead:', { name, phone, email });

    // Ocultar formulario y mostrar éxito
    hideLeadForm();
    const success = document.getElementById('pc-lead-success');
    if (success) success.classList.add('pc-visible');

    // Mensaje de confirmación en el chat
    setTimeout(() => {
      addMessage(
        `Muchas gracias, **${name}**. Su solicitud de visita ha sido registrada. ` +
        `Le contactaremos pronto a través de ${phone || email} para confirmar todos los detalles.`,
        'bot'
      );
      setTimeout(renderQuickReplies, 400);
    }, 600);
  }

  /* ========================================================================
     ABRIR / CERRAR VENTANA
     ======================================================================== */
  function openChat() {
    isOpen = true;
    const win    = document.getElementById('pc-window');
    const bubble = document.getElementById('pc-bubble');
    const badge  = document.getElementById('pc-badge');

    if (win)    win.classList.add('pc-open');
    if (bubble) bubble.classList.add('pc-hidden');
    if (badge)  badge.style.display = 'none';

    // Mostrar mensaje de bienvenida la primera vez
    if (!welcomeShown) {
      welcomeShown = true;
      setTimeout(() => {
        showTyping();
        setTimeout(() => {
          hideTyping();
          addMessage(
            `Bienvenido a **Inmobiliaria Prestige**. Soy Elena, su asesora personal.\n\n` +
            `Estoy aquí para ayudarle a encontrar la propiedad de sus sueños. ` +
            `¿En qué puedo asistirle hoy?`,
            'bot'
          );
          setTimeout(renderQuickReplies, 400);
        }, 1400);
      }, 300);
    }

    setTimeout(() => {
      const input = document.getElementById('pc-input');
      if (input) input.focus();
    }, 400);
  }

  function closeChat() {
    isOpen = false;
    const win    = document.getElementById('pc-window');
    const bubble = document.getElementById('pc-bubble');

    if (win)    win.classList.remove('pc-open');
    if (bubble) bubble.classList.remove('pc-hidden');
  }

  /* ========================================================================
     UTILIDADES
     ======================================================================== */
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /* ========================================================================
     AUTO-RESIZE DEL TEXTAREA
     ======================================================================== */
  function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 80) + 'px';
  }

  /* ========================================================================
     EVENT LISTENERS
     ======================================================================== */
  function bindEvents() {
    // Abrir chat
    document.getElementById('pc-bubble')?.addEventListener('click', openChat);

    // Cerrar chat
    document.getElementById('pc-close-btn')?.addEventListener('click', closeChat);

    // Enviar con botón
    document.getElementById('pc-send-btn')?.addEventListener('click', sendMessage);

    // Enviar con Enter (Shift+Enter = nueva línea)
    document.getElementById('pc-input')?.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Auto-resize textarea
    document.getElementById('pc-input')?.addEventListener('input', function () {
      autoResize(this);
    });

    // Formulario de lead — enviar
    document.getElementById('pc-lead-submit-btn')?.addEventListener('click', submitLeadForm);

    // Formulario de lead — cancelar
    document.getElementById('pc-lead-cancel-btn')?.addEventListener('click', () => {
      hideLeadForm();
      addMessage('De acuerdo. ¿En qué más puedo ayudarle?', 'bot');
    });

    // Cerrar con ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closeChat();
    });

    // Enter en campos del formulario de lead
    ['pc-lead-name', 'pc-lead-phone', 'pc-lead-email'].forEach(id => {
      document.getElementById(id)?.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitLeadForm();
        }
      });
    });
  }

  /* ========================================================================
     INICIALIZACIÓN
     ======================================================================== */
  function init() {
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else {
      setup();
    }
  }

  function setup() {
    buildWidget();
    bindEvents();
    // Pequeña animación de entrada de la burbuja
    setTimeout(() => {
      const bubble = document.getElementById('pc-bubble');
      if (bubble) bubble.style.animation = 'pc-bubble-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }, 800);
  }

  // Añadir animación de entrada de la burbuja al CSS dinámicamente
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pc-bubble-enter {
      from { opacity: 0; transform: scale(0) translateY(20px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
  `;
  document.head.appendChild(style);

  // Lanzar
  init();

})();
