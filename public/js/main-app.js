// public/js/main-app.js


// Tus credenciales de configuración de Firebase
const firebaseConfig = {
          apiKey: "AIzaSyAwJUjgCO1UNwo9V_gIdI8_7wlO-rYxjJI",
          authDomain: "mi-catalogo-tienda.firebaseapp.com",
          projectId: "mi-catalogo-tienda",
          storageBucket: "mi-catalogo-tienda.firebasestorage.app",
          messagingSenderId: "187610778929",
          appId: "1:187610778929:web:c6b3d11a969432d7657410"
        };
        firebase.initializeApp(firebaseConfig);
// Conexión a Firebase
const db = firebase.firestore();
const productosRef = db.collection('productos');

// Elementos del DOM del catálogo
const catalogoContainer = document.getElementById('catalogo-container');
const searchInput = document.getElementById('searchInput');
const categoriaSelect = document.getElementById('categoriaSelect');
const productModal = document.getElementById('product-modal');
const modalBody = document.getElementById('modal-body');
const closeButton = document.querySelector('.close-button');

// Elementos del DOM para la administración
const adminButton = document.getElementById('admin-button');
const passwordModal = document.getElementById('password-modal');
const passwordInput = document.getElementById('password-input');
const passwordSubmit = document.getElementById('password-submit');

let productos = []; // Almacenará los productos de Firebase

// Funciones para manejar la interfaz de usuario (UI)
const crearTarjetaProducto = (producto) => {
    const card = document.createElement('div');
    card.classList.add('producto-card');

    let precioHTML = '';
    let descuentoBadge = '';

    // Lógica para mostrar el descuento si aplica
    if (producto.precioDescuento && producto.precioDescuento < producto.precioOriginal) {
        const descuentoPorcentaje = Math.round(
            (1 - producto.precioDescuento / producto.precioOriginal) * 100
        );
        descuentoBadge = `<div class="descuento-badge">-${descuentoPorcentaje}%</div>`;
        precioHTML = `
            <p class="precio-original">S/. ${producto.precioOriginal.toFixed(2)}</p>
            <p class="precio-descuento">S/. ${producto.precioDescuento.toFixed(2)}</p>
        `;
    } else {
        // Si no hay descuento, solo muestra el precio normal
        precioHTML = `<p class="precio">S/. ${producto.precio1.toFixed(2)}</p>`;
    }

    card.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.modelo}">
        ${descuentoBadge}
        <div class="producto-info">
            <h3>${producto.marca} ${producto.modelo}</h3>
            <p>${producto.descripcion.substring(0, 50)}...</p>
            ${precioHTML}
            <button class="boton-detalle" data-id="${producto.id}">Ver detalles</button>
        </div>
    `;

    return card;
};

const renderizarCatalogo = (productosToShow) => {
    catalogoContainer.innerHTML = '';
    productosToShow.forEach(producto => {
        const card = crearTarjetaProducto(producto);
        catalogoContainer.appendChild(card);
    });
};

const llenarCategorias = (allProductos) => {
    const categorias = [...new Set(allProductos.map(p => p.categoria))];
    categoriaSelect.innerHTML = '<option value="all">Todas las categorías</option>';
    categorias.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoriaSelect.appendChild(option);
    });
};

// Función para obtener productos de Firebase
const getProductos = async () => {
    const snapshot = await productosRef.get();
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

// Lógica principal de la aplicación
document.addEventListener('DOMContentLoaded', async () => {
    productos = await getProductos();
    renderizarCatalogo(productos);
    llenarCategorias(productos);

    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoriaSelect.value;

        const filteredProductos = productos.filter(producto => {
            const matchesSearch = producto.modelo.toLowerCase().includes(searchTerm) ||
                                  producto.marca.toLowerCase().includes(searchTerm);
            const matchesCategory = selectedCategory === 'all' || producto.categoria === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        renderizarCatalogo(filteredProductos);
    };

    searchInput.addEventListener('input', applyFilters);
    categoriaSelect.addEventListener('change', applyFilters);
});

// Lógica del modal de detalles del producto
catalogoContainer.addEventListener('click', async (e) => {
    if (e.target.classList.contains('boton-detalle')) {
        const productId = e.target.dataset.id;
        const producto = productos.find(p => p.id === productId);

        let detallePreciosHTML = '';
        let descuentoModalBadge = '';
        const tieneDescuento = producto.precioDescuento && producto.precioDescuento < producto.precioOriginal;

        if (tieneDescuento) {
            const descuentoPorcentaje = Math.round(
                (1 - producto.precioDescuento / producto.precioOriginal) * 100
            );
            descuentoModalBadge = `<div class="descuento-modal-badge">-${descuentoPorcentaje}%</div>`;
            detallePreciosHTML = `
                <p>
                    <strong>Precio anterior:</strong> <span class="precio-original">S/. ${producto.precioOriginal.toFixed(2)}</span><br>
                    <strong>Precio con descuento:</strong> <span class="precio-descuento"><br>S/. ${producto.precioDescuento.toFixed(2)}</br></span>
                </p>
            `;
        } else if (producto.precioOriginal) {
            detallePreciosHTML = `<p><strong>Precio:</strong> <span class="precio-descuento">S/. ${producto.precioOriginal.toFixed(2)}</span></p>`;
        } else {
            detallePreciosHTML = `<p>Precio no disponible</p>`;
        }

        modalBody.innerHTML = `
            <div class="detalle-producto">
                ${descuentoModalBadge}
                <img src="${producto.imagen}" alt="${producto.modelo}">
                <div class="detalle-info">
                    <h2>${producto.marca} ${producto.modelo}</h2>
                    <p><strong>Categoría:</strong> ${producto.categoria}</p>
                    <p>${producto.descripcion}</p>
                    <div class="detalle-precios">
                        ${detallePreciosHTML}
                    </div>
                </div>
            </div>
        `;

        productModal.style.display = 'flex';
    }
});


closeButton.addEventListener('click', () => {
    productModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === productModal) {
        productModal.style.display = 'none';
    }
});

// Lógica para el modal de administración
adminButton.addEventListener('click', () => {
    passwordModal.style.display = 'flex'; // Aquí es donde el modal se hace visible
});

passwordSubmit.addEventListener('click', () => {
    const password = passwordInput.value;
    const adminPassword = 'admin123'; // Contraseña 

    if (password === adminPassword) {
        window.location.href = 'admin.html';
    } else {
        alert('Contraseña incorrecta. Inténtalo de nuevo.');
        passwordInput.value = '';
    }
});

// Cerrar el modal de contraseña si se hace clic fuera de él
passwordModal.addEventListener('click', (e) => {
    if (e.target.id === 'password-modal') {
        passwordModal.style.display = 'none';
    }
});