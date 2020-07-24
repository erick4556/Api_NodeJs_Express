const express = require("express");
const bodyParser = require("body-parser");
const productsRouter = require("./api/recursos/productos/productos.routes");
const usersRouter = require("./api/recursos/usuarios/usuarios.routes");
const logger = require("./utils/logger");
const morgan = require("morgan");
const authJWT = require("./api/libs/auth");
const passport = require("passport");
const config = require("./config");
const mongoose = require("mongoose");
const errorHandler = require("./api/libs/errorHandler");

passport.use(authJWT);

mongoose.connect("mongodb://127.0.0.1:27017/sellProducts");
mongoose.connection.on("error", () => {
  logger.error("Falló la conexión a mongodb");
  process.exit(1); //Mata el proceso de node
});

const app = express();

app.use(bodyParser.json());
app.use(
  morgan("short", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
); //morgan se encarga de hacer logs relacionado al request. Le paso el formato en el que quiero que sean emitidos los logs y un objeto de configuración.

app.use(passport.initialize()); // Le digo a express que use passport

app.use("/products", productsRouter);
app.use("/users", usersRouter);

//Manejo de errores para las rutas
app.use(errorHandler.processErrorsDb);
if (config === "prod") {
  app.use(errorHandler.errorsInProduction);
} else {
  app.use(errorHandler.errorsInDevelopment);
}
//----------------

app.get("/", passport.authenticate("jwt", { session: false }), (req, res) => {
  //session:false que no tenga de cookie ni sesiones
  logger.info(req.user); //Viene del auth, del objeto que se le pasa a next()
  res.send("Api de prueba");
});

app.listen(config.puerto, () => {
  logger.info("Escuchando en el puerto 3000");
});
