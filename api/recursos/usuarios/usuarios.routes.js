const express = require("express");
const _ = require("underscore");
const uuidv4 = require("uuid/v4");
const usuarios = require("../../../databaseArr").usuarios;
const middValidarUsuario = require("./usuarios.middleware").validarUsuario;
const middValidarLogin = require("./usuarios.middleware").validarLogin;
const usersRouter = express.Router();
const log = require("../../../utils/logger");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

usersRouter.get("/", (req, res) => {
  res.json(usuarios);
});

usersRouter.post("/", middValidarUsuario, (req, res) => {
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
          id: uuidv4(),
          username: newUser.username,
          email: newUser.email,
          password: hashedPassword,
        });
        res.status(201).json("Usuario creado exitosamente.");
      }
    }); //10 es la cantidad de rondas de hash del password
  }
});

usersRouter.post("/login", middValidarLogin, (req, res) => {
  let userNotAuthenticated = req.body;

  let index = _.findIndex(
    usuarios,
    (usuario) => usuario.username === userNotAuthenticated.username
  );

  if (index === -1) {
    log.info(`Usuario ${userNotAuthenticated.username} no existe.`);
    res.status(400).send("Credenciales incorrectas. El usuario no existe.");
  } else {
    let hashedPassword = usuarios[index].password;
    bcrypt.compare(
      userNotAuthenticated.password,
      hashedPassword,
      (err, iguales) => {
        if (iguales) {
          //Generar y enviar Token
          let token = jwt.sign(
            { id: usuarios[index].id },
            "secreto",
            { expiresIn: 86400 } //Válido por 24 horas el token }
          );
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
    );
  }
});

module.exports = usersRouter;
