const _ = require("underscore");
const log = require("./../../utils/logger");
const usuarios = require("./../../databaseArr").usuarios;
const bcrypt = require("bcrypt");
const passportJWT = require("passport-jwt");

let jwtOptions = {
  secretOrKey: "secreto", //Se necesita el secreto de la ruta de usuarios para descifrar el token
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(), //Busca el token en el header del request que es un bearer
};

const jwtStrategy = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {
  //jwtPayload es el token decifrado
  let index = _.findIndex(usuarios, (usuario) => usuario.id === jwtPayload.id);
  if (index === -1) {
    log.info(
      `JWT token no es válido. Usuario con id ${jwtPayload.id} no existe.`
    );
    next(null, false);
  } else {
    log.info(
      `Usuario ${usuarios[index].username} suministró token válido. Autenticación completada.`
    );
    next(null, {
      id: usuarios[index].id,
      username: usuarios[index].username,
    });
  }
});

/* const authFunction = (username, password, done) => {
  let index = _.findIndex(usuarios, (usuario) => usuario.username === username);

  if (index === -1) {
    log.info(`Usuario ${username} no existe.`);
    done(null, false);
  } else {
    let hashedPassword = usuarios[index].password;
    bcrypt.compare(password, hashedPassword, (err, iguales) => {
      if (iguales) {
        log.info(`Usuario ${username} completó la autenticación.`);
        done(null, true);
      } else {
        log.info(
          `Usuario ${username} no completo la autenticación, contraseña incorrecta.`
        );
        done(null, false);
      }
    }); //Comparo las dos contraseñas
  }
}; */

module.exports = jwtStrategy;
