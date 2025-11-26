const CARDS_CONTAINER_ID = "cards";
const TOAST_ID = "toast";
let appState = null; // keep state for helpers like cheat button

function normalizeAnswer(value) {
  if (value == null) return "";
  return String(value)
    .trim()
    .toLocaleLowerCase("es-ES")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

async function fetchContenido() {
  const url = `./contenido.json?ts=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`No se pudo cargar contenido.json (${res.status})`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error("contenido.json debe ser un array de preguntas");
  }
  return data;
}

function showToast(message, kind = "info") {
  const toast = document.getElementById(TOAST_ID);
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.style.background = kind === "error" ? "#991b1b" : kind === "success" ? "#065f46" : "#111827";
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => toast.classList.add("hidden"), 1500);
}

function renderApp(state) {
  const container = document.getElementById(CARDS_CONTAINER_ID);
  container.innerHTML = "";

  state.questions.forEach((q, index) => {
    const isUnlocked = index <= state.currentIndex;
    const isFocused = index === state.currentIndex;
    const isCompleted = index < state.currentIndex;

    const card = document.createElement("article");
    card.className = [
      "card",
      isCompleted ? "completed" : isUnlocked ? "unlocked" : "locked",
    ].join(" ");
    card.setAttribute("aria-label", `Pregunta ${index + 1}`);

    // Header
    const header = document.createElement("div");
    header.className = "card-header";
    const title = document.createElement("div");
    title.className = "card-title";
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = `#${index + 1}`;
    const titleText = document.createElement("span");
    titleText.textContent = isUnlocked ? q.titulo || `Pregunta ${index + 1}` : `Pregunta ${index + 1}`;
    title.appendChild(badge);
    title.appendChild(titleText);
    const stateElt = document.createElement("div");
    stateElt.className = "state";
    stateElt.innerHTML = `<span class="dot"></span>${isCompleted ? "Completada" : isUnlocked ? "Activa" : "Bloqueada"}`;
    header.appendChild(title);
    header.appendChild(stateElt);
    card.appendChild(header);

    // Body (only visible when focused/unlocked)
    if (isFocused) {
      const body = document.createElement("div");
      body.className = "card-body";

      // Media
      const media = document.createElement("div");
      media.className = "media";
      if (q.imagen) {
        const img = document.createElement("img");
        img.alt = q.titulo ? `Imagen de ${q.titulo}` : "Imagen de pista";
        img.src = q.imagen;
        media.appendChild(img);
      } else {
        const ph = document.createElement("div");
        ph.className = "placeholder";
        ph.textContent = "Sin imagen";
        media.appendChild(ph);
      }

      // Content
      const content = document.createElement("div");
      content.className = "content";
      const pista = document.createElement("div");
      pista.className = "pista";
      pista.textContent = q.pista || "Pista no disponible";
      const answerRow = document.createElement("div");
      answerRow.className = "answer-row";
      const input = document.createElement("input");
      input.id = `answer-input-${index}`;
      input.className = "input";
      input.type = "text";
      input.placeholder = "Escribe tu respuesta…";
      input.autocomplete = "off";
      input.spellcheck = false;
      input.setAttribute("aria-label", "Respuesta");
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.textContent = "Enviar";
      btn.type = "button";
      const feedback = document.createElement("div");
      feedback.className = "feedback";
      feedback.setAttribute("aria-live", "polite");

      // Submit logic
      const submit = () => {
        const user = normalizeAnswer(input.value);
        const expect = normalizeAnswer(q.respuesta);
        if (user && user === expect) {
          feedback.className = "feedback success";
          feedback.textContent = "¡Correcto! Desbloqueando la siguiente…";
          // Advance focus
          state.currentIndex = Math.min(state.currentIndex + 1, state.questions.length);
          // Re-render after a small delay for feedback visibility
          window.setTimeout(() => {
            renderApp(state);
            if (state.currentIndex === state.questions.length) {
              // Completed all
              completeAll(state);
            } else {
              showToast(`Pregunta #${state.currentIndex} desbloqueada`, "success");
            }
          }, 400);
        } else {
          input.value = "";
          feedback.className = "feedback error";
          feedback.textContent = "No es correcto. ¡Prueba otra vez!";
          showToast("Respuesta incorrecta", "error");
          input.focus();
        }
      };

      btn.addEventListener("click", submit);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") submit();
      });

      answerRow.appendChild(input);
      answerRow.appendChild(btn);
      content.appendChild(pista);
      content.appendChild(answerRow);
      content.appendChild(feedback);

      body.appendChild(media);
      body.appendChild(content);
      card.appendChild(body);

      // Autofocus input when card mounts
      window.setTimeout(() => input.focus(), 50);
    }

    container.appendChild(card);
  });
}

function celebrate() {
  const c = document.createElement("div");
  c.className = "confetti";
  document.body.appendChild(c);
  window.setTimeout(() => c.remove(), 2000);
}

function showCompletionMessage(text) {
  const overlay = document.createElement("div");
  overlay.className = "completion";
  overlay.innerHTML = `
    <div class="completion-card">
      <h2>¡Felicidades! 🎉</h2>
      <p>${text || "¡Has completado la jincana!"}</p>
      <button class="btn" type="button">Cerrar</button>
    </div>
  `;
  overlay.querySelector(".btn").addEventListener("click", () => overlay.remove());
  document.body.appendChild(overlay);
}

function completeAll(state) {
  celebrate();
  const last = state.questions[state.questions.length - 1];
  const msg = last && typeof last.felicidades === "string" ? last.felicidades : "¡Has completado la jincana!";
  showToast("¡Has completado la jincana! 🎉", "success");
  showCompletionMessage(msg);
}

function setupCheat(state) {
  const btn = document.getElementById("cheat-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const pwd = window.prompt("Introduce la contraseña:");
    if (pwd !== "69696969") {
      showToast("Contraseña incorrecta", "error");
      return;
    }
    const idx = state.currentIndex;
    const q = state.questions[idx];
    if (!q) return;
    const input = document.getElementById(`answer-input-${idx}`);
    if (input) {
      input.value = q.respuesta ?? "";
      input.focus();
      showToast("Respuesta rellenada", "success");
    }
  });
}

async function main() {
  try {
    // If opened directly as file://, explain how to run a tiny server so fetch works
    if (location.protocol === "file:") {
      const container = document.getElementById(CARDS_CONTAINER_ID);
      const box = document.createElement("div");
      box.style.maxWidth = "800px";
      box.style.margin = "40px auto";
      box.style.background = "#ffffff";
      box.style.border = "1px dashed #e6eaf1";
      box.style.borderRadius = "14px";
      box.style.padding = "16px";
      box.style.boxShadow = "0 10px 30px rgb(0 0 0 / 6%)";
      box.innerHTML = `
        <h3 style="margin:0 0 8px;">Para ver las preguntas necesitas un servidor local</h3>
        <p style="margin:0 0 10px;color:#6a6f85;">
          El navegador no puede leer <code>contenido.json</code> con <code>file://</code>.
          Ejecuta uno de estos comandos en la carpeta del proyecto y abre la URL indicada:
        </p>
        <pre style="background:#0f172a;color:#e2e8f0;padding:12px;border-radius:10px;overflow:auto;"><code>py -m http.server 5173
# o si tienes Node:
npx http-server -p 5173 -c-1</code></pre>
        <p style="margin:10px 0 0;">Luego abre <code>http://localhost:5173/</code> y refresca al cambiar <code>contenido.json</code>.</p>
      `;
      container.appendChild(box);
      showToast("Abre con un servidor local para cargar el JSON", "error");
      return;
    }

    // Load questions from JSON each time (no cache)
    const questions = await fetchContenido();
    const state = {
      questions,
      currentIndex: 0, // Only the primera pregunta empieza activa
    };
    appState = state;
    renderApp(appState);
    setupCheat(appState);
  } catch (err) {
    console.error(err);
    showToast("Error cargando contenido. Revisa contenido.json", "error");
    const container = document.getElementById(CARDS_CONTAINER_ID);
    const msg = document.createElement("p");
    msg.textContent = String(err?.message || err || "Error desconocido");
    container.appendChild(msg);
  }
}

window.addEventListener("DOMContentLoaded", main);


