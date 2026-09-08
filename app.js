const TOTAL_SECONDS = 40 * 60;
const STORAGE_KEY = "campuslands-api-lab-progress";
const NOTES_KEY = "campuslands-api-lab-notes";
const COOKIE_KEY = "campuslands-api-lab-cookie";

const timerDisplay = document.querySelector("#timerDisplay");
const timerToggle = document.querySelector("#timerToggle");
const timerReset = document.querySelector("#timerReset");
const timerContainer = document.querySelector(".timer");
const progressBar = document.querySelector("#progressBar");
const progressLabel = document.querySelector("#progressLabel");
const progressMessage = document.querySelector("#progressMessage");
const finishCard = document.querySelector("#finishCard");
const toast = document.querySelector("#toast");

let secondsRemaining = TOTAL_SECONDS;
let timerId = null;
let toastId = null;
let completedSteps = readStorage(STORAGE_KEY, []);

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // La guía sigue funcionando aunque el navegador bloquee localStorage.
  }
}

function showToast(message) {
  window.clearTimeout(toastId);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastId = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(secondsRemaining);
  document.title = timerId
    ? `${formatTime(secondsRemaining)} · API Lab`
    : "API Lab · Notas rápidas";
}

function pauseTimer() {
  window.clearInterval(timerId);
  timerId = null;
  timerContainer.classList.remove("is-running");
  timerToggle.title = "Continuar cronómetro";
  timerToggle.setAttribute("aria-label", "Continuar cronómetro");
  timerToggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7z" /></svg>';
  renderTimer();
}

function startTimer() {
  if (timerId || secondsRemaining <= 0) return;
  timerContainer.classList.add("is-running");
  timerToggle.title = "Pausar cronómetro";
  timerToggle.setAttribute("aria-label", "Pausar cronómetro");
  timerToggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" /></svg>';
  timerId = window.setInterval(() => {
    secondsRemaining -= 1;
    renderTimer();
    if (secondsRemaining === 0) {
      pauseTimer();
      showToast("¡Tiempo! Cierra con la evidencia de pruebas.");
    }
  }, 1000);
}

timerToggle.addEventListener("click", () => (timerId ? pauseTimer() : startTimer()));
timerReset.addEventListener("click", () => {
  pauseTimer();
  secondsRemaining = TOTAL_SECONDS;
  timerToggle.title = "Iniciar cronómetro";
  timerToggle.setAttribute("aria-label", "Iniciar cronómetro");
  renderTimer();
  showToast("Cronómetro reiniciado a 40:00");
});

document.querySelectorAll("[data-start-lab]").forEach((button) => {
  button.addEventListener("click", () => {
    startTimer();
    document.querySelector("#express").scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelector("#focusToggle").addEventListener("click", (event) => {
  const active = document.body.classList.toggle("focus-mode");
  event.currentTarget.querySelector("span").textContent = active ? "Mostrar ruta" : "Modo enfoque";
  event.currentTarget.setAttribute("aria-pressed", String(active));
});

function updateProgress() {
  completedSteps = [...new Set(completedSteps)].sort((a, b) => a - b);
  const percentage = Math.round((completedSteps.length / 8) * 100);
  progressBar.style.width = `${percentage}%`;
  progressLabel.textContent = `${percentage}%`;
  progressMessage.textContent = completedSteps.length === 8
    ? "Ruta completa. La evidencia está lista."
    : `${completedSteps.length} de 8 checkpoints completados.`;

  document.querySelectorAll("[data-complete]").forEach((checkpoint) => {
    const step = Number(checkpoint.dataset.complete);
    const complete = completedSteps.includes(step);
    checkpoint.classList.toggle("is-complete", complete);
    checkpoint.setAttribute("aria-pressed", String(complete));
  });

  document.querySelectorAll("[data-section]").forEach((navItem) => {
    const section = document.querySelector(`#${navItem.dataset.section}`);
    const step = Number(section.dataset.step);
    navItem.classList.toggle("is-complete", completedSteps.includes(step));
  });

  finishCard.classList.toggle("is-unlocked", completedSteps.length === 8);
  writeStorage(STORAGE_KEY, completedSteps);
}

document.querySelectorAll("[data-complete]").forEach((checkpoint) => {
  checkpoint.addEventListener("click", () => {
    const step = Number(checkpoint.dataset.complete);
    if (completedSteps.includes(step)) {
      completedSteps = completedSteps.filter((savedStep) => savedStep !== step);
    } else {
      completedSteps.push(step);
      showToast(step === 7 ? "¡Laboratorio completado!" : `Checkpoint ${String(step).padStart(2, "0")} guardado`);
    }
    updateProgress();
  });
});

document.querySelector("[data-reset-progress]").addEventListener("click", () => {
  completedSteps = [];
  updateProgress();
  document.querySelector("#inicio").scrollIntoView({ behavior: "smooth" });
  showToast("Progreso reiniciado");
});

const navItems = [...document.querySelectorAll("[data-section]")];
const lessonSections = [...document.querySelectorAll(".lesson")];
let navigationLocked = false;
let scrollFrame = null;

function setActiveNavigation(sectionId) {
  navItems.forEach((item) => {
    const active = item.dataset.section === sectionId;
    item.classList.toggle("is-active", active);
    if (active) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
  });
}

function updateActiveNavigation() {
  if (navigationLocked) return;
  const marker = window.scrollY + window.innerHeight * 0.34;
  let activeSection = lessonSections[0];

  lessonSections.forEach((section) => {
    if (section.offsetTop <= marker) activeSection = section;
  });

  setActiveNavigation(activeSection.id);
}

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navigationLocked = true;
    setActiveNavigation(item.dataset.section);
    window.setTimeout(() => {
      navigationLocked = false;
      updateActiveNavigation();
    }, 850);
  });
});

window.addEventListener("scroll", () => {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(() => {
    updateActiveNavigation();
    scrollFrame = null;
  });
}, { passive: true });

document.querySelectorAll("[data-copy-code]").forEach((button) => {
  button.addEventListener("click", async () => {
    const code = [...button.closest("[data-code-panel]").querySelectorAll(".code-line > span")]
      .map((line) => {
        const cleanLine = line.cloneNode(true);
        cleanLine.querySelectorAll("small").forEach((comment) => comment.remove());
        return cleanLine.textContent.trimEnd();
      })
      .join("\n");
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = "¡Copiado!";
      showToast("Código copiado al portapapeles");
      window.setTimeout(() => (button.textContent = button.closest(".code-panel").querySelector(".code-panel__bar span").textContent.includes("terminal") ? "Copiar comando" : "Copiar código"), 1400);
    } catch {
      showToast("Selecciona el código y usa Ctrl/Cmd + C");
    }
  });
});

const semverExamples = {
  major: "2.0.0 · Cambias el formato de respuesta y el código anterior del cliente deja de funcionar.",
  minor: "1.1.0 · Agregas el campo opcional favorita y todo lo anterior sigue funcionando.",
  patch: "1.0.1 · Corriges un mensaje de error sin cambiar el contrato de la API.",
};

document.querySelectorAll("[data-semver]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#semverMessage").textContent = semverExamples[button.dataset.semver];
  });
});

document.querySelectorAll("[data-version-answer]").forEach((button) => {
  button.addEventListener("click", () => {
    const correct = button.dataset.versionAnswer === "1.1.0";
    document.querySelector("#versionFeedback").textContent = correct
      ? "✓ Correcto: es una función nueva compatible, por eso aumenta MINOR."
      : "Inténtalo de nuevo: no es una corrección ni rompe compatibilidad.";
    document.querySelector("#versionFeedback").style.color = correct ? "#147b52" : "#a23e31";
  });
});

const presets = {
  valid: {
    titulo: "Repasar Express",
    contenido: "Crear una ruta POST y validarla",
    categoria: "clase",
  },
  invalid: {
    titulo: "No",
    contenido: "",
    categoria: "urgente",
  },
  extra: {
    titulo: "Idea para el proyecto",
    contenido: "Separar la entrada con un DTO",
    categoria: "idea",
    esAdmin: true,
  },
  update: {
    titulo: "Express dominado",
  },
};

const methodSelect = document.querySelector("#methodSelect");
const routeSelect = document.querySelector("#routeSelect");
const requestBody = document.querySelector("#requestBody");
const sendRequest = document.querySelector("#sendRequest");
const responseOutput = document.querySelector("#responseOutput");
const responseStatus = document.querySelector("#responseStatus");
const cookieOutput = document.querySelector("#cookieOutput");

document.querySelectorAll("[data-preset]").forEach((button) => {
  button.addEventListener("click", () => {
    const isUpdate = button.dataset.preset === "update";
    methodSelect.value = isUpdate ? "PATCH" : "POST";
    routeSelect.value = isUpdate ? "/api/v1/notas/:id" : "/api/v1/notas";
    requestBody.disabled = false;
    requestBody.value = JSON.stringify(presets[button.dataset.preset], null, 2);
  });
});

function syncRequestControls() {
  const route = routeSelect.value;
  const method = methodSelect.value;

  if (["/health", "/api/v1/preferencia"].includes(route)) {
    methodSelect.value = "GET";
  } else if (route === "/api/v1/notas" && ["PATCH", "DELETE"].includes(method)) {
    methodSelect.value = "GET";
  } else if (route === "/api/v1/notas/:id" && method === "POST") {
    methodSelect.value = "GET";
  }

  requestBody.disabled = ["GET", "DELETE"].includes(methodSelect.value);
}

routeSelect.addEventListener("change", syncRequestControls);
methodSelect.addEventListener("change", () => {
  if (["PATCH", "DELETE"].includes(methodSelect.value)) {
    routeSelect.value = "/api/v1/notas/:id";
  } else if (methodSelect.value === "POST") {
    routeSelect.value = "/api/v1/notas";
  }
  syncRequestControls();
});

function validateNote(body) {
  const errors = [];
  const title = typeof body.titulo === "string" ? body.titulo.trim() : "";
  const content = typeof body.contenido === "string" ? body.contenido.trim() : "";
  if (title.length < 3 || title.length > 60) {
    errors.push({ type: "field", value: body.titulo, msg: "El título debe tener entre 3 y 60 caracteres", path: "titulo", location: "body" });
  }
  if (content.length < 1 || content.length > 280) {
    errors.push({ type: "field", value: body.contenido, msg: "El contenido debe tener entre 1 y 280 caracteres", path: "contenido", location: "body" });
  }
  if (!["clase", "tarea", "idea"].includes(body.categoria)) {
    errors.push({ type: "field", value: body.categoria, msg: "Categoría no válida", path: "categoria", location: "body" });
  }
  return errors;
}

function validateNoteUpdate(body) {
  const allowedFields = ["titulo", "contenido", "categoria"];
  const errors = [];
  const fieldsSent = allowedFields.filter((field) => body[field] !== undefined);

  if (fieldsSent.length === 0) {
    errors.push({ msg: "Envía al menos un campo para actualizar", location: "body" });
  }
  if (body.titulo !== undefined && (typeof body.titulo !== "string" || body.titulo.trim().length < 3 || body.titulo.trim().length > 60)) {
    errors.push({ msg: "El título debe tener entre 3 y 60 caracteres", path: "titulo", location: "body" });
  }
  if (body.contenido !== undefined && (typeof body.contenido !== "string" || body.contenido.trim().length < 1 || body.contenido.trim().length > 280)) {
    errors.push({ msg: "El contenido debe tener entre 1 y 280 caracteres", path: "contenido", location: "body" });
  }
  if (body.categoria !== undefined && !["clase", "tarea", "idea"].includes(body.categoria)) {
    errors.push({ msg: "Categoría no válida", path: "categoria", location: "body" });
  }
  return errors;
}

function buildResponse() {
  const route = routeSelect.value;
  const method = methodSelect.value;

  if (route === "/health") {
    return { status: 200, body: { estado: "ok", version: "1.0.0" } };
  }

  if (route === "/api/v1/preferencia") {
    return {
      status: 200,
      body: { ultimaCategoria: readStorage(COOKIE_KEY, null) },
    };
  }

  if (route === "/api/v1/notas" && method === "GET") {
    return { status: 200, body: { data: readStorage(NOTES_KEY, []) } };
  }

  if (route === "/api/v1/notas/:id") {
    const notes = readStorage(NOTES_KEY, []);
    const note = notes[0];

    if (!note) return { status: 404, body: { error: "Nota no encontrada", ayuda: "Crea una nota primero con POST" } };
    if (method === "GET") return { status: 200, body: { data: note } };

    if (method === "DELETE") {
      writeStorage(NOTES_KEY, notes.slice(1));
      return { status: 204, body: null };
    }

    if (method === "PATCH") {
      let changes;
      try {
        changes = JSON.parse(requestBody.value);
      } catch {
        return { status: 400, body: { error: "El body no contiene JSON válido" } };
      }

      const errors = validateNoteUpdate(changes);
      if (errors.length) return { status: 400, body: { errores: errors } };

      const allowedChanges = {};
      if (changes.titulo !== undefined) allowedChanges.titulo = changes.titulo.trim();
      if (changes.contenido !== undefined) allowedChanges.contenido = changes.contenido.trim();
      if (changes.categoria !== undefined) allowedChanges.categoria = changes.categoria;
      const updatedNote = { ...note, ...allowedChanges, updatedAt: new Date().toISOString() };
      writeStorage(NOTES_KEY, [updatedNote, ...notes.slice(1)]);
      return { status: 200, body: { data: updatedNote } };
    }
  }

  let requestData;
  try {
    requestData = JSON.parse(requestBody.value);
  } catch {
    return { status: 400, body: { error: "El body no contiene JSON válido" } };
  }

  const errors = validateNote(requestData);
  if (errors.length) return { status: 400, body: { errores: errors } };

  const now = new Date().toISOString();
  const note = {
    _id: `nota_${Date.now().toString(36)}`,
    titulo: requestData.titulo.trim(),
    contenido: requestData.contenido.trim(),
    categoria: requestData.categoria,
    createdAt: now,
    updatedAt: now,
  };
  const notes = readStorage(NOTES_KEY, []);
  notes.unshift(note);
  writeStorage(NOTES_KEY, notes);
  writeStorage(COOKIE_KEY, note.categoria);
  return { status: 201, body: { data: note } };
}

function escapeHtml(value) {
  return value.replace(/[&<>"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  })[character]);
}

function highlightJson(data) {
  const safeJson = escapeHtml(JSON.stringify(data, null, 2));
  return safeJson.replace(
    /(&quot;.*?&quot;)(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?/g,
    (match, string, colon) => {
      if (string) return colon
        ? `<span class="console-key">${string}</span>${colon}`
        : `<span class="console-string">${string}</span>`;
      return `<span class="console-number">${match}</span>`;
    },
  );
}

sendRequest.addEventListener("click", () => {
  responseStatus.textContent = "PROCESANDO";
  responseStatus.className = "response-status";
  responseOutput.innerHTML = '<span class="console-muted">// Validación → DTO → modelo → respuesta…</span>';
  sendRequest.disabled = true;

  window.setTimeout(() => {
    const response = buildResponse();
    responseStatus.textContent = `${response.status} ${response.status < 400 ? "OK" : "ERROR"}`;
    responseStatus.classList.add(response.status < 400 ? "is-success" : "is-error");
    const bodyOutput = response.status === 204
      ? '<span class="console-muted">// Sin body: el recurso fue eliminado correctamente.</span>'
      : highlightJson(response.body);
    responseOutput.innerHTML = `<span class="console-muted">X-API-Version: 1.0.0\nContent-Type: application/json\n\n</span>${bodyOutput}`;
    const cookie = readStorage(COOKIE_KEY, null);
    cookieOutput.textContent = cookie ? `ultimaCategoria=${cookie}; HttpOnly; SameSite=Lax` : "vacío";
    sendRequest.disabled = false;
  }, 420);
});

const savedCookie = readStorage(COOKIE_KEY, null);
if (savedCookie) cookieOutput.textContent = `ultimaCategoria=${savedCookie}; HttpOnly; SameSite=Lax`;

updateProgress();
renderTimer();
updateActiveNavigation();
