const express = require("express");
const bodyParser = require("body-parser");
const productsRouter = require("./api/recursos/productos/routes");
const logger = require("./utils/logger");
const morgan = require("morgan");

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

app.use("/products", productsRouter);

app.get("/", (req, res) => {
  res.send("Api de prueba");
});

app.listen(3000, () => {
  logger.info("Escuchando en el puerto 3000");
});
