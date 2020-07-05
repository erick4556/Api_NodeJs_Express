const express = require("express");
const bodyParser = require("body-parser");
const productsRouter = require("./api/recursos/productos/productos.routes");
const usersRouter = require("./api/recursos/usuarios/usuarios.routes");
const logger = require("./utils/logger");
const morgan = require("morgan");
const passport = require("passport");
//Autenticación basica de contraseña y usuario
const basicStrategy = require("passport-http").BasicStrategy;
const auth = require("./api/libs/auth");

passport.use(new basicStrategy(auth));
/* 
//Prueba del logger
logger.info(__dirname);
logger.info("Winston");
logger.error("Explotó");
logger.warn("Algo pasó");
logger.debug("Debug");
 */
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

app.get("/", passport.authenticate("basic", { session: false }), (req, res) => {
  //session:false que no tenga de cookie ni sesiones
  res.send("Api de prueba");
});

app.listen(3000, () => {
  logger.info("Escuchando en el puerto 3000");
});
