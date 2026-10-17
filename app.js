"use strict";

// Plant Tech: cuentas y plantas guardadas localmente.
const CLAVE_USUARIOS = "plantTechUsuarios";

const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const recuperacionForm = document.getElementById("recuperacionForm");
const formularioPlanta = document.getElementById("formularioPlanta");

const mostrarRegistro = document.getElementById("mostrarRegistro");
const mostrarLogin = document.getElementById("mostrarLogin");
const mostrarRecuperacion = document.getElementById("mostrarRecuperacion");
const volverLogin = document.getElementById("volverLogin");
const cerrarSesion = document.getElementById("cerrarSesion");

const mensajeLogin = document.getElementById("mensajeLogin");
const mensajeRegistro = document.getElementById("mensajeRegistro");
const mensajeRecuperacion = document.getElementById("mensajeRecuperacion");
const mensajePlanta = document.getElementById("mensajePlanta");

const listaPlantas = document.getElementById("listaPlantas");
const bienvenida = document.getElementById("bienvenida");

let usuarioActual = null;
let plantas = [];

// Normaliza el usuario para evitar diferencias entre mayúsculas y minúsculas.
function normalizarUsuario(valor) {
  return valor.trim().toLowerCase();
}

// Cada usuario tiene su propia colección de plantas.
function clavePlantas(usuario) {
  return "plantTechPlantas_" + encodeURIComponent(usuario);
}

function obtenerUsuarios() {
  const datos = localStorage.getItem(CLAVE_USUARIOS);

  if (!datos) {
    return [];
  }

  const usuarios = JSON.parse(datos);

  if (!Array.isArray(usuarios)) {
    throw new Error("Formato de cuentas no válido.");
  }

  return usuarios;
}

function guardarUsuarios(usuarios) {
  localStorage.setItem(
    CLAVE_USUARIOS,
    JSON.stringify(usuarios)
  );
}

function mostrarMensaje(elemento, texto = "", tipo = "") {
  elemento.textContent = texto;
  elemento.className = "mensaje";

  if (tipo) {
    elemento.classList.add(tipo);
  }
}

// Solo se muestra uno de los tres formularios a la vez.
function mostrarSolo(formulario) {
  loginForm.hidden = formulario !== loginForm;
  registerForm.hidden = formulario !== registerForm;
  recuperacionForm.hidden = formulario !== recuperacionForm;

  mostrarMensaje(mensajeLogin);
  mostrarMensaje(mensajeRegistro);
  mostrarMensaje(mensajeRecuperacion);
}

function mostrarInicio() {
  mostrarSolo(loginForm);
}

function mostrarRegistroForm() {
  mostrarSolo(registerForm);
}

function mostrarRecuperacionForm() {
  mostrarSolo(recuperacionForm);
}

// Navegación entre formularios.
mostrarRegistro.addEventListener("click", mostrarRegistroForm);
mostrarLogin.addEventListener("click", mostrarInicio);
mostrarRecuperacion.addEventListener("click", mostrarRecuperacionForm);

volverLogin.addEventListener("click", () => {
  recuperacionForm.reset();
  mostrarInicio();
});

// REGISTRO DE CUENTAS
registerForm.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const nombre = document
    .getElementById("nombreUsuario")
    .value.trim();

  const usuario = normalizarUsuario(
    document.getElementById("usuarioRegistro").value
  );

  const contrasena = document
    .getElementById("contrasenaRegistro").value;

  const confirmar = document
    .getElementById("confirmarContrasena").value;

  if (!nombre || !usuario || !contrasena) {
    mostrarMensaje(
      mensajeRegistro,
      "Completa todos los campos obligatorios.",
      "error"
    );
    return;
  }

  if (!/^[a-z0-9_-]{3,30}$/.test(usuario)) {
    mostrarMensaje(
      mensajeRegistro,
      "El usuario debe tener entre 3 y 30 caracteres: letras, números, guion o guion bajo.",
      "error"
    );
    return;
  }

  if (contrasena.length < 6) {
    mostrarMensaje(
      mensajeRegistro,
      "La contraseña debe tener al menos 6 caracteres.",
      "error"
    );
    return;
  }

  if (contrasena !== confirmar) {
    mostrarMensaje(
      mensajeRegistro,
      "Las contraseñas no coinciden.",
      "error"
    );
    return;
  }

  try {
    const usuarios = obtenerUsuarios();

    const existe = usuarios.some(
      (cuenta) => normalizarUsuario(cuenta.usuario) === usuario
    );

    if (existe) {
      mostrarMensaje(
        mensajeRegistro,
        "Ese nombre de usuario ya está registrado.",
        "error"
      );
      return;
    }

    // Almacenamiento local para el proyecto académico.
    // No usar contraseñas en texto plano en una aplicación real.
    usuarios.push({
      nombre: nombre,
      usuario: usuario,
      contrasena: contrasena
    });

    guardarUsuarios(usuarios);

    registerForm.reset();

    document.getElementById("usuarioLogin").value = usuario;

    mostrarInicio();

    mostrarMensaje(
      mensajeLogin,
      "¡Cuenta creada! Ahora puedes iniciar sesión.",
      "exito"
    );

  } catch (error) {
    console.error("Error al registrar la cuenta:", error);

    mostrarMensaje(
      mensajeRegistro,
      "No se pudo crear la cuenta. Comprueba el almacenamiento del navegador.",
      "error"
    );
  }
});

// INICIO DE SESIÓN
loginForm.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const usuario = normalizarUsuario(
    document.getElementById("usuarioLogin").value
  );

  const contrasena = document
    .getElementById("contrasenaLogin").value;

  try {
    const cuenta = obtenerUsuarios().find(
      (registro) =>
        normalizarUsuario(registro.usuario) === usuario &&
        registro.contrasena === contrasena
    );

    if (!cuenta) {
      mostrarMensaje(
        mensajeLogin,
        "Usuario o contraseña incorrectos.",
        "error"
      );
      return;
    }

    mostrarMensaje(mensajeLogin);

    entrarAplicacion(cuenta);

  } catch (error) {
    console.error("Error al iniciar sesión:", error);

    mostrarMensaje(
      mensajeLogin,
      "No se pudieron leer las cuentas guardadas en este navegador.",
      "error"
    );
  }
});

// RECUPERACIÓN DE CONTRASEÑA
recuperacionForm.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const usuario = normalizarUsuario(
    document.getElementById("usuarioRecuperacion").value
  );

  const nombre = document
    .getElementById("nombreRecuperacion")
    .value.trim()
    .toLowerCase();

  const nueva = document
    .getElementById("nuevaContrasena").value;

  const confirmar = document
    .getElementById("confirmarNuevaContrasena").value;

  if (nueva.length < 6) {
    mostrarMensaje(
      mensajeRecuperacion,
      "La contraseña debe tener al menos 6 caracteres.",
      "error"
    );
    return;
  }

  if (nueva !== confirmar) {
    mostrarMensaje(
      mensajeRecuperacion,
      "Las contraseñas no coinciden.",
      "error"
    );
    return;
  }

  try {
    const usuarios = obtenerUsuarios();

    const cuenta = usuarios.find(
      (registro) =>
        normalizarUsuario(registro.usuario) === usuario &&
        registro.nombre.trim().toLowerCase() === nombre
    );

    if (!cuenta) {
      mostrarMensaje(
        mensajeRecuperacion,
        "No encontramos una cuenta con esos datos.",
        "error"
      );
      return;
    }

    cuenta.contrasena = nueva;

    guardarUsuarios(usuarios);

    recuperacionForm.reset();

    mostrarMensaje(
      mensajeRecuperacion,
      "Contraseña actualizada. Ya puedes iniciar sesión.",
      "exito"
    );

  } catch (error) {
    console.error("Error al recuperar la contraseña:", error);

    mostrarMensaje(
      mensajeRecuperacion,
      "No se pudo guardar el cambio. Comprueba el almacenamiento.",
      "error"
    );
  }
});

// ENTRAR A LA APLICACIÓN
function entrarAplicacion(cuenta) {
  usuarioActual = {
    usuario: cuenta.usuario,
    nombre: cuenta.nombre
  };

  cargarPlantas(cuenta.usuario);

  bienvenida.textContent = "Hola, " + cuenta.nombre + " 🌱";

  authSection.hidden = true;
  appSection.hidden = false;

  formularioPlanta.reset();

  document.getElementById("frecuencia").value = 3;

  mostrarMensaje(mensajePlanta);
  mostrarPlantas();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// CERRAR SESIÓN
cerrarSesion.addEventListener("click", () => {
  usuarioActual = null;
  plantas = [];

  appSection.hidden = true;
  authSection.hidden = false;

  loginForm.reset();
  formularioPlanta.reset();
  listaPlantas.replaceChildren();

  mostrarInicio();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

// CARGAR LAS PLANTAS DEL USUARIO
function cargarPlantas(usuario) {
  try {
    const datos = localStorage.getItem(clavePlantas(usuario));
    const resultado = datos ? JSON.parse(datos) : [];

    plantas = Array.isArray(resultado) ? resultado : [];

  } catch (error) {
    console.error("Error al cargar plantas:", error);
    plantas = [];
  }
}

// GUARDAR LAS PLANTAS
function guardarPlantas() {
  if (!usuarioActual) {
    return false;
  }

  try {
    localStorage.setItem(
      clavePlantas(usuarioActual.usuario),
      JSON.stringify(plantas)
    );

    return true;

  } catch (error) {
    console.error("Error al guardar plantas:", error);

    mostrarMensaje(
      mensajePlanta,
      "No se pudo guardar la información. El almacenamiento puede estar lleno.",
      "error"
    );

    return false;
  }
}

// FECHAS
function fechaLocalISO(fecha = new Date()) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function fechaLegible(fechaISO) {
  if (!fechaISO) {
    return "Sin fecha";
  }

  const fecha = new Date(fechaISO + "T12:00:00");

  return Number.isNaN(fecha.getTime())
    ? fechaISO
    : fecha.toLocaleDateString("es-CO");
}

function calcularProximoRiego(fecha, dias) {
  const proxima = new Date(fecha + "T12:00:00");

  proxima.setDate(
    proxima.getDate() + Number(dias)
  );

  return proxima;
}

function calcularEstadoRiego(planta) {
  const proxima = calcularProximoRiego(
    planta.fechaRiego,
    planta.frecuencia
  );

  const fechaProxima = fechaLocalISO(proxima);
  const hoy = fechaLocalISO();

  if (fechaProxima < hoy) {
    return "La fecha estimada pasó. Revisa la humedad del suelo.";
  }

  if (fechaProxima === hoy) {
    return "Hoy puedes revisar si la planta necesita agua.";
  }

  return "Próxima revisión: " + fechaLegible(fechaProxima);
}

function crearTexto(etiqueta, texto) {
  const p = document.createElement("p");
  p.textContent = etiqueta + texto;

  return p;
}

// MOSTRAR LA COLECCIÓN DE PLANTAS
function mostrarPlantas() {
  listaPlantas.replaceChildren();

  if (plantas.length === 0) {
    const vacio = document.createElement("div");
    vacio.className = "empty-state";

    const icono = document.createElement("span");
    icono.textContent = "🪴";

    const texto = document.createElement("p");
    texto.textContent = "Aún no has registrado plantas.";

    const ayuda = document.createElement("small");
    ayuda.textContent = "Tu colección aparecerá aquí.";

    vacio.append(icono, texto, ayuda);
    listaPlantas.appendChild(vacio);

    return;
  }

  plantas.forEach((planta, indice) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "planta";

    if (planta.imagen) {
      const imagen = document.createElement("img");

      imagen.src = planta.imagen;
      imagen.alt = "Fotografía de " + planta.nombre;
      imagen.className = "imagen-planta";
      imagen.loading = "lazy";

      tarjeta.appendChild(imagen);
    }

    const cuerpo = document.createElement("div");
    cuerpo.className = "planta-body";

    const titulo = document.createElement("h3");
    titulo.textContent = "🌱 " + planta.nombre;

    const estado = document.createElement("p");
    estado.className = "estado";
    estado.textContent = calcularEstadoRiego(planta);

    cuerpo.append(
      titulo,
      crearTexto("Especie: ", planta.especie || "Sin especificar"),
      crearTexto("Último riego: ", fechaLegible(planta.fechaRiego)),
      crearTexto("Intervalo de revisión: ", planta.frecuencia + " días"),
      estado,
      crearTexto("Observaciones: ", planta.observaciones || "Sin observaciones")
    );

    const acciones = document.createElement("div");
    acciones.className = "planta-actions";

    // Registrar el riego del día.
    const regar = document.createElement("button");
    regar.type = "button";
    regar.textContent = "Registrar riego de hoy";

    regar.addEventListener("click", () => {
      const anterior = plantas[indice].fechaRiego;

      plantas[indice].fechaRiego = fechaLocalISO();

      if (guardarPlantas()) {
        mostrarPlantas();

        mostrarMensaje(
          mensajePlanta,
          "Se actualizó el registro de riego.",
          "exito"
        );
      } else {
        plantas[indice].fechaRiego = anterior;
      }
    });

    // Editar los datos.
    const editar = document.createElement("button");
    editar.type = "button";
    editar.textContent = "Editar";

    editar.addEventListener("click", () => {
      editarPlanta(indice);
    });

    // Eliminar la planta.
    const eliminar = document.createElement("button");
    eliminar.type = "button";
    eliminar.className = "eliminar";
    eliminar.textContent = "Eliminar";

    eliminar.addEventListener("click", () => {
      if (!confirm(`¿Deseas eliminar "${planta.nombre}"?`)) {
        return;
      }

      const anteriores = plantas;

      plantas = plantas.filter(
        (_, i) => i !== indice
      );

      if (guardarPlantas()) {
        mostrarPlantas();

        mostrarMensaje(
          mensajePlanta,
          "Planta eliminada.",
          "exito"
        );
      } else {
        plantas = anteriores;
      }
    });

    acciones.append(regar, editar, eliminar);
    cuerpo.appendChild(acciones);
    tarjeta.appendChild(cuerpo);
    listaPlantas.appendChild(tarjeta);
  });
}

// EDITAR UNA PLANTA
function editarPlanta(indice) {
  const planta = plantas[indice];

  const nombre = prompt(
    "Nombre de la planta:",
    planta.nombre
  );

  if (nombre === null) return;

  const especie = prompt(
    "Especie:",
    planta.especie
  );

  if (especie === null) return;

  const frecuencia = prompt(
    "Días entre revisiones de riego (1 a 60):",
    planta.frecuencia
  );

  if (frecuencia === null) return;

  const observaciones = prompt(
    "Observaciones:",
    planta.observaciones || ""
  );

  if (observaciones === null) return;

  const nombreLimpio = nombre.trim();
  const especieLimpia = especie.trim();
  const frecuenciaNumero = Number(frecuencia);

  if (
    !nombreLimpio ||
    !especieLimpia ||
    !Number.isInteger(frecuenciaNumero) ||
    frecuenciaNumero < 1 ||
    frecuenciaNumero > 60
  ) {
    alert(
      "Revisa los datos. La frecuencia debe ser un número entre 1 y 60 días."
    );
    return;
  }

  const anterior = { ...planta };

  plantas[indice] = {
    ...planta,
    nombre: nombreLimpio,
    especie: especieLimpia,
    frecuencia: frecuenciaNumero,
    observaciones: observaciones.trim()
  };

  if (guardarPlantas()) {
    mostrarPlantas();

    mostrarMensaje(
      mensajePlanta,
      "Planta actualizada.",
      "exito"
    );
  } else {
    plantas[indice] = anterior;
  }
}

// REGISTRAR UNA PLANTA NUEVA
formularioPlanta.addEventListener("submit", (evento) => {
  evento.preventDefault();

  if (!usuarioActual) {
    return;
  }

  const nombre = document.getElementById("nombre").value.trim();
  const especie = document.getElementById("especie").value.trim();
  const fechaRiego = document.getElementById("fechaRiego").value;
  const frecuencia = Number(document.getElementById("frecuencia").value);
  const observaciones = document.getElementById("observaciones").value.trim();
  const archivoImagen = document.getElementById("imagen").files[0];

  if (
    !nombre ||
    !especie ||
    !fechaRiego ||
    !Number.isInteger(frecuencia) ||
    frecuencia < 1 ||
    frecuencia > 60
  ) {
    mostrarMensaje(
      mensajePlanta,
      "Completa correctamente los campos obligatorios.",
      "error"
    );
    return;
  }

  if (fechaRiego > fechaLocalISO()) {
    mostrarMensaje(
      mensajePlanta,
      "La fecha del último riego no puede ser futura.",
      "error"
    );
    return;
  }

  if (!archivoImagen || !archivoImagen.type.startsWith("image/")) {
    mostrarMensaje(
      mensajePlanta,
      "Selecciona una fotografía válida de la planta.",
      "error"
    );
    return;
  }

  if (archivoImagen.size > 15 * 1024 * 1024) {
    mostrarMensaje(
      mensajePlanta,
      "La imagen original supera los 15 MB. Selecciona una más pequeña.",
      "error"
    );
    return;
  }

  const lector = new FileReader();

  lector.onerror = () => {
    mostrarMensaje(
      mensajePlanta,
      "No se pudo leer la fotografía.",
      "error"
    );
  };

  lector.onload = () => {
    const imagenOriginal = new Image();

    imagenOriginal.onerror = () => {
      mostrarMensaje(
        mensajePlanta,
        "No se pudo abrir la imagen. Prueba con otra fotografía.",
        "error"
      );
    };

    imagenOriginal.onload = () => {
      const maximo = 800;

      const escala = Math.min(
        1,
        maximo / Math.max(
          imagenOriginal.width,
          imagenOriginal.height
        )
      );

      const canvas = document.createElement("canvas");

      canvas.width = Math.max(
        1,
        Math.round(imagenOriginal.width * escala)
      );

      canvas.height = Math.max(
        1,
        Math.round(imagenOriginal.height * escala)
      );

      const contexto = canvas.getContext("2d");

      if (!contexto) {
        mostrarMensaje(
          mensajePlanta,
          "No se pudo procesar la fotografía.",
          "error"
        );
        return;
      }

      contexto.drawImage(
        imagenOriginal,
        0,
        0,
        canvas.width,
        canvas.height
      );

      let imagenReducida;

      try {
        imagenReducida = canvas.toDataURL(
          "image/jpeg",
          0.72
        );
      } catch (error) {
        mostrarMensaje(
          mensajePlanta,
          "No se pudo comprimir la fotografía.",
          "error"
        );
        return;
      }

      const nuevaPlanta = {
        id: Date.now().toString() +
          Math.random().toString(16).slice(2),
        nombre: nombre,
        especie: especie,
        fechaRiego: fechaRiego,
        frecuencia: frecuencia,
        observaciones: observaciones,
        imagen: imagenReducida
      };

      plantas.push(nuevaPlanta);

      if (!guardarPlantas()) {
        plantas.pop();
        return;
      }

      mostrarPlantas();
      formularioPlanta.reset();

      document.getElementById("frecuencia").value = 3;

      mostrarMensaje(
        mensajePlanta,
        "¡Planta registrada y guardada correctamente!",
        "exito"
      );
    };

    imagenOriginal.src = lector.result;
  };

  lector.readAsDataURL(archivoImagen);
});

// Al abrir la página se muestra únicamente el inicio de sesión.
authSection.hidden = false;
appSection.hidden = true;
mostrarInicio();