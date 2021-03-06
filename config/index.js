const ambiente = process.env.NODE_ENV || "development";

const configuracionBase = {
  jwt: {},
  puerto: 3000,
  suprimirLogs: false,
  s3: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
};

let configuracionAmbiente = {};

switch (ambiente) {
  case "desarrollo":
  case "dev":
  case "development":
    configuracionAmbiente = require("./dev");
    break;
  case "production":
  case "prod":
    configuracionAmbiente = require("./prod");
    break;
  case "test":
    configuracionAmbiente = require("./test");
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
