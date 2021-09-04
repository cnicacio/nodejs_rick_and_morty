const express = require("express");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
require("dotenv").config();
require("express-async-errors");

// POR PADRÃO, O EXPRESS NÃO CONSEGUE SAIR DE FUNÇÕES ASSÍNCRONAS
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
  const getValidCharacters = () => rickandmorty.find({}).toArray(); // cria um array com todos os personagens válidos
  const getCharacterById = async (id) =>
    rickandmorty.findOne({ _id: ObjectId(id) });

  // CORS

  app.all("/*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");

    res.header(
      "Acces-Control-Allow-Headers",
      "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization"
    );

    next();
  });

  app.get("/", async (req, res) => {
		const teste = undefined;
		res.send({ info: "Olá, Blue" + teste.sdas});
	});

  // [GET] - todos os personagens
  app.get("/characters", async (req, res) => {
    res.send(await getValidCharacters());
  });

  // [GET] - personagem pelo id
  app.get("/characters/:id", async (req, res) => {
    const id = req.params.id;
    const personagem = await getCharacterById(id);

    if (!personagem) {
      res.status(404).send({ error: "Personagem não encontrado" });
      return;
    }

    res.send({ personagem });
  });

  // [POST]
	app.post("/personagens", async (req, res) => {
		const objeto = req.body;

		if (!objeto || !objeto.nome || !objeto.imagemUrl) {
			res.status(400).send({
				error:
					"Personagem inválido, certifique-se que tenha os campos nome e imagemUrl",
			});
			return;
		}

		const result = await personagens.insertOne(objeto);

		console.log(result);
		//Se ocorrer algum erro com o mongoDb esse if vai detectar
		if (result.acknowledged == false) {
			res.status(500).send({ error: "Ocorreu um erro" });
			return;
		}

		res.status(201).send(objeto);
	});

	//[PUT] Atualizar personagem
	app.put("/personagens/:id", async (req, res) => {
		const id = req.params.id;
		const objeto = req.body;

		if (!objeto || !objeto.nome || !objeto.imagemUrl) {
			res.status(400);
			send({
				error:
					"Requisição inválida, certifique-se que tenha os campos nome e imagemUrl",
			});
			return;
		}

		const quantidadePersonagens = await personagens.countDocuments({
			_id: ObjectId(id),
		});

		if (quantidadePersonagens !== 1) {
			res.status(404).send({ error: "Personagem não encontrado" });
			return;
		}

		const result = await personagens.updateOne(
			{
				_id: ObjectId(id),
			},
			{
				$set: objeto,
			}
		);
		//console.log(result);
		//Se acontecer algum erro no MongoDb, cai na seguinte valiadação
		if (result.acknowledged == "undefined") {
			res
				.status(500)
				.send({ error: "Ocorreu um erro ao atualizar o personagem" });
			return;
		}
		res.send(await getPersonagemById(id));
	});
  
  // [DELETE]
  app.delete("/characters/:id", async (req, res) => {
    const id = req.params.id;
    const quantityOfCharacters = await rickandmorty.countDocuments({
      _id: ObjectId(id),
    });

    if (quantityOfCharacters !== 1) {
      res.status(404).send({ error: "Personagem não encontrado!" });
      return;
    }

    const result = await rickandmorty.deleteOne({
      _id: ObjectId(id),
    });

    // se não conseguir deletar, é erro do MongoDB
    if (result.deletedCount !== 1) {
      res.status(500).send({ error: "Houve um erro ao remover o personagem" });
      return;
    }

    res.status(200).send({ info: "Personagem deletado com sucesso" });
  });

  
  
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
    console.info(`App rodando em http://localhost:${port}`);
  });
})();
