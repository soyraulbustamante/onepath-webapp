const universidades = [
    { id: "pucp", nombre: "Pontificia Universidad Católica del Perú", logo: "pucp.svg" },
    { id: "unmsm", nombre: "Universidad Nacional Mayor de San Marcos", logo: "unmsm.svg" },
    { id: "uni", nombre: "Universidad Nacional de Ingeniería", logo: "uni.svg" },
    { id: "utec", nombre: "Universidad de Ingeniería y Tecnología", logo: "utec.svg" },
    { id: "upc", nombre: "Universidad Peruana de Ciencias Aplicadas", logo: "upc.svg" }
];


// ======= LOCALSTORAGE =======
const STORAGE_KEY = "conveniosUniversitarios";

const cargarConvenios = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

const guardarConvenios = (lista) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
};


// ======= CARGAR SELECT DE UNIVERSIDADES =======
const universidadSelect = document.getElementById("universidadSelect");
universidades.forEach(u => {
    const option = document.createElement("option");
    option.value = u.id;
    option.textContent = u.nombre;
    universidadSelect.appendChild(option);
});


// ======= RENDERIZACIÓN DE TARJETAS =======
const contenedor = document.getElementById("conveniosContainer");

function render() {
    contenedor.innerHTML = "";
    const convenios = cargarConvenios();

    const hoy = new Date();

    convenios.forEach((c, index) => {
        const expDate = new Date(c.fechaExp);

        // Marcar expirados automáticamente
        c.estado = expDate < hoy ? "EXPIRADO" : "ACTIVO";

        const uni = universidades.find(u => u.id === c.universidad);

        const card = document.createElement("div");
        card.classList.add("convenio-card");

        card.innerHTML = `
            <img src="../../assets/images/universities/${uni.logo}">
            <span class="convenio-title">${uni.nombre}</span>
            <span class="convenio-beneficio">${c.beneficio}</span>
            <span class="badge ${c.estado === 'EXPIRADO' ? 'badge-expirado' : 'badge-activo'}">
                ${c.estado}
            </span>
            <span>Vence: ${c.fechaExp}</span>
            <button class="delete-btn" data-index="${index}">Eliminar</button>
        `;

        contenedor.appendChild(card);
    });

    guardarConvenios(convenios); // Guarda estados actualizados
}


// ======= REGISTRO =======
document.getElementById("formConvenio").addEventListener("submit", (e) => {
    e.preventDefault();

    const nueva = {
        universidad: universidadSelect.value,
        beneficio: document.getElementById("beneficioInput").value,
        fechaExp: document.getElementById("fechaExpInput").value,
        estado: "ACTIVO"
    };

    const convenios = cargarConvenios();
    convenios.push(nueva);
    guardarConvenios(convenios);

    render();
    e.target.reset();
});


// ======= ELIMINAR =======
contenedor.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const idx = e.target.dataset.index;
        const convenios = cargarConvenios();
        convenios.splice(idx, 1);
        guardarConvenios(convenios);
        render();
    }
});


// ======= INICIAL =======
render();
