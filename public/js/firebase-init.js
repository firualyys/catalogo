import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const productosRef = collection(db, 'productos');

export { db, productosRef };