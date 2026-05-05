// =====================================================================
//  login.js — Autenticación con Firebase Authentication
//  Expone funciones globales (loginUser, registerUser, toggleForm, logout,
//  mostrarUsuario, estaLogueado) para mantener la compatibilidad con los
//  onclick/onsubmit del HTML y con perfil.html (.pagina-protegida).
// =====================================================================

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

// --- Configuración del proyecto ---
const firebaseConfig = {
    apiKey: "AIzaSyCqxCob5bDM7KfPy9ADjKccEDv4ouwiXS4",
    authDomain: "inmobiliaria-pr0yec.firebaseapp.com",
    projectId: "inmobiliaria-pr0yec",
    storageBucket: "inmobiliaria-pr0yec.firebasestorage.app",
    messagingSenderId: "771460096132",
    appId: "1:771460096132:web:b5a75c933eb1db555f22d1",
    measurementId: "G-F6ZLXZYT42"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ---------------------------------------------------------------------
//  Helpers de UI
// ---------------------------------------------------------------------
function mostrarError(texto, color = "#dc2626") {
    const box = document.getElementById("error");
    if (!box) return;
    box.style.color   = color;
    box.innerText     = texto;
}

function traducirError(err) {
    switch (err && err.code) {
        case "auth/invalid-email":        return "El correo no es válido.";
        case "auth/missing-password":     return "Debes introducir una contraseña.";
        case "auth/weak-password":        return "La contraseña debe tener al menos 6 caracteres.";
        case "auth/email-already-in-use": return "Este correo ya está registrado.";
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":       return "Email o contraseña incorrectos.";
        default: return "Error: " + ((err && err.message) || (err && err.code) || "desconocido");
    }
}

// ---------------------------------------------------------------------
//  Funciones globales (las usan los onsubmit / onclick del HTML)
// ---------------------------------------------------------------------

// Iniciar sesión
window.loginUser = async function () {
    const email = (document.getElementById("email") || {}).value || "";
    const pass  = (document.getElementById("pass")  || {}).value || "";
    mostrarError("");

    try {
        await signInWithEmailAndPassword(auth, email.trim(), pass);
        window.location.href = "index.html";
    } catch (err) {
        mostrarError(traducirError(err));
    }
    return false;
};

// Registrar nueva cuenta y guardar el usuario en Firestore
window.registerUser = async function () {
    const email = ((document.getElementById("newEmail") || {}).value || "").trim();
    const pass  = (document.getElementById("newPass")  || {}).value || "";
    mostrarError("");

    try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);

        // Guardar el perfil del usuario en la colección "usuarios"
        try {
            await setDoc(doc(db, "usuarios", cred.user.uid), {
                uid:           cred.user.uid,
                email:         cred.user.email,
                nombre:        email.split("@")[0],
                fechaRegistro: serverTimestamp(),
                proveedor:     "email"
            });
        } catch (errDb) {
            console.warn("No se pudo guardar el usuario en Firestore:", errDb);
        }

        mostrarError("Cuenta creada con éxito. Redirigiendo…", "#16a34a");
        setTimeout(() => (window.location.href = "index.html"), 1200);
    } catch (err) {
        mostrarError(traducirError(err));
    }
    return false;
};

// Conmutar entre formulario de login y de registro
window.toggleForm = function () {
    const loginForm    = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const titulo       = document.getElementById("titulo");
    const toggleText   = document.getElementById("toggleText");
    if (!loginForm || !registerForm) return;

    mostrarError("");
    const mostrarRegistro = loginForm.style.display !== "none";

    loginForm.style.display    = mostrarRegistro ? "none"  : "block";
    registerForm.style.display = mostrarRegistro ? "block" : "none";

    if (titulo)     titulo.innerText     = mostrarRegistro ? "Crea tu cuenta"   : "Accede a tu cuenta";
    if (toggleText) toggleText.innerText = mostrarRegistro ? "Ya tengo cuenta"  : "Crear cuenta";
};

// Cerrar sesión
window.logout = async function () {
    try {
        await signOut(auth);
    } catch (e) {
        console.error("Error al cerrar sesión:", e);
    }
    window.location.href = "login.html";
};

// Comprobación rápida del estado actual (sincrónica)
window.estaLogueado = function () {
    return !!auth.currentUser;
};

// ---------------------------------------------------------------------
//  Render del menú de usuario y protección de páginas
// ---------------------------------------------------------------------
function mostrarUsuario(user) {
    const menu = document.getElementById("userMenu");
    if (!menu) return;

    if (user) {
        const nombre = user.displayName || (user.email ? user.email.split("@")[0] : "Usuario");
        menu.classList.add("logged");
        menu.innerHTML = `
            <span style="color:#fff; margin-right:10px;">Hola, ${nombre}</span>
            <a href="perfil.html" style="color:#fff; margin-right:10px;">Mi perfil</a>
            <a href="#" onclick="logout(); return false;" style="color:#fff;">Salir</a>
        `;
    } else {
        menu.classList.remove("logged");
        menu.innerHTML = "";
    }
}
window.mostrarUsuario = mostrarUsuario;

// Rellena los datos del usuario dentro de perfil.html
function pintarPerfil(user) {
    if (!document.body.classList.contains("pagina-protegida")) return;
    if (!user) return;

    const nombre   = user.displayName || (user.email ? user.email.split("@")[0] : "Usuario");
    const initial  = document.getElementById("userInitial");
    const userName = document.getElementById("userName");
    const userMail = document.getElementById("userEmail");

    if (initial)  initial.innerText  = nombre.charAt(0).toUpperCase();
    if (userName) userName.innerText = nombre;
    if (userMail) userMail.innerText = user.email || "";
}

// Listener centralizado: pinta el menú, rellena el perfil y protege rutas
onAuthStateChanged(auth, (user) => {
    mostrarUsuario(user);
    pintarPerfil(user);

    if (document.body.classList.contains("pagina-protegida") && !user) {
        window.location.href = "login.html";
    }
});
