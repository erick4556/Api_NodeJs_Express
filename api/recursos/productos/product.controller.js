const Product = require("./products.model");

const getProducts = () => {
  return Product.find({});
};

function createProduct(product, owner) {
  //return Promise.reject("Prueba de falla!!");
  return new Product({ ...product, owner }).save();
}

const getProductId = (id) => {
  return Product.findById(id);
};

const editProduct = (id, product, username) => {
  return Product.findOneAndUpdate(
    { _id: id },
    { ...product, owner: username },
    {
      new: true, //Permite que una vez que haya hecho el update, que retorne el objeto modificado.
    }
  );
};

const deleteProduct = (id) => {
  return Product.findByIdAndRemove(id);
};

module.exports = {
  createProduct,
  getProducts,
  getProductId,
  editProduct,
  deleteProduct,
};
