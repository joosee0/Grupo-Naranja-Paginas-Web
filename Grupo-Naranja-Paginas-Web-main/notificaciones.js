const STORAGE_KEY = "prestige_notifications";

/* mensajes iniciales si no hay nada guardado */
let messages = JSON.parse(localStorage.getItem(STORAGE_KEY));

if (!messages) {
    messages = [
        {
            id: 1,
            icon: "📅",
            title: "Reserva confirmada",
            text: "Tu reserva para PROP-021 ha sido confirmada.",
            time: "Hace 2 horas",
            read: false
        },
        {
            id: 2,
            icon: "🏠",
            title: "Nueva solicitud de visita",
            text: "Un cliente quiere visitar PROP-008 este viernes.",
            time: "Hace 5 horas",
            read: false
        },
        {
            id: 3,
            icon: "✉️",
            title: "Mensaje de cliente",
            text: "Tienes una nueva consulta sobre un piso en Sevilla.",
            time: "Ayer",
            read: true
        }
    ];

    save();
}

/* guardar en localStorage */
function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

/* renderizar mensajes */
function render() {
    const container = document.querySelector(".section-card-body");
    container.innerHTML = "";

    let unread = 0;

    messages.forEach(msg => {

        if (!msg.read) unread++;

        const div = document.createElement("div");
        div.className = "message-item" + (msg.read ? "" : " unread");

        div.innerHTML = `
            <div class="message-icon">${msg.icon}</div>
            <div class="message-content">
                <h3>${msg.title}</h3>
                <p>${msg.text}</p>
                <span class="message-time">${msg.time}</span>
            </div>
        `;

        /* click = marcar como leído */
        div.addEventListener("click", () => {
            msg.read = true;
            save();
            render();
        });

        container.appendChild(div);
    });

    /* actualizar badge */
    const badge = document.querySelector(".badge");
    if (badge) badge.textContent = unread;
}

/* marcar todo como leído */
function markAllRead() {
    messages.forEach(m => m.read = true);
    save();
    render();
}

/* simular nuevo mensaje (reserva o aviso) */
function addMessage(icon, title, text) {
    messages.unshift({
        id: Date.now(),
        icon,
        title,
        text,
        time: "Ahora",
        read: false
    });

    save();
    render();
}

/* iniciar */
render();

/* hacer botón funcional */
document.querySelector(".btn-primary").addEventListener("click", markAllRead);

/* simulación opcional cada 20s (como sistema real) */
setInterval(() => {
    const random = [
        { icon: "📅", title: "Nueva reserva", text: "Se ha creado una nueva reserva" },
        { icon: "🏠", title: "Visita programada", text: "Un cliente ha solicitado visita" },
        { icon: "💬", title: "Nuevo mensaje", text: "Tienes un mensaje nuevo" }
    ];

    const msg = random[Math.floor(Math.random() * random.length)];
    addMessage(msg.icon, msg.title, msg.text);

}, 20000);