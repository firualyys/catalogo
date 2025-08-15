// Tus credenciales de configuraci\u00f3n de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAwJUjgCO1UNwo9V_gIdI8_7wlO-rYxjJI",
    authDomain: "mi-catalogo-tienda.firebaseapp.com",
    projectId: "mi-catalogo-tienda",
    storageBucket: "mi-catalogo-tienda.firebasestorage.app",
    messagingSenderId: "187610778929",
    appId: "1:187610778929:web:c6b3d11a969432d7657410"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);

document.addEventListener('DOMContentLoaded', () => {
    // Inicializamos Firestore
    const db = firebase.firestore();
    const productosRef = db.collection('productos');

    const productTableBody = document.querySelector('#product-table tbody');
    const productForm = document.getElementById('product-form');
    const submitButton = document.getElementById('submit-button');
    const productImagenFileInput = document.getElementById('product-imagen-file');
    const imagePreview = document.getElementById('image-preview');

    const productIdInput = document.getElementById('product-id');
    const productCategoriaInput = document.getElementById('product-categoria');
    const productMarcaInput = document.getElementById('product-marca');
    const productModeloInput = document.getElementById('product-modelo');
    const productDescripcionInput = document.getElementById('product-descripcion');
    const productPrecioOriginalInput = document.getElementById('product-precio-original');
    const productPrecioDescuentoInput = document.getElementById('product-precio-descuento');
    const productImagenInput = document.getElementById('product-imagen');
    const discountPercentageElement = document.getElementById('discount-percentage');
    
    // Elementos y referencias para el carrusel
    const carruselForm = document.getElementById('form-carrusel');
    const carruselImageInput = document.getElementById('slide-imagen');
    const carruselTitleInput = document.getElementById('slide-titulo');
    const carruselDescriptionInput = document.getElementById('slide-descripcion');
    const carruselListContainer = document.getElementById('lista-slides');

    const carruselRef = db.collection('carrusel');

    const renderizarCarruselAdmin = async () => {
        // Vacia el contenedor antes de renderizar
        carruselListContainer.innerHTML = ''; 

        // Obtiene los slides de la base de datos
        const snapshot = await carruselRef.get();
        
        // Itera sobre cada documento (slide)
        snapshot.forEach(doc => {
            const slide = doc.data();
            const docId = doc.id;
            
            // Crea el elemento para el slide
            const slideElement = document.createElement('div');
            
            // Aplica clases para la nueva estructura con más altura
            slideElement.classList.add('bg-white', 'rounded-xl', 'shadow-lg', 'overflow-hidden', 'flex', 'flex-col', 'transform', 'hover:scale-105', 'transition-transform', 'duration-300');
            
            slideElement.innerHTML = `
                <div class="h-56 bg-gray-200">
                    <img src="${slide.imagenUrl}" alt="${slide.titulo}" class="w-full h-full object-cover">
                </div>
                <div class="p-6 flex flex-col justify-between flex-grow">
                    <div>
                        <h4 class="text-xl font-bold text-gray-800">${slide.titulo}</h4>
                        <p class="text-base text-gray-600 mt-2">${slide.descripcion}</p>
                    </div>
                    <button class="eliminar-carrusel-btn mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200" data-id="${docId}">Eliminar</button>
                </div>
            `;
            
            // Agrega el slide al contenedor
            carruselListContainer.appendChild(slideElement);
        });
    };

    //Manejar el envío del formulario del carrusel
    carruselForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nuevoSlide = {
            imagenUrl: carruselImageInput.value,
            titulo: carruselTitleInput.value,
            descripcion: carruselDescriptionInput.value
        };

        try {
            await carruselRef.add(nuevoSlide);
            alert('Slide de carrusel agregado con éxito.');
            carruselForm.reset();
            renderizarCarruselAdmin();
        } catch (error) {
            console.error("Error al agregar el slide del carrusel: ", error);
        }
    });

    // Manejar la eliminación de un slide
    carruselListContainer.addEventListener('click', async (e) => {
        const target = e.target;
        if (target.classList.contains('eliminar-carrusel-btn')) {
            const id = target.dataset.id;
            if (confirm("¿Estás seguro de que quieres eliminar este slide?")) {
                try {
                    await carruselRef.doc(id).delete();
                    renderizarCarruselAdmin();
                } catch (error) {
                    console.error("Error al eliminar el slide: ", error);
                }
            }
        }
    });   


    // Funciiones para calcular y mostrar el porcentaje de descuento
    const calculateDiscount = () => {
        const precioOriginal = parseFloat(productPrecioOriginalInput.value);
        const precioDescuento = parseFloat(productPrecioDescuentoInput.value);

        if (!isNaN(precioOriginal) && !isNaN(precioDescuento) && precioOriginal > 0) {
            const discount = ((precioOriginal - precioDescuento) / precioOriginal) * 100;
            if (discount > 0) {
                discountPercentageElement.textContent = `(${discount.toFixed(2)}% de descuento)`;
                discountPercentageElement.classList.remove('text-red-500');
                discountPercentageElement.classList.add('text-green-600', 'font-semibold');
            } else {
                discountPercentageElement.textContent = ``;
            }
        } else {
            discountPercentageElement.textContent = '';
        }
    };

    // Event listeners para actualizar el calculo en tiempo real
    productPrecioOriginalInput.addEventListener('input', calculateDiscount);
    productPrecioDescuentoInput.addEventListener('input', calculateDiscount);
    
    // funciones para renderizar la tabla de productos (version con Firebase)
    const renderizarTabla = async () => {
        productTableBody.innerHTML = '';
        const snapshot = await productosRef.get();
        snapshot.forEach(doc => {
            const producto = doc.data();
            const docId = doc.id;

            // logica para mostrar el precio de descuento si existe
            let precioMostradoHTML = `<span class="text-gray-900">S/. ${parseFloat(producto.precioOriginal).toFixed(2)}</span>`;
            if (producto.precioDescuento && producto.precioDescuento < producto.precioOriginal) {
                const discount = ((producto.precioOriginal - producto.precioDescuento) / producto.precioOriginal) * 100;
                precioMostradoHTML = `<div class="flex items-center space-x-2">
                    <span class="line-through text-gray-500">S/. ${parseFloat(producto.precioOriginal).toFixed(2)}</span>
                    <span class="text-red-600 font-semibold">S/. ${parseFloat(producto.precioDescuento).toFixed(2)}</span>
                    <span class="text-xs text-white bg-green-500 font-bold px-2 py-1 rounded-full">${discount.toFixed(0)}% OFF</span>
                </div>`;
            }

            const row = document.createElement('tr');
            row.classList.add('hover:bg-gray-100');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${docId}</td>
                <td class="px-6 py-4 whitespace-nowrap">${producto.modelo}</td>
                <td class="px-6 py-4 whitespace-nowrap">${producto.marca}</td>
                <td class="px-6 py-4 whitespace-nowrap">${precioMostradoHTML}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex space-x-2">
                        <button class="editar-btn bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200" data-id="${docId}">Editar</button>
                        <button class="eliminar-btn bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200" data-id="${docId}">Eliminar</button>
                    </div>
                </td>
            `;
            productTableBody.appendChild(row);
        });
    };

    // funcionamiento para cargar los datos de un producto en el formulario
    const cargarDatosEnFormulario = (producto) => {
        productIdInput.value = producto.id;
        productCategoriaInput.value = producto.categoria || '';
        productMarcaInput.value = producto.marca || '';
        productModeloInput.value = producto.modelo || '';
        productDescripcionInput.value = producto.descripcion || '';
        productPrecioOriginalInput.value = producto.precioOriginal || 0;
        productPrecioDescuentoInput.value = producto.precioDescuento || 0;
        productImagenInput.value = producto.imagen || '';
        imagePreview.innerHTML = producto.imagen ? `<img src="${producto.imagen}" alt="Vista previa de la imagen" class="max-w-xs h-auto block rounded-lg shadow-md">` : '';
        submitButton.textContent = 'Actualizar Producto';
        // \u00a1Aqu\u00ed est\u00e1 la llamada que faltaba!
        calculateDiscount();
    };

    // Funci\u00f3n para limpiar el formulario
    const limpiarFormulario = () => {
        productForm.reset();
        productIdInput.value = '';
        imagePreview.innerHTML = '';
        submitButton.textContent = 'Agregar Producto';
        discountPercentageElement.textContent = '';
        discountPercentageElement.classList.remove('text-green-600', 'font-semibold');
    };

    // Manejar la vista previa de la imagen al seleccionar un archivo
    productImagenFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const fileURL = URL.createObjectURL(file);
            imagePreview.innerHTML = `<img src="${fileURL}" alt="Vista previa de la imagen" style="max-width: 100%; height: auto; display: block; border-radius: 8px;">`;
        } else {
            imagePreview.innerHTML = '';
        }
    });

    // Manejar el enviado del formulario
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nuevoProducto = {
            categoria: productCategoriaInput.value,
            marca: productMarcaInput.value,
            modelo: productModeloInput.value,
            descripcion: productDescripcionInput.value,
            precioOriginal: parseFloat(productPrecioOriginalInput.value),
            precioDescuento: parseFloat(productPrecioDescuentoInput.value) || null,
            imagen: productImagenInput.value
        };

        const productId = productIdInput.value;
        try {
            if (productId) {
                await productosRef.doc(productId).update(nuevoProducto);
            } else {
                await productosRef.add(nuevoProducto);
            }
            
            limpiarFormulario();
            renderizarTabla();
        } catch (e) {
            console.error("Error al guardar el producto: ", e);
        }
    });

    // Manejar los botones de acciones (Editar y Eliminar)
    productTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const id = target.dataset.id;
        if (target.classList.contains('editar-btn')) {
            try {
                const doc = await productosRef.doc(id).get();
                if (doc.exists) {
                    cargarDatosEnFormulario({ ...doc.data(), id: doc.id });
                }
            } catch (e) {
                console.error("Error al obtener el producto para editar: ", e);
            }
        } else if (target.classList.contains('eliminar-btn')) {
            // Reemplazo de confirm() por un modal
            const modal = document.getElementById('confirm-modal');
            const confirmBtn = document.getElementById('confirm-btn');
            const cancelBtn = document.getElementById('cancel-btn');

            modal.style.display = 'block';

            confirmBtn.onclick = async () => {
                modal.style.display = 'none';
                try {
                    await productosRef.doc(id).delete();
                    renderizarTabla();
                } catch (e) {
                    console.error("Error al eliminar el producto: ", e);
                }
            };

            cancelBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }
    });

    renderizarTabla();
    renderizarCarruselAdmin();
});