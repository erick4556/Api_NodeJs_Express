const express = require("express");
const _ = require("underscore");
const uuidv4 = require("uuid/v4");
const middValidarProducto = require("./productos.middleware");
const productsRouter = express.Router();
const log = require("../../../utils/logger");
const passport = require("passport");
const jwtAuth = passport.authenticate("jwt", { session: false });
const productController = require("./product.controller");
const productosMiddleware = require("./productos.middleware");

productsRouter.get("/", (req, res) => {
  productController
    .getProducts()
    .then((products) => {
      res.json(products);
    })
    .catch((err) => {
      err
        .status(500)
        .send("Error al obtener los productos de la base de datos.");
    });
});

productsRouter.post(
  "/",
  [jwtAuth, middValidarProducto.validarPorducto],
  (req, res) => {
    productController
      .createProduct(req.body, req.user.username)
      .then((product) => {
        log.info("Nuevo producto agregado", product.toObject());
        res.status(201).json(product);
      })
      .catch((err) => {
        log.error("Producto no pudo ser creado", err);
        res.status(500).send({
          error: "Error al tratar de crear el producto",
        });
      });
  }
);

productsRouter.get("/:id", productosMiddleware.validarId, (req, res) => {
  let id = req.params.id;
  productController
    .getProductId(id)
    .then((product) => {
      if (!product) {
        res.status(404).send(`El producto con id ${req.params.id} no existe`);
      } else {
        res.status(200).json(product);
      }
    })
    .catch((err) => {
      log.error(`Error al tratar de obtener el producto con id: ${id} `, err);
      res
        .status(500)
        .send(`Error al tratar de obtener el producto con id: ${id} `);
    });
});

productsRouter.put(
  "/:id",
  [jwtAuth, middValidarProducto.validarPorducto],
  async (req, res) => {
    let id = req.params.id;
    let authenticatedUser = req.user.username;
    let productToReplace;

    try {
      productToReplace = await productController.getProductId(id);
      console.log(productToReplace);
    } catch (error) {
      log.error(`Error al tratar de editar el producto con id: ${id} `, error);
      res.status(500).send(`Error al editar el producto con id: ${id}`);
      return;
    }

    if (!productToReplace) {
      log.info(`El producto con id ${id} no existe`);
      res.status(404).send(`El producto con id ${id} no existe`);
    } else {
      if (productToReplace.owner !== authenticatedUser) {
        log.info(
          `Usuario ${authenticatedUser} no es dueño del producto con id ${id}. Dueño real es ${productToReplace.owner}.`
        );
        res
          .status(401)
          .send(
            `No eres dueño del producto con id ${id}. Solo puedes editar productos creados por ti.`
          );
      } else {
        productController
          .editProduct(id, req.body, authenticatedUser)
          .then((product) => {
            log.info(
              `El producto con id ${id} fue modificado`,
              product.toObject()
            );
            res.send(product);
          })
          .catch((err) => {
            log.error(`Error al borrar el producto con id ${id}`, err);
            res.status(500).send(`Error al borrar el producto con id ${id}`);
          });
      }
    }
  }
);

productsRouter.delete(
  "/:id",
  [jwtAuth, productosMiddleware.validarId],
  async (req, res) => {
    let id = req.params.id;
    let productToDelete;

    try {
      productToDelete = await productController.getProductId(id);
      console.log(productToDelete);
    } catch (error) {
      log.error(
        `Error al tratar de eliminar el producto con id: ${id} `,
        error
      );
      res.status(500).send(`Error al eliminar el producto con id: ${id}`);
      return;
    }

    if (!productToDelete) {
      log.info(`El producto con id ${id} no existe`);
      res.status(404).send(`El producto con id ${id} no existe`);
    } else {
      let authenticatedUser = req.user.username;
      if (productToDelete.owner !== authenticatedUser) {
        log.info(
          `Usuario ${authenticatedUser} no es dueño del producto con id ${id}. Dueño real es ${productToDelete.owner}.`
        );
        res
          .status(401)
          .send(
            `No eres dueño del producto con id ${id}. Solo puedes eliminar productos creados por ti.`
          );
      } else {
        try {
          let productDeleted = await productController.deleteProduct(id);
          log.info(`El producto con id ${id} fue borrado`);
          res.json(productDeleted);
        } catch (error) {
          res.status(500).send(`Error al borrar el producto con id ${id}`);
        }
      }
    }
  }
);

module.exports = productsRouter;
