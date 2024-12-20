document.getElementById("mostrarInformacion").addEventListener("click", mostrarInformacion);

// Obtener el nombre de la persona desde la URL
function obtenerNombreDesdeURL() {
  const url = window.location.href;  // Obtener la URL completa
  const regex = /\/([^\/&]+)&/;  // Expresión regular para capturar el nombre entre el último '/' y '&'
  const match = url.match(regex);  // Buscar coincidencias en la URL
  
  if (match && match[1]) {
    return match[1];  // Si se encuentra, devolver el nombre
  } else {
    return null;  // Si no se encuentra, devolver null
  }
}

function mostrarInformacion() {
  const nombreUsuario = obtenerNombreDesdeURL();  // Obtener el nombre del parámetro en la URL
  
  // Verificar que el nombre esté presente en la URL
  if (!nombreUsuario) {
    alert("No se ha encontrado el nombre en la URL.");
    return;
  }

  fetch('data/amigos.csv')  // Ruta al archivo CSV dentro del repositorio
    .then(response => response.text())
    .then(data => {
      // Procesar el archivo CSV y buscar el amigo secreto
      const amigos = procesarCSV(data);
      const amigoSecreto = obtenerAmigoSecreto(amigos, nombreUsuario);

      // Mostrar la información
      if (amigoSecreto) {
        document.getElementById("nombreAmigo").innerText = `Amigo Secreto: ${amigoSecreto.amigoSecreto}`;
        document.getElementById("codigoAmigo").innerText = `Código: ${amigoSecreto.codigo}`;
        document.getElementById("descripcionAmigo").innerText = amigoSecreto.descripcion || 'No hay descripción';
      } else {
        alert("No se encontró el amigo secreto para este nombre.");
      }
    })
    .catch(error => console.error('Error al cargar el archivo CSV:', error));
}

// Función para procesar el archivo CSV y convertirlo en un array de objetos
function procesarCSV(csv) {
  const filas = csv.split('\n');  // Dividir las filas
  const amigos = [];

  for (let i = 0; i < filas.length; i++) {
    const celdas = filas[i].split(',');  // Dividir las celdas por comas
    if (celdas.length >= 4) {  // Asegurarse de que haya al menos 4 celdas (nombre, código, amigoSecreto, descripcion)
      amigos.push({
        nombre: celdas[0].trim(),
        codigo: celdas[1].trim(),
        amigoSecreto: celdas[2].trim(),
        descripcion: celdas[3] ? celdas[3].trim() : ''
      });
    }
  }

  return amigos;
}

// Función para obtener el amigo secreto basado en el nombre del usuario
function obtenerAmigoSecreto(amigos, nombreUsuario) {
  return amigos.find(amigo => amigo.nombre === nombreUsuario);  // Buscar al amigo que tenga el mismo nombre
}
