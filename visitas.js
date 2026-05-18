const KEY = "visitas_inmobiliaria";

let visits = JSON.parse(localStorage.getItem(KEY)) || [];

/* guardar */
function save() {
    localStorage.setItem(KEY, JSON.stringify(visits));
}

/* render */
function render(filter = "all") {
    const container = document.getElementById("visits-container");
    container.innerHTML = "";

    let filtered = visits;

    if (filter !== "all") {
        filtered = visits.filter(v => v.status === filter);
    }

    document.getElementById("visit-count").textContent = visits.length;

    filtered.forEach(v => {
        const div = document.createElement("div");
        div.className = "visit-card";

        div.innerHTML = `
            <h3>${v.property}</h3>
            <p>👤 Cliente: ${v.client}</p>
            <p>📅 ${v.date} - ${v.time}</p>
            <span class="status ${v.status}">${v.status}</span>

            <div class="actions">
                <button onclick="changeStatus(${v.id}, 'confirmada')">Confirmar</button>
                <button onclick="changeStatus(${v.id}, 'cancelada')">Cancelar</button>
                <button onclick="removeVisit(${v.id})">Eliminar</button>
            </div>
        `;

        container.appendChild(div);
    });
}

/* cambiar estado */
function changeStatus(id, status) {
    visits = visits.map(v => v.id === id ? { ...v, status } : v);
    save();
    render(document.getElementById("filter-status").value);
}

/* eliminar */
function removeVisit(id) {
    visits = visits.filter(v => v.id !== id);
    save();
    render();
}

/* añadir demo */
document.getElementById("add-demo").addEventListener("click", () => {
    visits.push({
        id: Date.now(),
        property: "Piso en Sevilla Centro",
        client: "Cliente Demo",
        date: "2026-05-20",
        time: "17:00",
        status: "pendiente"
    });

    save();
    render();
});

/* filtro */
document.getElementById("filter-status").addEventListener("change", (e) => {
    render(e.target.value);
});

render();