const express = require("express");
const _ = require("underscore");
const uuidv4 = require("uuid/v4");
const middValidarUsuario = require("./usuarios.middleware").validarUsuario;
const middValidarLogin = require("./usuarios.middleware").validarLogin;
const middValidarLetra = require("./usuarios.middleware")
  .trasnformBodyToLowerCase;
const usersRouter = express.Router();
const log = require("../../../utils/logger");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../../../config");
const userController = require("../usuarios/usuario.controller");
const usuarioController = require("../usuarios/usuario.controller");
const errorHandler = require("../../libs/errorHandler");
const {
  DatosEnUso,
  CredencialesIncorrectas,
} = require("../usuarios/usuarios.error");

usersRouter.get(
  "/",
  errorHandler.processErrors((req, res) => {
    return userController.getUsers().then((users) => {
      res.json(users);
    });
  })
);

usersRouter.post(
  "/",
  [middValidarUsuario, middValidarLetra],
  async (req, res) => {
    let newUser = req.body;
    let userExists;

    try {
      userExists = await userController.userExists(
        newUser.username,
        newUser.email
      );
      console.log(userExists);
      if (userExists) {
        log.warn(
          `Email ${newUser.email} o username ${newUser.username} ya existen en la base de datos`
        );
        res
          .status(409)
          .send("El email o usuario ya existen en la base de datos.");
        return;
      }

      bcrypt.hash(newUser.password, 10, (err, hashedPassword) => {
        if (err) {
          log.error("Error al tratar de obtener el hash de la contraseña", err);
          res.status(500).send("Error creando al usuario.");
        } else {
          userController
            .createUser(newUser, hashedPassword)
            .then((newUser) => {
              log.info("Nuevo producto agregado", newUser.toObject());
              res.status(201).send(newUser);
            })
            .catch((err) => {
              log.error("Error ocurrió al tratar de crear nuevo usuario", err);
              res
                .status(500)
                .send("Error ocurrio al tratar de crear nuevo usuario");
            });
        }
      });
    } catch (error) {
      log.error(
        `Error al tratar de verificar si usuario ${newUser.username} con email ${newUser.email} ya existe.`
      );
      res.status(500).send("Error al crear un nuevo usuario.");
    }
  }
);

usersRouter.post(
  "/login",
  [middValidarLogin, middValidarLetra],
  async (req, res) => {
    let userNotAuthenticated = req.body;
    let userRegistered;

    try {
      userRegistered = await usuarioController.getUser({
        username: userNotAuthenticated.username,
      });
    } catch (error) {
      log.error(
        `Error al buscar si el usuario ${userNotAuthenticated.username} ya existe`,
        err
      );
      res.status(500).send("Error durante el proceso del login.");
      return;
    }

    if (!userRegistered) {
      log.info(`Usuario ${userNotAuthenticated.username} no existe.`);
      res
        .status(400)
        .send(
          "Credenciales incorrectas. Escribe el username y contraseña correctas"
        );
    } else {
      let correctPassword;
      try {
        correctPassword = await bcrypt.compare(
          userNotAuthenticated.password,
          userRegistered.password
        );
      } catch (error) {
        log.error(
          "Error al tratar de verificar si la contraseña es correcta",
          error
        );
        res.status(500).send("Error durante el proceso del login.");
        return;
      }

      if (correctPassword) {
        //Generar y enviar Token
        let token = jwt.sign({ id: userRegistered.id }, config.jwt.secret, {
          expiresIn: config.jwt.expirationTime,
        });
        log.info(
          `Usuario ${userNotAuthenticated.username} completó autenticación exitosamente.`
        );
        res.status(200).json({ token });
      } else {
        log.info(
          `Usuario ${userNotAuthenticated.username} no completo la autenticación, contraseña incorrecta.`
        );
        res
          .status(400)
          .send(
            "Credenciales incorrectas. Asegurate que el username y contraseña sean correctas."
          );
      }
    }
  }
);

module.exports = usersRouter;
