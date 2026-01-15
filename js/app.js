// Variables globales
// Premios fijos (edita estos valores para cambiar los premios)
const PRIZES = [
  "Premio 1",
  "Premio 2",
  "Premio 3",
  "Premio 4",
  "Premio 5",
  "Premio 6",
  "Premio 7",
  "Premio 8",
];

let options = [...PRIZES];
let isSpinning = false;
let rotation = 0;
const colors = ["#072e90", "#d30e29"];

// Elementos del DOM
const rouletteWheel = document.getElementById("roulette-wheel");
const spinBtn = document.getElementById("spin-btn");
const resultValue = document.getElementById("result-value");
// Modal
const resultModal = document.getElementById("result-modal");
const closeModalBtn = document.getElementById("close-modal");

// (Se elimina la gestión de la barra lateral y edición de opciones)

// Actualizar la ruleta con las opciones actuales
function updateRouletteWheel() {
  // Limpiar ruleta actual
  rouletteWheel.innerHTML = "";

  // Si no hay opciones, no dibujar segmentos
  if (options.length === 0) {
    return;
  }

  // Calcular ángulo por segmento
  const anglePerSegment = 360 / options.length;

  // Construir fondo con conic-gradient para segmentos exactamente iguales
  const stepPercent = 100 / options.length;
  let gradientParts = [];
  for (let i = 0; i < options.length; i++) {
    const start = (i * stepPercent).toFixed(6);
    const end = ((i + 1) * stepPercent).toFixed(6);
    const color = colors[i % colors.length];
    gradientParts.push(`${color} ${start}% ${end}%`);
  }
  rouletteWheel.style.background = `conic-gradient(${gradientParts.join(
    ", "
  )})`;

  // Crear solo labels posicionados en el centro angular de cada segmento
  // Calcular radio para colocar los textos en píxeles según el tamaño actual
  const radius = (rouletteWheel.clientWidth / 2) * 0.78; // 78% del radio

  options.forEach((option, index) => {
    const label = document.createElement("div");
    label.className = "roulette-segment"; // usamos la clase para posicionar el label

    const textDiv = document.createElement("div");
    textDiv.className = "segment-text";
    textDiv.textContent = option;

    // Colocar el texto en el ángulo medio del segmento y a un radio legible
    const midAngle = index * anglePerSegment + anglePerSegment / 2;
    textDiv.style.transform = `rotate(${midAngle}deg) translate(0, -${radius}px) rotate(${-midAngle}deg) translate(-50%, -50%)`;

    label.appendChild(textDiv);
    rouletteWheel.appendChild(label);
  });
}

// Recalcular posiciones de texto al redimensionar (mantenerlos dentro de su sección)
window.addEventListener("resize", () => {
  updateRouletteWheel();
});

// Actualizar estado del botón de girar
function updateSpinButton() {
  spinBtn.disabled = options.length < 1 || isSpinning;
}

// Girar la ruleta
spinBtn.addEventListener("click", spinRoulette);

function spinRoulette() {
  if (options.length < 1 || isSpinning) return;

  isSpinning = true;
  updateSpinButton();

  // Seleccionar una opción aleatoria
  const selectedIndex = Math.floor(Math.random() * options.length);
  const selectedOption = options[selectedIndex];

  // Calcular ángulo de parada para que el puntero apunte a la opción seleccionada
  const anglePerSegment = 360 / options.length;
  // Añadir múltiples vueltas completas más el ángulo para la opción seleccionada
  const fullRotations = 5; // Número de vueltas completas antes de parar
  const stopAngle =
    360 * fullRotations +
    (360 - selectedIndex * anglePerSegment) -
    anglePerSegment / 2;

  // Aplicar rotación con animación
  rouletteWheel.style.transition =
    "transform 4s cubic-bezier(0.17, 0.67, 0.21, 0.99)";
  rouletteWheel.style.transform = `rotate(${rotation + stopAngle}deg)`;

  // Actualizar rotación acumulada
  rotation += stopAngle;

  // Mostrar resultado al terminar la transición (con fallback por tiempo)
  const onEnd = (e) => {
    if (e.propertyName !== "transform") return;
    rouletteWheel.removeEventListener("transitionend", onEnd);
    resultValue.textContent = selectedOption;
    resultValue.style.color = colors[selectedIndex % colors.length];
    isSpinning = false;
    updateSpinButton();
    openResultModal();
  };
  rouletteWheel.addEventListener("transitionend", onEnd, { once: true });
  // Fallback por si no dispara transitionend
  setTimeout(() => {
    if (resultModal && !resultModal.classList.contains("open")) {
      onEnd({ propertyName: "transform" });
    }
  }, 4200);

  // Mostrar mensaje durante el giro
  resultValue.textContent = "Girando...";
  resultValue.style.color = "#d4af37";
}

// Modal helpers
function openResultModal() {
  if (!resultModal) return;
  resultModal.classList.add("open");
  resultModal.setAttribute("aria-hidden", "false");
}

function closeResultModal() {
  if (!resultModal) return;
  resultModal.classList.remove("open");
  resultModal.setAttribute("aria-hidden", "true");
  // Regresar al estado inicial (rotación 0)
  rotation = 0;
  rouletteWheel.style.transition = "none";
  rouletteWheel.style.transform = `rotate(0deg)`;
  // Forzar reflow para que la transición se reaplique en el próximo giro
  void rouletteWheel.offsetWidth;
  rouletteWheel.style.transition =
    "transform 4s cubic-bezier(0.17, 0.67, 0.21, 0.99)";
  // Reiniciar estado visual del resultado para el siguiente giro
  resultValue.textContent = 'Pulsa "Girar" para comenzar';
  resultValue.style.color = "#fff";
  isSpinning = false;
  updateSpinButton();
}

// Listeners del modal
if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closeResultModal);
}
if (resultModal) {
  resultModal.addEventListener("click", (e) => {
    if (e.target === resultModal) closeResultModal();
  });
}
document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    resultModal &&
    resultModal.classList.contains("open")
  ) {
    closeResultModal();
  }
});

// Inicializar la ruleta con premios fijos
updateRouletteWheel();
updateSpinButton();
