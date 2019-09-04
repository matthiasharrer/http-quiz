const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const app = express();

app.get("/", (req, res) => {
    res.end("Welcome to this short little quiz. To start just post your name.")
});

app.post("/", (req, res) => {
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    res.location(path.join(fullUrl, "next-steps"))
       .end(`Hi ${req.body}!`);
})

app.listen(process.env.PORT || 80, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`),
);