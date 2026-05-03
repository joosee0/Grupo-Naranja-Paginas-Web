function loginUser() {

    let user = document.getElementById("user").value;
    let pass = document.getElementById("pass").value;

    // usuario de prueba
    if (user === "admin" && pass === "1234") {

        // guardamos sesión
        localStorage.setItem("logged", "true");
        localStorage.setItem("user", user);

        // redirigir
        window.location.href = "index.html";

    } else {

        document.getElementById("error").innerText =
            "Usuario o contraseña incorrectos";
    }

    return false;
}