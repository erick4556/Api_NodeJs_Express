const Joi = require("@hapi/joi");

const blueprintProducto = Joi.object({
  titulo: Joi.string().max(100).required(),
  precio: Joi.number().positive().precision(2).required(), //precision es para los decimales
  moneda: Joi.string().length(3).uppercase(), //length se dice que es estrictamente tiene que se de ese tamaño
}); //Guardar como se ve un objeto válido

//Middleware
const validarPorducto = (req, res, netx) => {
  let result = blueprintProducto.validate(req.body, {
    abortEarly: false,
    convert: false,
  }); //abortEarly: false, para que muestre todos los errores, conver, para que no convierta los decimales
  if (result.error === undefined) {
    netx(); //Middleware, ya puede serguir avanzando
  } else {
    let errors = result.error.details.reduce((i, error) => {
      return i + `[${error.message}]`;
    }, ""); //El string vacio es lo que primero se le asigna a "i"
    console.log(errors);
    res.status(400).send(errors);
  }
};

module.exports = {
  validarPorducto,
};
