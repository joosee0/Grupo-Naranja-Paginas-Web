

// Imports de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCqxCob5bDM7KfPy9ADjKccEDv4ouwiXS4",
    authDomain: "inmobiliaria-pr0yec.firebaseapp.com",
    projectId: "inmobiliaria-pr0yec",
    storageBucket: "inmobiliaria-pr0yec.firebasestorage.app",
    messagingSenderId: "771460096132",
    appId: "1:771460096132:web:b5a75c933eb1db555f22d1",
    measurementId: "G-F6ZLXZYT42"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Mostrar error o éxito
function mostrarError(texto, color = "#dc2626") {
    const box = document.getElementById("error");
    if (!box) return;
    box.style.color = color;
    box.textContent = texto;
}

// Traducir errores
function traducirError(err) {
    const errores = {
        "auth/invalid-email": "El correo no es válido.",
        "auth/weak-password": "Mínimo 6 caracteres para la contraseña.",
        "auth/email-already-in-use": "Este correo ya está registrado.",
        "auth/invalid-credential": "Email o contraseña incorrectos.",
        "auth/wrong-password": "Email o contraseña incorrectos.",
        "auth/user-not-found": "Email o contraseña incorrectos."
    };
    return errores[err?.code] || "Error: " + (err?.message || "desconocido");
}

// Toggle login / registro
function toggleForm(e) {
    if (e) e.preventDefault();

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const titulo = document.getElementById("titulo");
    const toggleLink = document.getElementById("toggleLink");

    if (!loginForm || !registerForm) return;

    mostrarError("");

    const mostrandoLogin = loginForm.style.display !== "none";

    loginForm.style.display = mostrandoLogin ? "none" : "block";
    registerForm.style.display = mostrandoLogin ? "block" : "none";

    if (titulo) {
        titulo.textContent = mostrandoLogin
            ? "Crea tu cuenta"
            : "Accede a tu cuenta";
    }

    if (toggleLink) {
        toggleLink.textContent = mostrandoLogin
            ? "¿Ya tienes cuenta? Iniciar sesión"
            : "¿No tienes cuenta? Crear cuenta";
    }
}

// LOGIN
async function loginUser(e) {
    if (e) e.preventDefault();

    const email = document.getElementById("user")?.value?.trim() || "";
    const pass = document.getElementById("pass")?.value || "";

    mostrarError("");

    try {
        await signInWithEmailAndPassword(auth, email, pass);

        // mejor replace que href
        window.location.replace("perfil.html");

    } catch (err) {
        mostrarError(traducirError(err));
    }

    return false;
}

// REGISTRO
async function registerUser(e) {
    if (e) e.preventDefault();

    const email = document.getElementById("newUser")?.value?.trim() || "";
    const pass = document.getElementById("newPass")?.value || "";

    mostrarError("");

    if (pass.length < 6) {
        mostrarError("La contraseña debe tener al menos 6 caracteres");
        return false;
    }

    try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);

        await setDoc(doc(db, "usuarios", cred.user.uid), {
            uid: cred.user.uid,
            email: cred.user.email,
            nombre: email.split("@")[0],
            fechaRegistro: serverTimestamp(),
            proveedor: "email"
        });

        mostrarError("✅ Cuenta creada. Redirigiendo...", "#16a34a");

        setTimeout(() => {
            window.location.replace("perfil.html");
        }, 1000);

    } catch (err) {
        mostrarError(traducirError(err));
    }

    return false;
}

// LOGOUT
async function logout() {
    await signOut(auth);
    window.location.replace("login.html");
}

// MENÚ USUARIO
function actualizarMenu(user) {
    const menu = document.getElementById("userMenu");
    if (!menu) return;

    if (user) {
        const nombre = user.email?.split("@")[0] || "Usuario";

        menu.innerHTML = `
            <a href="perfil.html" style="color:#c5a059;">👤 ${nombre}</a>
            <a href="#" id="btnLogout" style="margin-left:12px;color:#666;">Salir</a>
        `;

        document.getElementById("btnLogout")?.addEventListener("click", (e) => {
            e.preventDefault();
            logout();
        });

    } else {
        menu.innerHTML = `<a href="login.html" style="color:#fff;">Iniciar Sesión</a>`;
    }
}

// PERFIL
function cargarPerfil(user) {
    if (!document.body.classList.contains("pagina-privada")) return;
    if (!user) return;

    const nombre = user.email?.split("@")[0] || "Usuario";

    const elNombre = document.getElementById("sidebarUserName") ||
document.getElementById("userName");

    const elAvatar = document.getElementById("avatarInitial") ||
document.getElementById("userInitial");

    if (elNombre) elNombre.textContent = nombre;
    if (elAvatar) elAvatar.textContent = nombre.charAt(0).toUpperCase();
}

// FIREBASE AUTH STATE (CORREGIDO)
onAuthStateChanged(auth, (user) => {

    actualizarMenu(user);
    cargarPerfil(user);

    const esPrivada = document.body.classList.contains("pagina-privada");
    if (!esPrivada) return;

    // Espera corta para evitar false null
    setTimeout(() => {
        if (!auth.currentUser) {
            window.location.replace("login.html");
        }
    }, 600);
});

// INIT
document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("toggleLink")
        ?.addEventListener("click", toggleForm);

    document.getElementById("loginForm")
        ?.addEventListener("submit", loginUser);

    document.getElementById("registerForm")
        ?.addEventListener("submit", registerUser);
});