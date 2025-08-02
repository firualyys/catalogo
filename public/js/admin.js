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
    const productPrecio1Input = document.getElementById('product-precio1');
    const productPrecio2Input = document.getElementById('product-precio2');
    const productPrecio3Input = document.getElementById('product-precio3');
    const productImagenInput = document.getElementById('product-imagen');
    
    // Función para renderizar la tabla de productos (versión con Firebase)
    const renderizarTabla = async () => {
        productTableBody.innerHTML = '';
        const snapshot = await productosRef.get();
        snapshot.forEach(doc => {
            const producto = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${doc.id}</td>
                <td>${producto.modelo}</td>
                <td>${producto.marca}</td>
                <td>S/. ${producto.precio1.toFixed(2)}</td>
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
        productPrecio1Input.value = producto.precio1;
        productPrecio2Input.value = producto.precio2;
        productPrecio3Input.value = producto.precio3;
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
            precio1: parseFloat(productPrecio1Input.value),
            precio2: parseFloat(productPrecio2Input.value),
            precio3: parseFloat(productPrecio3Input.value),
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