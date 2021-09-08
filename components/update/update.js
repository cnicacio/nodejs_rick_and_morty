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
  const getCharacterById = async (id) =>
    rickandmorty.findOne({ _id: ObjectId(id) });

  router.use(function timelog(req, res, next) {
    console.log("Time: ", Date.now());
    next();
  });

  router.put("/:id", async (req, res) => {
    const id = req.params.id;
    const object = req.body;

    if (!object || !object.nome || !object.imagemUrl) {
      res.status(400).send({
        error:
          "Personagem inválido, certifique-se que tenha os campos nome e imagemUrl",
      });
      return;
    }

    const quantityOfCharacters = await rickandmorty.countDocuments({
      _id: ObjectId(id),
    });

    if (quantityOfCharacters !== 1) {
      res.status(404).send( { error: "Personagem não encontrado! " });
      return;
    }

    const result = await rickandmorty.updateOne(
      {
        _id: ObjectId(id),
      },
      {
        $set: object,
      }
    );

    if (result.acknowledged == "undefined") {
      res
        .status(500)
        .send({ error: "Ocorreu um erro ao atualizar o personagem" });
    }

    res.send(await getCharacterById(id));
  });
})();

module.exports = router;