const express = require("express");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
require("dotenv").config();

(async () => {
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbName = process.env.DB_NAME;
  const port = process.env.PORT || 3000; // somente para ambientes em nuvem (para funcionar corretamente no Heroku)
  const app = express();
  app.use(express.json());
  const connectionString = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.r16hc.mongodb.net/${dbName}?retryWrites=true&w=majority`;
  const options = {
    useUnifiedTopology: true,
  };
  const client = await mongodb.MongoClient.connect(connectionString, options);
  const db = client.db("db_rickandmorty"); // conexão direta com o banco de dados
  const rickandmorty = db.collection("rickandmorty");
  const getValidCharacters = () => rickandmorty.find({}).toArray(); // cria um array com todos os personagens válidos
  const getCharacterById = async (id) =>
    rickandmorty.findOne({ _id: ObjectId(id) });

  // CORS

  app.all("/", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");

    res.header(
      "Acces-Control-Allow-Headers",
      "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization"
    );

    next();
  });

  app.get("/", (req, res) => {
    res.send({ info: "Olá, Blue!" });
  });

  // [GET] - todos os personagens
  app.get("/characters", async (req, res) => {
    res.send(await getValidCharacters());
  });

  // [GET] - personagem pelo id
  app.get("/characters/:id", async (req, res) => {
    const id = req.params.id;
    const character = await getCharacterById(id);
    res.send({ character });
  });

  // [POST]
  app.post("/characters", async (req, res) => {
		const objeto = req.body;

		if (!objeto || !objeto.nome || !objeto.imagemUrl) {
			res.send(
				"Requisição inválida, certifique-se que tenha os campos nome e imagemUrl"
			);
			return;
		}

		const insertCount = await rickandmorty.insertOne(objeto);

		if (!insertCount) {
			res.send("Ocorreu um erro");
			return;
		}

		res.send(objeto);
	});

  // [PUT]
  app.put("/characters/:id", async (req, res) => {
    const id = req.params.id;
    const object = req.body;
    res.send(await rickandmorty.updateOne(
        {
          _id: ObjectId(id),
        },
        {
          $set: object,
        }
      ));
  });

  // [DELETE]
  app.delete("/characters/:id", async (req, res) => {
    const id = req.params.id;
    res.send(await rickandmorty.deleteOne(
        {
            _id: ObjectId(id),
        }
      ));
  });

  app.listen(port, () => {
    console.info(`App rodando em http://localhost:${port}`);
  });
})();
