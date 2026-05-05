/* ==========================================================================
   THEME.JS — Toggle Modo Claro / Modo Oscuro con persistencia en localStorage
   ========================================================================== */

// 1. Aplicar tema guardado INMEDIATAMENTE para evitar parpadeo (FOUC)
(function () {
    try {
        var saved = localStorage.getItem('theme');
        if (!saved) {
            saved = 'light'; // Tema por defecto
        }
        document.documentElement.setAttribute('data-theme', saved);
    } catch (e) {
        document.documentElement.setAttribute('data-theme', 'light');
    }
})();

// 2. Función global de toggle (usada por el botón onclick)
function toggleTheme() {
    var html = document.documentElement;
    var current = html.getAttribute('data-theme') || 'light';
    var next = (current === 'light') ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    try {
        localStorage.setItem('theme', next);
    } catch (e) {
        // Si localStorage está bloqueado, ignoramos silenciosamente
    }
}
