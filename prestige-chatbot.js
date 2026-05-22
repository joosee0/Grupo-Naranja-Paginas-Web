(function () {
  'use strict';
 
  const AI_CONFIG = {
    provider: 'none', 
    
  together: {
  apiKey: 'api key aqui',
  model: 'meta-llama/Llama-3.3-70b-instruct-turbo', // Ejemplo de modelo
  endpoint: 'https://together.xyz',
},
 
    groq: {
      apiKey: 'api key aqui cuando la tenga',
      model: 'llama-3.3-70b-versatile',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    },
 
    gemini: {
      apiKey: 'api key aqui cuando la tenga',
      model: 'gemini-1.5-flash',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/',
    },
 
    systemPrompt: `Eres Elena, asesora inmobiliaria de Inmobiliaria Prestige, una firma de bienes raíces de alto standing con sede en Sevilla, España.
Tu estilo es: educado, sofisticado, discreto y profesional. Usas un lenguaje refinado pero cercano, nunca vulgar ni excesivamente informal.
Ayudas a los clientes a encontrar propiedades de lujo, villas, áticos exclusivos y residencias en Sevilla y su área metropolitana (Alcalá de Guadaíra, Dos Hermanas, Mairena del Aljarafe, La Rinconada).
Siempre ofreces agendar visitas personalizadas. Cuando el usuario quiera agendar, solicita nombre, teléfono y email con elegancia.
Respuestas: concisas (máx. 3-4 frases), en español, siempre amables. Nunca reveles que eres una IA a menos que te lo pregunten directamente.`,
  };
 
  /* ========================================================================
     RESPUESTAS AUTOMÁTICAS LOCALES, 
     ======================================================================== */
  const AUTO_RESPONSES = {
    propiedades_destacadas: `Con mucho gusto. Actualmente contamos con una cuidada selección de residencias exclusivas en Sevilla: villas contemporáneas en Alcalá de Guadaíra, áticos con vistas panorámicas en Triana y propiedades de obra nueva en urbanizaciones privadas. ¿Le gustaría concretar una visita personalizada?`,
    buscar_zona: `Por supuesto. Trabajamos en las zonas más codiciadas del área metropolitana: Sevilla Capital, Alcalá de Guadaíra, Dos Hermanas, Mairena del Aljarafe y La Rinconada. ¿Tiene alguna zona en mente? Con placer le preparo una selección a medida.`,
    agendar_visita: `Encantada de organizar su visita privada. Para coordinarla de manera óptima, le solicito algunos datos de contacto. Rellene el formulario a continuación y nos pondremos en contacto con usted a la mayor brevedad.`,
    frente_al_mar: `Una elección excelente. Aunque nuestra especialidad son las residencias de lujo en Sevilla y su área metropolitana, también gestionamos propiedades en la Costa del Sol y Cádiz. ¿Le gustaría que le preparáramos una selección combinada?`,
    hablar_asesor: `Por supuesto, será un placer ponerle en contacto con uno de nuestros asesores personales. Puede llamarnos al +34 900 000 000 (lunes a viernes, 9h–20h) o dejarnos sus datos y le llamamos en el momento que prefiera.`,
    presupuesto: `Trabajamos con un amplio rango de presupuestos, desde pisos reformados desde 295.000 € hasta fincas señoriales por encima de 2.000.000 €. ¿Podría indicarme qué rango tiene en mente? Así le ofrezco las opciones más ajustadas a sus necesidades.`,
    default: `Gracias por su consulta. En Inmobiliaria Prestige estamos a su disposición para ofrecerle el servicio más personalizado. ¿Podría indicarme con más detalle qué tipo de propiedad o información está buscando? Estaré encantada de ayudarle.`,
    comprar_piso: `Excelente decisión. Disponemos de pisos de obra nueva y reformados en las mejores ubicaciones de Sevilla, desde 295.000 €. Contamos con opciones de 2, 3 y 4 dormitorios con acabados de alta calidad. ¿Tiene alguna zona preferida o un presupuesto en mente?`,
    alquiler: `Gestionamos una selecta cartera de inmuebles en alquiler en Sevilla y área metropolitana, desde apartamentos céntricos hasta villas privadas. Los precios oscilan entre 900 € y 4.500 € mensuales según la tipología. ¿Busca para uso personal o inversión?`,
    vender_propiedad: `Si desea vender su propiedad, en Prestige le ofrecemos una valoración gratuita y profesional, junto con una estrategia de comercialización exclusiva. Gestionamos todo el proceso con total discreción. ¿Le gustaría que un asesor se pasara a valorar su inmueble?`,
    obra_nueva: `Contamos con promociones de obra nueva en las zonas más demandadas de Sevilla: Nervión, Los Remedios, Triana y urbanizaciones de lujo en la periferia. Entrega inmediata y en construcción. ¿Le interesa alguna zona en particular?`,
    garaje_trastero: `Sí, la mayoría de nuestras propiedades incluyen plaza de garaje y trastero. También gestionamos la venta y alquiler de plazas independientes en Sevilla Capital desde 18.000 €. ¿Necesita algo concreto?`,
    hipoteca_financiacion: `Trabajamos con las principales entidades bancarias y disponemos de acuerdos preferentes para nuestros clientes. Podemos orientarle con simulaciones de hipoteca sin compromiso. ¿Desea que nuestro asesor financiero se ponga en contacto con usted?`,
    documentacion: `Los documentos habituales para la compra son: DNI/NIE, nota simple del Registro de la Propiedad, certificado energético, escritura de compraventa y justificante de pago del ITP o IVA según el caso. Le guiamos en cada paso para que el proceso sea totalmente transparente.`,
    gastos_compra: `Al precio de compra hay que añadir entre un 10% y un 12% en gastos: ITP (7% en Andalucía para segunda mano) o IVA (10% para obra nueva), notaría, registro y gestoría. Le facilitamos un desglose detallado antes de cualquier firma.`,
    valoracion_gratuita: `Ofrecemos valoraciones gratuitas y sin compromiso realizadas por nuestros expertos tasadores. El proceso es rápido: en 24–48 horas tiene un informe detallado del valor de mercado de su inmueble. ¿Le agendamos una valoración?`,
    horario_contacto: `Nuestras oficinas están abiertas de lunes a viernes de 9:00 a 20:00 h y sábados de 10:00 a 14:00 h. También puede contactarnos en cualquier momento a través de este chat o por email en info@prestigeinmobiliaria.es.`,
  };
 
  /* ========================================================================
     MEJORA 13 — QUICK REPLIES CONTEXTUALES
     Distintos conjuntos de sugerencias según el flujo de conversación
     ======================================================================== */
  const QR_SETS = {
    inicial: [
      { label: '✦ Ver propiedades destacadas', key: 'propiedades_destacadas' },
      { label: '⌖ Buscar por zona',            key: 'buscar_zona' },
      { label: '◎ Agendar una visita',          key: 'agendar_visita' },
      { label: '◉ Propiedades frente al mar',   key: 'frente_al_mar' },
      { label: '◈ Hablar con un asesor',        key: 'hablar_asesor' },
      { label: '⌂ Quiero comprar un piso',      key: 'comprar_piso' },
      { label: '↩ Quiero alquilar',             key: 'alquiler' },
      { label: '◁ Vender mi propiedad',         key: 'vender_propiedad' },
      { label: '⊞ Obra nueva',                  key: 'obra_nueva' },
      { label: '€ Financiación e hipoteca',     key: 'hipoteca_financiacion' },
      { label: '≡ ¿Qué documentos necesito?',   key: 'documentacion' },
      { label: '∑ Gastos de compraventa',       key: 'gastos_compra' },
      { label: '◇ Valoración gratuita',         key: 'valoracion_gratuita' },
      { label: '◷ Horario y contacto',          key: 'horario_contacto' },
      { label: '⊡ Garaje y trastero',           key: 'garaje_trastero' },
    ],
    tras_zona: [
      { label: '€ Indicar mi presupuesto',     key: 'presupuesto' },
      { label: '◎ Agendar una visita',          key: 'agendar_visita' },
      { label: '◈ Hablar con un asesor',        key: 'hablar_asesor' },
    ],
    tras_propiedades: [
      { label: '⌖ Buscar por zona',            key: 'buscar_zona' },
      { label: '€ Indicar mi presupuesto',     key: 'presupuesto' },
      { label: '◎ Agendar una visita',          key: 'agendar_visita' },
    ],
    tras_asesor: [
      { label: '◎ Agendar una visita',          key: 'agendar_visita' },
      { label: '✦ Ver propiedades destacadas', key: 'propiedades_destacadas' },
    ],
  };
 
  const QR_NEXT = {
    propiedades_destacadas: 'tras_propiedades',
    buscar_zona:            'tras_zona',
    frente_al_mar:          'tras_propiedades',
    hablar_asesor:          'tras_asesor',
    presupuesto:            'tras_propiedades',
    comprar_piso:           'tras_zona',
    alquiler:               'tras_zona',
    vender_propiedad:       'tras_asesor',
    obra_nueva:             'tras_propiedades',
    hipoteca_financiacion:  'tras_asesor',
    documentacion:          'tras_propiedades',
    gastos_compra:          'tras_propiedades',
    valoracion_gratuita:    'tras_asesor',
    horario_contacto:       'tras_asesor',
    garaje_trastero:        'tras_propiedades',
  };
 
  /* ========================================================================
     ESTADO DEL WIDGET
     ======================================================================== */
  let isOpen             = false;
  let isTyping           = false;
  let leadFormVisible    = false;
  let welcomeShown       = false;
  let currentQRSet       = 'inicial';
  let conversationHistory = [];
  let renderableMessages  = [];
 
  /* ========================================================================
     MEJORA 3 — MEMORIA EN SESSIONSTORAGE
     ======================================================================== */
  const SESSION_KEY = 'prestige_chat_history';
 
  function loadHistory() {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        conversationHistory = p.history      || [];
        currentQRSet        = p.qrSet        || 'inicial';
        welcomeShown        = p.welcomeShown || false;
        return p.messages || [];
      }
    } catch (e) {}
    return [];
  }
 
  function saveHistory() {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        history:      conversationHistory,
        qrSet:        currentQRSet,
        welcomeShown,
        messages:     renderableMessages,
      }));
    } catch (e) {}
  }
 
  function clearHistory() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
    conversationHistory = [];
    renderableMessages  = [];
    currentQRSet        = 'inicial';
    welcomeShown        = false;
  }
 
  /* ========================================================================
     CONSTRUCCIÓN DEL DOM
     ======================================================================== */
  function buildWidget() {
    const widget = document.createElement('div');
    widget.id = 'prestige-chatbot-widget';
    widget.innerHTML = `
      <button id="pc-bubble" aria-label="Abrir chat con asesor inmobiliario" title="Habla con Elena, tu asesora personal">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <div id="pc-badge">1</div>
      </button>
 
      <div id="pc-window" role="dialog" aria-label="Chat con asesor Inmobiliaria Prestige">
 
        <div id="pc-header">
          <div id="pc-avatar">
            <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div id="pc-header-info">
            <div id="pc-header-name">Elena — Asesora Prestige</div>
            <div id="pc-header-status">Disponible ahora</div>
          </div>
          <button id="pc-reset-btn" aria-label="Nueva conversación" title="Nueva conversación">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74"/>
              <polyline points="3 3 3 9 9 9"/>
            </svg>
            <span class="pc-reset-label">Nueva</span>
          </button>
          <button id="pc-close-btn" aria-label="Cerrar chat">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
 
        <div id="pc-messages" role="log" aria-live="polite"></div>
 
        <div id="pc-typing">
          <div class="pc-msg-avatar">
            <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div class="pc-typing-dots"><span></span><span></span><span></span></div>
        </div>
 
        <div id="pc-lead-success">
          <p><strong>¡Perfecto, muchas gracias!</strong><br>
          Uno de nuestros asesores se pondrá en contacto con usted en breve para confirmar todos los detalles.</p>
        </div>
 
        <div id="pc-quick-replies"></div>
 
        <div id="pc-lead-form">
          <div class="pc-lead-title">◇ Datos para su visita privada</div>
          <div class="pc-lead-field">
            <svg class="pc-lead-icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <input type="text" id="pc-lead-name" placeholder="Su nombre completo" autocomplete="name" />
            <span class="pc-field-error" id="pc-err-name"></span>
          </div>
          <div class="pc-lead-field">
            <svg class="pc-lead-icon" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.18 6.18l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <input type="tel" id="pc-lead-phone" placeholder="Teléfono (ej: 600 123 456)" autocomplete="tel" />
            <span class="pc-field-error" id="pc-err-phone"></span>
          </div>
          <div class="pc-lead-field">
            <svg class="pc-lead-icon" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <input type="email" id="pc-lead-email" placeholder="Correo electrónico" autocomplete="email" />
            <span class="pc-field-error" id="pc-err-email"></span>
          </div>
          <button class="pc-lead-submit" id="pc-lead-submit-btn">Solicitar visita privada →</button>
          <button class="pc-lead-cancel" id="pc-lead-cancel-btn">Cancelar</button>
        </div>
 
        <div id="pc-input-area">
          <div id="pc-input-wrap">
            <textarea id="pc-input" placeholder="Escriba su consulta..." rows="1" maxlength="500" aria-label="Escribir mensaje"></textarea>
            <span id="pc-char-count">0/500</span>
          </div>
          <button id="pc-send-btn" aria-label="Enviar mensaje">
            <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
 
        <div id="pc-footer-note">
          Asesoría inmobiliaria de lujo · <span>Inmobiliaria Prestige</span>
        </div>
 
      </div>
    `;
    document.body.appendChild(widget);
  }
 
  /* ========================================================================
     MENSAJES localeessss
     ======================================================================== */
  function addMessage(text, role = 'bot', animate = true, skipSave = false) {
    const container = document.getElementById('pc-messages');
    const div = document.createElement('div');
    div.className = 'pc-msg pc-' + role + (animate ? '' : ' pc-no-anim');
 
    if (role === 'bot') {
      div.innerHTML =
        '<div class="pc-msg-avatar"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>' +
        '<div class="pc-bubble-msg">' + formatMessage(text) + '</div>';
    } else {
      div.innerHTML = '<div class="pc-bubble-msg">' + escapeHtml(text) + '</div>';
    }
 
    container.appendChild(div);
    scrollToBottom();
 
    conversationHistory.push({ role: role === 'bot' ? 'assistant' : 'user', content: text });
 
    if (!skipSave) {
      renderableMessages.push({ text, role });
      saveHistory();
    }
  }
 
  function formatMessage(text) {
    return escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }
 
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
 
  function scrollToBottom() {
    const el = document.getElementById('pc-messages');
    if (el) setTimeout(() => { el.scrollTop = el.scrollHeight; }, 50);
  }
 
  /* ========================================================================
     MEJORA 9 (desactivar botón)
     ======================================================================== */
  function showTyping() {
    document.getElementById('pc-typing')?.classList.add('pc-visible');
    isTyping = true;
    setSendEnabled(false);
    scrollToBottom();
  }
 
  function hideTyping() {
    document.getElementById('pc-typing')?.classList.remove('pc-visible');
    isTyping = false;
    setSendEnabled(true);
  }
 
  function setSendEnabled(on) {
    const btn   = document.getElementById('pc-send-btn');
    const input = document.getElementById('pc-input');
    if (btn)   { btn.disabled = !on;   btn.classList.toggle('pc-disabled', !on); }
    if (input) { input.disabled = !on; }
  }
 
  /* ========================================================================
     MEJORA 13 — contestciones rapidas CONTEXTUALES
     ======================================================================== */
  function renderQuickReplies(setKey) {
    const container = document.getElementById('pc-quick-replies');
    if (!container) return;
    const set = QR_SETS[setKey || currentQRSet] || QR_SETS.inicial;
    container.innerHTML = '';
    set.forEach(qr => {
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
    document.getElementById('pc-quick-replies')?.classList.add('pc-hidden');
  }
 
  /* ========================================================================
     contexttaciones rapidas — HANDLER
     ======================================================================== */
  async function handleQuickReply(qr) {
    hideQuickReplies();
    const cleanLabel = qr.label.replace(/^[✦⌖◎◉◈€⌂↩◁⊞≡∑◇◷⊡]\s*/, '');
    addMessage(cleanLabel, 'user');
 
    if (QR_NEXT[qr.key]) currentQRSet = QR_NEXT[qr.key];
 
    if (qr.key === 'agendar_visita') {
      await delay(600);
      addMessage(AUTO_RESPONSES.agendar_visita, 'bot');
      await delay(400);
      showLeadForm();
      return;
    }
    await respondTo(cleanLabel, qr.key);
  }
 
  /* ========================================================================
     ENVÍO DE MENSAJE
     ======================================================================== */
  async function sendMessage() {
    const input = document.getElementById('pc-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text || isTyping) return;
    input.value = '';
    input.style.height = 'auto';
    updateCharCount(0);
    hideQuickReplies();
    addMessage(text, 'user');
 
    const lower = text.toLowerCase();
    if (lower.includes('visita') || lower.includes('ver') || lower.includes('agendar') || lower.includes('cita')) {
      currentQRSet = 'tras_propiedades';
    }
    await respondTo(text, null);
  }
 
  /* ========================================================================
     ANTHROPIC API — respuestas inteligentes
     ======================================================================== */
  async function callAnthropic(userText) {
    const ctx = getPageContext();
    const sys = AI_CONFIG.systemPrompt + (ctx ? '\n\nContexto actual: ' + ctx : '');
    const messages = [
      ...conversationHistory.slice(-10),
      { role: 'user', content: userText },
    ];
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          system: sys,
          messages,
        }),
      });
      if (!res.ok) throw new Error('Anthropic ' + res.status);
      const data = await res.json();
      return data.content?.[0]?.text || AUTO_RESPONSES.default;
    } catch (err) {
      console.warn('[Chatbot] Anthropic error:', err);
      return AUTO_RESPONSES.default;
    }
  }

  /* ========================================================================
     RESPUESTA
     ======================================================================== */
  async function respondTo(userText, quickKey) {
    showTyping();
    let response;
    if (AI_CONFIG.provider === 'groq') {
      response = await callGroq(userText);
    } else if (AI_CONFIG.provider === 'gemini') {
      response = await callGemini(userText);
    } else if (quickKey && AUTO_RESPONSES[quickKey]) {
      // Quick reply con respuesta local predefinida
      await delay(900 + Math.random() * 700);
      response = AUTO_RESPONSES[quickKey];
    } else {
      // Texto libre → Anthropic API
      response = await callAnthropic(userText);
    }
    hideTyping();
    addMessage(response, 'bot');
    setTimeout(() => renderQuickReplies(currentQRSet), 300);
  }
 
  /* ========================================================================
     GROQ API (la ia=
     ======================================================================== */
  async function callGroq(userText) {
    const ctx = getPageContext();
    const sys = AI_CONFIG.systemPrompt + (ctx ? '\n\nContexto actual: ' + ctx : '');
    const messages = [
      { role: 'system', content: sys },
      ...conversationHistory.slice(-10),
      { role: 'user', content: userText },
    ];
    try {
      const res = await fetch(AI_CONFIG.groq.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + AI_CONFIG.groq.apiKey },
        body: JSON.stringify({ model: AI_CONFIG.groq.model, messages, max_tokens: 300, temperature: 0.7 }),
      });
      if (!res.ok) throw new Error('Groq ' + res.status);
      const data = await res.json();
      return data.choices?.[0]?.message?.content || AUTO_RESPONSES.default;
    } catch (err) {
      console.warn('[Chatbot] Groq error:', err);
      return AUTO_RESPONSES.default;
    }
  }
 
  /* ========================================================================
     GEMINI API (la segunda ia)
     ======================================================================== */
  async function callGemini(userText) {
    const ctx = getPageContext();
    const sys = AI_CONFIG.systemPrompt + (ctx ? '\n\nContexto actual: ' + ctx : '');
    const endpoint = AI_CONFIG.gemini.endpoint + AI_CONFIG.gemini.model + ':generateContent?key=' + AI_CONFIG.gemini.apiKey;
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
          system_instruction: { parts: [{ text: sys }] },
          contents,
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
        }),
      });
      if (!res.ok) throw new Error('Gemini ' + res.status);
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || AUTO_RESPONSES.default;
    } catch (err) {
      console.warn('[Chatbot] Gemini error:', err);
      return AUTO_RESPONSES.default;
    }
  }
 
  /* ========================================================================
     MEJORA 6 — CONTEXTO DE LA PÁGINA
     ======================================================================== */
  function getPageContext() {
    const parts = [];
    const path  = window.location.pathname;
 
    if (path.includes('propiedades')) {
      parts.push('El usuario está en la página de Propiedades.');
      const operacion = document.getElementById('operacion')?.value;
      const tipo      = document.getElementById('tipo')?.value;
      const zona      = document.getElementById('zona')?.value;
      const precio    = document.getElementById('precio')?.value;
      const hab       = document.getElementById('habitaciones')?.value;
      const texto     = document.getElementById('busquedaTexto')?.value?.trim();
      const count     = document.getElementById('countNum')?.textContent;
      if (operacion) parts.push('Operación: ' + operacion + '.');
      if (tipo)      parts.push('Tipo inmueble: ' + tipo + '.');
      if (zona)      parts.push('Zona: ' + zona + '.');
      if (precio)    parts.push('Precio máx: ' + Number(precio).toLocaleString('es-ES') + ' €.');
      if (hab)       parts.push('Habitaciones mín: ' + hab + '.');
      if (texto)     parts.push('Búsqueda: "' + texto + '".');
      if (count)     parts.push('Resultados: ' + count + '.');
    } else if (path.includes('contacto')) {
      parts.push('El usuario está en la página de Contacto.');
    } else if (path.includes('servicios')) {
      parts.push('El usuario está en la página de Servicios.');
    } else if (path.includes('index') || path === '/' || path.endsWith('/')) {
      parts.push('El usuario está en la página de Inicio.');
    }
    return parts.join(' ');
  }
 
  /* ========================================================================
     MEJORA 5 — VALIDACIÓN REAL
     ======================================================================== */
  function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
  function validatePhone(p) { return /^[\d\s\-+()]{7,15}$/.test(p); }
 
  function setFieldError(fieldId, errId, msg) {
    const f = document.getElementById(fieldId);
    const e = document.getElementById(errId);
    if (!f || !e) return;
    f.classList.toggle('pc-field-invalid', !!msg);
    e.textContent = msg || '';
  }
 
  function clearFieldErrors() {
    ['name','phone','email'].forEach(f =>
      setFieldError('pc-lead-' + f, 'pc-err-' + f, ''));
  }
 
  /* ========================================================================
     Formularioo
     ======================================================================== */
  function showLeadForm() {
    const form = document.getElementById('pc-lead-form');
    if (!form) return;
    form.classList.add('pc-visible');
    leadFormVisible = true;
    hideQuickReplies();
    clearFieldErrors();
    setTimeout(() => document.getElementById('pc-lead-name')?.focus(), 100);
  }
 
  function hideLeadForm() {
    document.getElementById('pc-lead-form')?.classList.remove('pc-visible');
    leadFormVisible = false;
    renderQuickReplies(currentQRSet);
  }
 
  function submitLeadForm() {
    const name  = (document.getElementById('pc-lead-name')?.value  || '').trim();
    const phone = (document.getElementById('pc-lead-phone')?.value || '').trim();
    const email = (document.getElementById('pc-lead-email')?.value || '').trim();
 
    let valid = true;
    clearFieldErrors();
 
    if (name.length < 2) {
      setFieldError('pc-lead-name', 'pc-err-name', 'Indique su nombre completo.');
      valid = false;
    }
    if (phone && !validatePhone(phone)) {
      setFieldError('pc-lead-phone', 'pc-err-phone', 'Formato de teléfono no válido.');
      valid = false;
    }
    if (email && !validateEmail(email)) {
      setFieldError('pc-lead-email', 'pc-err-email', 'Dirección de correo no válida.');
      valid = false;
    }
    if (!phone && !email) {
      setFieldError('pc-lead-phone', 'pc-err-phone', 'Indique teléfono o email.');
      setFieldError('pc-lead-email', 'pc-err-email', 'Indique teléfono o email.');
      valid = false;
    }
    if (!valid) return;
 
    /* -----------------------------------------------------------------------
       MEJORA 4 — ENVÍO CON EMAILJS 
       1. Añade en el HTML:
          <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
       2. cuaando tenga disponible todo:
 
       if (typeof emailjs !== 'undefined') {
         emailjs.send('TU_SERVICE_ID', 'TU_TEMPLATE_ID', {
           from_name: name, phone, email,
           page:      window.location.href,
           timestamp: new Date().toLocaleString('es-ES'),
         }, 'TU_PUBLIC_KEY');
       }
    ----------------------------------------------------------------------- */
    console.log('[Prestige Chatbot] Nuevo lead:', { name, phone, email, page: window.location.href });
 
    hideLeadForm();
    document.getElementById('pc-lead-success')?.classList.add('pc-visible');
 
    setTimeout(() => {
      addMessage(
        'Muchas gracias, **' + name + '**. Su solicitud de visita ha sido registrada. ' +
        'Le contactaremos pronto a través de ' + (phone || email) + ' para confirmar todos los detalles.',
        'bot'
      );
      currentQRSet = 'inicial';
      setTimeout(() => renderQuickReplies('inicial'), 400);
    }, 600);
  }
 
  /* ========================================================================
     ABRIR / CERRAR / REINICIAR
     ======================================================================== */
  function openChat() {
    isOpen = true;
    document.getElementById('pc-window')?.classList.add('pc-open');
    document.getElementById('pc-bubble')?.classList.add('pc-hidden');
    const badge = document.getElementById('pc-badge');
    if (badge) badge.style.display = 'none';
 
    if (!welcomeShown && renderableMessages.length > 0) {
      // Restaurar historial guardado
      welcomeShown = true;
      renderableMessages.forEach(m => addMessage(m.text, m.role, false, true));
      setTimeout(() => renderQuickReplies(currentQRSet), 200);
    } else if (!welcomeShown) {
      welcomeShown = true;
      setTimeout(() => {
        showTyping();
        setTimeout(() => {
          hideTyping();
          addMessage(
            'Bienvenido a **Inmobiliaria Prestige**. Soy Elena, su asesora personal.\n\n' +
            'Estoy aquí para ayudarle a encontrar la propiedad de sus sueños. ¿En qué puedo asistirle hoy?',
            'bot'
          );
          setTimeout(() => renderQuickReplies('inicial'), 400);
        }, 1400);
      }, 300);
    }
 
    setTimeout(() => document.getElementById('pc-input')?.focus(), 400);
  }
 
  function closeChat() {
    isOpen = false;
    document.getElementById('pc-window')?.classList.remove('pc-open');
    document.getElementById('pc-bubble')?.classList.remove('pc-hidden');
  }
 
  // MEJORA 8 — boton Reiniciar conversación
  function resetChat() {
    if (!confirm('¿Desea iniciar una nueva conversación? Se borrará el historial actual.')) return;
    clearHistory();
    welcomeShown = false;
    const container = document.getElementById('pc-messages');
    if (container) container.innerHTML = '';
    document.getElementById('pc-lead-success')?.classList.remove('pc-visible');
    hideLeadForm();
    hideQuickReplies();
    setTimeout(() => {
      showTyping();
      setTimeout(() => {
        hideTyping();
        addMessage(
          'Nueva conversación iniciada. Soy Elena, su asesora de **Inmobiliaria Prestige**.\n¿En qué puedo ayudarle?',
          'bot'
        );
        setTimeout(() => renderQuickReplies('inicial'), 400);
      }, 1000);
    }, 200);
  }
 
  /* ========================================================================
     MEJORA 7 — contador de palabras
     ======================================================================== */
  function updateCharCount(len) {
    const el = document.getElementById('pc-char-count');
    if (!el) return;
    el.textContent = len + '/500';
    el.classList.toggle('pc-char-warn',  len > 400);
    el.classList.toggle('pc-char-limit', len >= 490);
  }
 
  /* ========================================================================
     utilidades
     ======================================================================== */
  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
 
  function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 80) + 'px';
  }
 
  /* ========================================================================
     EVENT LISTENERS
     ======================================================================== */
  function bindEvents() {
    document.getElementById('pc-bubble')?.addEventListener('click', openChat);
    document.getElementById('pc-close-btn')?.addEventListener('click', closeChat);
    document.getElementById('pc-reset-btn')?.addEventListener('click', resetChat);
    document.getElementById('pc-send-btn')?.addEventListener('click', sendMessage);
 
    document.getElementById('pc-input')?.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    document.getElementById('pc-input')?.addEventListener('input', function () {
      autoResize(this);
      updateCharCount(this.value.length);
    });
 
    document.getElementById('pc-lead-submit-btn')?.addEventListener('click', submitLeadForm);
    document.getElementById('pc-lead-cancel-btn')?.addEventListener('click', () => {
      hideLeadForm();
      addMessage('De acuerdo. ¿En qué más puedo ayudarle?', 'bot');
    });
 
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) closeChat();
    });
 
    ['pc-lead-name','pc-lead-phone','pc-lead-email'].forEach(id => {
      const el = document.getElementById(id);
      el?.addEventListener('input', () => {
        const f = id.replace('pc-lead-', '');
        setFieldError(id, 'pc-err-' + f, '');
      });
      el?.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); submitLeadForm(); }
      });
    });
  }
 
  /* ========================================================================
     INICIALIZACIÓN
     ======================================================================== */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else {
      setup();
    }
  }
 
  function setup() {
    renderableMessages = loadHistory();
    buildWidget();
    bindEvents();
    setTimeout(() => {
      const bubble = document.getElementById('pc-bubble');
      if (bubble) bubble.style.animation = 'pc-bubble-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }, 800);
  }
 
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pc-bubble-enter { from{opacity:0;transform:scale(0) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }

    #pc-messages {
      overflow-y: auto !important;
      overflow-x: hidden !important;
      flex: 1 1 auto !important;
      min-height: 0 !important;
      max-height: 100% !important;
      scroll-behavior: smooth;
    }
    #pc-window {
      display: flex !important;
      flex-direction: column !important;
    }

    #pc-reset-btn {
      display: inline-flex !important;
      align-items: center !important;
      gap: 5px !important;
      padding: 5px 10px 5px 8px !important;
      border: 1px solid rgba(255,255,255,0.25) !important;
      border-radius: 20px !important;
      background: rgba(255,255,255,0.08) !important;
      color: rgba(255,255,255,0.85) !important;
      font-size: 11px !important;
      font-weight: 500 !important;
      letter-spacing: 0.04em !important;
      cursor: pointer !important;
      transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s !important;
      white-space: nowrap !important;
    }
    #pc-reset-btn svg {
      width: 13px !important;
      height: 13px !important;
      flex-shrink: 0 !important;
      transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    }
    #pc-reset-btn:hover {
      background: rgba(255,255,255,0.18) !important;
      border-color: rgba(255,255,255,0.5) !important;
      color: #fff !important;
      transform: translateY(-1px) !important;
    }
    #pc-reset-btn:hover svg {
      transform: rotate(-360deg) !important;
    }
    #pc-reset-btn:active {
      transform: scale(0.95) translateY(0) !important;
    }
    .pc-reset-label {
      line-height: 1 !important;
    }
  `;
  document.head.appendChild(style);
 
  init();
 
})();
