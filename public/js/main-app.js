import { getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Importa la base de datos y la referencia a la colección de productos desde tu archivo de inicialización.
import { db, productosRef } from "./firebase-init.js";
import { cargarCarrusel } from "./carrusel.js";

// Elementos del DOM
const catalogoContainer = document.getElementById('catalogo-container');
const searchInput = document.getElementById('searchInput');
const categoriasFiltroContainer = document.getElementById('categorias-filtro'); // Nuevo elemento para checkboxes
const marcasFiltroContainer = document.getElementById('marcas-filtro');
const preciosFiltroContainer = document.getElementById('precios-filtro');
const productModal = document.getElementById('product-modal');
const modalBody = document.getElementById('modal-body');
const closeButton = document.querySelector('.close-button');
const adminButton = document.getElementById('admin-button');
const passwordModal = document.getElementById('password-modal');
const passwordInput = document.getElementById('password-input');
const passwordSubmit = document.getElementById('password-submit');
const passwordModalCloseButton = document.querySelector('.close-button-password');

const numeroWhatsapp = '981963937'; // Número de WhatsApp para consultas

// Variable global para almacenar los productos
let productos = [];

// Función para crear la tarjeta de producto en el catálogo
const crearTarjetaProducto = (producto) => {
    const card = document.createElement('div');
    card.classList.add('producto-card');

    let precioHTML = '';
    let descuentoBadge = '';

    const tieneDescuento = producto.precioDescuento && producto.precioDescuento < producto.precioOriginal;

    if (tieneDescuento) {
        const descuentoPorcentaje = Math.round(
            (1 - producto.precioDescuento / producto.precioOriginal) * 100
        );
        descuentoBadge = `<div class="descuento-badge">-${descuentoPorcentaje}%</div>`;
        precioHTML = `
            <p class="precio-original">S/. ${producto.precioOriginal.toFixed(2)}</p>
            <p class="precio-descuento">S/. ${producto.precioDescuento.toFixed(2)}</p>
        `;
    } else if (producto.precioOriginal) {
        precioHTML = `<p class="precio">S/. ${producto.precioOriginal.toFixed(2)}</p>`;
    } else {
        precioHTML = `<p class="precio">Precio no disponible</p>`;
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

// Función para renderizar los productos en el catálogo
const renderizarProductos = (productosToShow) => {
    if (!catalogoContainer) return;
    catalogoContainer.innerHTML = '';
    if (productosToShow.length === 0) {
        catalogoContainer.innerHTML = '<p class="no-encontrado">No se encontraron productos que coincidan con los filtros.</p>';
        return;
    }
    productosToShow.forEach(producto => {
        const card = crearTarjetaProducto(producto);
        catalogoContainer.appendChild(card);
    });
};

// Función para llenar dinámicamente los filtros de categorías con checkboxes
const llenarCategoriasCheckboxes = (allProductos) => {
    if (!categoriasFiltroContainer) return;
    const uniqueCategories = [...new Set(allProductos.map(p => p.categoria))];
    categoriasFiltroContainer.innerHTML = ''; // Limpiar opciones existentes
    uniqueCategories.forEach(category => {
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" name="categoria" value="${category}">
            ${category}
        `;
        categoriasFiltroContainer.appendChild(label);
    });
};

// Función para llenar dinámicamente los filtros de marcas
const llenarMarcas = (allProductos) => {
    if (!marcasFiltroContainer) return;
    const uniqueBrands = [...new Set(allProductos.map(p => p.marca))];
    marcasFiltroContainer.innerHTML = ''; // Limpiar opciones existentes
    uniqueBrands.forEach(brand => {
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" name="marca" value="${brand}">
            ${brand}
        `;
        marcasFiltroContainer.appendChild(label);
    });
};

// Función para aplicar los filtros (actualizada para incluir categorías con checkboxes)
const aplicarFiltros = () => {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    // Obtener los filtros de categoría, marca y precio desde los elementos del DOM
    const selectedCategories = Array.from(categoriasFiltroContainer.querySelectorAll('input[type="checkbox"]:checked')).map(el => el.value);
    const selectedBrands = Array.from(marcasFiltroContainer.querySelectorAll('input[type="checkbox"]:checked')).map(el => el.value);
    const selectedPriceRange = preciosFiltroContainer.querySelector('input[type="radio"]:checked').value;

    const productosFiltrados = productos.filter(producto => {
        const matchesSearch = producto.modelo.toLowerCase().includes(searchTerm) ||
            producto.marca.toLowerCase().includes(searchTerm) ||
            producto.descripcion.toLowerCase().includes(searchTerm);
        
        // Filtro por categoría (ahora con checkboxes)
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(producto.categoria);

        // Filtro por marca
        const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(producto.marca);
        
        // Filtro por rango de precio
        const matchesPrice = (() => {
            if (selectedPriceRange === 'all') return true;
            const [minStr, maxStr] = selectedPriceRange.split('-');
            const min = parseFloat(minStr);
            const max = maxStr === 'max' ? Infinity : parseFloat(maxStr);
            const productPrice = producto.precioDescuento || producto.precioOriginal;
            return productPrice >= min && productPrice <= max;
        })();
        
        return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
    });

    renderizarProductos(productosFiltrados);
};

// Lógica para obtener productos de Firebase y configurar la página
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const snapshot = await getDocs(productosRef);
        productos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        renderizarProductos(productos);
        llenarCategoriasCheckboxes(productos); // Llenar las categorías con checkboxes
        llenarMarcas(productos); 
        
        // Asignar los event listeners de los filtros
        if (searchInput) searchInput.addEventListener('input', aplicarFiltros);
        // Nuevo listener para las categorías (ahora con checkboxes)
        if (categoriasFiltroContainer) categoriasFiltroContainer.addEventListener('change', aplicarFiltros);
        // Listeners para marcas y precios
        if (marcasFiltroContainer) marcasFiltroContainer.addEventListener('change', aplicarFiltros);
        if (preciosFiltroContainer) preciosFiltroContainer.addEventListener('change', aplicarFiltros);
        await cargarCarrusel();
        
    } catch (error) {
        console.error("Error al obtener los productos:", error);
        if (catalogoContainer) {
            catalogoContainer.innerHTML = '<p>Error al cargar los productos. Inténtalo de nuevo más tarde.</p>';
        }
    }
});

// Lógica del modal de detalles del producto
if (catalogoContainer) {
    catalogoContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('boton-detalle')) {
            const productId = e.target.dataset.id;
            const producto = productos.find(p => p.id === productId);

            if (!producto) return;

            let detallePreciosHTML = '';
            let descuentoModalBadge = '';
            const tieneDescuento = producto.precioDescuento && producto.precioDescuento < producto.precioOriginal;

            if (tieneDescuento) {
                const descuentoPorcentaje = Math.round(
                    (1 - producto.precioDescuento / producto.precioOriginal) * 100
                );
                descuentoModalBadge = `<div class="descuento-modal-badge">-${descuentoPorcentaje}%</div>`;
                detallePreciosHTML = `
                    <p class="precio-line">
                        <strong>Precio anterior:</strong> <span class="precio-original">S/. ${producto.precioOriginal.toFixed(2)}</span>
                    </p>
                    <p class="precio-line">
                        <strong>Precio con descuento:</strong> <span class="precio-descuento">S/. ${producto.precioDescuento.toFixed(2)}</span>
                    </p>
                `;
            } else if (producto.precioOriginal) {
                detallePreciosHTML = `<p><strong>Precio:</strong> <span class="precio-descuento">S/. ${producto.precioOriginal.toFixed(2)}</span></p>`;
            } else {
                detallePreciosHTML = `<p>Precio no disponible</p>`;
            }

            // Separamos la descripción por comas y la convertimos en una lista.
            const descripcionArray = producto.descripcion.split(',').map(item => `<li>${item.trim()}</li>`).join('');

            if (modalBody) {
                // Aquí está la parte modificada. Se añade el div del botón de WhatsApp al final.
                modalBody.innerHTML = `
                    <div class="detalle-producto">
                        <div class="detalle-header">
                            ${descuentoModalBadge}
                            <img src="${producto.imagen}" alt="${producto.modelo}">
                        </div>
                        <div class="detalle-info">
                            <h2>${producto.marca} ${producto.modelo}</h2>
                            <p><strong>Categoría:</strong> ${producto.categoria}</p>
                            <div class="detalle-descripcion">
                                <ol>${descripcionArray}</ol>
                            </div>
                            <div class="detalle-precios">
                                ${detallePreciosHTML}
                            </div>
                            <div class="detalle-acciones">
                                <a href="https://wa.me/${numeroWhatsapp}?text=Hola, estoy interesado en el producto: ${producto.marca} ${producto.modelo}. ¿Podrías darme más información?" 
                                   target="_blank" class="boton-whatsapp">
                                    <i class="fab fa-whatsapp"></i> Consultar por WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            }

            if (productModal) {
                productModal.style.display = 'flex';
            }
        }
    });
}

if (closeButton) {
    closeButton.addEventListener('click', () => {
        if (productModal) productModal.style.display = 'none';
    });
}

window.addEventListener('click', (e) => {
    if (e.target === productModal) {
        if (productModal) productModal.style.display = 'none';
    }
});

// Lógica para el modal de administración
if (adminButton) {
    adminButton.addEventListener('click', () => {
        if (passwordModal) passwordModal.style.display = 'flex';
    });
}

if (passwordSubmit) {
    passwordSubmit.addEventListener('click', () => {
        const password = passwordInput ? passwordInput.value : '';
        const adminPassword = 'admin123'; 

        if (password === adminPassword) {
            window.location.href = 'admin.html';
        } else {
            console.error('Contraseña incorrecta. Inténtalo de nuevo.');
            if (passwordInput) passwordInput.value = '';
        }
    });
}

if (passwordModalCloseButton) {
    passwordModalCloseButton.addEventListener('click', () => {
        if (passwordModal) passwordModal.style.display = 'none';
    });
}

if (passwordModal) {
    passwordModal.addEventListener('click', (e) => {
        if (e.target.id === 'password-modal') {
            passwordModal.style.display = 'none';
        }
    });
}
