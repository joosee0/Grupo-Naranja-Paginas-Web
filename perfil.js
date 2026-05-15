// js/perfil.js

document.addEventListener("DOMContentLoaded", function() {
    // Cargar datos del usuario
    cargarDatosUsuario();
    
    // Inicializar navegación del sidebar
    inicializarNavegacion();
    
    // Inicializar funcionalidades específicas
    inicializarFavoritos();
    inicializarVisitas();
    inicializarMensajes();
    inicializarConfiguracion();
    
    // Cargar avatar si existe
    cargarAvatar();
});

//  CARGAR DATOS DEL USUARIO 
function cargarDatosUsuario() {
    const usuario = localStorage.getItem("currentUser");
    if (usuario) {
        // Actualizar nombre en sidebar y header
        document.getElementById("sidebarUserName").textContent = usuario;
        
        // Actualizar inicial del avatar
        const inicial = usuario.charAt(0).toUpperCase();
        document.getElementById("avatarInitial").textContent = inicial;
        
        // Actualizar título de la página
        document.title = `Mi Perfil - ${usuario} - Inmobiliaria Prestige`;
    }
}

//  NAVEGACIÓN DEL SIDEBAR 
function inicializarNavegacion() {
    const menuButtons = document.querySelectorAll(".menu-btn[data-section]");
    
    menuButtons.forEach(button => {
        button.addEventListener("click", function() {
            const sectionId = this.getAttribute("data-section");
            mostrarSeccion(sectionId);
            
            // Actualizar botón activo
            menuButtons.forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");
        });
    });
    
    // Botón cerrar sesión del sidebar
    const btnLogout = document.getElementById("btnLogoutSidebar");
    if (btnLogout) {
        btnLogout.addEventListener("click", function() {
            if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
                logout();
            }
        });
    }
}

//  FUNCIÓN CORREGIDA: Navegación simple y funcional
function mostrarSeccion(sectionId) {
    // Ocultar todas las secciones
    const secciones = document.querySelectorAll(".perfil-section");
    secciones.forEach(section => {
        section.classList.remove("active");
    });
    
    // Mostrar sección seleccionada
    const seccionActiva = document.getElementById(sectionId);
    if (seccionActiva) {
        seccionActiva.classList.add("active");
    }
    
    // Actualizar badge de mensajes si es necesario
    if (sectionId === "mensajes") {
        marcarMensajesComoLeidos();
    }
}

//  FAVORITOS 
function inicializarFavoritos() {
    const favoritesList = document.getElementById("favoritesList");
    const favCount = document.getElementById("favCount");
    const statFavoritos = document.getElementById("statFavoritos");
    
    // Cargar favoritos desde localStorage
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    
    if (favoritos.length > 0) {
        favoritesList.innerHTML = "";
        favoritos.forEach((propiedad, index) => {
            const card = crearCardFavorito(propiedad, index);
            favoritesList.appendChild(card);
        });
        
        // Actualizar contadores
        if (favCount) favCount.textContent = favoritos.length;
        if (statFavoritos) statFavoritos.textContent = favoritos.length;
    } else {
        favoritesList.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-heart" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                <p>Aún no tienes propiedades guardadas.</p>
                <a href="propiedades.html" class="btn-primary" style="display: inline-block; margin-top: 16px; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
                    Explorar propiedades
                </a>
            </div>
        `;
    }
}

function crearCardFavorito(propiedad, index) {
    const div = document.createElement("div");
    div.className = "property-card favorite-card";
    div.style.cssText = "border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; display: flex; gap: 16px; align-items: center; background: white;";
    
    div.innerHTML = `
        <div style="width: 120px; height: 90px; background: #f3f4f6; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <i class="fas fa-home" style="font-size: 32px; color: #ccc;"></i>
        </div>
        <div style="flex: 1;">
            <h3 style="margin: 0 0 8px 0; font-size: 18px;">${propiedad.titulo || "Propiedad"}</h3>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
                <i class="fas fa-map-marker-alt"></i> ${propiedad.ubicacion || "Ubicación no disponible"}
            </p>
            <p style="margin: 0; font-weight: 600; color: #b8860b; font-size: 18px;">
                ${propiedad.precio || "Consultar precio"}
            </p>
        </div>
        <div style="display: flex; gap: 8px;">
            <button onclick="verPropiedad(${index})" class="btn-outline" style="padding: 8px 16px; border: 1px solid #b8860b; color: #b8860b; background: none; border-radius: 6px; cursor: pointer;">
                <i class="fas fa-eye"></i> Ver
            </button>
            <button onclick="eliminarFavorito(${index})" class="btn-danger" style="padding: 8px 16px; border: none; background: #dc3545; color: white; border-radius: 6px; cursor: pointer;">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return div;
}

function eliminarFavorito(index) {
    if (confirm("¿Eliminar esta propiedad de favoritos?")) {
        let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
        favoritos.splice(index, 1);
        localStorage.setItem("favoritos", JSON.stringify(favoritos));
        inicializarFavoritos();
        
        // Mostrar mensaje temporal
        mostrarNotificacion("Propiedad eliminada de favoritos", "info");
    }
}

function verPropiedad(index) {
    // Aquí podrías redirigir a la página de detalles de la propiedad
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    const propiedad = favoritos[index];
    
    if (propiedad && propiedad.id) {
        window.location.href = `propiedades.html?id=${propiedad.id}`;
    } else {
        mostrarNotificacion("Propiedad no disponible", "error");
    }
}

//  VISITAS 
function inicializarVisitas() {
    const visitasList = document.getElementById("visitasList");
    const statVisitas = document.getElementById("statVisitas");
    
    // Cargar visitas desde localStorage
    const visitas = JSON.parse(localStorage.getItem("visitas")) || [];
    
    if (visitas.length > 0) {
        visitasList.innerHTML = "";
        visitas.forEach((visita, index) => {
            const item = crearItemVisita(visita, index);
            visitasList.appendChild(item);
        });
        
        if (statVisitas) statVisitas.textContent = visitas.length;
    } else {
        visitasList.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-calendar-check" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                <p>No tienes visitas programadas</p>
                <a href="propiedades.html" class="btn-primary" style="display: inline-block; margin-top: 16px; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
                    Programar visita
                </a>
            </div>
        `;
    }
}

function crearItemVisita(visita, index) {
    const div = document.createElement("div");
    div.className = "visita-item";
    div.style.cssText = "border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: white; display: flex; justify-content: space-between; align-items: center;";
    
    const fecha = new Date(visita.fecha);
    const fechaFormateada = fecha.toLocaleDateString("es-ES", { 
        day: "2-digit", 
        month: "long", 
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
    
    div.innerHTML = `
        <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 50px; height: 50px; background: #fef3c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i class="fas fa-calendar-alt" style="color: #b8860b; font-size: 20px;"></i>
            </div>
            <div>
                <h4 style="margin: 0 0 4px 0;">${visita.propiedad || "Propiedad"}</h4>
                <p style="margin: 0; color: #666; font-size: 14px;">
                    <i class="fas fa-clock"></i> ${fechaFormateada}
                </p>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #888;">
                    <i class="fas fa-user"></i> ${visita.contacto || "Contacto"}
                </p>
            </div>
        </div>
        <div style="display: flex; gap: 8px;">
            <button onclick="cancelarVisita(${index})" class="btn-outline" style="padding: 8px 16px; border: 1px solid #dc3545; color: #dc3545; background: none; border-radius: 6px; cursor: pointer;">
                Cancelar
            </button>
            <button onclick="reprogramarVisita(${index})" class="btn-primary" style="padding: 8px 16px; border: none; background: #b8860b; color: white; border-radius: 6px; cursor: pointer;">
                Reprogramar
            </button>
        </div>
    `;
    
    return div;
}

function cancelarVisita(index) {
    if (confirm("¿Cancelar esta visita?")) {
        let visitas = JSON.parse(localStorage.getItem("visitas")) || [];
        visitas.splice(index, 1);
        localStorage.setItem("visitas", JSON.stringify(visitas));
        inicializarVisitas();
        mostrarNotificacion("Visita cancelada", "info");
    }
}

function reprogramarVisita(index) {
    mostrarNotificacion("Función de reprogramación en desarrollo", "info");
}

//  MENSAJES 
function inicializarMensajes() {
    const messagesList = document.getElementById("messagesList");
    const msgCount = document.getElementById("msgCount");
    const statMensajes = document.getElementById("statMensajes");
    
    // Cargar mensajes desde localStorage
    const mensajes = JSON.parse(localStorage.getItem("mensajes")) || [];
    
    if (mensajes.length > 0) {
        messagesList.innerHTML = "";
        mensajes.forEach((mensaje, index) => {
            const item = crearItemMensaje(mensaje, index);
            messagesList.appendChild(item);
        });
        
        const noLeidos = mensajes.filter(m => !m.leido).length;
        if (msgCount) {
            msgCount.textContent = noLeidos;
            msgCount.style.display = noLeidos > 0 ? "inline" : "none";
        }
        if (statMensajes) statMensajes.textContent = noLeidos;
    } else {
        // Mensajes por defecto (los que ya tienes en HTML)
        const mensajesPorDefecto = [
            {
                avatar: "A",
                remitente: "Atención al cliente",
                hora: "10:30",
                preview: "Hola, hemos recibido tu solicitud de financiación...",
                leido: false
            },
            {
                avatar: "P",
                remitente: "Propiedades",
                hora: "Ayer",
                preview: "La propiedad Villa Mediterránea sigue disponible...",
                leido: true
            }
        ];
        
        messagesList.innerHTML = "";
        mensajesPorDefecto.forEach(mensaje => {
            const item = crearItemMensaje(mensaje, -1);
            messagesList.appendChild(item);
        });
    }
}

function crearItemMensaje(mensaje, index) {
    const div = document.createElement("div");
    div.className = `message-item ${!mensaje.leido ? "unread" : ""}`;
    div.style.cssText = `border-bottom: 1px solid #e5e7eb; padding: 16px; display: flex; gap: 16px; cursor: pointer; transition: background 0.2s; ${!mensaje.leido ? "background: #fef9e7;" : ""}`;
    
    div.innerHTML = `
        <div class="message-avatar" style="width: 48px; height: 48px; background: ${!mensaje.leido ? "#b8860b" : "#666"}; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">
            ${mensaje.avatar || "M"}
        </div>
        <div class="message-content" style="flex: 1;">
            <div class="message-header" style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <strong style="${!mensaje.leido ? "color: #000;" : "color: #666;"}">${mensaje.remitente || "Remitente"}</strong>
                <span class="message-time" style="font-size: 12px; color: #888;">${mensaje.hora || ""}</span>
            </div>
            <p class="message-preview" style="margin: 0; color: #666; font-size: 14px; ${!mensaje.leido ? "font-weight: 600;" : ""}">
                ${mensaje.preview || ""}
            </p>
        </div>
    `;
    
    div.addEventListener("click", () => abrirMensaje(mensaje, index));
    
    return div;
}

function abrirMensaje(mensaje, index) {
    // Marcar como leído
    if (index >= 0) {
        let mensajes = JSON.parse(localStorage.getItem("mensajes")) || [];
        if (mensajes[index]) {
            mensajes[index].leido = true;
            localStorage.setItem("mensajes", JSON.stringify(mensajes));
        }
    }
    
    // Aquí podrías abrir un modal o redirigir a una página de detalle
    alert(`Mensaje de: ${mensaje.remitente}\n\n${mensaje.preview}\n\n[Función completa en desarrollo]`);
    
    inicializarMensajes();
}

function marcarMensajesComoLeidos() {
    const mensajes = JSON.parse(localStorage.getItem("mensajes")) || [];
    mensajes.forEach(m => m.leido = true);
    localStorage.setItem("mensajes", JSON.stringify(mensajes));
    inicializarMensajes();
}

// CONFIGURACIÓN 
function inicializarConfiguracion() {
    const settingsForm = document.getElementById("settingsForm");
    const settingsUser = document.getElementById("settingsUser");
    const settingsEmail = document.getElementById("settingsEmail");
    const settingsPhone = document.getElementById("settingsPhone");
    const btnCancel = document.getElementById("btnCancelSettings");
    const saveMessage = document.getElementById("saveMessage");
    
    // Cargar datos actuales del usuario
    const usuario = localStorage.getItem("currentUser");
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const userData = users.find(u => u.user === usuario);
    
    if (userData) {
        if (settingsUser) settingsUser.value = userData.user || "";
        if (settingsEmail) settingsEmail.value = userData.email || "";
        if (settingsPhone) settingsPhone.value = userData.phone || "";
    }
    
    // Cancelar cambios
    if (btnCancel) {
        btnCancel.addEventListener("click", function() {
            if (userData) {
                if (settingsUser) settingsUser.value = userData.user || "";
                if (settingsEmail) settingsEmail.value = userData.email || "";
                if (settingsPhone) settingsPhone.value = userData.phone || "";
            }
            if (saveMessage) saveMessage.style.display = "none";
        });
    }
    
    // Guardar cambios
    if (settingsForm) {
        settingsForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            const newUser = settingsUser.value.trim();
            const newEmail = settingsEmail.value.trim();
            const newPhone = settingsPhone.value.trim();
            
            // Actualizar en localStorage
            const userIndex = users.findIndex(u => u.user === usuario);
            if (userIndex >= 0) {
                users[userIndex].user = newUser;
                users[userIndex].email = newEmail;
                users[userIndex].phone = newPhone;
                localStorage.setItem("users", JSON.stringify(users));
                
                // Actualizar currentUser si cambió el nombre
                if (newUser !== usuario) {
                    localStorage.setItem("currentUser", newUser);
                }
                
                // Mostrar mensaje de éxito
                if (saveMessage) {
                    saveMessage.style.display = "block";
                    setTimeout(() => {
                        saveMessage.style.display = "none";
                    }, 3000);
                }
                
                // Recargar datos
                cargarDatosUsuario();
                mostrarNotificacion("Cambios guardados correctamente", "success");
            }
        });
    }
    
    // Subida de avatar
    const avatarUpload = document.getElementById("avatarUpload");
    if (avatarUpload) {
        avatarUpload.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    localStorage.setItem("userAvatar", e.target.result);
                    cargarAvatar();
                    mostrarNotificacion("Avatar actualizado", "success");
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

function cargarAvatar() {
    const avatar = localStorage.getItem("userAvatar");
    const avatarPreview = document.getElementById("avatarPreview");
    const avatarInitial = document.getElementById("avatarInitial");
    
    if (avatar && avatarPreview) {
        avatarPreview.innerHTML = `
            <img src="${avatar}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
            <label for="avatarUpload" class="avatar-edit" title="Cambiar foto" style="position: absolute; bottom: 0; right: 0; background: #b8860b; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid white;">
                <i class="fas fa-camera" style="font-size: 12px;"></i>
            </label>
        `;
        avatarPreview.style.position = "relative";
    }
}

// UTILIDADES
function mostrarNotificacion(mensaje, tipo = "info") {
    // Crear notificación temporal
    const notif = document.createElement("div");
    notif.textContent = mensaje;
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${tipo === "success" ? "#10b981" : tipo === "error" ? "#ef4444" : "#3b82f6"};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = "slideOut 0.3s ease";
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// Animaciones CSS 
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);