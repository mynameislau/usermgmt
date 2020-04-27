const path = require("path");
const jsonServer = require("json-server");
const jsonServerApp = jsonServer.create();
const db = require("./db.json");
const router = jsonServer.router(db);

const middlewares = jsonServer.defaults({
  static: path.join(__dirname, "../front/build"),
});

jsonServerApp.use(middlewares);

jsonServerApp.use((_req, res, next) => {
  setTimeout(() => {
    if (Math.random() < 0) { // editer pour tester les erreurs
      res.status(500).jsonp({
        error: "test server error",
      });
    } else {
      next();
    }
  }, 500 + Math.random() * 500);
});

jsonServerApp.use(router);

const port = 3001;
jsonServerApp.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});
