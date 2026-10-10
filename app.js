'use strict';

/* ==========================================================
   Clase 2 · JavaScript y el DOM
   Cada bloque corresponde a una lección de index.html.
   ========================================================== */

/* ---------- Utilidades generales ---------- */

// Atajos para no repetir document.querySelector / querySelectorAll.
// (En la lección 1 se usan los métodos completos para que se vea cómo funcionan.)
const $ = (selector, contexto = document) => contexto.querySelector(selector);
const $$ = (selector, contexto = document) => [...contexto.querySelectorAll(selector)];

// localStorage puede fallar (modo privado, permisos), por eso lo envolvemos en try/catch.
function guardar(clave, valor) {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* sin almacenamiento */ }
}
function leer(clave, porDefecto) {
  try {
    const dato = localStorage.getItem(clave);
    return dato === null ? porDefecto : JSON.parse(dato);
  } catch (e) {
    return porDefecto;
  }
}

/* ---------- Consola visual ---------- */

const consolaSalida = $('#consola-salida');
const codigoSalida = $('#codigo-salida');
const TEXTO_CODIGO_VACIO = '// Aquí verás el código de cada acción…';

// Une varias líneas en un solo texto (así los fragmentos se escriben sin sangría rara)
const cod = (...lineas) => lineas.join('\n');

// Muestra un fragmento en el panel de código y marca la línea de consola asociada
function mostrarCodigo(codigo, linea) {
  codigoSalida.textContent = codigo;
  $$('.linea.seleccionada', consolaSalida).forEach((l) => l.classList.remove('seleccionada'));
  if (linea) linea.classList.add('seleccionada');
}

// Escribe una línea en la consola de la página. tipo: 'info' | 'ok' | 'aviso-c'
// codigo (opcional): el fragmento que produjo este resultado; se muestra en el panel derecho.
function registrar(mensaje, tipo = 'info', codigo = '') {
  const vacia = $('.consola-vacia', consolaSalida);
  if (vacia) vacia.remove(); // quita el texto inicial al primer mensaje

  const linea = document.createElement('div');
  linea.className = 'linea';
  if (codigo) {
    linea.dataset.codigo = codigo; // la guardamos para poder volver a mostrarla al hacer clic
    linea.classList.add('con-codigo');
    linea.title = 'Clic para ver el código';
  }

  const hora = document.createElement('span');
  hora.className = 'hora';
  hora.textContent = new Date().toLocaleTimeString('es-GT');

  const texto = document.createElement('span');
  texto.className = tipo;
  texto.textContent = mensaje;

  linea.append(hora, texto);
  consolaSalida.append(linea);
  consolaSalida.scrollTop = consolaSalida.scrollHeight; // baja hasta el último mensaje
  if (codigo) mostrarCodigo(codigo, linea);
}

// Delegación: un clic en cualquier línea del historial vuelve a mostrar su código
consolaSalida.addEventListener('click', (e) => {
  const linea = e.target.closest('.linea[data-codigo]');
  if (linea) mostrarCodigo(linea.dataset.codigo, linea);
});

function limpiarConsola() {
  codigoSalida.textContent = TEXTO_CODIGO_VACIO;
  consolaSalida.textContent = '';
  const vacia = document.createElement('div');
  vacia.className = 'consola-vacia';
  vacia.textContent = 'Aquí verás lo que hace el código de cada ejemplo…';
  consolaSalida.append(vacia);
}
$('#consola-limpiar').addEventListener('click', limpiarConsola);
limpiarConsola();

/* ==========================================================
   NAVEGACIÓN ENTRE LECCIONES + PROGRESO
   ========================================================== */

const lecciones = $$('.leccion');
const menu = $('#menu');
const btnAnterior = $('#btn-anterior');
const btnSiguiente = $('#btn-siguiente');
const barra = $('#progreso-barra');
const textoProgreso = $('#progreso-texto');

// Ejercicios completados: { "1": true, "3": true, ... }
let completadas = leer('clase2-completadas', {});
let actual = 0;

// Construye el menú lateral a partir de las secciones del HTML
lecciones.forEach((leccion, i) => {
  const item = document.createElement('li');
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.textContent = `${i + 1}. ${leccion.dataset.titulo}`;
  boton.addEventListener('click', () => irA(i));
  item.append(boton);
  menu.append(item);
});

function actualizarProgreso() {
  const total = lecciones.length;
  const hechas = Object.values(completadas).filter(Boolean).length;
  barra.style.width = `${(hechas / total) * 100}%`;
  textoProgreso.textContent = `${hechas} de ${total} ejercicios`;

  $$('button', menu).forEach((boton, i) => {
    boton.classList.toggle('completada', Boolean(completadas[i + 1]));
  });
}

function irA(indice) {
  actual = Math.max(0, Math.min(indice, lecciones.length - 1));

  lecciones.forEach((leccion, i) => { leccion.hidden = i !== actual; });
  $$('button', menu).forEach((boton, i) => {
    boton.classList.toggle('activa', i === actual);
  });

  btnAnterior.disabled = actual === 0;
  btnSiguiente.disabled = actual === lecciones.length - 1;

  history.replaceState(null, '', `#leccion-${actual + 1}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  registrar(`Lección ${actual + 1}: ${lecciones[actual].dataset.titulo}`, 'aviso-c');
}

btnAnterior.addEventListener('click', () => irA(actual - 1));
btnSiguiente.addEventListener('click', () => irA(actual + 1));

// Casillas "Ya lo hice": un solo listener en el contenedor (delegación, lección 7)
$('.contenido').addEventListener('change', (e) => {
  if (e.target.matches('input[data-leccion]')) {
    completadas[e.target.dataset.leccion] = e.target.checked;
    guardar('clase2-completadas', completadas);
    actualizarProgreso();
  }
});

// Restaura el estado guardado de las casillas
$$('input[data-leccion]').forEach((casilla) => {
  casilla.checked = Boolean(completadas[casilla.dataset.leccion]);
});

// Modo oscuro de toda la página
const btnTema = $('#btn-tema');
function aplicarTema(oscuro) {
  document.body.classList.toggle('oscuro', oscuro);
  btnTema.textContent = oscuro ? '☀️ Modo claro' : '🌙 Modo oscuro';
  guardar('clase2-oscuro', oscuro);
}
btnTema.addEventListener('click', () => {
  aplicarTema(!document.body.classList.contains('oscuro'));
});
aplicarTema(leer('clase2-oscuro', false));

/* ==========================================================
   LECCIÓN 1 · Seleccionar elementos
   ========================================================== */
(function leccion1() {
  // Aquí usamos los métodos completos del DOM, sin los atajos $ y $$
  const titulo = document.getElementById('l1-titulo');

  function limpiar() {
    document.querySelectorAll('.resaltado').forEach((el) => el.classList.remove('resaltado'));
  }

  document.getElementById('l1-btn-id').addEventListener('click', () => {
    limpiar();
    titulo.classList.add('resaltado');
    registrar("document.getElementById('l1-titulo') → 1 elemento <h3>", 'info', cod(
      "const titulo = document.getElementById('l1-titulo');",
      "titulo.classList.add('resaltado');"
    ));
  });

  document.getElementById('l1-btn-uno').addEventListener('click', () => {
    limpiar();
    const primero = document.querySelector('.l1-parrafo'); // solo devuelve el primero
    primero.classList.add('resaltado');
    registrar("document.querySelector('.l1-parrafo') → solo el primero: \"" + primero.textContent + '"', 'info', cod(
      "// querySelector devuelve SOLO el primero que coincida",
      "const primero = document.querySelector('.l1-parrafo');",
      "primero.classList.add('resaltado');"
    ));
  });

  document.getElementById('l1-btn-todos').addEventListener('click', () => {
    limpiar();
    const todos = document.querySelectorAll('.l1-parrafo'); // lista de elementos
    todos.forEach((p) => p.classList.add('resaltado'));
    registrar(`document.querySelectorAll('.l1-parrafo') → ${todos.length} elementos`, 'info', cod(
      "// querySelectorAll devuelve una lista con TODOS",
      "const todos = document.querySelectorAll('.l1-parrafo');",
      "todos.forEach((p) => p.classList.add('resaltado'));"
    ));
  });

  document.getElementById('l1-btn-limpiar').addEventListener('click', () => {
    limpiar();
    registrar('Se quitó el resaltado', 'ok', cod(
      "document.querySelectorAll('.resaltado')",
      "  .forEach((el) => el.classList.remove('resaltado'));"
    ));
  });
})();

/* ==========================================================
   LECCIÓN 2 · Contenido y atributos
   ========================================================== */
(function leccion2() {
  const entrada = $('#l2-entrada');
  const salida = $('#l2-salida');
  const enlace = $('#l2-enlace');

  $('#l2-btn-texto').addEventListener('click', () => {
    salida.textContent = entrada.value; // las etiquetas se muestran como texto
    registrar('salida.textContent = entrada.value → se muestra tal cual', 'info', cod(
      "// Las etiquetas se muestran como texto",
      "salida.textContent = entrada.value;"
    ));
  });

  $('#l2-btn-html').addEventListener('click', () => {
    salida.innerHTML = entrada.value; // las etiquetas se interpretan como HTML
    registrar('salida.innerHTML = entrada.value → el HTML se interpreta', 'aviso-c', cod(
      "// Las etiquetas se interpretan como HTML",
      "salida.innerHTML = entrada.value;"
    ));
  });

  let cambiado = false;
  $('#l2-btn-enlace').addEventListener('click', () => {
    cambiado = !cambiado;
    if (cambiado) {
      enlace.setAttribute('href', 'https://www.w3schools.com/js/');
      enlace.textContent = 'W3Schools JavaScript';
    } else {
      enlace.setAttribute('href', 'https://developer.mozilla.org');
      enlace.textContent = 'MDN Web Docs';
    }
    registrar(`setAttribute('href', ...) → ${enlace.getAttribute('href')}`, 'ok', cod(
      "enlace.setAttribute('href', 'https://www.w3schools.com/js/');",
      "enlace.textContent = 'W3Schools JavaScript';"
    ));
  });

  $('#l2-btn-leer').addEventListener('click', () => {
    registrar(`enlace.getAttribute('href') → ${enlace.getAttribute('href')}`, 'info', cod(
      "// getAttribute LEE el valor de un atributo",
      "const url = enlace.getAttribute('href');"
    ));
  });
})();

/* ==========================================================
   LECCIÓN 3 · Estilos y clases
   ========================================================== */
(function leccion3() {
  const caja = $('#l3-caja');

  $('#l3-btn-clase').addEventListener('click', () => {
    const activa = caja.classList.toggle('activa'); // toggle devuelve true si quedó agregada
    registrar(`caja.classList.toggle('activa') → ${activa ? 'clase agregada' : 'clase quitada'}`, 'info', cod(
      "// toggle: si la clase está la quita, si no está la agrega",
      "caja.classList.toggle('activa');"
    ));
  });

  $('#l3-btn-tema-demo').addEventListener('click', () => {
    aplicarTema(!document.body.classList.contains('oscuro'));
    registrar("document.body.classList.toggle('oscuro')", 'ok', cod(
      "// El CSS cambia las variables de color cuando body tiene la clase",
      "document.body.classList.toggle('oscuro');"
    ));
  });

  $('#l3-color').addEventListener('input', (e) => {
    caja.style.backgroundColor = e.target.value;
    registrar(`caja.style.backgroundColor = '${e.target.value}'`, 'info', cod(
      "selectorColor.addEventListener('input', (e) => {",
      "  caja.style.backgroundColor = e.target.value;",
      "});"
    ));
  });

  $('#l3-radio').addEventListener('input', (e) => {
    caja.style.borderRadius = `${e.target.value}px`; // en JS las propiedades van en camelCase
    registrar(`caja.style.borderRadius = '${e.target.value}px'`, 'info', cod(
      "// En JS las propiedades CSS van en camelCase (border-radius → borderRadius)",
      "caja.style.borderRadius = e.target.value + 'px';"
    ));
  });
})();

/* ==========================================================
   LECCIÓN 4 · Eventos
   ========================================================== */
(function leccion4() {
  // --- click: contador ---
  const valor = $('#l4-valor');
  let cuenta = 0;

  function mostrarCuenta(codigo) {
    valor.textContent = cuenta;
    registrar(`contador = ${cuenta}`, 'info', codigo);
  }
  $('#l4-mas').addEventListener('click', () => {
    cuenta++;
    mostrarCuenta(cod(
      "botonMas.addEventListener('click', () => {",
      "  cuenta++;",
      "  valor.textContent = cuenta;",
      "});"
    ));
  });
  $('#l4-menos').addEventListener('click', () => {
    cuenta--;
    mostrarCuenta(cod(
      "botonMenos.addEventListener('click', () => {",
      "  cuenta--;",
      "  valor.textContent = cuenta;",
      "});"
    ));
  });
  $('#l4-reset').addEventListener('click', () => {
    cuenta = 0;
    mostrarCuenta(cod(
      "botonReiniciar.addEventListener('click', () => {",
      "  cuenta = 0;",
      "  valor.textContent = cuenta;",
      "});"
    ));
  });

  // --- keydown: teclado ---
  $('#l4-teclas').addEventListener('keydown', (evento) => {
    $('#l4-ultima').textContent = evento.key;
    registrar(`keydown → key: "${evento.key}", code: "${evento.code}"`, 'info', cod(
      "campo.addEventListener('keydown', (evento) => {",
      "  // key = el carácter · code = la tecla física",
      "  ultima.textContent = evento.key;",
      "});"
    ));
  });

  // --- submit: formulario ---
  $('#l4-form').addEventListener('submit', (evento) => {
    evento.preventDefault(); // sin esto la página se recargaría
    const nombre = $('#l4-nombre').value.trim();
    $('#l4-saludo').textContent = `¡Hola, ${nombre}! 👋`;
    registrar(`submit → preventDefault() y saludo para "${nombre}"`, 'ok', cod(
      "formulario.addEventListener('submit', (evento) => {",
      "  evento.preventDefault();   // evita que se recargue la página",
      "  const nombre = campo.value.trim();",
      "  saludo.textContent = '¡Hola, ' + nombre + '!';",
      "});"
    ));
    evento.target.reset();
  });

  // --- mouseover / mouseout ---
  const zona = $('#l4-zona');
  zona.addEventListener('mouseover', () => {
    zona.classList.add('encima');
    zona.textContent = '¡El mouse está aquí!';
  });
  zona.addEventListener('mouseout', () => {
    zona.classList.remove('encima');
    zona.textContent = 'Pasa el mouse por aquí';
  });
})();

/* ==========================================================
   LECCIÓN 5 · Crear y eliminar elementos
   ========================================================== */
(function leccion5() {
  const form = $('#l5-form');
  const campo = $('#l5-texto');
  const lista = $('#l5-lista');
  const contador = $('#l5-contador');

  // Crea un <li> con su botón de borrar y lo devuelve (todavía no está en la página)
  function crearItem(texto) {
    const li = document.createElement('li');

    const span = document.createElement('span');
    span.textContent = texto; // textContent: seguro con texto del usuario

    const borrar = document.createElement('button');
    borrar.type = 'button';
    borrar.className = 'borrar';
    borrar.textContent = '🗑';
    borrar.setAttribute('aria-label', 'Borrar');
    borrar.addEventListener('click', () => {
      li.remove();
      actualizarContador();
      registrar(`li.remove() → se eliminó "${texto}"`, 'aviso-c', cod(
        "borrar.addEventListener('click', () => {",
        "  li.remove();   // quita el elemento del DOM",
        "});"
      ));
    });

    li.append(span, borrar);
    return li;
  }

  function actualizarContador() {
    contador.textContent = lista.children.length;
  }

  function agregar(alInicio) {
    const texto = campo.value.trim();
    if (!texto) return;
    const li = crearItem(texto);
    if (alInicio) {
      lista.prepend(li);
      registrar(`lista.prepend(li) → "${texto}" al inicio`, 'ok', cod(
        "const li = document.createElement('li');   // 1. crear",
        "li.textContent = texto;                     // 2. configurar",
        "lista.prepend(li);                          // 3. insertar al inicio"
      ));
    } else {
      lista.appendChild(li);
      registrar(`lista.appendChild(li) → "${texto}" al final`, 'ok', cod(
        "const li = document.createElement('li');   // 1. crear",
        "li.textContent = texto;                     // 2. configurar",
        "lista.appendChild(li);                      // 3. insertar al final"
      ));
    }
    campo.value = '';
    campo.focus();
    actualizarContador();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    agregar(false);
  });
  $('#l5-inicio').addEventListener('click', () => agregar(true));
})();

/* ==========================================================
   LECCIÓN 6 · Recorrer el DOM
   ========================================================== */
(function leccion6() {
  const arbol = $('#l6-arbol');
  const info = $('#l6-info');

  // Solo nos interesan los hijos que sean ".caja" (hay también <span> de etiqueta)
  const soloCajas = (elementos) => [...elementos].filter((el) => el.classList.contains('caja'));
  const nombre = (el) => (el ? el.dataset.nombre : 'ninguno');

  // Un solo listener en el árbol: cada clic "burbujea" hasta aquí
  arbol.addEventListener('click', (e) => {
    const caja = e.target.closest('.caja'); // la caja más cercana al punto del clic
    if (!caja) return;

    // 1. Quitar marcas anteriores
    $$('.sel, .padre, .hijo, .hermano', arbol).forEach((el) => {
      el.classList.remove('sel', 'padre', 'hijo', 'hermano');
    });

    // 2. Recorrer el árbol desde la caja elegida
    const padre = caja.parentElement.classList.contains('caja') ? caja.parentElement : null;
    const hijos = soloCajas(caja.children);
    const hermanos = padre ? soloCajas(padre.children).filter((el) => el !== caja) : [];
    const anterior = caja.previousElementSibling;
    const siguiente = caja.nextElementSibling;

    // 3. Marcar
    caja.classList.add('sel');
    if (padre) padre.classList.add('padre');
    hijos.forEach((el) => el.classList.add('hijo'));
    hermanos.forEach((el) => el.classList.add('hermano'));

    // 4. Explicar
    const anteriorCaja = anterior && anterior.classList.contains('caja') ? anterior : null;
    const siguienteCaja = siguiente && siguiente.classList.contains('caja') ? siguiente : null;
    info.textContent =
      `Seleccionado: ${nombre(caja)} · parentElement: ${nombre(padre)} · ` +
      `hijos: ${hijos.length ? hijos.map(nombre).join(', ') : 'ninguno'} · ` +
      `previousElementSibling: ${nombre(anteriorCaja)} · nextElementSibling: ${nombre(siguienteCaja)}`;
    registrar(`Recorrido desde "${nombre(caja)}" → ${hijos.length} hijo(s), ${hermanos.length} hermano(s)`, 'info', cod(
      "const caja = e.target.closest('.caja');",
      "const padre = caja.parentElement;",
      "const hijos = caja.children;",
      "const anterior = caja.previousElementSibling;",
      "const siguiente = caja.nextElementSibling;"
    ));

    e.stopPropagation(); // que el clic no active también a las cajas ancestras
  });
})();

/* ==========================================================
   LECCIÓN 7 · Delegación de eventos + localStorage
   ========================================================== */
(function leccion7() {
  const CLAVE = 'clase2-tareas';
  const form = $('#l7-form');
  const campo = $('#l7-texto');
  const lista = $('#l7-lista');
  const json = $('#l7-json');

  // Estado: un arreglo de objetos { texto, hecha }
  let tareas = leer(CLAVE, []);

  // Vuelve a dibujar toda la lista a partir del arreglo
  function dibujar() {
    lista.textContent = ''; // vacía la lista
    tareas.forEach((tarea, indice) => {
      const li = document.createElement('li');
      li.dataset.indice = indice; // guardamos la posición en un atributo data-*
      li.classList.toggle('hecha', tarea.hecha);

      const texto = document.createElement('span');
      texto.className = 'texto';
      texto.textContent = tarea.texto;

      const borrar = document.createElement('button');
      borrar.type = 'button';
      borrar.className = 'borrar';
      borrar.textContent = '🗑';
      borrar.setAttribute('aria-label', 'Borrar tarea');

      li.append(texto, borrar);
      lista.append(li);
    });
    json.textContent = JSON.stringify(tareas, null, 2);
  }

  function guardarYDibujar() {
    guardar(CLAVE, tareas);
    dibujar();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = campo.value.trim();
    if (!texto) return;
    tareas.push({ texto, hecha: false });
    registrar(`Tarea agregada: "${texto}" (se guardó en localStorage)`, 'ok', cod(
      "tareas.push({ texto: texto, hecha: false });",
      "localStorage.setItem('tareas', JSON.stringify(tareas));"
    ));
    campo.value = '';
    guardarYDibujar();
  });

  // DELEGACIÓN: un solo listener en <ul>, sin importar cuántos <li> existan
  lista.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const indice = Number(li.dataset.indice);

    if (e.target.matches('.borrar')) {
      registrar(`Delegación: clic en 🗑 → se borra "${tareas[indice].texto}"`, 'aviso-c', cod(
        "// Un solo listener en la <ul> atiende a todos los <li>",
        "lista.addEventListener('click', (e) => {",
        "  if (e.target.matches('.borrar')) {",
        "    tareas.splice(indice, 1);   // quita la tarea del arreglo",
        "  }",
        "});"
      ));
      tareas.splice(indice, 1);
    } else if (e.target.matches('.texto')) {
      tareas[indice].hecha = !tareas[indice].hecha;
      registrar(`Delegación: clic en texto → hecha = ${tareas[indice].hecha}`, 'info', cod(
        "// Un solo listener en la <ul> atiende a todos los <li>",
        "lista.addEventListener('click', (e) => {",
        "  if (e.target.matches('.texto')) {",
        "    tareas[indice].hecha = !tareas[indice].hecha;",
        "  }",
        "});"
      ));
    } else {
      return;
    }
    guardarYDibujar();
  });

  $('#l7-vaciar').addEventListener('click', () => {
    tareas = [];
    registrar('Se vació la lista y localStorage', 'aviso-c', cod(
      "tareas = [];",
      "localStorage.setItem('tareas', JSON.stringify(tareas));"
    ));
    guardarYDibujar();
  });

  dibujar();
})();

/* ==========================================================
   LECCIÓN 8 · Reto final: tablero de notas
   ========================================================== */
(function leccion8() {
  const CLAVE = 'clase2-notas';
  const form = $('#l8-form');
  const campo = $('#l8-texto');
  const color = $('#l8-color');
  const caracteres = $('#l8-caracteres');
  const tablero = $('#l8-tablero');
  const total = $('#l8-total');

  let notas = leer(CLAVE, []); // [{ texto, color }]

  function dibujar() {
    tablero.textContent = '';
    notas.forEach((nota, indice) => {
      const div = document.createElement('div');
      div.className = `nota ${nota.color}`;
      div.dataset.indice = indice;

      const texto = document.createElement('p');
      texto.textContent = nota.texto;

      const borrar = document.createElement('button');
      borrar.type = 'button';
      borrar.className = 'borrar';
      borrar.textContent = '✖';
      borrar.setAttribute('aria-label', 'Borrar nota');

      div.append(borrar, texto);
      tablero.append(div);
    });
    total.textContent = notas.length;
  }

  function guardarYDibujar() {
    guardar(CLAVE, notas);
    dibujar();
  }

  // Contador de caracteres en vivo
  campo.addEventListener('input', () => {
    caracteres.textContent = `${campo.value.length} / ${campo.maxLength}`;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = campo.value.trim();
    if (!texto) return;
    notas.push({ texto, color: color.value });
    registrar(`Nota ${color.value} agregada (${notas.length} en total)`, 'ok', cod(
      "form.addEventListener('submit', (e) => {",
      "  e.preventDefault();",
      "  notas.push({ texto: campo.value.trim(), color: color.value });",
      "  localStorage.setItem('notas', JSON.stringify(notas));",
      "  // luego se vuelve a dibujar el tablero con createElement",
      "});"
    ));
    form.reset();
    caracteres.textContent = `0 / ${campo.maxLength}`;
    guardarYDibujar();
  });

  // Delegación: borrar una nota
  tablero.addEventListener('click', (e) => {
    if (!e.target.matches('.borrar')) return;
    const indice = Number(e.target.closest('.nota').dataset.indice);
    registrar(`Nota borrada: "${notas[indice].texto}"`, 'aviso-c', cod(
      "tablero.addEventListener('click', (e) => {",
      "  if (!e.target.matches('.borrar')) return;",
      "  const nota = e.target.closest('.nota');",
      "  notas.splice(Number(nota.dataset.indice), 1);",
      "});"
    ));
    notas.splice(indice, 1);
    guardarYDibujar();
  });

  $('#l8-vaciar').addEventListener('click', () => {
    notas = [];
    registrar('Tablero vaciado', 'aviso-c', cod(
      "notas = [];",
      "localStorage.setItem('notas', JSON.stringify(notas));"
    ));
    guardarYDibujar();
  });

  dibujar();
})();

/* ==========================================================
   ARRANQUE: abrir la lección indicada en la URL (#leccion-3) o la 1
   ========================================================== */
(function iniciar() {
  const coincidencia = location.hash.match(/^#leccion-(\d+)$/);
  const inicial = coincidencia ? Number(coincidencia[1]) - 1 : 0;
  actualizarProgreso();
  irA(inicial);
})();
