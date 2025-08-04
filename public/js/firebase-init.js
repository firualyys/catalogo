// js/firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Nota: El objeto firebaseConfig será inyectado por el script de construcción de Netlify.
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const productosRef = collection(db, 'productos');

// Exporta las referencias para que otros archivos puedan usarlas.
export { db, productosRef };