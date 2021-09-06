const express = require("express");
const router = express.Router();

// Middleware que especificará que é esse router que será utilizado no index.js

// Timelog registra a data exata do acesso à rota
router.use(function timelog(req, res, next) {
  console.log("Time: ", Date.now());
  next();
});

router.get("/", async (req, res) => {
  res.send({ info: "Olá, Blue" });
});

module.exports = router;