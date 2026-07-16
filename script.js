/* ==========================================================================
   TEST DE VAK — SEMESTRE 2026A — COBAED
   script.js
   Arquitectura MVC adaptada a cliente. Todo el estado vive en `STATE`.
   Comunicación con backend vía fetch() contra el Web App de Apps Script
   (se usa fetch en vez de google.script.run porque el sitio se aloja en
   GitHub Pages, fuera del sandbox de Apps Script).
   ========================================================================== */

'use strict';

/* ---------------------------------------------------------------------
   1. CONFIGURACIÓN GENERAL
   --------------------------------------------------------------------- */

// TODO: reemplazar por la URL de despliegue real del Web App (Code.gs -> doGet/doPost)
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxnHDHv9i5_xr-GehXHvYuDt9yhCWB7uw4cvphfQ4D7VFbCcfbTR7S-G2lh4rNQfY6Y/exec';

const FECHA_LIMITE = new Date('2026-10-01T00:00:00');

const LOCAL_STORAGE_KEY = 'cobaed_vak_2026A_progreso';

const PLANTELES = [
  '01 La Forestal', '02 Lerdo', '03 Fco. I. Madero', '04 Gregorio A. García',
  '05 Bermejillo', '06 Peñón Blanco', '07 Villa Ocampo', '08 Nazas',
  '09 Lomas', '10 Santiago Papasquiaro', '11 Tepehuanes', '12 Nuevo Ideal',
  '13 Tamazula', '14 San Juan De Guadalupe', '15 San Miguel De Cruces',
  '16 Tayoltita', '17 Mezquital', '18 Antonio Amaro', '19 Santa Clara',
  '20 Guadalupe Victoria', '21 Huazamota', '22 Santa Ma. Del Oro',
  '23 Coneto de Comonfort', '24 Simón Bolívar', '27 Vicente Guerrero',
  '28 El Salto', '29 Canatlán', '30 El Durazno', '31 La Ciudad',
  '32 Juana Villalobos', '33 Pino Suárez', '34 Villas Del Guadiana',
  '35 Gómez Palacio', '98 Mapimí'
];

const TURNOS = ['Matutino', 'Vespertino'];
const SEMESTRES = ['1°', '3°', '5°'];
const GENEROS = ['Femenino', 'Masculino', 'Prefiero no decirlo'];

/* ---------------------------------------------------------------------
   2. BANCO DE 40 PREGUNTAS — texto y opciones EXACTOS del instrumento
      original. `key` es la tabla de corrección oficial: indica, para
      cada letra de respuesta, a qué canal (V/A/K) corresponde.
   --------------------------------------------------------------------- */

const PREGUNTAS = [
  { n: 1, texto: '¿Cuál de las siguientes actividades disfrutas más?', a: 'Escuchar música', b: 'Ver películas', c: 'Bailar con buena música', key: { a: 'A', b: 'V', c: 'K' } },
  { n: 2, texto: '¿Qué programa de televisión prefieres?', a: 'Reportajes de descubrimientos y lugares', b: 'Cómico y de entretenimiento', c: 'Noticias del mundo', key: { a: 'V', b: 'K', c: 'A' } },
  { n: 3, texto: 'Cuando conversas con otra persona, tú:', a: 'La escuchas atentamente', b: 'La observas', c: 'Tiendes a tocarla', key: { a: 'A', b: 'V', c: 'K' } },
  { n: 4, texto: 'Si pudieras adquirir uno de los siguientes artículos, ¿cuál elegirías?', a: 'Un jacuzzi', b: 'Un estéreo', c: 'Un televisor', key: { a: 'K', b: 'A', c: 'V' } },
  { n: 5, texto: '¿Qué prefieres hacer un sábado por la tarde?', a: 'Quedarte en casa', b: 'Ir a un concierto', c: 'Ir al cine', key: { a: 'K', b: 'A', c: 'V' } },
  { n: 6, texto: '¿Qué tipo de exámenes se te facilitan más?', a: 'Examen oral', b: 'Examen escrito', c: 'Examen de opción múltiple', key: { a: 'A', b: 'V', c: 'K' } },
  { n: 7, texto: '¿Cómo te orientas más fácilmente?', a: 'Mediante el uso de un mapa', b: 'Pidiendo indicaciones', c: 'A través de la intuición', key: { a: 'V', b: 'A', c: 'K' } },
  { n: 8, texto: 'En tu tiempo de descanso, prefieres:', a: 'Pensar', b: 'Caminar por los alrededores', c: 'Descansar', key: { a: 'A', b: 'V', c: 'K' } },
  { n: 9, texto: 'Te halaga más que te digan que:', a: 'Tienes buen aspecto', b: 'Tienes un trato muy agradable', c: 'Tienes una conversación interesante', key: { a: 'V', b: 'K', c: 'A' } },
  { n: 10, texto: '¿Cuál de estos ambientes te atrae más?', a: 'Uno en el que se sienta un clima agradable', b: 'Uno en el que se escuchen las olas del mar', c: 'Uno con una hermosa vista al océano', key: { a: 'K', b: 'A', c: 'V' } },
  { n: 11, texto: '¿De qué manera se te facilita aprender algo?', a: 'Repitiendo en voz alta', b: 'Escribiéndolo varias veces', c: 'Relacionándolo con algo divertido', key: { a: 'A', b: 'V', c: 'K' } },
  { n: 12, texto: '¿A qué evento prefieres asistir?', a: 'A una reunión social', b: 'A una exposición de arte', c: 'A una conferencia', key: { a: 'K', b: 'V', c: 'A' } },
  { n: 13, texto: 'Te formas una opinión de otras personas:', a: 'Por la sinceridad de su voz', b: 'Por la forma de estrecharte la mano', c: 'Por su aspecto', key: { a: 'A', b: 'K', c: 'V' } },
  { n: 14, texto: '¿Cómo te consideras?', a: 'Atlético', b: 'Intelectual', c: 'Sociable', key: { a: 'V', b: 'A', c: 'K' } },
  { n: 15, texto: '¿Qué tipo de películas te gustan más?', a: 'Clásicas', b: 'De acción', c: 'De amor', key: { a: 'A', b: 'V', c: 'K' } },
  { n: 16, texto: 'Prefieres mantener contacto con otra persona:', a: 'Por correo electrónico', b: 'Tomando café juntos', c: 'Por teléfono', key: { a: 'V', b: 'K', c: 'A' } },
  { n: 17, texto: '¿Cuál de las siguientes frases te identifica más?', a: 'Me gusta que mi auto se sienta bien al conducirlo', b: 'Percibo hasta el más ligero ruido que hace mi auto', c: 'Es importante que mi auto esté limpio por fuera y por dentro', key: { a: 'K', b: 'A', c: 'V' } },
  { n: 18, texto: '¿Cómo prefieres pasar el tiempo con tu pareja?', a: 'Conversando', b: 'Acariciándose', c: 'Mirando algo juntos', key: { a: 'A', b: 'K', c: 'V' } },
  { n: 19, texto: 'Si no encuentras las llaves en una bolsa:', a: 'La buscas mirando', b: 'Sacudes la bolsa para oír el ruido', c: 'Buscas al tacto', key: { a: 'V', b: 'A', c: 'K' } },
  { n: 20, texto: 'Cuando tratas de recordar algo, ¿cómo lo haces?', a: 'A través de imágenes', b: 'A través de emociones', c: 'A través de sonidos', key: { a: 'V', b: 'K', c: 'A' } },
  { n: 21, texto: 'Si tuvieras dinero, ¿qué harías?', a: 'Comprar una casa', b: 'Viajar y conocer el mundo', c: 'Adquirir un estudio de grabación', key: { a: 'K', b: 'V', c: 'A' } },
  { n: 22, texto: '¿Qué frase te identifica?', a: 'Reconozco a las personas por su voz', b: 'No recuerdo el aspecto de la gente', c: 'Recuerdo el aspecto de alguien, pero no su nombre', key: { a: 'A', b: 'K', c: 'V' } },
  { n: 23, texto: 'Si tuvieras que quedarte en una isla desierta, preferirías llevar contigo:', a: 'Algunos buenos libros', b: 'Un radio portátil de alta frecuencia', c: 'Golosinas y comida enlatada', key: { a: 'V', b: 'A', c: 'K' } },
  { n: 24, texto: '¿Cuál de estos entretenimientos prefieres?', a: 'Tocar un instrumento musical', b: 'Sacar fotografías', c: 'Hacer actividades manuales', key: { a: 'A', b: 'V', c: 'K' } },
  { n: 25, texto: '¿Cómo es tu forma de vestir?', a: 'Impecable', b: 'Informal', c: 'Muy informal', key: { a: 'V', b: 'A', c: 'K' } },
  { n: 26, texto: '¿Qué es lo que más te gusta de una fogata nocturna?', a: 'El calor del fuego y los bombones asados', b: 'El sonido del fuego quemando la leña', c: 'Mirar el fuego y las estrellas', key: { a: 'K', b: 'A', c: 'V' } },
  { n: 27, texto: '¿Cómo se te facilita entender algo?', a: 'Cuando te lo explican verbalmente', b: 'Cuando utilizan medios visuales', c: 'Cuando se realiza a través de alguna actividad', key: { a: 'A', b: 'V', c: 'K' } },
  { n: 28, texto: '¿Por qué te distingues?', a: 'Por tener una gran intuición', b: 'Por ser un buen conversador', c: 'Por ser un buen observador', key: { a: 'K', b: 'A', c: 'V' } },
  { n: 29, texto: '¿Qué es lo que más disfrutas de un amanecer?', a: 'La emoción de vivir un nuevo día', b: 'Las tonalidades del cielo', c: 'El canto de las aves', key: { a: 'K', b: 'V', c: 'A' } },
  { n: 30, texto: 'Si pudieras elegir, ¿qué preferirías ser?', a: 'Un gran médico', b: 'Un gran músico', c: 'Un gran pintor', key: { a: 'K', b: 'A', c: 'V' } },
  { n: 31, texto: 'Cuando eliges tu ropa, ¿qué es lo más importante para ti?', a: 'Que sea adecuada', b: 'Que luzca bien', c: 'Que sea cómoda', key: { a: 'A', b: 'V', c: 'K' } },
  { n: 32, texto: '¿Qué es lo que más disfrutas de una habitación?', a: 'Que sea silenciosa', b: 'Que sea confortable', c: 'Que esté limpia y ordenada', key: { a: 'A', b: 'K', c: 'V' } },
  { n: 33, texto: '¿Qué es más sexy para ti?', a: 'Una iluminación tenue', b: 'El perfume', c: 'Cierto tipo de música', key: { a: 'V', b: 'K', c: 'A' } },
  { n: 34, texto: '¿A qué tipo de espectáculo preferirías asistir?', a: 'A un concierto de música', b: 'A un espectáculo de magia', c: 'A una muestra gastronómica', key: { a: 'A', b: 'V', c: 'K' } },
  { n: 35, texto: '¿Qué te atrae más de una persona?', a: 'Su trato y forma de ser', b: 'Su aspecto físico', c: 'Su conversación', key: { a: 'K', b: 'V', c: 'A' } },
  { n: 36, texto: 'Cuando vas de compras, ¿en dónde pasas más tiempo?', a: 'En una librería', b: 'En una perfumería', c: 'En una tienda de discos', key: { a: 'V', b: 'K', c: 'A' } },
  { n: 37, texto: '¿Cuál es tu idea de una noche romántica?', a: 'A la luz de las velas', b: 'Con música romántica', c: 'Bailando tranquilamente', key: { a: 'V', b: 'A', c: 'K' } },
  { n: 38, texto: '¿Qué es lo que más disfrutas de viajar?', a: 'Conocer personas y hacer nuevos amigos', b: 'Conocer lugares nuevos', c: 'Aprender sobre otras costumbres', key: { a: 'K', b: 'V', c: 'A' } },
  { n: 39, texto: 'Cuando estás en la ciudad, ¿qué es lo que más echas de menos del campo?', a: 'El aire limpio y refrescante', b: 'Los paisajes', c: 'La tranquilidad', key: { a: 'K', b: 'V', c: 'A' } },
  { n: 40, texto: 'Si te ofrecieran uno de los siguientes empleos, ¿cuál elegirías?', a: 'Director de una estación de radio', b: 'Director de un club deportivo', c: 'Director de una revista', key: { a: 'A', b: 'K', c: 'V' } }
];

/* ---------------------------------------------------------------------
   3. ESTADO GLOBAL
   --------------------------------------------------------------------- */

const STATE = {
  step: 'intro',            // intro | form | quiz | result
  quizIndex: 0,
  form: {
    plantel: '', turno: '', semestre: '', nombre: '', matricula: '',
    genero: '', grupo: '', correo: '', usuario: ''
  },
  respuestas: {},            // { 1:'a', 2:'c', ... }
  darkMode: false
};

/* ---------------------------------------------------------------------
   4. UTILIDADES
   --------------------------------------------------------------------- */

function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $all(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

function toast(mensaje, icon = 'success') {
  Swal.fire({
    toast: true, position: 'top-end', icon, title: mensaje,
    showConfirmButton: false, timer: 2600, timerProgressBar: true,
    background: 'var(--card-bg)', color: 'var(--text-main)'
  });
}

function alertaElegante(opts) {
  return Swal.fire({
    background: 'var(--card-bg)', color: 'var(--text-main)',
    confirmButtonColor: 'var(--azul-plumbago)', ...opts
  });
}

function guardarProgresoLocal() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      step: STATE.step, quizIndex: STATE.quizIndex,
      form: STATE.form, respuestas: STATE.respuestas
    }));
  } catch (e) { console.warn('No se pudo autoguardar:', e); }
}

function cargarProgresoLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    Object.assign(STATE.form, data.form || {});
    STATE.respuestas = data.respuestas || {};
    STATE.quizIndex = data.quizIndex || 0;
    return true;
  } catch (e) { return false; }
}

function limpiarProgresoLocal() {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}

function sanitizar(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

function validarMatricula(mat) {
  return /^[A-Za-z0-9]{4,15}$/.test(mat.trim());
}

function validarCorreoInstitucional(correo) {
  return /^[a-zA-Z0-9._%+-]+@cobaed\.mx$/i.test(correo.trim());
}

/* ---------------------------------------------------------------------
   5. NAVEGACIÓN ENTRE PANTALLAS
   --------------------------------------------------------------------- */

function mostrarPantalla(id) {
  $all('.pantalla').forEach(p => p.classList.remove('activa'));
  const target = $('#' + id);
  target.classList.add('activa');
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (window.AOS) AOS.refreshHard();
}

function irAFormulario() {
  STATE.step = 'form';
  mostrarPantalla('pantalla-formulario');
}

function irACuestionario() {
  if (!validarFormulario()) return;
  STATE.step = 'quiz';
  poblarUsuarioAutenticado();
  renderPreguntaActual();
  mostrarPantalla('pantalla-cuestionario');
}

/* ---------------------------------------------------------------------
   6. FORMULARIO
   --------------------------------------------------------------------- */

function poblarCatalogos() {
  const selPlantel = $('#plantel');
  PLANTELES.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p; opt.textContent = p;
    selPlantel.appendChild(opt);
  });
  TURNOS.forEach(t => $('#turno').appendChild(new Option(t, t)));
  SEMESTRES.forEach(s => $('#semestre').appendChild(new Option(s, s)));
  GENEROS.forEach(g => $('#genero').appendChild(new Option(g, g)));
}

function poblarUsuarioAutenticado() {
  // En producción, obtenerUsuario() del backend retorna el correo de sesión
  // de Workspace. Aquí se refleja lo último conocido / capturado.
  $('#resumen-usuario') && ($('#resumen-usuario').textContent = STATE.form.correo || 'invitado');
}

function bindFormulario() {
  $('#form-vak').addEventListener('input', (e) => {
    const campo = e.target.name;
    if (!campo) return;
    STATE.form[campo] = e.target.value;
    guardarProgresoLocal();
    actualizarBarraProgresoFormulario();
  });

  $('#matricula').addEventListener('blur', () => {
    if (STATE.form.matricula) {
      $('#correo').value = `${STATE.form.matricula.trim()}@cobaed.mx`;
      STATE.form.correo = $('#correo').value;
    }
  });

  $('#btn-ir-cuestionario').addEventListener('click', irACuestionario);
}

function actualizarBarraProgresoFormulario() {
  const campos = ['plantel', 'turno', 'semestre', 'nombre', 'matricula', 'genero', 'grupo', 'correo'];
  const llenos = campos.filter(c => (STATE.form[c] || '').trim() !== '').length;
  const pct = Math.round((llenos / campos.length) * 100);
  $('#barra-progreso-formulario').style.width = pct + '%';
}

function validarFormulario() {
  const requeridos = ['plantel', 'turno', 'semestre', 'nombre', 'matricula', 'genero', 'grupo', 'correo'];
  for (const campo of requeridos) {
    if (!STATE.form[campo] || !STATE.form[campo].trim()) {
      alertaElegante({ icon: 'warning', title: 'Faltan datos', text: 'Todos los campos del formulario son obligatorios.' });
      return false;
    }
  }
  if (!validarMatricula(STATE.form.matricula)) {
    alertaElegante({ icon: 'error', title: 'Matrícula inválida', text: 'La matrícula debe tener entre 4 y 15 caracteres alfanuméricos.' });
    return false;
  }
  if (!validarCorreoInstitucional(STATE.form.correo)) {
    alertaElegante({ icon: 'error', title: 'Correo inválido', text: 'Captura un correo institucional válido (@cobaed.edu.mx o @alumno.cobaed.edu.mx).' });
    return false;
  }
  return true;
}

/* ---------------------------------------------------------------------
   7. CUESTIONARIO (40 preguntas, una tarjeta a la vez)
   --------------------------------------------------------------------- */

function renderPreguntaActual() {
  const p = PREGUNTAS[STATE.quizIndex];
  const cont = $('#tarjeta-pregunta');
  const seleccionActual = STATE.respuestas[p.n] || '';

  cont.innerHTML = `
    <div class="pregunta-card animate__animated animate__fadeIn">
      <span class="pregunta-numero">Pregunta ${p.n} de 40</span>
      <h3 class="pregunta-texto">${sanitizar(p.texto)}</h3>
      <div class="opciones-radio">
        ${['a', 'b', 'c'].map(letra => `
          <label class="opcion ${seleccionActual === letra ? 'seleccionada' : ''}">
            <input type="radio" name="opcion-actual" value="${letra}" ${seleccionActual === letra ? 'checked' : ''}>
            <span class="opcion-letra">${letra.toUpperCase()}</span>
            <span class="opcion-texto">${sanitizar(p[letra])}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `;

  $all('input[name="opcion-actual"]', cont).forEach(input => {
    input.addEventListener('change', (e) => {
      STATE.respuestas[p.n] = e.target.value;
      guardarProgresoLocal();
      actualizarBarraProgresoCuestionario();
      setTimeout(avanzarPregunta, 280);
    });
  });

  $('#btn-anterior').disabled = STATE.quizIndex === 0;
  $('#btn-siguiente').textContent = STATE.quizIndex === PREGUNTAS.length - 1 ? 'Finalizar' : 'Siguiente';
  actualizarBarraProgresoCuestionario();
}

function actualizarBarraProgresoCuestionario() {
  const respondidas = Object.keys(STATE.respuestas).length;
  const pct = Math.round((respondidas / PREGUNTAS.length) * 100);
  $('#barra-progreso-cuestionario').style.width = pct + '%';
  $('#texto-progreso-cuestionario').textContent = `${respondidas} / ${PREGUNTAS.length} respondidas`;
}

function avanzarPregunta() {
  const p = PREGUNTAS[STATE.quizIndex];
  if (!STATE.respuestas[p.n]) {
    toast('Selecciona una opción para continuar', 'info');
    return;
  }
  if (STATE.quizIndex < PREGUNTAS.length - 1) {
    STATE.quizIndex++;
    renderPreguntaActual();
  } else {
    finalizarCuestionario();
  }
}

function retrocederPregunta() {
  if (STATE.quizIndex > 0) {
    STATE.quizIndex--;
    renderPreguntaActual();
  }
}

function bindCuestionario() {
  $('#btn-siguiente').addEventListener('click', avanzarPregunta);
  $('#btn-anterior').addEventListener('click', retrocederPregunta);
}

/* ---------------------------------------------------------------------
   8. LÓGICA VAK — CORRECCIÓN AUTOMÁTICA
   --------------------------------------------------------------------- */

function calcularResultadoVAK() {
  const conteo = { V: 0, A: 0, K: 0 };
  PREGUNTAS.forEach(p => {
    const letra = STATE.respuestas[p.n];
    if (!letra) return;
    const canal = p.key[letra];
    conteo[canal]++;
  });

  const total = conteo.V + conteo.A + conteo.K || 1;
  const porcentajes = {
    V: Math.round((conteo.V / total) * 100),
    A: Math.round((conteo.A / total) * 100),
    K: Math.round((conteo.K / total) * 100)
  };

  // Determinar dominancia, resolviendo empates por prioridad V > A > K
  // (criterio institucional: en empate se prioriza el canal con mayor
  // peso pedagógico documentado para educación media superior).
  let dominante = 'V';
  if (conteo.A > conteo[dominante]) dominante = 'A';
  if (conteo.K > conteo[dominante]) dominante = 'K';
  const empatados = ['V', 'A', 'K'].filter(c => conteo[c] === conteo[dominante]);
  const huboEmpate = empatados.length > 1;

  return { conteo, porcentajes, dominante, huboEmpate, total };
}

const INFO_CANAL = {
  V: {
    nombre: 'Visual',
    icono: 'visibility',
    color: 'var(--azul-plumbago)',
    tendencia: 'aprender principalmente a través de lo que ves: imágenes, esquemas, colores y detalles visuales.',
    recomendacion: 'usar mapas mentales, subrayar con colores, ver videos y esquemas, y sentarte donde tengas buena visibilidad del pizarrón.',
    fortalezas: ['Memoria visual detallada', 'Aprendizaje rápido con material gráfico', 'Buena organización espacial'],
    oportunidades: ['Reforzar la retención de lo escuchado', 'Practicar tomar apuntes auditivos', 'Verbalizar lo aprendido en voz alta']
  },
  A: {
    nombre: 'Auditivo',
    icono: 'hearing',
    color: 'var(--verde-suave)',
    tendencia: 'aprender principalmente a través de lo que escuchas: explicaciones verbales, sonidos y repetición secuencial.',
    recomendacion: 'grabar las clases, leer en voz alta, participar en debates y estudiar en un ambiente silencioso o con música instrumental.',
    fortalezas: ['Buena memoria secuencial', 'Facilidad para el debate y la exposición oral', 'Aprendizaje eficaz mediante explicaciones verbales'],
    oportunidades: ['Reforzar la comprensión con apoyos visuales', 'Practicar la lectura de esquemas y diagramas', 'Evitar distraerse con el ruido ambiental']
  },
  K: {
    nombre: 'Kinestésico',
    icono: 'touch_app',
    color: 'var(--marron-tierra)',
    tendencia: 'aprender principalmente a través del movimiento, el tacto y la experiencia práctica.',
    recomendacion: 'realizar prácticas de laboratorio, maquetas, ejercicios manuales y tomar descansos activos durante el estudio.',
    fortalezas: ['Aprendizaje sólido a través de la práctica', 'Buena memoria de experiencias vividas', 'Facilidad para actividades manuales y de movimiento'],
    oportunidades: ['Reforzar la atención en explicaciones puramente teóricas', 'Practicar la síntesis visual y auditiva', 'Desarrollar mayor tolerancia a sesiones sin movimiento']
  }
};

/* ---------------------------------------------------------------------
   9. RESULTADOS + GRÁFICOS
   --------------------------------------------------------------------- */

let chartRadar, chartDoughnut, chartBarras;

function finalizarCuestionario() {
  const faltantes = PREGUNTAS.filter(p => !STATE.respuestas[p.n]);
  if (faltantes.length) {
    alertaElegante({
      icon: 'warning', title: 'Cuestionario incompleto',
      text: `Faltan ${faltantes.length} pregunta(s) por responder.`
    });
    STATE.quizIndex = PREGUNTAS.findIndex(p => !STATE.respuestas[p.n]);
    renderPreguntaActual();
    return;
  }

  const resultado = calcularResultadoVAK();
  STATE.resultado = resultado;
  renderResultado(resultado);
  registrarEnvio(resultado);
  STATE.step = 'result';
  mostrarPantalla('pantalla-resultado');
}

function renderResultado(res) {
  const info = INFO_CANAL[res.dominante];

  $('#resultado-dominancia').innerHTML = `
    <span class="material-icons" style="color:${info.color}">${info.icono}</span>
    Tu percepción dominante es <strong>${info.nombre}</strong>
  `;
  $('#resultado-descripcion').textContent = `Según tus resultados, tienes tendencia a ${info.tendencia}`;

  $('#tabla-yo').innerHTML = `
    <tr><th>Yo</th><td>${sanitizar(STATE.form.nombre)}</td></tr>
    <tr><th>Tengo tendencia a...</th><td>${info.tendencia}</td></tr>
    <tr><th>Por lo tanto se me facilita aprender con...</th><td>${info.recomendacion}</td></tr>
  `;

  $('#lista-fortalezas').innerHTML = info.fortalezas.map(f => `<li>${f}</li>`).join('');
  $('#lista-oportunidades').innerHTML = info.oportunidades.map(o => `<li>${o}</li>`).join('');

  $('#pct-visual').textContent = res.porcentajes.V + '%';
  $('#pct-auditivo').textContent = res.porcentajes.A + '%';
  $('#pct-kinestesico').textContent = res.porcentajes.K + '%';

  if (res.huboEmpate) {
    toast('Hubo empate entre canales; se resolvió por prioridad institucional V > A > K', 'info');
  }

  renderGraficos(res);
}

function renderGraficos(res) {
  const labels = ['Visual', 'Auditivo', 'Kinestésico'];
  const data = [res.porcentajes.V, res.porcentajes.A, res.porcentajes.K];
  const colores = ['#5B7C99', '#8FAE92', '#A67B5B'];

  const ctxRadar = $('#chart-radar');
  const ctxDoughnut = $('#chart-doughnut');
  const ctxBarras = $('#chart-barras');

  if (chartRadar) chartRadar.destroy();
  if (chartDoughnut) chartDoughnut.destroy();
  if (chartBarras) chartBarras.destroy();

  chartRadar = new Chart(ctxRadar, {
    type: 'radar',
    data: { labels, datasets: [{ label: 'Porcentaje', data, backgroundColor: 'rgba(91,124,153,0.25)', borderColor: '#5B7C99', pointBackgroundColor: colores }] },
    options: { plugins: { legend: { display: false } }, scales: { r: { beginAtZero: true, max: 100 } } }
  });

  chartDoughnut = new Chart(ctxDoughnut, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colores }] },
    options: { plugins: { legend: { position: 'bottom' } } }
  });

  chartBarras = new Chart(ctxBarras, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Porcentaje', data, backgroundColor: colores }] },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }
  });
}

/* ---------------------------------------------------------------------
   10. ENVÍO AL BACKEND (Google Apps Script)
   --------------------------------------------------------------------- */

function estadoEntrega() {
  return new Date() <= FECHA_LIMITE ? 'EN TIEMPO' : 'FUERA DE TIEMPO';
}

async function registrarEnvio(resultado) {
  const payload = {
    accion: 'guardarFormulario',
    datosPersonales: STATE.form,
    respuestas: STATE.respuestas,
    totales: resultado.conteo,
    porcentajes: resultado.porcentajes,
    dominante: resultado.dominante,
    fecha: new Date().toISOString().slice(0, 10),
    hora: new Date().toTimeString().slice(0, 8),
    estado: estadoEntrega()
  };

  if (!WEB_APP_URL || WEB_APP_URL.includes('REEMPLAZAR_CON_ID_DE_DESPLIEGUE')) {
    console.error('WEB_APP_URL no ha sido configurada. Edita script.js y coloca la URL /exec real de tu implementación de Apps Script.');
    $('#btn-reenviar').style.display = 'inline-flex';
    alertaElegante({
      icon: 'error', title: 'Backend no configurado',
      text: 'La URL del Web App (WEB_APP_URL en script.js) todavía es el valor de ejemplo. Debes reemplazarla por la URL /exec de tu implementación antes de poder guardar resultados.'
    });
    return;
  }

  try {
    $('#loader-envio').classList.add('visible');
    const resp = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // evita preflight CORS en Apps Script
      body: JSON.stringify(payload)
    });

    const textoCrudo = await resp.text();
    console.log('[VAK] HTTP', resp.status, resp.statusText);
    console.log('[VAK] Respuesta cruda del servidor:', textoCrudo);

    if (!resp.ok) {
      throw new Error(`El servidor respondió con estado HTTP ${resp.status} (${resp.statusText}). Revisa la consola para el detalle.`);
    }

    let data;
    try {
      data = JSON.parse(textoCrudo);
    } catch (parseErr) {
      // Esto ocurre típicamente cuando Apps Script devolvió una página de
      // inicio de sesión o de error HTML en vez de JSON (permisos, URL
      // apuntando a /dev en vez de /exec, o el despliegue no es público).
      throw new Error('La respuesta del servidor no fue JSON válido. Es probable que el Web App no esté implementado como "Cualquier usuario" o que la URL no termine en /exec. Ver consola.');
    }

    if (data && data.ok) {
      toast('Resultados guardados correctamente');
      limpiarProgresoLocal();
      $('#btn-reenviar').style.display = 'none';
    } else {
      throw new Error((data && data.error) || 'Error desconocido del servidor');
    }
  } catch (err) {
    console.error('[VAK] Error al guardar en el servidor:', err);
    $('#btn-reenviar').style.display = 'inline-flex';
    alertaElegante({
      icon: 'error', title: 'No se pudo guardar en el servidor',
      html: `Tus resultados se muestran localmente. Detalle técnico:<br><code style="font-size:0.8rem">${sanitizar(err.message)}</code><br><br>Verifica tu conexión e inténtalo de nuevo con el botón "Enviar".`
    });
  } finally {
    $('#loader-envio').classList.remove('visible');
  }
}

function reenviarResultado() {
  if (STATE.resultado) registrarEnvio(STATE.resultado);
}

/* ---------------------------------------------------------------------
   11. EXPORTAR / IMPRIMIR
   --------------------------------------------------------------------- */

function descargarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const res = STATE.resultado;
  const info = INFO_CANAL[res.dominante];

  doc.setFontSize(16);
  doc.text('COBAED — Test de VAK — Semestre 2026A', 40, 50);
  doc.setFontSize(11);
  doc.text(`Alumno(a): ${STATE.form.nombre}`, 40, 80);
  doc.text(`Matrícula: ${STATE.form.matricula}   Plantel: ${STATE.form.plantel}`, 40, 98);
  doc.text(`Turno: ${STATE.form.turno}   Semestre: ${STATE.form.semestre}   Grupo: ${STATE.form.grupo}`, 40, 116);
  doc.text(`Percepción dominante: ${info.nombre}`, 40, 144);
  doc.text(`Visual: ${res.porcentajes.V}%   Auditivo: ${res.porcentajes.A}%   Kinestésico: ${res.porcentajes.K}%`, 40, 162);
  doc.text('Tengo tendencia a:', 40, 190);
  doc.text(doc.splitTextToSize(info.tendencia, 500), 40, 206);
  doc.text('Por lo tanto debo:', 40, 250);
  doc.text(doc.splitTextToSize(info.recomendacion, 500), 40, 266);
  doc.save(`VAK_${STATE.form.matricula || 'resultado'}.pdf`);
}

function imprimirResultado() {
  window.print();
}

/* ---------------------------------------------------------------------
   12. MODO OSCURO / CLARO
   --------------------------------------------------------------------- */

function alternarModoOscuro() {
  STATE.darkMode = !STATE.darkMode;
  document.body.classList.toggle('modo-oscuro', STATE.darkMode);
  $('#icono-tema').textContent = STATE.darkMode ? 'light_mode' : 'dark_mode';
}

/* ---------------------------------------------------------------------
   13. INICIALIZACIÓN
   --------------------------------------------------------------------- */

function restaurarEstadoDesdeLocalStorage() {
  const habiaProgreso = cargarProgresoLocal();
  if (!habiaProgreso) return;
  ['plantel', 'turno', 'semestre', 'nombre', 'matricula', 'genero', 'grupo', 'correo']
    .forEach(campo => {
      const el = document.getElementsByName(campo)[0];
      if (el && STATE.form[campo]) el.value = STATE.form[campo];
    });
  actualizarBarraProgresoFormulario();
  if (Object.keys(STATE.respuestas).length) {
    toast('Se restauró tu progreso anterior', 'info');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.AOS) AOS.init({ duration: 600, once: true });

  poblarCatalogos();
  bindFormulario();
  bindCuestionario();
  restaurarEstadoDesdeLocalStorage();

  $('#btn-iniciar').addEventListener('click', irAFormulario);
  $('#btn-toggle-tema').addEventListener('click', alternarModoOscuro);
  $('#btn-descargar-pdf').addEventListener('click', descargarPDF);
  $('#btn-imprimir').addEventListener('click', imprimirResultado);
  $('#btn-reenviar').addEventListener('click', reenviarResultado);

  mostrarPantalla('pantalla-intro');
});
