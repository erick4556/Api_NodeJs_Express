const ambiente = process.env.NODE_ENV || "development";

const configuracionBase = {
  jwt: {},
  puerto: 3000,
};

let configuracionAmbiente = {};

switch (ambiente) {
  case "desarrollo":
  case "dev":
  case "develpment":
    configuracionAmbiente = require("./dev");
    break;
  case "production":
  case "prod":
    configuracionAmbiente = require("./prod");
    break;
  default:
    configuracionAmbiente = require("./dev");
}

const generalConfig = {
  ...configuracionBase,
  ...configuracionAmbiente,
};

console.log(generalConfig);

module.exports = generalConfig;
