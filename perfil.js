// js/perfil.js

// variable para el usuario actual
let usuarioActual = null;

// cuando la página cargue
document.addEventListener("DOMContentLoaded", function() {
    
    // cargar usuario actual
    usuarioActual = localStorage.getItem("currentUser");
    
    if (usuarioActual) {
        document.getElementById("sidebarUserName").textContent = usuarioActual;
        document.getElementById("avatarInitial").textContent = usuarioActual.charAt(0).toUpperCase();
        document.getElementById("settingsUser").value = usuarioActual;
        document.getElementById("settingsEmail").value = localStorage.getItem("userEmail") || "";
        document.getElementById("settingsPhone").value = localStorage.getItem("userPhone") || "";
        
        // cargar notificaciones
        const notifyEmail = localStorage.getItem("notifyEmail");
        const notifySMS = localStorage.getItem("notifySMS");
        if (notifyEmail !== null) document.getElementById("notifyEmail").checked = notifyEmail === "true";
        if (notifySMS !== null) document.getElementById("notifySMS").checked = notifySMS === "true";
    }

    // === CAMBIAR DE SECCIÓN ===
    document.querySelectorAll(".menu-btn[data-section]").forEach(btn => {
        btn.addEventListener("click", function() {
            // quitar activo de todos
            document.querySelectorAll(".menu-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".perfil-section").forEach(s => s.classList.remove("active"));
            
            // activar el seleccionado
            this.classList.add("active");
            const section = this.dataset.section;
            document.getElementById(section).classList.add("active");
            
            // cargar contenido dinámico según la sección
            if (section === "favoritos") cargarFavoritos();
            if (section === "visitas") cargarVisitas();
            if (section === "mensajes") cargarMensajes();
        });
    });

    // === AVATAR: subir y preview ===
    document.getElementById("avatarUpload")?.addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith("image/")) {
            alert("Selecciona una imagen válida");
            return;
        }
        const reader = new FileReader();
        reader.onload = function(event) {
            const avatar = document.getElementById("avatarPreview");
            const initial = document.getElementById("avatarInitial");
            if (avatar) {
                avatar.style.backgroundImage = `url(${event.target.result})`;
                avatar.style.backgroundSize = "cover";
                avatar.style.backgroundPosition = "center";
            }
            if (initial) initial.style.display = "none";
            localStorage.setItem("userAvatar", event.target.result);
        };
        reader.readAsDataURL(file);
    });

    // === CONFIGURACIÓN: cancelar ===
    document.getElementById("btnCancelSettings")?.addEventListener("click", function() {
        if (usuarioActual) {
            document.getElementById("settingsUser").value = usuarioActual;
            document.getElementById("settingsEmail").value = localStorage.getItem("userEmail") || "";
            document.getElementById("settingsPhone").value = localStorage.getItem("userPhone") || "";
        }
        document.getElementById("saveMessage").style.display = "none";
    });

    // === CONFIGURACIÓN: guardar ===
    document.getElementById("settingsForm")?.addEventListener("submit", function(e) {
        e.preventDefault();
        const nuevoNombre = document.getElementById("settingsUser").value.trim();
        const nuevoEmail = document.getElementById("settingsEmail").value.trim();
        const nuevoTelefono = document.getElementById("settingsPhone").value.trim();
        const notifyEmail = document.getElementById("notifyEmail").checked;
        const notifySMS = document.getElementById("notifySMS").checked;
        
        if (!nuevoNombre) {
            alert("El nombre es obligatorio");
            return;
        }
        
        localStorage.setItem("currentUser", nuevoNombre);
        localStorage.setItem("userEmail", nuevoEmail);
        localStorage.setItem("userPhone", nuevoTelefono);
        localStorage.setItem("notifyEmail", notifyEmail);
        localStorage.setItem("notifySMS", notifySMS);
        
        usuarioActual = nuevoNombre;
        document.getElementById("sidebarUserName").textContent = nuevoNombre;
        document.getElementById("avatarInitial").textContent = nuevoNombre.charAt(0).toUpperCase();
        
        const saveMessage = document.getElementById("saveMessage");
        saveMessage.style.display = "block";
        setTimeout(() => { saveMessage.style.display = "none"; }, 3000);
    });

    // === LOGOUT ===
    document.getElementById("btnLogoutSidebar")?.addEventListener("click", function(e) {
        e.preventDefault();
        if (confirm("¿Cerrar sesión?")) {
            localStorage.removeItem("logged");
            localStorage.removeItem("currentUser");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userPhone");
            localStorage.removeItem("userAvatar");
            localStorage.removeItem("favoritos_" + usuarioActual);
            localStorage.removeItem("visitas_" + usuarioActual);
            window.location.href = "login.html";
        }
    });

    // === CARGAR AVATAR GUARDADO ===
    const avatarGuardado = localStorage.getItem("userAvatar");
    if (avatarGuardado) {
        const avatar = document.getElementById("avatarPreview");
        const initial = document.getElementById("avatarInitial");
        if (avatar) {
            avatar.style.backgroundImage = `url(${avatarGuardado})`;
            avatar.style.backgroundSize = "cover";
            avatar.style.backgroundPosition = "center";
        }
        if (initial) initial.style.display = "none";
    }

    // === CARGAR FAVORITOS (simulado) ===
    function cargarFavoritos() {
        const container = document.getElementById("favoritesList");
        const favoritos = JSON.parse(localStorage.getItem("favoritos_" + usuarioActual)) || [];
        
        if (favoritos.length === 0) {
            container.innerHTML = '<p class="empty-state">Aún no tienes propiedades guardadas. <a href="propiedades.html">Explorar</a></p>';
            document.getElementById("statFavoritos").textContent = "0";
            document.getElementById("favCount").textContent = "0";
            return;
        }
        
        container.innerHTML = favoritos.map(prop => `
            <article class="property-card">
                <div class="property-image">🏠</div>
                <div class="property-info">
                    <h4>${prop.titulo || "Propiedad"}</h4>
                    <p class="property-price">${prop.precio || "Consultar"}</p>
                    <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${prop.ubicacion || "Ubicación"}</p>
                    <button class="btn-sm" onclick="eliminarFavorito('${prop.id}')">Quitar</button>
                </div>
            </article>
        `).join("");
        
        document.getElementById("statFavoritos").textContent = favoritos.length;
        document.getElementById("favCount").textContent = favoritos.length;
    }

    // === ELIMINAR FAVORITO ===
    window.eliminarFavorito = function(id) {
        if (!confirm("¿Quitar de favoritos?")) return;
        let favoritos = JSON.parse(localStorage.getItem("favoritos_" + usuarioActual)) || [];
        favoritos = favoritos.filter(p => p.id !== id);
        localStorage.setItem("favoritos_" + usuarioActual, JSON.stringify(favoritos));
        cargarFavoritos();
    };

    // === CARGAR VISITAS (simulado) ===
    function cargarVisitas() {
        const container = document.getElementById("visitasList");
        const visitas = JSON.parse(localStorage.getItem("visitas_" + usuarioActual)) || [];
        
        if (visitas.length === 0) {
            container.innerHTML = '<p class="empty-state">No tienes visitas programadas. <a href="propiedades.html">Solicitar una</a></p>';
            document.getElementById("statVisitas").textContent = "0";
            return;
        }
        
        container.innerHTML = visitas.map(visita => `
            <div class="visita-item">
                <div class="visita-info">
                    <h4>${visita.propiedad || "Propiedad"}</h4>
                    <p><i class="fas fa-calendar"></i> ${visita.fecha || "Fecha pendiente"}</p>
                    <p><i class="fas fa-clock"></i> ${visita.hora || "Hora pendiente"}</p>
                </div>
                <div class="visita-date">
                    <span class="visita-status ${visita.estado || 'pendiente'}">${visita.estado || "Pendiente"}</span>
                </div>
            </div>
        `).join("");
        
        document.getElementById("statVisitas").textContent = visitas.length;
    }

    // === CARGAR MENSAJES (simulado) ===
    function cargarMensajes() {
        const container = document.getElementById("messagesList");
        const mensajes = JSON.parse(localStorage.getItem("mensajes_" + usuarioActual)) || [
            { id: 1, de: "Atención al cliente", texto: "Hola, hemos recibido tu solicitud de financiación...", hora: "10:30", leido: false },
            { id: 2, de: "Propiedades", texto: "La propiedad Villa Mediterránea sigue disponible...", hora: "Ayer", leido: true }
        ];
        
        // contar no leídos
        const noLeidos = mensajes.filter(m => !m.leido).length;
        document.getElementById("statMensajes").textContent = noLeidos;
        document.getElementById("msgCount").textContent = noLeidos;
        if (noLeidos > 0) {
            document.getElementById("msgCount").classList.add("new");
        } else {
            document.getElementById("msgCount").classList.remove("new");
        }
        
        container.innerHTML = mensajes.map(msg => `
            <div class="message-item ${msg.leido ? '' : 'unread'}" onclick="marcarLeido(${msg.id})">
                <div class="message-avatar">${msg.de.charAt(0).toUpperCase()}</div>
                <div class="message-content">
                    <div class="message-header">
                        <strong>${msg.de}</strong>
                        <span class="message-time">${msg.hora}</span>
                    </div>
                    <p class="message-preview">${msg.texto}</p>
                </div>
            </div>
        `).join("");
    }

    // === MARCAR MENSAJE COMO LEÍDO ===
    window.marcarLeido = function(id) {
        let mensajes = JSON.parse(localStorage.getItem("mensajes_" + usuarioActual)) || [
            { id: 1, de: "Atención al cliente", texto: "Hola, hemos recibido tu solicitud de financiación...", hora: "10:30", leido: false },
            { id: 2, de: "Propiedades", texto: "La propiedad Villa Mediterránea sigue disponible...", hora: "Ayer", leido: true }
        ];
        const msg = mensajes.find(m => m.id === id);
        if (msg && !msg.leido) {
            msg.leido = true;
            localStorage.setItem("mensajes_" + usuarioActual, JSON.stringify(mensajes));
            cargarMensajes();
        }
    };

    // === CARGAR SECCIÓN ACTUAL AL INICIAR ===
    const seccionActiva = document.querySelector(".perfil-section.active")?.id || "resumen";
    if (seccionActiva === "favoritos") cargarFavoritos();
    if (seccionActiva === "visitas") cargarVisitas();
    if (seccionActiva === "mensajes") cargarMensajes();
});