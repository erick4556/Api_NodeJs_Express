const winston = require("winston");
const config = require("../config");

//Configuración de winston

const incluirFecha = winston.format((info) => {
  info.message = `${new Date().toISOString()} ${info.message}`;
  return info;
});

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: config.suprimirLogs ? "error" : "debug", //Mediante la configuración uso el nivel
      handleExceptions: true,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      level: "info",
      handleExceptions: true,
      format: winston.format.combine(incluirFecha(), winston.format.simple()),
      maxsize: 5120000, // 5MB. Tamaño máximo de archivos de log
      maxFiles: 5, //Solo va tener 5 archivos de logs
      filename: `${__dirname}/../logs/logs-aplicacion.log`,
    }),
  ],
});

module.exports = logger;
