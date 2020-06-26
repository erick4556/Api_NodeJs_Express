const express = require("express");
const bodyParser = require("body-parser");
const productsRouter = require("./api/recursos/productos/routes");
const app = express();

app.use(bodyParser.json());

app.use("/products", productsRouter);

app.get("/", (req, res) => {
  res.send("Api de prueba");
});

app.listen(3000, () => {
  console.log("Puerto 3000");
});
