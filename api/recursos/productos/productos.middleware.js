const Joi = require("@hapi/joi");
const log = require("../../../utils/logger");

const blueprintProducto = Joi.object({
  titulo: Joi.string().max(100).required(),
  precio: Joi.number().positive().precision(2).required(), //precision es para los decimales
  moneda: Joi.string().length(3).uppercase(), //length se dice que estrictamente tiene que ser de ese tamaño
}); //Guardar como se ve un objeto válido

//Middleware
const validarPorducto = (req, res, next) => {
  let result = blueprintProducto.validate(req.body, {
    abortEarly: false,
    convert: false,
  }); //abortEarly: false, para que muestre todos los errores, conver, para que no convierta los decimales
  if (result.error === undefined) {
    next(); //Middleware, ya puede serguir avanzando
  } else {
    let errors = result.error.details.reduce((i, error) => {
      return i + `[${error.message}]`;
    }, ""); //El string vacio es lo que primero se le asigna a "i"

    log.warn("El siguiente producto no paso la validación", req.body, errors);
    console.log(errors);
    res.status(400).send(errors);
  }
};

module.exports = {
  validarPorducto,
};
