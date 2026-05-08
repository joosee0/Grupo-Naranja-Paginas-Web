// login.js — Autenticación con Firebase
// Inmobiliaria Prestige

// (Hecho por Miguel)

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

// Traducir errores de Firebase
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

// Cambiar entre login y registro
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
        titulo.textContent = mostrandoLogin ? "Crea tu cuenta" : "Accede a tu cuenta";
    }
    if (toggleLink) {
        toggleLink.textContent = mostrandoLogin 
            ? "¿Ya tienes cuenta? Iniciar sesión" 
            : "¿No tienes cuenta? Crear cuenta";
    }
}

// Iniciar sesión con Firebase
async function loginUser(e) {
    if (e) e.preventDefault();
    
    const email = document.getElementById("user")?.value?.trim() || "";
    const pass = document.getElementById("pass")?.value || "";
    
    mostrarError("");
    
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        window.location.href = "perfil.html";
    } catch (err) {
        mostrarError(traducirError(err));
    }
    return false;
}

// Registrar usuario con Firebase
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
        
        // Guardar usuario en Firestore
        try {
            await setDoc(doc(db, "usuarios", cred.user.uid), {
                uid: cred.user.uid,
                email: cred.user.email,
                nombre: email.split("@")[0],
                fechaRegistro: serverTimestamp(),
                proveedor: "email"
            });
        } catch (errDb) {
            console.warn("No se pudo guardar en Firestore:", errDb);
        }
        
        mostrarError("✅ Cuenta creada. Redirigiendo...", "#16a34a");
        setTimeout(() => {
            window.location.href = "perfil.html";
        }, 1200);
        
    } catch (err) {
        mostrarError(traducirError(err));
    }
    return false;
}

// Cerrar sesión
async function logout() {
    try {
        await signOut(auth);
    } catch (err) {
        console.error("Error al cerrar sesión:", err);
    }
    window.location.href = "login.html";
}

// Actualizar menú de usuario
function actualizarMenu(user) {
    const menu = document.getElementById("userMenu");
    if (!menu) return;
    
    if (user) {
        const nombre = user.email?.split("@")[0] || "Usuario";
        menu.innerHTML = `
            <a href="perfil.html" style="color:#c5a059;">👤 ${nombre}</a>
            <a href="#" id="btnLogout" style="margin-left:12px;color:#666;">Salir</a>
        `;
        // Añadir evento al botón de logout dinámico
        document.getElementById("btnLogout")?.addEventListener("click", (e) => {
            e.preventDefault();
            logout();
        });
    } else {
        menu.innerHTML = `<a href="login.html" style="color:#fff;">Iniciar Sesión</a>`;
    }
}

// Cargar datos en perfil.html
function cargarPerfil(user) {
    if (!document.body.classList.contains("pagina-privada")) return;
    if (!user) return;
    
    const nombre = user.email?.split("@")[0] || "Usuario";
    
    const elNombre = document.getElementById("sidebarUserName") || document.getElementById("userName");
    const elAvatar = document.getElementById("avatarInitial") || document.getElementById("userInitial");
    
    if (elNombre) elNombre.textContent = nombre;
    if (elAvatar) elAvatar.textContent = nombre.charAt(0).toUpperCase();
}

// Listener de Firebase: se ejecuta cuando cambia el estado de auth
onAuthStateChanged(auth, (user) => {
    actualizarMenu(user);
    cargarPerfil(user);
    
    // Proteger páginas privadas
    if (document.body.classList.contains("pagina-privada") && !user) {
        window.location.href = "login.html";
    }
});

// Inicializar cuando cargue la página
document.addEventListener("DOMContentLoaded", function() {
    // Evento para el enlace de toggle
    const toggleLink = document.getElementById("toggleLink");
    if (toggleLink) {
        toggleLink.addEventListener("click", toggleForm);
    }
    
    // Eventos para los formularios
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", loginUser);
    }
    
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", registerUser);
    }
});

// (final de Miguel)