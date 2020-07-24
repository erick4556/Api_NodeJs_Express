class DatosEnUso extends Error {
  constructor(message) {
    super(message);
    this.message =
      message || "El email o usuario ya están asociados con una cuneta.";
    this.status = 409;
    this.name = "DatosEnUso";
  }
}

class CredencialesIncorrectas extends Error {
  constructor(message) {
    super(message);
    this.message =
      message ||
      "Credenciales incorrectas. Escribe el username y contraseña correctas";
    this.status = 400;
    this.name = "CredencialesIncorrectas";
  }
}

module.exports = {
  DatosEnUso,
  CredencialesIncorrectas,
};
