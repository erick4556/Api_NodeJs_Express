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
const errorHandler = require("../../libs/errorHandler");
const {
  ProductoNoExiste,
  UsuarioNoEsDuen,
} = require("../productos/productos.error");
const { processErrors } = require("../../libs/errorHandler");

productsRouter.get(
  "/",
  errorHandler.processErrors((req, res) => {
    return productController.getProducts().then((products) => {
      res.json(products);
    });
  })
);

productsRouter.post(
  "/",
  [jwtAuth, middValidarProducto.validarPorducto],
  errorHandler.processErrors((req, res) => {
    return productController
      .createProduct(req.body, req.user.username)
      .then((product) => {
        log.info("Nuevo producto agregado", product.toObject());
        res.status(201).json(product);
      });
  })
);

productsRouter.get(
  "/:id",
  productosMiddleware.validarId,
  errorHandler.processErrors((req, res) => {
    let id = req.params.id;
    return productController.getProductId(id).then((product) => {
      if (!product)
        throw new ProductoNoExiste(`El producto con id ${id} no existe`);
      //res.status(404).send(`El producto con id ${req.params.id} no existe`);

      res.status(200).json(product);
    });
  })
);

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
      //throw new ProductoNoExiste(`El producto con id ${id} no existe`);
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

        /* throw new UsuarioNoEsDuen(
          `No eres dueño del producto con id ${id}. Solo puedes editar productos creados por ti.`
        ); */
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
            log.error(`Error al editar el producto con id ${id}`, err);
            res.status(500).send(`Error al editar el producto con id ${id}`);
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
      // throw new ProductoNoExiste(`El producto con id ${id} no existe`);
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
        /* throw new UsuarioNoEsDuen(
          `No eres dueño del producto con id ${id}. Solo puedes eliminar productos creados por ti.`
        ); */
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

productsRouter.put(
  "/:id/image",
  middValidarProducto.validarImagen,
  errorHandler.processErrors(async (req, res) => {
    log.info("Request para subir imagen", req.body);
    res.json({ url: "updated" });
  })
);

module.exports = productsRouter;
