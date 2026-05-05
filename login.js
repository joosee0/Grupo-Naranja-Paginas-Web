
// Función para cambiar entre formulario de login y registro
function toggleForm() {
    let loginForm = document.getElementById("loginForm");
    let registerForm = document.getElementById("registerForm");
    let titulo = document.getElementById("titulo");
    let toggleText = document.getElementById("toggleText");
    let error = document.getElementById("error");

    // Si el login está oculto, lo mostramos y ocultamos el registro
    if (loginForm.style.display === "none") {
        loginForm.style.display = "block";
        registerForm.style.display = "none";
        titulo.innerText = "Accede a tu cuenta";
        toggleText.innerText = "Crear cuenta";
    } else {
        // Si no, mostramos registro y ocultamos login
        loginForm.style.display = "none";
        registerForm.style.display = "block";
        titulo.innerText = "Crea tu cuenta";
        toggleText.innerText = "Iniciar sesión";
    }

    // Limpiamos los mensajes de error
    error.innerText = "";
    error.style.color = "";
}

// Función para registrar un nuevo usuario
function registerUser() {
    let user = document.getElementById("newUser").value;
    let pass = document.getElementById("newPass").value;
    let error = document.getElementById("error");

    // Obtenemos los usuarios guardados o creamos array vacío
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Comprobamos si el usuario ya existe
    let usuarioExiste = users.find(u => u.user === user);

    if (usuarioExiste) {
        error.style.color = "red";
        error.innerText = "El usuario ya existe";
        return false;
    }

    // Validamos que la contraseña tenga al menos 6 caracteres
    if (pass.length < 6) {
        error.style.color = "red";
        error.innerText = "La contraseña debe tener al menos 6 caracteres";
        return false;
    }

    // Guardamos el nuevo usuario
    users.push({ user: user, pass: pass });
    localStorage.setItem("users", JSON.stringify(users));

    // Mostramos mensaje de éxito
    error.style.color = "green";
    error.innerText = "Cuenta creada correctamente";

    // Volvemos al formulario de login después de 1.5 segundos
    setTimeout(() => {
        toggleForm();
        document.getElementById("registerForm").reset();
    }, 1500);

    return false;
}

// Función para iniciar sesión
function loginUser() {
    let user = document.getElementById("user").value;
    let pass = document.getElementById("pass").value;
    let error = document.getElementById("error");

    // Obtenemos la lista de usuarios
    let users = JSON.parse(localStorage.getItem("users")) || [];

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