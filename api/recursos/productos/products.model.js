const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, "Producto debe tener título"],
  },
  precio: {
    type: Number,
    min: 0,
    required: [true, "Producto debe tener un precio"],
  },
  moneda: {
    type: String,
    maxlength: 3,
    minlength: 3,
    required: [true, "Producto debe tener una moneda."],
  },
  owner: {
    type: String,
    required: [true, "Producto debe tener una propietario."],
  },
});

module.exports = mongoose.model("products", productSchema);
