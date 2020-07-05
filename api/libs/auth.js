const _ = require("underscore");
const log = require("./../../utils/logger");
const usuarios = require("./../../databaseArr").usuarios;
const bcrypt = require("bcrypt");

const authFunction = (username, password, done) => {
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
};

module.exports = authFunction;
