import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCqxCob5bDM7KfPy9ADjKccEDv4ouwiXS4",
    authDomain: "inmobiliaria-pr0yec.firebaseapp.com",
    projectId: "inmobiliaria-pr0yec",
    storageBucket: "inmobiliaria-pr0yec.firebasestorage.app",
    messagingSenderId: "771460096132",
    appId: "1:771460096132:web:b5a75c933eb1db555f22d1",
    measurementId: "G-F6ZLXZYT42"
};

const auth = getAuth(initializeApp(firebaseConfig));
const db = getFirestore(initializeApp(firebaseConfig));

function mostrarError(txt) { document.getElementById("error").textContent = txt; }

async function loginUser(e) {
    if (e) e.preventDefault();
    const email = document.getElementById("user").value;
    const pass = document.getElementById("pass").value;

    try {
        await signInWithEmailAndPassword(auth, email, pass);
        // Modal Universal
        const modal = document.getElementById('modal2FA');
        modal.style.display = 'flex';
        
        document.getElementById('btnVerificar2FA').onclick = () => {
            if (document.getElementById('codigo2FA').value === "123456") {
                window.location.href = "perfil.html";
            } else {
                alert("Código incorrecto (usa 123456)");
            }
        };
        document.getElementById('btnCancelar2FA').onclick = () => modal.style.display = 'none';
    } catch (err) {
        mostrarError("Email o contraseña incorrectos");
    }
}

async function registerUser(e) {
    e.preventDefault();
    const email = document.getElementById("newUser").value;
    const pass = document.getElementById("newPass").value;
    try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, "usuarios", cred.user.uid), { email, fecha: serverTimestamp() });
        alert("Cuenta creada, ya puedes iniciar sesión");
    } catch (err) { mostrarError("Error al registrar"); }
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loginForm")?.addEventListener("submit", loginUser);
    document.getElementById("registerForm")?.addEventListener("submit", registerUser);
    document.getElementById("toggleLink")?.addEventListener("click", (e) => {
        e.preventDefault();
        const login = document.getElementById("loginForm");
        const reg = document.getElementById("registerForm");
        login.style.display = login.style.display === "none" ? "block" : "none";
        reg.style.display = reg.style.display === "none" ? "block" : "none";
    });
});
