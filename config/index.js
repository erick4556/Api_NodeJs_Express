const ambiente = process.env.NODE_ENV || "development";

const configuracionBase = {
  jwt: {},
  puerto: 3000,
  suprimirLogs: false,
  s3: {
    accessKeyId: "AKIAZYJG3L2FEYYYL7MS",
    secretAccessKey: "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",
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
