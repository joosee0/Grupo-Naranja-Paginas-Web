document.addEventListener('DOMContentLoaded', function () {
    const STORAGE_KEY = 'prestige_historial_navegacion';
    
    // Elementos del DOM
    const totalVisitasEl = document.getElementById('totalVisitas');
    const ultimaVisitaEl = document.getElementById('ultimaVisita');
    const tablaHistorialEl = document.getElementById('tablaHistorial');
    const historialSesionEl = document.getElementById('historialSesion');
    const btnGuardar = document.getElementById('btnGuardar');
    const btnBorrar = document.getElementById('btnBorrar');
    const btnExportar = document.getElementById('btnExportar');

    // Leer historial desde localStorage
    function obtenerHistorial() {
        try {
            const datos = localStorage.getItem(STORAGE_KEY);
            return datos ? JSON.parse(datos) : [];
        } catch (e) {
            console.error('Error leyendo localStorage:', e);
            return [];
        }
    }

    // Guardar en localStorage
    function guardarHistorial(historial) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(historial));
    }

    // Crear y guardar nueva visita
    function registrarVisita() {
        const historial = obtenerHistorial();
        const nuevaVisita = {
            id: Date.now(), // ID único basado en timestamp
            fecha: new Date().toLocaleString('es-ES'),
            pagina: window.location.href,
            referencia: document.referrer || 'Acceso directo',
            resolucion: `${window.screen.width}x${window.screen.height}`,
            userAgent: navigator.platform
        };
        historial.push(nuevaVisita);
        guardarHistorial(historial);
        actualizarInterfaz();
    }

    // Renderizar tabla y resumen
    function actualizarInterfaz() {
        const historial = obtenerHistorial();
        
        // Actualizar resumen
        totalVisitasEl.textContent = historial.length;
        ultimaVisitaEl.textContent = historial.length > 0 
            ? historial[historial.length - 1].fecha 
            : 'Sin registros';

        // Renderizar tabla
        tablaHistorialEl.innerHTML = '';
        if (historial.length === 0) {
            tablaHistorialEl.innerHTML = '<tr><td colspan="5">No hay visitas registradas aún.</td></tr>';
            return;
        }

        // Mostrar de más reciente a más antiguo
        for (let i = historial.length - 1; i >= 0; i--) {
            const v = historial[i];
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${historial.length - i}</td>
                <td>${v.fecha}</td>
                <td class="break-url">${v.pagina}</td>
                <td class="break-url">${v.referencia}</td>
                <td>${v.resolucion}</td>
            `;
            tablaHistorialEl.appendChild(fila);
        }
    }

    // Cargar historial de sesión actual (Performance API)
    function cargarHistorialSesion() {
        historialSesionEl.innerHTML = '';
        const entries = performance.getEntriesByType('navigation');
        
        if (entries.length > 0) {
            entries.forEach(entry => {
                const li = document.createElement('li');
                const fecha = entry.startTime ? new Date(Date.now() - entry.startTime).toLocaleTimeString() : 'N/A';
                li.textContent = `• ${entry.name.split('/').pop() || 'Inicio'} | Tipo: ${entry.type} | Carga: ${Math.round(entry.duration)}ms`;
                historialSesionEl.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = `• ${window.location.pathname} (página actual)`;
            historialSesionEl.appendChild(li);
        }
    }

    // Exportar a archivo JSON descargable
    function exportarHistorial() {
        const historial = obtenerHistorial();
        if (historial.length === 0) {
            alert('No hay datos para exportar.');
            return;
        }
        const blob = new Blob([JSON.stringify(historial, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `historiale_prestige_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Borrar todo el historial con confirmación
    function borrarHistorial() {
        if (confirm('¿Estás seguro de eliminar todo el historial? Esta acción no se puede deshacer.')) {
            localStorage.removeItem(STORAGE_KEY);
            actualizarInterfaz();
        }
    }

    // Event Listeners
    btnGuardar?.addEventListener('click', registrarVisita);
    btnBorrar?.addEventListener('click', borrarHistorial);
    btnExportar?.addEventListener('click', exportarHistorial);

    // Inicializar al cargar
    registrarVisita(); // Auto-registra la visita actual
    cargarHistorialSesion();
});