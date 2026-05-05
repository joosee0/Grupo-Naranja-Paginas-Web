    // Buscamos si existe un usuario con esas credenciales
    let usuarioValido = users.find(u => u.user === user && u.pass === pass);

    if (usuarioValido) {
        // Guardamos que el usuario está logueado
        localStorage.setItem("logged", "true");
        localStorage.setItem("currentUser", user);

        // Redirigimos a la página principal
        window.location.href = "index.html";
    } else {
        error.style.color = "red";
        error.innerText = "Usuario o contraseña incorrectos";
    }

    return false;
}

// Función para cerrar sesión
function logout() {
    // Eliminamos los datos de sesión
    localStorage.removeItem("logged");
    localStorage.removeItem("currentUser");

    // Volvemos al login
    window.location.href = "login.html";
}

// Función para mostrar el menú de usuario (si está logueado)
function mostrarUsuario() {
    let menu = document.getElementById("userMenu");
    
    // Si no existe el menú en esta página, salimos
    if (!menu) return;

    let logged = localStorage.getItem("logged");
    let user = localStorage.getItem("currentUser");

    // Si está logueado, mostramos su nombre y opción de salir
    if (logged === "true" && user) {
        menu.innerHTML = `
            <span>Hola, ${user}</span>
            <a href="perfil.html">Mi perfil</a>
            <a href="#" onclick="logout()">Salir</a>
        `;
    } else {
        // Si no, mostramos el enlace al login
        menu.innerHTML = `<a href="login.html">Login</a>`;
    }
}

// Función para comprobar si el usuario está logueado (para páginas protegidas)
function estaLogueado() {
    return localStorage.getItem("logged") === "true";
}

// Cuando la página cargue completamente
document.addEventListener("DOMContentLoaded", function() {
    // Mostramos el menú de usuario si existe
    mostrarUsuario();
});

