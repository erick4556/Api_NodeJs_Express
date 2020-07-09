const express = require("express");
const _ = require("underscore");
const uuidv4 = require("uuid/v4");
const productEjem = require("../../../databaseArr").productEjem;
const middValidarProducto = require("./productos.middleware");
const productsRouter = express.Router();
const log = require("../../../utils/logger");
const passport = require("passport");
const jwtAuth = passport.authenticate("jwt", { session: false });
//Ejemplo usando un arreglo

productsRouter.get("/", (req, res) => {
  res.json(productEjem);
});

productsRouter.post(
  "/",
  [jwtAuth, middValidarProducto.validarPorducto],
  (req, res) => {
    let newProduct = {
      ...req.body,
      id: uuidv4(),
      owner: req.user.username,
    };

    productEjem.push(newProduct);
    log.info("Nuevo producto agregado", newProduct);
    res.status(201).json(newProduct);
  }
);

productsRouter.get("/:id", (req, res) => {
  for (let producto of productEjem) {
    if (producto.id === req.params.id) {
      res.json(producto);
      return;
    }
  }
  res.status(404).send(`El producto con id ${req.params.id} no existe`);
});

productsRouter.put(
  "/:id",
  [jwtAuth, middValidarProducto.validarPorducto],
  (req, res) => {
    let reemplazoProducto = {
      ...req.body,
      id: req.params.id,
      owner: req.user.username,
    };

    let indice = _.findIndex(
      productEjem,
      (product) => product.id === reemplazoProducto.id
    ); //Encuentra el indice del array productEjem

    if (indice !== -1) {
      if (productEjem[indice].owner !== reemplazoProducto.owner) {
        log.info(
          `Usuario ${req.user.username} no es dueño del producto con id ${reemplazoProducto.id}. Dueño real es ${productEjem[indice].owner}.`
        );
        res
          .status(401)
          .send(
            `No eres dueño del producto con id ${reemplazoProducto.id}. Solo puedes modificar productos creados por ti.`
          );
      } else {
        productEjem[indice] = reemplazoProducto;
        log.info(
          `El producto con id ${reemplazoProducto.id} fue reemplazado`,
          reemplazoProducto
        );
        res.status(200).send(reemplazoProducto);
      }
    } else {
      log.warn(`El producto con id ${reemplazoProducto.id} no existe`);
      res
        .status(404)
        .send(`El producto con id ${reemplazoProducto.id} no existe`);
    }
  }
);

productsRouter.delete("/:id", jwtAuth, (req, res) => {
  let indiceBorrar = _.findIndex(
    productEjem,
    (product) => product.id === req.params.id
  );
  if (indiceBorrar === -1) {
    log.warn(`El producto con id ${req.params.id} no existe`);
    res.status(404).send(`El producto con id ${req.params.id} no existe`);
    return;
  } else {
    if (productEjem[indiceBorrar].owner !== req.user.username) {
      log.info(
        `Usuario ${req.user.username} no es dueño del producto con id ${productEjem[indiceBorrar].id}. Dueño real es ${productEjem[indiceBorrar].owner}.`
      );
      res
        .status(401)
        .send(
          `No eres dueño del producto con id ${productEjem[indiceBorrar].id}. Solo puedes eliminar productos creados por ti.`
        );
    } else {
      log.warn(`El producto con id ${req.params.id} fue borrado`);
      let borrado = productEjem.splice(indiceBorrar, 1);
      res.json(borrado);
    }
  }
});

//Fin de ejemplo

module.exports = productsRouter;
