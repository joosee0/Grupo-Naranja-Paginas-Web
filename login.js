
// Cambiar entre formularios
function toggleForm(e) {
    if (e) e.preventDefault();
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const titulo = document.getElementById("titulo");
    const toggleLink = document.getElementById("toggleLink");
    const error = document.getElementById("error");

    const isLoginVisible = loginForm.style.display !== "none";
    loginForm.style.display = isLoginVisible ? "none" : "block";
    registerForm.style.display = isLoginVisible ? "block" : "none";
    titulo.textContent = isLoginVisible ? "Crea tu cuenta" : "Accede a tu cuenta";
    toggleLink.textContent = isLoginVisible ? "Iniciar sesión" : "Crear cuenta";
    error.textContent = "";
    error.style.color = "";
}

// Registrar usuario
function registerUser(e) {
    if (e) e.preventDefault();
    const user = document.getElementById("newUser").value.trim();
    const pass = document.getElementById("newPass").value;
    const error = document.getElementById("error");

    let users = JSON.parse(localStorage.getItem("users")) || [];
    
    if (users.find(u => u.user === user)) {
        error.style.color = "red";
        error.textContent = "El usuario ya existe";
        return false;
    }
    if (pass.length < 6) {
        error.style.color = "red";
        error.textContent = "Mínimo 6 caracteres";
        return false;
    }

    users.push({ user, pass });
    localStorage.setItem("users", JSON.stringify(users));

    error.style.color = "green";
    error.textContent = "✅ Cuenta creada. Inicia sesión.";
    
    setTimeout(() => {
        toggleForm();
        document.getElementById("registerForm").reset();
    }, 1500);
    return false;
}

// Iniciar sesión → REDIRIGE A PERFIL
function loginUser(e) {
    if (e) e.preventDefault();
    const user = document.getElementById("user").value.trim();
    const pass = document.getElementById("pass").value;
    const error = document.getElementById("error");

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const validUser = users.find(u => u.user === user && u.pass === pass);

    if (validUser) {
        // Guardar sesión
        localStorage.setItem("logged", "true");
        localStorage.setItem("currentUser", user);
        
        // ✅ REDIRIGIR A PERFIL AUTOMÁTICAMENTE
        window.location.href = "perfil.html";
    } else {
        error.style.color = "red";
        error.textContent = "Usuario o contraseña incorrectos";
    }
    return false;
}

// Cerrar sesión
function logout() {
    localStorage.removeItem("logged");
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

// Verificar si está logueado
function estaLogueado() {
    return localStorage.getItem("logged") === "true";
}

// Inicialización
document.addEventListener("DOMContentLoaded", function() {
    const toggleLink = document.getElementById("toggleLink");
    if (toggleLink) toggleLink.addEventListener("click", toggleForm);

    const loginForm = document.getElementById("loginForm");
    if (loginForm) loginForm.addEventListener("submit", loginUser);

    const registerForm = document.getElementById("registerForm");
    if (registerForm) registerForm.addEventListener("submit", registerUser);
});