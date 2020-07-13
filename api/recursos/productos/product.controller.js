const Product = require("./products.model");

const getProducts = () => {
  return Product.find({});
};

function createProduct(product, owner) {
  return new Product({ ...product, owner }).save();
}

module.exports = {
  createProduct,
  getProducts,
};
