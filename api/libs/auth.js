const log = require("./../../utils/logger");
const passportJWT = require("passport-jwt");
const config = require("../../config");
const userController = require("../recursos/usuarios/usuario.controller");

let jwtOptions = {
  secretOrKey: config.jwt.secret, //Se necesita el secreto de la ruta de usuarios para descifrar el token
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(), //Busca el token en el header del request que es un bearer
};

const jwtStrategy = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {
  //jwtPayload es el token decifrado

  userController
    .getUser({ id: jwtPayload.id })
    .then((user) => {
      if (!user) {
        log.info(
          `JWT token no es válido. Usuario con id ${jwtPayload.id} no existe.`
        );
        next(null, false);
      } else {
        log.info(
          `Usuario ${user.username} suministró token válido. Autenticación completada.`
        );
        next(null, {
          id: user.id,
          username: user.username,
        });
      }
    })
    .catch((err) => {
      log.error("Error al tratar de validar el token.", err);
      next(err);
    });
});

module.exports = jwtStrategy;
