//let auth2;

// Inicializar la API de Google y la autenticación
/*function initGoogleAPI() {
  console.log("La API de Google se está cargando...");
  gapi.load('client:auth2', initAuth); // Aquí se carga la autenticación y la API
}*/

// Inicializar la autenticación de Google OAuth2
/*function initAuth() {
  console.log("Autenticación de Google iniciada...");
  gapi.auth2.init({
    client_id: '356174108484-cn1o3ant9648cemlkr333b6u0eu6g94o.apps.googleusercontent.com',  // Reemplaza esto con tu Client ID de OAuth 2.0
  }).then(function() {
    auth2 = gapi.auth2.getAuthInstance();
    console.log('Autenticación inicializada');
    
    // Ahora que la autenticación está lista, inicializa la API de Google Sheets
    initSheetsAPI();
  });
}*/
// Inicializar la autenticación de Google usando Google Identity Services (GIS)
function initAuth() {
  console.log("Autenticación de Google iniciada...");

  // Reemplaza '356174108484-cn1o3ant9648cemlkr333b6u0eu6g94o.apps.googleusercontent.com' con tu client ID
  google.accounts.id.initialize({
    client_id: '356174108484-cn1o3ant9648cemlkr333b6u0eu6g94o.apps.googleusercontent.com',  // Tu ID de cliente de OAuth 2.0
    callback: handleCredentialResponse  // Función que maneja la respuesta de la autenticación
  });

  // Renderiza el botón de inicio de sesión
  google.accounts.id.renderButton(
    document.getElementById("googleSignInButton"), // El contenedor del botón
    { theme: "outline", size: "large" } // Opciones de diseño para el botón
  );
}

// Callback que maneja la respuesta después de que el usuario inicie sesión
function handleCredentialResponse(response) {
  console.log("ID Token:", response.credential);

  // Aquí puedes hacer algo con el token ID, como verificar la autenticación
  // y luego inicializar la API de Google Sheets.
  // Si tienes el ID token, lo puedes usar para autenticación con tu backend
  initSheetsAPI(response.credential); // Usamos el ID token para autenticar con Sheets
}

// Inicializar la API de Google Sheets
/*function initSheetsAPI() {
  console.log("API de Google Sheets cargada...");
  gapi.client.load('sheets', 'v4', function() {
    console.log('API de Sheets cargada correctamente');
  });
}*/
function initSheetsAPI(idToken) {
  gapi.client.init({
    apiKey: 'AIzaSyA43cgs6m9Cb_4Klamy9m5HO6Zapre3_10',
    clientId: '356174108484-cn1o3ant9648cemlkr333b6u0eu6g94o.apps.googleusercontent.com',
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    access_token: idToken  // Usa el ID token aquí
  }).then(function() {
    console.log("API de Sheets cargada correctamente");
  }).catch(function(error) {
    console.error("Error al cargar la API de Sheets", error);
  });
}


// Función para obtener el amigo secreto desde Google Sheets
function obtenerAmigoSecreto(nombre) {
  return new Promise((resolve, reject) => {
    if (gapi.client.sheets) {
      console.log("Haciendo solicitud a Google Sheets...");
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1yy3piHXjzUPZ-VEQFsE1-CFgNf99o1eSLeqm28tlptU',  // Tu ID de hoja de Google Sheets
        range: 'Usuarios!A2:C'  // Rango de celdas donde está el nombre y el amigo secreto
      }).then((response) => {
        const rows = response.result.values;
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (row[0] === nombre) {
            resolve(row[2]);  // La columna C tiene el nombre del amigo secreto
            return;
          }
        }
        reject('Nombre no encontrado');
      }).catch((error) => {
        reject('Error al acceder a la hoja de Google Sheets: ' + error.message);
      });
    } else {
      reject('API de Sheets no está disponible.');
    }
  });
}

// Mostrar el formulario para ingresar la descripción
function mostrarFormulario() {
    document.getElementById('formulario').style.display = 'block';
  }

// Función para actualizar la descripción en Google Sheets
function actualizarDescripcionEnSheet(nombre, descripcion) {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1yy3piHXjzUPZ-VEQFsE1-CFgNf99o1eSLeqm28tlptU',
    range: 'Usuarios!A2:D'  // Leemos todas las filas de A a D
  }).then((response) => {
    const rows = response.result.values;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] === nombre) {
        const rowIndex = i + 2;  // Las filas en Google Sheets comienzan desde la fila 2
        const range = `Usuarios!D${rowIndex}`;
        const requestData = {
          spreadsheetId: '1yy3piHXjzUPZ-VEQFsE1-CFgNf99o1eSLeqm28tlptU',
          range: range,
          valueInputOption: 'RAW',
          resource: {
            values: [
              [descripcion]
            ]
          }
        };

        gapi.client.sheets.spreadsheets.values.update(requestData).then((response) => {
          console.log('Descripción actualizada', response);
        }, (error) => {
          console.error('Error al actualizar la descripción', error);
        });
        break;
      }
    }
  }).catch((error) => {
    console.error('Error al obtener las filas', error);
  });
}

// Obtener el nombre desde la URL
const urlParams = new URLSearchParams(window.location.search);
const nombre = urlParams.get('nombre');  // Ejemplo: "Ana"
//const codigo = urlParams.get('codigo');  // Ejemplo: "GT4R5"

// Mostrar la información cuando el usuario hace clic en "Mostrar Información"
function mostrarInformacion() {
  // Mostrar el nombre de la persona
  document.getElementById('nombre').innerText = "Nombre: " + nombre;

  // Buscar el nombre en Google Sheets para obtener el nombre del amigo secreto
  obtenerAmigoSecreto(nombre)
    .then(amigoSecreto => {
      // Mostrar el amigo secreto en la página
      document.getElementById('amigoSecreto').innerText = "Amigo Secreto: " + amigoSecreto;

      // Mostrar la foto y la información
      document.getElementById('foto').src = `./img/SS.png`; // Foto predeterminada
      document.getElementById('informacion').style.display = 'block';
    })
    .catch(error => {
      console.error('Error al obtener amigo secreto:', error);
    });
}

// Función para mostrar/ocultar el menú
function toggleMenu() {
  const menu = document.getElementById('menu');
  menu.classList.toggle('show'); // Cambia entre mostrar y ocultar el menú
}

// Llamar la función para inicializar Google API cuando la página cargue
//window.onload = initGoogleAPI;
window.onload = initAuth;