const express = require("express");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
require("dotenv").config();
require("express-async-errors");

// Requisições de endpoints
const home = require("./components/home/home");
const readAll = require("./components/read-all/read-all");
const readById = require("./components/read-by-id/read-by-id");
const create = require("./components/create/create");
const update = require("./components/update/update");
const del = require("./components/delete/delete");

(async () => {
  const app = express();
  app.use(express.json());
  const port = process.env.PORT || 3000;

  // CORS

  var cors = require("cors");
  app.use(cors());
  app.options("*", cors());

  // Criando a rota /home
  app.use("/home", home);

  // [GET] - todos os personagens
  app.use("/characters/read-all", readAll);

  // [GET] - personagem pelo id
  app.use("/characters/read-by-id", readById);

  // [POST]
  app.use("/characters/create", create);

  // [PUT]
  app.use("/characters/update", update);

  // [DELETE]
  app.use("/characters/delete", del);

  // Tratamento de erros com middlewares:
  app.all("*", (req, res) => {
    res.status(404).send({ message: "Endpoint has not been found" });
  });

  // biblioteca express async errors
  app.use((error, req, res, next) => {
    res.status(error.status || 500).send({
      error: {
        status: error.status || 500,
        message: error.message || "Internal server error",
      },
    });
  });

  app.listen(port, () => {
    console.info(`App rodando em http://localhost:${port}/home`);
  });
})();
