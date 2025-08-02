        // Tus credenciales de configuración de Firebase
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
    
    // Función para renderizar la tabla de productos (versión con Firebase)
    const renderizarTabla = async () => {
        productTableBody.innerHTML = '';
        const snapshot = await productosRef.get();
        snapshot.forEach(doc => {
            const producto = doc.data();

            // Lógica para mostrar el precio de descuento si existe
            let precioMostrado = producto.precioOriginal;
            if (producto.precioDescuento && producto.precioDescuento < producto.precioOriginal) {
                precioMostrado = producto.precioDescuento;
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${doc.id}</td>
                <td>${producto.modelo}</td>
                <td>${producto.marca}</td>
                <td>S/. ${precioMostrado.toFixed(2)}</td>
                <td class="admin-acciones">
                    <button class="editar-btn" data-id="${doc.id}">Editar</button>
                    <button class="eliminar-btn" data-id="${doc.id}">Eliminar</button>
                </td>
            `;
            productTableBody.appendChild(row);
        });
    };


    // Función para cargar los datos de un producto en el formulario
    const cargarDatosEnFormulario = (producto) => {
        productIdInput.value = producto.id;
        productCategoriaInput.value = producto.categoria;
        productMarcaInput.value = producto.marca;
        productModeloInput.value = producto.modelo;
        productDescripcionInput.value = producto.descripcion;
        productPrecioOriginalInput.value = producto.precioOriginal;
        productPrecioDescuentoInput.value = producto.precioDescuento;
        productImagenInput.value = producto.imagen;
        imagePreview.innerHTML = `<img src="${producto.imagen}" alt="Vista previa de la imagen" style="max-width: 100%; height: auto; display: block; border-radius: 8px;">`;
        submitButton.textContent = 'Actualizar Producto';
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

    // Manejar el envío del formulario
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nuevoProducto = {
            categoria: productCategoriaInput.value,
            marca: productMarcaInput.value,
            modelo: productModeloInput.value,
            descripcion: productDescripcionInput.value,
            precioOriginal: parseFloat(productPrecioOriginalInput.value),
            precioDescuento: parseFloat(productPrecioDescuentoInput.value),
            imagen: productImagenInput.value
        };

        const productId = productIdInput.value;
        if (productId) {
            // Actualizar producto
            await productosRef.doc(productId).update(nuevoProducto);
        } else {
            // Agregar nuevo producto
            await productosRef.add(nuevoProducto);
        }
        
        // Limpiar formulario y re-renderizar
        productForm.reset();
        productIdInput.value = '';
        imagePreview.innerHTML = '';
        submitButton.textContent = 'Agregar Producto';
        renderizarTabla();
    });

    // Manejar los botones de acción (Editar y Eliminar)
    productTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const id = target.dataset.id;
        if (target.classList.contains('editar-btn')) {
            const doc = await productosRef.doc(id).get();
            if (doc.exists) {
                cargarDatosEnFormulario({ ...doc.data(), id: doc.id });
            }
        } else if (target.classList.contains('eliminar-btn')) {
            if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                await productosRef.doc(id).delete();
                renderizarTabla();
            }
        }
    });

    // Inicializar la tabla al cargar la página
    renderizarTabla();
});