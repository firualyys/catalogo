import { getDocs, collection } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { db } from "./firebase-init.js";

const carruselRef = collection(db, "carrusel");

// Elementos del DOM
const carruselElement   = document.querySelector("#carouselExampleIndicators");
const carruselInner     = document.querySelector(".carousel-inner");
const carruselIndicators= document.querySelector(".carousel-indicators");

export const cargarCarrusel = async () => {
  if (!carruselElement || !carruselInner || !carruselIndicators) {
    console.error("No se encontraron todos los elementos del carrusel en el DOM.");
    return;
  }

  try {
    const snapshot = await getDocs(carruselRef);
    const docs = snapshot.docs.map(d => d.data());

    let itemsHtml = "";
    let indicatorsHtml = "";

    if (docs.length === 0) {
      // Slide por defecto si no hay datos
      indicatorsHtml = `
        <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0"
          class="active" aria-current="true" aria-label="Slide 1"></button>`;
      itemsHtml = `
        <div class="carousel-item active">
          <img src="https://via.placeholder.com/1200x500?text=Sin+im%C3%A1genes" class="d-block w-100" alt="Sin imágenes">
          <div class="carousel-caption d-none d-md-block">
            <h5>Sin contenido</h5>
            <p>No hay imágenes disponibles en este momento.</p>
          </div>
        </div>`;
    } else {
      docs.forEach((slide, index) => {
        indicatorsHtml += `
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${index}"
            class="${index === 0 ? "active" : ""}" aria-current="${index === 0 ? "true" : "false"}"
            aria-label="Slide ${index + 1}"></button>`;

        itemsHtml += `
          <div class="carousel-item ${index === 0 ? "active" : ""}">
            <img src="${slide.imagenUrl}" class="d-block w-100" alt="${slide.titulo || `Slide ${index+1}`}">
            <div class="carousel-caption d-none d-md-block">
              <h5>${slide.titulo || ""}</h5>
              <p>${slide.descripcion || ""}</p>
            </div>
          </div>`;
      });
    }

    // Reemplaza skeleton + indicador temporal por el contenido real
    carruselIndicators.innerHTML = indicatorsHtml;
    carruselInner.innerHTML = itemsHtml;

    // Sanitiza: garantiza que exista item/indicador .active
    const firstItem = carruselInner.querySelector(".carousel-item") ;
    const activeItem = carruselInner.querySelector(".carousel-item.active") || firstItem;
    const firstBtn  = carruselIndicators.querySelector("button");
    const activeBtn = carruselIndicators.querySelector("button.active") || firstBtn;

    if (activeItem && !activeItem.classList.contains("active")) activeItem.classList.add("active");
    if (activeBtn) {
      if (!activeBtn.classList.contains("active")) activeBtn.classList.add("active");
      activeBtn.setAttribute("aria-current", "true");
    }

    // Inicializa SOLAMENTE ahora (sin data attributes)
    const instance = bootstrap.Carousel.getOrCreateInstance(carruselElement, {
      interval: 5000,
      ride: true,   // empieza a rotar automáticamente
      pause: false
    });
    instance.to(0);

  } catch (err) {
    console.error("Error al cargar el carrusel desde Firestore:", err);
  }
};

// Espera a que TODO cargue (incluido Bootstrap) antes de correr
window.addEventListener("load", cargarCarrusel);
