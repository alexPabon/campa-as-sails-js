document.addEventListener('DOMContentLoaded', () => {
  let generatePass = document.getElementById('generatedPassword');
  if(generatePass) {
    generatePass.addEventListener('click', function () {
      let password = generateRandomPassword();
      let formContainer = this.closest('form');

      if (formContainer) {
        const passwordInput = formContainer.querySelector('input[name="password"]');
        if (passwordInput) {
          passwordInput.value = password;
        }
      }

      console.log(password);

    });
  }
});

function generateRandomPassword(charLength=12) {
  // Implementa aquí tu lógica para generar una contraseña aleatoria
  // Puedes utilizar librerías como "crypto-random-string" o generar una cadena aleatoria utilizando caracteres y longitud específica

  // Ejemplo de generación de contraseña aleatoria de 8 caracteres
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  var password = '';

  for (var i = 0; i < charLength; i++) {
    var randomIndex = Math.floor(Math.random() * characters.length);
    password += characters.charAt(randomIndex);
  }

  return password;
}
