class ProductoNoExiste extends Error {
  constructor(message) {
    super(message);
    this.message = message || "Producto no existe.";
    this.status = 404;
    this.name = "ProductoNoExiste";
  }
}

class UsuarioNoEsDuen extends Error {
  constructor(message) {
    super(message);
    this.message = message || "No eres dueño del producto.";
    this.status = 401;
    this.name = "UsuarioNoEsDuen";
  }
}

module.exports = {
  ProductoNoExiste,
  UsuarioNoEsDuen,
};
