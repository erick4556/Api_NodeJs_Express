const Joi = require("@hapi/joi");
const log = require("../../../utils/logger");
const fileType = require("file-type");

const blueprintProducto = Joi.object({
  titulo: Joi.string().max(100).required(),
  precio: Joi.number().positive().precision(2).required(), //precision es para los decimales
  moneda: Joi.string().length(3).uppercase().required(), //length se dice que estrictamente tiene que ser de ese tamaño
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

const validarId = (req, res, next) => {
  let id = req.params.id;
  if (id.match(/^[a-fA-F0-9]{24}$/) === null) {
    res.status(401).send(`El id ${id} suministrado en el URL no es válido.`);
  } else {
    next();
  }
};

const CONTENT_TYPES_PERMITIDOS = ["image/jpeg", "image/jpg", "image/png"];
const validarImagen = (req, res, next) => {
  let contentType = req.get("content-type");
  if (!CONTENT_TYPES_PERMITIDOS.includes(contentType)) {
    log.warn(
      `Request para modificar imagen de producto con id [${req.params.id}] no tiene content-type valido [${contentType}]`
    );
    res
      .status(400)
      .send(
        `Archivos de tipo ${contentType} no son soportados. Usar uno de ${CONTENT_TYPES_PERMITIDOS.join(
          ", "
        )}`
      );
    return;
  }

  let fileInfo = fileType(req.body); //Para verificar si la imagen es segura
  console.log(fileInfo);
  if (!CONTENT_TYPES_PERMITIDOS.includes(fileInfo.mime)) {
    const message = `Disparidad entre content-type [${contentType}] y tipo de archivo [${fileInfo.ext}]. Request no será procesado`;
    log.warn(
      `${message}. Request dirigido a producto con id [${req.params.id}].`
    );
    res.status(400).send(message);
    return;
  }

  req.fileExtension = fileInfo.ext;
  next();
};

module.exports = {
  validarPorducto,
  validarId,
  validarImagen,
};
