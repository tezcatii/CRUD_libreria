// --- 1. Variables Globales y Selectores de la Interfaz ---
const formulario = document.getElementById('formulario');
const tbody = document.getElementById('tbody');
const btnSubmit = formulario.querySelector('button[type="submit"]');
const cardTitle = formulario.closest('.card').querySelector('.card-header h2');

// Carga los libros guardados previamente o inicializa un arreglo vacío
let libros = JSON.parse(window.localStorage.getItem('libros')) || [];
let editandoId = null; // Almacena el ID del libro que el usuario desea editar

// --- 2. Escuchadores de Eventos (Event Listeners) ---
document.addEventListener('DOMContentLoaded', listarLibros);
formulario.addEventListener('submit', guardarLibro);

// --- 3. Operaciones Principales del CRUD ---

// [LEER] Renderiza los libros almacenados dentro de la tabla HTML
function listarLibros() {
    tbody.innerHTML = '';
    
    // Muestra un mensaje amigable si la base de datos local está vacía
    if (libros.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No hay libros registrados en el sistema</td></tr>`;
        return;
    }

    // Recorre el arreglo y genera las filas dinámicamente
    libros.forEach(libro => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${libro.titulo}</strong></td>
            <td>${libro.descripcion}</td>
            <td>$${parseFloat(libro.precio).toFixed(2)}</td>
            <td>
                <button class="btn btn-warning btn-sm me-2" onclick="cargarDatosEdicion(${libro.id})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="eliminarLibro(${libro.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// [CREAR y ACTUALIZAR] Procesa el envío de datos desde el formulario
function guardarLibro(e) {
    e.preventDefault();

    // Captura y limpia los valores introducidos por el usuario
    const titulo = document.getElementById('titulo').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const precio = document.getElementById('precio').value.trim();

    // Validación de seguridad para campos vacíos
    if (!titulo || !descripcion || !precio) {
        alert('Por favor, complete todos los campos requeridos.');
        return;
    }

    if (editandoId === null) {
        // ACCIÓN: CREAR NUEVO REGISTRO
        const nuevoLibro = {
            id: Date.now(), // Genera un ID numérico único basado en milisegundos
            titulo,
            descripcion,
            precio: parseFloat(precio)
        };
        libros.push(nuevoLibro);
    } else {
        // ACCIÓN: ACTUALIZAR REGISTRO EXISTENTE
        libros = libros.map(libro => 
            libro.id === editandoId ? { ...libro, titulo, descripcion, precio: parseFloat(precio) } : libro
        );
        
        // Restablece el formulario a su diseño original de inserción
        editandoId = null;
        btnSubmit.textContent = 'Agregar';
        btnSubmit.className = 'btn btn-primary';
        cardTitle.textContent = 'Agregar nuevo libro';
    }

    // Sincroniza los cambios con el navegador y refresca la tabla
    actualizarLocalStorage();
    listarLibros();
    formulario.reset();
}

// [PRE-ACTUALIZAR] Extrae la información de la fila y la monta en el formulario
window.cargarDatosEdicion = function(id) {
    const libro = libros.find(l => l.id === id);
    if (!libro) return;

    // Asigna los valores del libro a los campos de entrada correspondientes
    document.getElementById('titulo').value = libro.titulo;
    document.getElementById('descripcion').value = libro.descripcion;
    document.getElementById('precio').value = libro.precio;

    // Transforma el diseño de la tarjeta para indicar el modo edición
    editandoId = id;
    btnSubmit.textContent = 'Guardar Cambios';
    btnSubmit.className = 'btn btn-success';
    cardTitle.textContent = 'Modificar detalles del libro';
}

// [ELIMINAR] Quita un objeto específico de la base de datos local
window.eliminarLibro = function(id) {
    if (confirm('¿Está seguro de que desea eliminar este libro del catálogo de forma permanente?')) {
        libros = libros.filter(libro => libro.id !== id);
        
        // Si el usuario borra el libro que tenía seleccionado para editar, limpia el formulario
        if (editandoId === id) {
            editandoId = null;
            btnSubmit.textContent = 'Agregar';
            btnSubmit.className = 'btn btn-primary';
            cardTitle.textContent = 'Agregar nuevo libro';
            formulario.reset();
        }

        actualizarLocalStorage();
        listarLibros();
    }
}

// --- 4. Persistencia de Datos ---
function actualizarLocalStorage() {
    localStorage.setItem('libros', JSON.stringify(libros));
}
