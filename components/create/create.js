const express = require("express");
const router = express.Router();
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;

(async () => {
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbName = process.env.DB_NAME;
  const dbChar = process.env.DB_CHAR;
  const connectionString = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.${dbChar}.mongodb.net/${dbName}?retryWrites=true&w=majority`;
  const options = {
    useUnifiedTopology: true,
  };
  const client = await mongodb.MongoClient.connect(connectionString, options);
  const db = client.db("db_rickandmorty"); // conexão direta com o banco de dados
  const rickandmorty = db.collection("rickandmorty");

  router.use(function timelog(req, res, next) {
    console.log("Time: ", Date.now());
    next();
  });

  router.post("/", async (req, res) => {
    const character = req.body;

    if (!character || !character.nome || !character.imagemUrl) {
      res.status(400).send({ error: "Personagem inválido, certifique-se que tenha os campos nome e imagemUrl" });
      return;
    }

    const result = await rickandmorty.insertOne(character);

    // se ocorrer algum erro com o MongoDB, esse if detectará e retornará result como falso
    if (result.acknowledged == false) {
      res.status(500).send({ error: "Ocorreu um erro" });
      return;
    }

    res.status(201).send({ character });
  });
})();

module.exports = router;