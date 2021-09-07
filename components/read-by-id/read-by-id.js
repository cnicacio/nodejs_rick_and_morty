const express = require("express");
const router = express.Router();
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;

(async () => {
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbName = process.env.DB_NAME;
  const dbChar = process.env.DB_CHAR;
  const port = process.env.PORT || 3000; // somente para ambientes em nuvem (para funcionar corretamente no Heroku)
  const app = express();
  app.use(express.json());
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

  router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const character = await getCharacterById(id);

    if (!character) {
      res.status(404).send({ error: "Personagem não encontrado" });
      return;
    }

    res.send({ character });
  });
})();

module.exports = router;