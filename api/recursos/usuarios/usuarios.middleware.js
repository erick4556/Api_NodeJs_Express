const Joi = require("@hapi/joi");
const log = require("../../../utils/logger");

const blueprintUsuario = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).max(200).required(),
  email: Joi.string().email().required(),
});

const validarUsuario = (req, res, next) => {
  const resultado = blueprintUsuario.validate(req.body, {
    abortEarly: false,
    convert: false,
  });
  if (resultado.error === undefined) {
    next();
  } else {
    console.log(
      "Error",
      resultado.error.details.map((err) => err.message)
    );
    log.info(
      "Falló la validación del usuario ",
      resultado.error.details.map((err) => err.message)
    );
    res
      .status(400)
      .send("Información del usuario no cumple con los requisitos.");
  }
};

module.exports = {
  validarUsuario,
};
