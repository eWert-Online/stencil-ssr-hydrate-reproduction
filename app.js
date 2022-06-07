const express = require("express");
const fs = require("fs");
const path = require("path");

const hydrate = require("./public/hydrate");

const app = express();
const port = 3333;
const indexHtml = fs.readFileSync(path.resolve("./views/index.html"), "utf8");

async function serverRenderer(req, res, next) {
  const renderedHtml = await hydrate.renderToString(indexHtml, {
    url: req.url,
    removeBooleanAttributeQuotes: true,
    prettyHtml: true,
    removeUnusedStyles: true,
  });
  // console.log(renderedHtml);
  console.log(`SERVER RENDERED ${req.url} at ${Date.now()}`);
  res.send(renderedHtml.html);
}

function run() {
  app.use("/public", express.static(path.join(process.cwd(), "public")));
  app.use("/assets", express.static(path.join(process.cwd(), "assets")));
  app.use(serverRenderer);

  app.listen(port, () => console.log(`server started at http://localhost:${port}/`));
}

run();
