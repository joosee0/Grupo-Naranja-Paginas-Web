// js/perfil.js

document.addEventListener("DOMContentLoaded", function() {

    // cargar usuario
    cargarDatosUsuario();

    // navegación sidebar
    inicializarNavegacion();

    // módulos
    inicializarFavoritos();
    inicializarVisitas();
    inicializarMensajes();
    inicializarConfiguracion();

    // avatar
    cargarAvatar();
});


// cargar usuario
function cargarDatosUsuario() {

    const usuario = localStorage.getItem("currentUser");

    if (usuario) {

        document.getElementById("sidebarUserName").textContent = usuario;

        const inicial = usuario.charAt(0).toUpperCase();
        document.getElementById("avatarInitial").textContent = inicial;

        document.title = `Mi Perfil - ${usuario} - Inmobiliaria Prestige`;
    }
}


// navegación sidebar
function inicializarNavegacion() {

    const menuButtons = document.querySelectorAll(".menu-btn[data-section]");

    menuButtons.forEach(button => {

        button.addEventListener("click", function() {

            const sectionId = this.dataset.section;

            mostrarSeccion(sectionId);

            menuButtons.forEach(btn => btn.classList.remove("active"));

            this.classList.add("active");
        });
    });

    const btnLogout = document.getElementById("btnLogoutSidebar");

    if (btnLogout) {

        btnLogout.addEventListener("click", function() {

            if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {

                logout();
            }
        });
    }
}


// mostrar sección
function mostrarSeccion(sectionId) {

    const secciones = document.querySelectorAll(".perfil-section");

    secciones.forEach(section => {

        section.classList.remove("active");
    });

    const activa = document.getElementById(sectionId);

    if (activa) {

        activa.classList.add("active");
    }

    if (sectionId === "mensajes") {

        marcarMensajesComoLeidos();
    }
}


// favoritos
function inicializarFavoritos() {

    const favoritesList = document.getElementById("favoritesList");

    const favCount = document.getElementById("favCount");

    const statFavoritos = document.getElementById("statFavoritos");

    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

    if (favoritos.length > 0) {

        favoritesList.innerHTML = "";

        favoritos.forEach((propiedad, index) => {

            favoritesList.appendChild(crearCardFavorito(propiedad, index));
        });

        if (favCount) favCount.textContent = favoritos.length;

        if (statFavoritos) statFavoritos.textContent = favoritos.length;

    } else {

        favoritesList.innerHTML = "<p class='empty-state'>Aún no tienes propiedades guardadas.</p>";
    }
}


// crear card favorito
function crearCardFavorito(propiedad, index) {

    const div = document.createElement("div");

    div.className = "property-card favorite-card";

    div.innerHTML = `

        <div>
            <h3>${propiedad.titulo || "Propiedad"}</h3>
            <p>${propiedad.ubicacion || ""}</p>
            <p>${propiedad.precio || ""}</p>
        </div>

        <button onclick="eliminarFavorito(${index})">Eliminar</button>
    `;

    return div;
}


// eliminar favorito
function eliminarFavorito(index) {

    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

    favoritos.splice(index, 1);

    localStorage.setItem("favoritos", JSON.stringify(favoritos));

    inicializarFavoritos();
}


// visitas
function inicializarVisitas() {

    const visitasList = document.getElementById("visitasList");

    const statVisitas = document.getElementById("statVisitas");

    const visitas = JSON.parse(localStorage.getItem("visitas")) || [];

    if (visitas.length > 0) {

        visitasList.innerHTML = "";

        visitas.forEach((v, i) => {

            visitasList.appendChild(crearItemVisita(v, i));
        });

        if (statVisitas) statVisitas.textContent = visitas.length;

    } else {

        visitasList.innerHTML = "<p>No tienes visitas programadas</p>";
    }
}


// crear visita
function crearItemVisita(visita) {

    const div = document.createElement("div");

    div.className = "visita-item";

    div.innerHTML = `
        <p><strong>${visita.propiedad}</strong></p>
        <p>${visita.fecha}</p>
    `;

    return div;
}


// mensajes
function inicializarMensajes() {

    const messagesList = document.getElementById("messagesList");

    const msgCount = document.getElementById("msgCount");

    const mensajes = JSON.parse(localStorage.getItem("mensajes")) || [];

    if (mensajes.length > 0) {

        messagesList.innerHTML = "";

        mensajes.forEach((m, i) => {

            messagesList.appendChild(crearItemMensaje(m, i));
        });

        const noLeidos = mensajes.filter(m => !m.leido).length;

        if (msgCount) msgCount.textContent = noLeidos;

    } else {

        messagesList.innerHTML = "<p>No tienes mensajes</p>";
    }
}


// crear mensaje
function crearItemMensaje(mensaje) {

    const div = document.createElement("div");

    div.className = "message-item";

    div.innerHTML = `
        <strong>${mensaje.remitente}</strong>
        <p>${mensaje.preview}</p>
    `;

    return div;
}


// marcar mensajes leídos
function marcarMensajesComoLeidos() {

    let mensajes = JSON.parse(localStorage.getItem("mensajes")) || [];

    mensajes.forEach(m => m.leido = true);

    localStorage.setItem("mensajes", JSON.stringify(mensajes));

    inicializarMensajes();
}


// configuración
function inicializarConfiguracion() {

    const form = document.getElementById("settingsForm");

    if (!form) return;

    form.addEventListener("submit", function(e) {

        e.preventDefault();

        mostrarNotificacion("Cambios guardados correctamente", "success");
    });
}


// avatar
function cargarAvatar() {

    const avatar = localStorage.getItem("userAvatar");

    const avatarPreview = document.getElementById("avatarPreview");

    if (avatar && avatarPreview) {

        avatarPreview.innerHTML = `
            <img src="${avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">
        `;
    }
}


// logout
function logout() {

    localStorage.removeItem("logged");

    localStorage.removeItem("currentUser");

    window.location.href = "login.html";
}


// notificaciones
function mostrarNotificacion(msg, tipo) {

    const div = document.createElement("div");

    div.textContent = msg;

    div.style.position = "fixed";
    div.style.top = "20px";
    div.style.right = "20px";
    div.style.padding = "10px";
    div.style.background = tipo === "success" ? "green" : "blue";
    div.style.color = "white";
    div.style.zIndex = "9999";

    document.body.appendChild(div);

    setTimeout(() => div.remove(), 3000);
}