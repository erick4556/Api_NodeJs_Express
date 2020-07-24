const mongoose = require("mongoose");
const log = require("../../utils/logger");

const processErrors = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch(next); //Con catch(next) se lo paso a la siguiente función en la cadena
  };
};

const processErrorsDb = (err, req, res, next) => {
  //Saber si el error es de base de dato
  if (err instanceof mongoose.Error || err.name === "MongoError") {
    log.error("Ocurrió un error relacionado a mongoose.", err);
    //Agrego dos propiedades a err
    err.message =
      "Error relacionado a la base de datos ocurrió inesperadamente.";
    err.status = 500;
  }
  next(err); //le paso el error a la siguiente función en la cadena
};

const errorsInProduction = (err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    message: err.message,
  });
};

const errorsInDevelopment = (err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    stack: err.stack || "", //Detalla el error
  });
};

module.exports = {
  processErrors,
  processErrorsDb,
  errorsInProduction,
  errorsInDevelopment,
};
