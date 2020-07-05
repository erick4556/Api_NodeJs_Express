const express = require("express");
const _ = require("underscore");
const uuidv4 = require("uuid/v4");
const usuarios = require("../../../databaseArr").usuarios;
const middValidarUsuario = require("./usuarios.middleware");
const usersRouter = express.Router();
const log = require("../../../utils/logger");
const bcrypt = require("bcrypt");

usersRouter.get("/", (req, res) => {
  res.json(usuarios);
});

usersRouter.post("/", middValidarUsuario.validarUsuario, (req, res) => {
  let newUser = req.body;

  let indice = _.findIndex(usuarios, (usuario) => {
    return (
      usuario.username === newUser.username || usuario.email === newUser.email
    );
  });

  if (indice !== -1) {
    log.info("Email o username ya existe.");
    res.status(409).send("El email o username ya existe.");
  } else {
    bcrypt.hash(newUser.password, 10, (err, hashedPassword) => {
      if (err) {
        log.error("Error al obtener el hash de una constraseña.", err);
        res.status(500).send("Ocurrió un error creando al usuario");
      } else {
        usuarios.push({
          username: newUser.username,
          email: newUser.email,
          password: hashedPassword,
        });
        res.status(201).json("Usuario creado exitosamente.");
      }
    }); //10 es la cantidad de rondas de hash del password
  }
});

module.exports = usersRouter;
