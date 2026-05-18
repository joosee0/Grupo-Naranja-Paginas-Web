

// Foto de perfil
const uploadPhoto = document.getElementById('uploadPhoto');
const profilePreview = document.getElementById('profilePreview');
const changePhotoBtn = document.getElementById('changePhotoBtn');

changePhotoBtn.addEventListener('click', () => {
    uploadPhoto.click();
});

uploadPhoto.addEventListener('change', (e) => {

    const file = e.target.files[0];

    if (file) {

        const reader = new FileReader();

        reader.onload = function (event) {

            profilePreview.src = event.target.result;

            localStorage.setItem(
                'profileImage',
                event.target.result
            );
        }

        reader.readAsDataURL(file);
    }
});


// Cargar foto guardada
const savedImage = localStorage.getItem('profileImage');

if (savedImage) {
    profilePreview.src = savedImage;
}


// Formulario de cuenta
const accountForm = document.getElementById('accountForm');

accountForm.addEventListener('submit', function (e) {

    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const apellidos = document.getElementById('apellidos').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const ciudad = document.getElementById('ciudad').value;
    const bio = document.getElementById('bio').value;

    localStorage.setItem('nombre', nombre);
    localStorage.setItem('apellidos', apellidos);
    localStorage.setItem('email', email);
    localStorage.setItem('telefono', telefono);
    localStorage.setItem('ciudad', ciudad);
    localStorage.setItem('bio', bio);

    document.getElementById(
        'sidebarName'
    ).textContent = `${nombre} ${apellidos}`;

    alert('Cambios guardados correctamente');

});


// Cargar datos
window.addEventListener('load', () => {

    if (localStorage.getItem('nombre')) {
        document.getElementById('nombre').value =
            localStorage.getItem('nombre');
    }

    if (localStorage.getItem('apellidos')) {
        document.getElementById('apellidos').value =
            localStorage.getItem('apellidos');
    }

    if (localStorage.getItem('email')) {
        document.getElementById('email').value =
            localStorage.getItem('email');
    }

    if (localStorage.getItem('telefono')) {
        document.getElementById('telefono').value =
            localStorage.getItem('telefono');
    }

    if (localStorage.getItem('ciudad')) {
        document.getElementById('ciudad').value =
            localStorage.getItem('ciudad');
    }

    if (localStorage.getItem('bio')) {
        document.getElementById('bio').value =
            localStorage.getItem('bio');
    }

    const savedName = localStorage.getItem('nombre');
    const savedLastName = localStorage.getItem('apellidos');

    if (savedName && savedLastName) {

        document.getElementById(
            'sidebarName'
        ).textContent = `${savedName} ${savedLastName}`;
    }

});


// Cambiar tema
const themeSelect = document.getElementById('themeSelect');

themeSelect.addEventListener('change', () => {

    const selectedTheme = themeSelect.value;

    if (selectedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

    localStorage.setItem('theme', selectedTheme);

});


// Cargar tema
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark') {

    document.body.classList.add('dark-mode');

    themeSelect.value = 'dark';
}


// Seguridad
const securityForm = document.getElementById('securityForm');

securityForm.addEventListener('submit', (e) => {

    e.preventDefault();

    const newPassword =
        document.getElementById('newPassword').value;

    const confirmPassword =
        document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {

        alert('Las contraseñas no coinciden');

        return;
    }

    alert('Contraseña actualizada correctamente');

});


// Eliminar cuenta
document.getElementById('deleteAccountBtn')
    .addEventListener('click', () => {

        const confirmDelete = confirm(
            '¿Seguro que deseas eliminar tu cuenta?'
        );

        if (confirmDelete) {

            localStorage.clear();

            alert('Cuenta eliminada');

            window.location.href = 'index.html';
        }

    });