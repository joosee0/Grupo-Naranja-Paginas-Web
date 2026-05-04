// Cambiar entre login y registro
function toggleForm() {

    let loginForm = document.getElementById("loginForm");
    let registerForm = document.getElementById("registerForm");
    let titulo = document.getElementById("titulo");
    let toggleText = document.getElementById("toggleText");

    if (loginForm.style.display === "none") {
        loginForm.style.display = "block";
        registerForm.style.display = "none";
        titulo.innerText = "Accede a tu cuenta";
        toggleText.innerText = "Crear cuenta";
    } else {
        loginForm.style.display = "none";
        registerForm.style.display = "block";
        titulo.innerText = "Crea tu cuenta";
        toggleText.innerText = "Iniciar sesión";
    }

    document.getElementById("error").innerText = "";
}

// Registro
function registerUser() {

    let user = document.getElementById("newUser").value;
    let pass = document.getElementById("newPass").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    // comprobar si ya existe
    let exists = users.find(u => u.user === user);

    if (exists) {
        document.getElementById("error").innerText = "El usuario ya existe";
        return false;
    }

    users.push({ user: user, pass: pass });

    localStorage.setItem("users", JSON.stringify(users));

    document.getElementById("error").style.color = "green";
    document.getElementById("error").innerText = "Cuenta creada correctamente";

    toggleForm();

    return false;
}

// Login
function loginUser() {

    let user = document.getElementById("user").value;
    let pass = document.getElementById("pass").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    let validUser = users.find(u => u.user === user && u.pass === pass);

    if (validUser) {

        localStorage.setItem("logged", "true");
        localStorage.setItem("currentUser", user);

        window.location.href = "index.html";

    } else {

        document.getElementById("error").innerText =
            "Usuario o contraseña incorrectos";
    }

    return false;
}

// Mostrar usuario en todas las páginas
function mostrarUsuario() {

    let menu = document.getElementById("userMenu");

    if (!menu) return;

    let logged = localStorage.getItem("logged");
    let user = localStorage.getItem("currentUser");

    if (logged === "true" && user) {

        menu.innerHTML =
            " | <a href='perfil.html'>Mi perfil</a> | " +
            "<a href='#' onclick='logout()'>Salir</a>";

    } else {

        menu.innerHTML =
            "<a href='login.html'>Login</a>";
    }
}

// Logout
function logout() {

    localStorage.removeItem("logged");
    localStorage.removeItem("currentUser");

    window.location.href = "login.html";
}

// Ejecutar en todas las páginas al cargar
document.addEventListener("DOMContentLoaded", mostrarUsuario);